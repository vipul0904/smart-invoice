// ── Utility Functions ──
function generateInvoiceNumber() {
  var d = new Date(), y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0');
  return 'INV-' + y + m + day + '-' + String(Math.floor(Math.random()*10000)).padStart(4,'0');
}
function formatCurrency(amount, currency) {
  var sym = currency || '₹';
  var locales = {'₹':'en-IN','$':'en-US','€':'de-DE'};
  try { return sym + ' ' + Number(amount).toLocaleString(locales[sym]||'en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }
  catch(e) { return sym + ' ' + Number(amount).toFixed(2); }
}
function calculateTotals(items, gstRate, discountRate) {
  var subtotal = items.reduce(function(s,it){ return s + (Number(it.quantity)||0)*(Number(it.price)||0); }, 0);
  var discountAmount = subtotal * (Number(discountRate)||0) / 100;
  var afterDiscount = subtotal - discountAmount;
  var gstAmount = afterDiscount * (Number(gstRate)||0) / 100;
  return { subtotal:subtotal, discountAmount:discountAmount, afterDiscount:afterDiscount, gstAmount:gstAmount, grandTotal:afterDiscount+gstAmount };
}
function getTodayDate() { return new Date().toISOString().split('T')[0]; }
function getDueDate(days) { var d=new Date(); d.setDate(d.getDate()+(days||30)); return d.toISOString().split('T')[0]; }

// ── LocalStorage CRUD ──
var InvoiceStorage = {
  KEY: 'smart_invoices',
  getAll: function() { try { return JSON.parse(localStorage.getItem(this.KEY))||[]; } catch(e) { return []; } },
  getById: function(id) { return this.getAll().find(function(inv){return inv.id===id;}); },
  save: function(invoice) {
    var all = this.getAll();
    invoice.id = invoice.id || Date.now().toString(36)+Math.random().toString(36).slice(2);
    invoice.savedAt = new Date().toISOString();
    all.unshift(invoice);
    localStorage.setItem(this.KEY, JSON.stringify(all));
    return invoice;
  },
  update: function(id, data) {
    var all = this.getAll(), idx = all.findIndex(function(inv){return inv.id===id;});
    if(idx!==-1){ all[idx]=Object.assign({},all[idx],data,{updatedAt:new Date().toISOString()}); localStorage.setItem(this.KEY,JSON.stringify(all)); }
    return all[idx];
  },
  remove: function(id) { var all=this.getAll().filter(function(inv){return inv.id!==id;}); localStorage.setItem(this.KEY,JSON.stringify(all)); },
  search: function(query) {
    var q=query.toLowerCase();
    return this.getAll().filter(function(inv){ return (inv.invoiceNumber||'').toLowerCase().includes(q)||(inv.clientName||'').toLowerCase().includes(q)||(inv.companyName||'').toLowerCase().includes(q); });
  }
};

// ── PDF Export (html2canvas + jsPDF) ──
// Now also uploads PDF to Supabase storage and updates invoice record
function exportToPDF(elementId, filename, userId, invoiceId) {
  var el = document.getElementById(elementId);
  if (!el) { alert('Invoice preview not found!'); return; }

  // Show loading state
  var btn = document.activeElement;
  var origText = btn ? btn.textContent : '';
  if (btn) btn.textContent = 'Generating...';

  // Force full opacity and visibility on element + ALL children before capture
  var allNodes = [el].concat(Array.from(el.querySelectorAll('*')));
  var savedStyles = [];
  for (var i = 0; i < allNodes.length; i++) {
    savedStyles.push(allNodes[i].getAttribute('style') || '');
    allNodes[i].style.opacity = '1';
    allNodes[i].style.visibility = 'visible';
    allNodes[i].style.animation = 'none';
  }
  el.style.background = '#ffffff';
  el.style.boxShadow = 'none';

  html2canvas(el, {
    scale: 3,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: 900,
    removeContainer: true
  }).then(function(canvas) {
    // Restore all saved styles
    for (var i = 0; i < allNodes.length; i++) {
      if (savedStyles[i]) {
        allNodes[i].setAttribute('style', savedStyles[i]);
      } else {
        allNodes[i].removeAttribute('style');
      }
    }
    try {
      var imgData = canvas.toDataURL('image/jpeg', 1.0);
      var pdf = new jspdf.jsPDF('p', 'mm', 'a4');
      var pdfWidth = pdf.internal.pageSize.getWidth();
      var pdfHeight = pdf.internal.pageSize.getHeight();
      var margin = 8;
      var imgWidth = pdfWidth - (margin * 2);
      var imgHeight = (canvas.height * imgWidth) / canvas.width;

      var heightLeft = imgHeight;
      var position = margin;

      // First page
      pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - margin * 2);

      // Additional pages if needed
      while (heightLeft > 0) {
        position = -(pdfHeight - margin * 2 - heightLeft) + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - margin * 2);
      }

      // Download locally
      pdf.save(filename || 'invoice.pdf');

      // Upload to Supabase storage if user is authenticated
      if (userId && supabaseClient) {
        var pdfBlob = pdf.output('blob');
        var storagePath = userId + '/' + (filename || 'invoice.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');

        supabaseClient.storage
          .from('pdfs')
          .upload(storagePath, pdfBlob, {
            contentType: 'application/pdf',
            upsert: true
          })
          .then(function(uploadResult) {
            if (uploadResult.error) {
              console.error('PDF upload error:', uploadResult.error);
              return;
            }
            // Get public URL
            var urlResult = supabaseClient.storage.from('pdfs').getPublicUrl(storagePath);
            var pdfUrl = urlResult.data ? urlResult.data.publicUrl : null;

            // Update invoice record with PDF URL if we have an invoice ID
            if (pdfUrl && invoiceId) {
              supabaseClient
                .from('invoices')
                .update({ pdf_url: pdfUrl })
                .eq('id', invoiceId)
                .eq('user_id', userId)
                .then(function(updateResult) {
                  if (updateResult.error) {
                    console.error('PDF URL update error:', updateResult.error);
                  } else {
                    console.log('PDF saved to Supabase:', pdfUrl);
                  }
                });
            }
          });
      }
    } catch(e) {
      console.error('PDF save error:', e);
      alert('Error creating PDF: ' + e.message);
    }
    if (btn) btn.textContent = origText;
  }).catch(function(err) {
    // Restore styles on error too
    for (var i = 0; i < allNodes.length; i++) {
      if (savedStyles[i]) {
        allNodes[i].setAttribute('style', savedStyles[i]);
      } else {
        allNodes[i].removeAttribute('style');
      }
    }
    console.error('html2canvas error:', err);
    alert('PDF generation failed: ' + err.message);
    if (btn) btn.textContent = origText;
  });
}
function printInvoice() { window.print(); }
