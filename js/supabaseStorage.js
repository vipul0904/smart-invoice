// ── Supabase Database Storage (replaces localStorage InvoiceStorage) ──

var SupabaseStorage = {

  // ── Save a new invoice (insert into invoices + invoice_items) ──
  save: function(invoice, userId) {
    if (!supabaseClient || !userId) return Promise.reject(new Error('Not authenticated'));

    var totals = calculateTotals(invoice.items, invoice.gstRate, invoice.discountRate);

    // Upload logo if it's a base64 data URL
    var logoPromise = Promise.resolve(null);
    if (invoice.companyLogo && invoice.companyLogo.startsWith('data:')) {
      logoPromise = this._uploadBase64(invoice.companyLogo, 'logos', userId);
    } else if (invoice.companyLogo) {
      logoPromise = Promise.resolve(invoice.companyLogo);
    }

    return logoPromise.then(function(logoUrl) {
      // Insert invoice row
      return supabaseClient
        .from('invoices')
        .insert({
          user_id: userId,
          invoice_number: invoice.invoiceNumber || null,
          invoice_date: invoice.invoiceDate || null,
          due_date: invoice.dueDate || null,
          currency: invoice.currency || '₹',
          company_name: invoice.companyName || null,
          company_address: invoice.companyAddress || null,
          company_phone: invoice.companyPhone || null,
          company_email: invoice.companyEmail || null,
          company_gst: invoice.companyGST || null,
          company_logo_url: logoUrl || null,
          client_name: invoice.clientName || null,
          client_address: invoice.clientAddress || null,
          client_phone: invoice.clientPhone || null,
          client_email: invoice.clientEmail || null,
          client_gst: invoice.clientGST || null,
          gst_rate: Number(invoice.gstRate) || 0,
          discount_rate: Number(invoice.discountRate) || 0,
          subtotal: totals.subtotal,
          discount_amount: totals.discountAmount,
          gst_amount: totals.gstAmount,
          grand_total: totals.grandTotal,
          notes: invoice.notes || null,
          terms: invoice.terms || null
        })
        .select()
        .single();
    }).then(function(result) {
      if (result.error) throw result.error;
      var savedInvoice = result.data;

      // Insert invoice items
      var items = (invoice.items || []).map(function(item, index) {
        return {
          invoice_id: savedInvoice.id,
          item_order: index,
          name: item.name || null,
          description: item.description || null,
          quantity: Number(item.quantity) || 0,
          price: Number(item.price) || 0,
          total: (Number(item.quantity) || 0) * (Number(item.price) || 0)
        };
      });

      if (items.length === 0) return savedInvoice;

      return supabaseClient
        .from('invoice_items')
        .insert(items)
        .then(function(itemResult) {
          if (itemResult.error) console.error('Error saving items:', itemResult.error);
          return savedInvoice;
        });
    });
  },

  // ── Update an existing invoice ──
  update: function(invoiceId, invoice, userId) {
    if (!supabaseClient || !userId) return Promise.reject(new Error('Not authenticated'));

    var totals = calculateTotals(invoice.items, invoice.gstRate, invoice.discountRate);

    // Upload logo if it's a base64 data URL
    var logoPromise = Promise.resolve(null);
    if (invoice.companyLogo && invoice.companyLogo.startsWith('data:')) {
      logoPromise = this._uploadBase64(invoice.companyLogo, 'logos', userId);
    } else if (invoice.companyLogo) {
      logoPromise = Promise.resolve(invoice.companyLogo);
    }

    return logoPromise.then(function(logoUrl) {
      var updateData = {
        invoice_number: invoice.invoiceNumber || null,
        invoice_date: invoice.invoiceDate || null,
        due_date: invoice.dueDate || null,
        currency: invoice.currency || '₹',
        company_name: invoice.companyName || null,
        company_address: invoice.companyAddress || null,
        company_phone: invoice.companyPhone || null,
        company_email: invoice.companyEmail || null,
        company_gst: invoice.companyGST || null,
        client_name: invoice.clientName || null,
        client_address: invoice.clientAddress || null,
        client_phone: invoice.clientPhone || null,
        client_email: invoice.clientEmail || null,
        client_gst: invoice.clientGST || null,
        gst_rate: Number(invoice.gstRate) || 0,
        discount_rate: Number(invoice.discountRate) || 0,
        subtotal: totals.subtotal,
        discount_amount: totals.discountAmount,
        gst_amount: totals.gstAmount,
        grand_total: totals.grandTotal,
        notes: invoice.notes || null,
        terms: invoice.terms || null
      };
      if (logoUrl) updateData.company_logo_url = logoUrl;

      return supabaseClient
        .from('invoices')
        .update(updateData)
        .eq('id', invoiceId)
        .eq('user_id', userId)
        .select()
        .single();
    }).then(function(result) {
      if (result.error) throw result.error;

      // Delete old items and re-insert
      return supabaseClient
        .from('invoice_items')
        .delete()
        .eq('invoice_id', invoiceId)
        .then(function() {
          var items = (invoice.items || []).map(function(item, index) {
            return {
              invoice_id: invoiceId,
              item_order: index,
              name: item.name || null,
              description: item.description || null,
              quantity: Number(item.quantity) || 0,
              price: Number(item.price) || 0,
              total: (Number(item.quantity) || 0) * (Number(item.price) || 0)
            };
          });
          if (items.length === 0) return result.data;
          return supabaseClient
            .from('invoice_items')
            .insert(items)
            .then(function() { return result.data; });
        });
    });
  },

  // ── Get all invoices for a user ──
  getAll: function(userId) {
    if (!supabaseClient || !userId) return Promise.resolve([]);

    return supabaseClient
      .from('invoices')
      .select('*, invoice_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(function(result) {
        if (result.error) { console.error('Fetch error:', result.error); return []; }
        // Map to app format
        return (result.data || []).map(function(inv) {
          return {
            id: inv.id,
            invoiceNumber: inv.invoice_number || '',
            invoiceDate: inv.invoice_date || '',
            dueDate: inv.due_date || '',
            currency: inv.currency || '₹',
            companyName: inv.company_name || '',
            companyAddress: inv.company_address || '',
            companyPhone: inv.company_phone || '',
            companyEmail: inv.company_email || '',
            companyGST: inv.company_gst || '',
            companyLogo: inv.company_logo_url || '',
            clientName: inv.client_name || '',
            clientAddress: inv.client_address || '',
            clientPhone: inv.client_phone || '',
            clientEmail: inv.client_email || '',
            clientGST: inv.client_gst || '',
            gstRate: inv.gst_rate || 0,
            discountRate: inv.discount_rate || 0,
            notes: inv.notes || '',
            terms: inv.terms || '',
            savedAt: inv.created_at,
            updatedAt: inv.updated_at,
            items: (inv.invoice_items || [])
              .sort(function(a, b) { return (a.item_order || 0) - (b.item_order || 0); })
              .map(function(item) {
                return {
                  name: item.name || '',
                  description: item.description || '',
                  quantity: item.quantity || 1,
                  price: item.price || 0
                };
              }),
            totals: {
              subtotal: Number(inv.subtotal) || 0,
              discountAmount: Number(inv.discount_amount) || 0,
              gstAmount: Number(inv.gst_amount) || 0,
              grandTotal: Number(inv.grand_total) || 0
            }
          };
        });
      });
  },

  // ── Delete an invoice ──
  remove: function(invoiceId, userId) {
    if (!supabaseClient || !userId) return Promise.reject(new Error('Not authenticated'));

    return supabaseClient
      .from('invoices')
      .delete()
      .eq('id', invoiceId)
      .eq('user_id', userId)
      .then(function(result) {
        if (result.error) throw result.error;
        return true;
      });
  },

  // ── Search invoices ──
  search: function(query, userId) {
    if (!supabaseClient || !userId) return Promise.resolve([]);
    var q = '%' + query + '%';

    return supabaseClient
      .from('invoices')
      .select('*, invoice_items(*)')
      .eq('user_id', userId)
      .or('invoice_number.ilike.' + q + ',client_name.ilike.' + q + ',company_name.ilike.' + q)
      .order('created_at', { ascending: false })
      .then(function(result) {
        if (result.error) { console.error('Search error:', result.error); return []; }
        // Re-use same mapping as getAll
        return (result.data || []).map(function(inv) {
          return {
            id: inv.id,
            invoiceNumber: inv.invoice_number || '',
            invoiceDate: inv.invoice_date || '',
            dueDate: inv.due_date || '',
            currency: inv.currency || '₹',
            companyName: inv.company_name || '',
            companyAddress: inv.company_address || '',
            companyPhone: inv.company_phone || '',
            companyEmail: inv.company_email || '',
            companyGST: inv.company_gst || '',
            companyLogo: inv.company_logo_url || '',
            clientName: inv.client_name || '',
            clientAddress: inv.client_address || '',
            clientPhone: inv.client_phone || '',
            clientEmail: inv.client_email || '',
            clientGST: inv.client_gst || '',
            gstRate: inv.gst_rate || 0,
            discountRate: inv.discount_rate || 0,
            notes: inv.notes || '',
            terms: inv.terms || '',
            savedAt: inv.created_at,
            updatedAt: inv.updated_at,
            items: (inv.invoice_items || [])
              .sort(function(a, b) { return (a.item_order || 0) - (b.item_order || 0); })
              .map(function(item) {
                return {
                  name: item.name || '',
                  description: item.description || '',
                  quantity: item.quantity || 1,
                  price: item.price || 0
                };
              }),
            totals: {
              subtotal: Number(inv.subtotal) || 0,
              discountAmount: Number(inv.discount_amount) || 0,
              gstAmount: Number(inv.gst_amount) || 0,
              grandTotal: Number(inv.grand_total) || 0
            }
          };
        });
      });
  },

  // ── Upload base64 image/file to storage ──
  _uploadBase64: function(base64Data, bucket, userId) {
    if (!supabaseClient) return Promise.resolve(null);

    try {
      // Extract MIME type and data
      var matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) return Promise.resolve(null);

      var mimeType = matches[1];
      var base64 = matches[2];
      var ext = mimeType.split('/')[1] || 'png';
      var fileName = userId + '/' + Date.now() + '.' + ext;

      // Convert base64 to Uint8Array
      var binaryStr = atob(base64);
      var bytes = new Uint8Array(binaryStr.length);
      for (var i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      return supabaseClient.storage
        .from(bucket)
        .upload(fileName, bytes.buffer, {
          contentType: mimeType,
          upsert: true
        })
        .then(function(result) {
          if (result.error) { console.error('Upload error:', result.error); return null; }
          // Get public URL
          var urlResult = supabaseClient.storage.from(bucket).getPublicUrl(fileName);
          return urlResult.data ? urlResult.data.publicUrl : null;
        });
    } catch (e) {
      console.error('Upload failed:', e);
      return Promise.resolve(null);
    }
  }
};
