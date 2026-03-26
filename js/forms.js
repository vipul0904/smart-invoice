// ── Form Components: Company, Client, Details, Products, Pricing, Notes, Actions ──

// Phone validation: only allow digits, +, and spaces
function handlePhoneInput(setter, field) {
  return function(e) {
    var val = e.target.value.replace(/[^0-9+ ]/g, '');
    // Only allow + at the beginning
    var first = val.charAt(0);
    var rest = val.slice(1).replace(/\+/g, '');
    val = first + rest;
    setter(field, val);
  };
}

function CompanyForm() {
  var ctx = useContext(InvoiceContext), inv=ctx.invoice, uf=ctx.updateField;
  var handleLogo = function(e) { var f=e.target.files[0]; if(!f)return; var r=new FileReader(); r.onload=function(ev){uf('companyLogo',ev.target.result);}; r.readAsDataURL(f); };
  var icon = html`<svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`;
  return html`<${SectionCard} title="Company Information" icon=${icon}>
    <div className="space-y-3">
      <div className="flex gap-4 items-start">
        <div className="flex-shrink-0">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Logo</label>
          <label className="logo-upload w-20 h-20 rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden">
            ${inv.companyLogo ? html`<img src=${inv.companyLogo} className="w-full h-full object-cover"/>` : html`<svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg><span className="text-[10px] text-slate-400 mt-1">Upload</span>`}
            <input type="file" accept="image/*" onChange=${handleLogo} className="hidden"/>
          </label>
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <${FormInput} label="Company Name" value=${inv.companyName} onChange=${function(e){uf('companyName',e.target.value);}} placeholder="Your Company"/>
          <${FormInput} label="GST Number" value=${inv.companyGST} onChange=${function(e){uf('companyGST',e.target.value);}} placeholder="GST Number"/>
        </div>
      </div>
      <${FormInput} label="Address" value=${inv.companyAddress} onChange=${function(e){uf('companyAddress',e.target.value);}} placeholder="Company Address"/>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <${FormInput} label="Phone" value=${inv.companyPhone} onChange=${handlePhoneInput(uf,'companyPhone')} placeholder="+91 98765 43210" type="tel"/>
        <${FormInput} label="Email" value=${inv.companyEmail} onChange=${function(e){uf('companyEmail',e.target.value);}} placeholder="hello@company.com" type="email"/>
      </div>
    </div>
  <//>`;
}

function ClientForm() {
  var ctx = useContext(InvoiceContext), inv=ctx.invoice, uf=ctx.updateField;
  var icon = html`<svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`;
  return html`<${SectionCard} title="Client Information" icon=${icon}>
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <${FormInput} label="Client Name" value=${inv.clientName} onChange=${function(e){uf('clientName',e.target.value);}} placeholder="Client Name"/>
        <${FormInput} label="GST (Optional)" value=${inv.clientGST} onChange=${function(e){uf('clientGST',e.target.value);}} placeholder="Client GST"/>
      </div>
      <${FormInput} label="Address" value=${inv.clientAddress} onChange=${function(e){uf('clientAddress',e.target.value);}} placeholder="Client Address"/>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <${FormInput} label="Phone" value=${inv.clientPhone} onChange=${handlePhoneInput(uf,'clientPhone')} placeholder="+91 98765 43210" type="tel"/>
        <${FormInput} label="Email" value=${inv.clientEmail} onChange=${function(e){uf('clientEmail',e.target.value);}} placeholder="client@email.com" type="email"/>
      </div>
    </div>
  <//>`;
}

function InvoiceDetailsForm() {
  var ctx = useContext(InvoiceContext), inv=ctx.invoice, uf=ctx.updateField;
  var icon = html`<svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>`;
  var currencies = [{value:'₹',label:'₹ INR'},{value:'$',label:'$ USD'},{value:'€',label:'€ EUR'}];
  return html`<${SectionCard} title="Invoice Details" icon=${icon}>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <${FormInput} label="Invoice #" value=${inv.invoiceNumber} onChange=${function(e){uf('invoiceNumber',e.target.value);}}/>
      <${FormInput} label="Date" type="date" value=${inv.invoiceDate} onChange=${function(e){uf('invoiceDate',e.target.value);}}/>
      <${FormInput} label="Due Date" type="date" value=${inv.dueDate} onChange=${function(e){uf('dueDate',e.target.value);}}/>
      <${FormSelect} label="Currency" value=${inv.currency} onChange=${function(e){uf('currency',e.target.value);}} options=${currencies}/>
    </div>
  <//>`;
}

