// ── Invoice Preview Component (Live Preview Panel) ──

function InvoicePreview() {
  var ctx = useContext(InvoiceContext), inv=ctx.invoice, totals=ctx.totals;
  var formatDate = function(d) { if(!d) return ''; try { return new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}); } catch(e){return d;} };

  return html`<div className="sticky top-20">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Live Preview</h3>
      <div className="flex gap-1">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
        <span className="text-[10px] text-emerald-500 font-medium">Live</span>
      </div>
    </div>
    <div id="invoice-preview" className="invoice-paper p-8" style=${{minHeight:'600px',fontSize:'13px',background:'#ffffff',color:'#1e293b',opacity:'1'}}>
      <!-- Header -->
      <div className="flex justify-between items-start mb-8 pb-6" style=${{borderBottom:'2px solid #e2e8f0'}}>
        <div className="flex items-center gap-4">
          ${inv.companyLogo && html`<img src=${inv.companyLogo} className="rounded-lg" style=${{width:'56px',height:'56px',objectFit:'contain',border:'1px solid #f1f5f9'}}/>`}
          <div>
            <h2 className="text-xl font-bold" style=${{color:'#1e293b'}}>${inv.companyName || 'Your Company'}</h2>
            ${inv.companyAddress && html`<p className="text-xs mt-0.5" style=${{color:'#475569'}}>${inv.companyAddress}</p>`}
            ${inv.companyPhone && html`<p className="text-xs" style=${{color:'#475569'}}>${inv.companyPhone}</p>`}
            ${inv.companyEmail && html`<p className="text-xs" style=${{color:'#475569'}}>${inv.companyEmail}</p>`}
            ${inv.companyGST && html`<p className="text-xs font-medium mt-1" style=${{color:'#475569'}}>GST: ${inv.companyGST}</p>`}
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-extrabold" style=${{color:'#4f46e5'}}>INVOICE</h1>
          <p className="text-xs mt-1 font-mono" style=${{color:'#64748b'}}>${inv.invoiceNumber}</p>
        </div>
      </div>

      <!-- Client & Dates -->
      <div className="flex justify-between mb-8">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style=${{color:'#64748b'}}>Bill To</p>
          <p className="font-semibold" style=${{color:'#334155'}}>${inv.clientName || 'Client Name'}</p>
          ${inv.clientAddress && html`<p className="text-xs" style=${{color:'#475569'}}>${inv.clientAddress}</p>`}
          ${inv.clientPhone && html`<p className="text-xs" style=${{color:'#475569'}}>${inv.clientPhone}</p>`}
          ${inv.clientEmail && html`<p className="text-xs" style=${{color:'#475569'}}>${inv.clientEmail}</p>`}
          ${inv.clientGST && html`<p className="text-xs mt-1" style=${{color:'#475569'}}>GST: ${inv.clientGST}</p>`}
        </div>
        <div className="text-right space-y-1">
          <div><p className="text-[10px] font-semibold uppercase" style=${{color:'#64748b'}}>Date</p><p className="text-xs" style=${{color:'#334155'}}>${formatDate(inv.invoiceDate)}</p></div>
          <div><p className="text-[10px] font-semibold uppercase" style=${{color:'#64748b'}}>Due Date</p><p className="text-xs" style=${{color:'#334155'}}>${formatDate(inv.dueDate)}</p></div>
        </div>
      </div>

      <!-- Items Table -->
      <table className="w-full mb-6" style=${{borderCollapse:'collapse'}}>
        <thead><tr style=${{background:'#f8fafc'}}>
          <th className="text-left py-2.5 px-3 text-[10px] font-semibold uppercase rounded-l-lg" style=${{color:'#475569'}}>#</th>
          <th className="text-left py-2.5 px-3 text-[10px] font-semibold uppercase" style=${{color:'#475569'}}>Item</th>
          <th className="text-left py-2.5 px-3 text-[10px] font-semibold uppercase" style=${{color:'#475569'}}>Description</th>
          <th className="text-center py-2.5 px-3 text-[10px] font-semibold uppercase" style=${{color:'#475569'}}>Qty</th>
          <th className="text-right py-2.5 px-3 text-[10px] font-semibold uppercase" style=${{color:'#475569'}}>Price</th>
          <th className="text-right py-2.5 px-3 text-[10px] font-semibold uppercase rounded-r-lg" style=${{color:'#475569'}}>Total</th>
        </tr></thead>
        <tbody>
          ${inv.items.map(function(item, i) {
            var t = (Number(item.quantity)||0)*(Number(item.price)||0);
            return html`<tr key=${i} style=${{borderBottom:'1px solid #f1f5f9'}}>
              <td className="py-2.5 px-3 text-xs" style=${{color:'#64748b'}}>${i+1}</td>
              <td className="py-2.5 px-3 font-medium" style=${{color:'#1e293b'}}>${item.name||'-'}</td>
              <td className="py-2.5 px-3 text-xs" style=${{color:'#475569'}}>${item.description||'-'}</td>
              <td className="py-2.5 px-3 text-center" style=${{color:'#1e293b'}}>${item.quantity}</td>
              <td className="py-2.5 px-3 text-right" style=${{color:'#1e293b'}}>${formatCurrency(item.price, inv.currency)}</td>
              <td className="py-2.5 px-3 text-right font-medium" style=${{color:'#1e293b'}}>${formatCurrency(t, inv.currency)}</td>
            </tr>`;
          })}
        </tbody>
      </table>

      <!-- Totals -->
      <div className="flex justify-end mb-8">
        <div className="w-64 space-y-1.5">
          <div className="flex justify-between text-xs" style=${{color:'#475569'}}><span>Subtotal</span><span>${formatCurrency(totals.subtotal, inv.currency)}</span></div>
          ${totals.discountAmount>0 && html`<div className="flex justify-between text-xs" style=${{color:'#ef4444'}}><span>Discount (${inv.discountRate}%)</span><span>-${formatCurrency(totals.discountAmount, inv.currency)}</span></div>`}
          <div className="flex justify-between text-xs" style=${{color:'#475569'}}><span>GST (${inv.gstRate}%)</span><span>+${formatCurrency(totals.gstAmount, inv.currency)}</span></div>
          <div className="pt-2 flex justify-between font-bold text-base" style=${{borderTop:'2px solid #e2e8f0'}}>
            <span style=${{color:'#1e293b'}}>Grand Total</span><span style=${{color:'#4f46e5'}}>${formatCurrency(totals.grandTotal, inv.currency)}</span>
          </div>
        </div>
      </div>

      <!-- Notes & Terms -->
      ${(inv.notes || inv.terms) && html`<div className="pt-4 space-y-2" style=${{borderTop:'1px solid #f1f5f9'}}>
        ${inv.notes && html`<div><p className="text-[10px] font-semibold uppercase mb-0.5" style=${{color:'#64748b'}}>Notes</p><p className="text-xs" style=${{color:'#475569'}}>${inv.notes}</p></div>`}
        ${inv.terms && html`<div><p className="text-[10px] font-semibold uppercase mb-0.5" style=${{color:'#64748b'}}>Terms & Conditions</p><p className="text-xs" style=${{color:'#475569'}}>${inv.terms}</p></div>`}
      </div>`}
    </div>
  </div>`;
}