function ProductTable() {
  var ctx = useContext(InvoiceContext), inv=ctx.invoice, ui=ctx.updateItem, ai=ctx.addItem, ri=ctx.removeItem;
  var icon = html`<svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`;
  var inputCls = "px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm input-focus";
  return html`<${SectionCard} title="Items / Services" icon=${icon}>
    <div className="space-y-2">
      <div className="hidden sm:grid grid-cols-12 gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1">
        <div className="col-span-3">Item</div><div className="col-span-2">Description</div><div className="col-span-2">Qty</div><div className="col-span-2">Price</div><div className="col-span-2">Total</div><div className="col-span-1"/>
      </div>
      ${inv.items.map(function(item, i) {
        var total = (Number(item.quantity)||0)*(Number(item.price)||0);
        return html`<div key=${i} className="grid grid-cols-12 gap-2 items-center slide-in">
          <input className=${"col-span-12 sm:col-span-3 "+inputCls} placeholder="Item name" value=${item.name} onChange=${function(e){ui(i,'name',e.target.value);}}/>
          <input className=${"col-span-12 sm:col-span-2 "+inputCls} placeholder="Description" value=${item.description} onChange=${function(e){ui(i,'description',e.target.value);}}/>
          <input className=${"col-span-4 sm:col-span-2 text-center "+inputCls} type="number" min="0" value=${item.quantity} onChange=${function(e){ui(i,'quantity',e.target.value);}}/>
          <input className=${"col-span-4 sm:col-span-2 "+inputCls} type="number" min="0" step="0.01" value=${item.price} onChange=${function(e){ui(i,'price',e.target.value);}}/>
          <div className="col-span-3 sm:col-span-2 text-sm font-medium text-slate-600 dark:text-slate-300 px-1">${formatCurrency(total, inv.currency)}</div>
          <button onClick=${function(){ri(i);}} className="col-span-1 p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" disabled=${inv.items.length<=1}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>`;
      })}
      <button onClick=${ai} className="mt-2 w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-400 hover:text-brand-500 hover:border-brand-300 dark:hover:border-brand-600 transition-colors btn-press">+ Add Item</button>
    </div>
  <//>`;
}

function PriceSection() {
  var ctx = useContext(InvoiceContext), inv=ctx.invoice, uf=ctx.updateField, totals=ctx.totals;
  var icon = html`<svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
  return html`<${SectionCard} title="Price Calculation" icon=${icon}>
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <${FormInput} label="GST %" type="number" min="0" max="100" value=${inv.gstRate} onChange=${function(e){uf('gstRate',e.target.value);}}/>
        <${FormInput} label="Discount %" type="number" min="0" max="100" value=${inv.discountRate} onChange=${function(e){uf('discountRate',e.target.value);}}/>
      </div>
      <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-4 space-y-2 text-sm">
        <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>${formatCurrency(totals.subtotal, inv.currency)}</span></div>
        ${totals.discountAmount>0 && html`<div className="flex justify-between text-red-500"><span>Discount (${inv.discountRate}%)</span><span>-${formatCurrency(totals.discountAmount, inv.currency)}</span></div>`}
        <div className="flex justify-between text-slate-500"><span>GST (${inv.gstRate}%)</span><span>+${formatCurrency(totals.gstAmount, inv.currency)}</span></div>
        <div className="border-t border-slate-200 dark:border-slate-600 pt-2 flex justify-between font-bold text-lg text-slate-800 dark:text-white">
          <span>Grand Total</span><span className="gradient-text">${formatCurrency(totals.grandTotal, inv.currency)}</span>
        </div>
      </div>
    </div>
  <//>`;
}

function NotesForm() {
  var ctx = useContext(InvoiceContext), inv=ctx.invoice, uf=ctx.updateField;
  var icon = html`<svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>`;
  return html`<${SectionCard} title="Notes & Terms" icon=${icon}>
    <div className="space-y-3">
      <${FormTextarea} label="Notes" value=${inv.notes} onChange=${function(e){uf('notes',e.target.value);}} placeholder="Any additional notes..." rows=${2}/>
      <${FormTextarea} label="Terms & Conditions" value=${inv.terms} onChange=${function(e){uf('terms',e.target.value);}} placeholder="Payment terms..." rows=${2}/>
    </div>
  <//>`;
}

function ActionButtons() {
  var ctx = useContext(InvoiceContext), inv=ctx.invoice, clearForm=ctx.clearForm, editingId=ctx.editingId, totals=ctx.totals;
  var auth = useContext(AuthContext);
  var _s = useState(false), saved=_s[0], setSaved=_s[1];
  var _sv = useState(false), saving=_sv[0], setSaving=_sv[1];
  var _er = useState(null), saveError=_er[0], setSaveError=_er[1];
  var handleSave = function() {
    if (!auth.user) { setSaveError('Please sign in first'); return; }
    setSaving(true); setSaveError(null);
    var userId = auth.user.id;
    var promise;
    if (editingId) {
      promise = SupabaseStorage.update(editingId, inv, userId);
    } else {
      promise = SupabaseStorage.save(inv, userId);
    }
    promise.then(function(result) {
      // Also save to localStorage as backup
      var data = Object.assign({}, inv, {totals:totals});
      if(editingId) InvoiceStorage.update(editingId, data); else InvoiceStorage.save(data);
      setSaved(true); setSaving(false);
      setTimeout(function(){setSaved(false);}, 2000);
    }).catch(function(err) {
      console.error('Supabase save error:', err);
      setSaveError(err.message || 'Save failed');
      setSaving(false);
    });
  };
  var handleDownload = function(){ exportToPDF('invoice-preview', (inv.invoiceNumber||'invoice')+'.pdf', auth.user ? auth.user.id : null, editingId); };
  var btnBase = "flex-1 min-w-[100px] py-2.5 px-3 rounded-xl text-sm font-semibold transition-all btn-press ";
  return html`<div className="space-y-2">
    ${saveError && html`<div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">${saveError}</div>`}
    <div className="flex flex-wrap gap-2">
      <button onClick=${handleSave} disabled=${saving} className=${btnBase+"text-white bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 shadow-lg shadow-brand-500/25"}>${saving?'Saving...':saved?'✓ Saved!':(editingId?'Update Invoice':'Save Invoice')}</button>
      <button onClick=${handleDownload} className=${btnBase+"text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25"}>Download PDF</button>
      <button onClick=${printInvoice} className=${btnBase+"text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"}>Print</button>
      <button onClick=${clearForm} className=${btnBase+"text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"}>Clear</button>
    </div>
  </div>`;
}
