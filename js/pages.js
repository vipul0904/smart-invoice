// ── Pages: HomePage & HistoryPage ──

function HomePage() {
  return html`<div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left: Form -->
      <div className="space-y-4 fade-in">
        <${CompanyForm}/>
        <${ClientForm}/>
        <${InvoiceDetailsForm}/>
        <${ProductTable}/>
        <${PriceSection}/>
        <${NotesForm}/>
        <${ActionButtons}/>
      </div>
      <!-- Right: Live Preview (single instance, grid handles responsive stacking) -->
      <div>
        <${InvoicePreview}/>
      </div>
    </div>
  </div>`;
}

function HistoryPage() {
  var _s = useState(''), search=_s[0], setSearch=_s[1];
  var _i = useState([]), invoices=_i[0], setInvoices=_i[1];
  var _m = useState(null), deleteId=_m[0], setDeleteId=_m[1];
  var _ld = useState(true), loadingInv=_ld[0], setLoadingInv=_ld[1];
  var ctx = useContext(InvoiceContext);
  var auth = useContext(AuthContext);

  var refresh = function(){
    if (!auth.user) { setInvoices([]); setLoadingInv(false); return; }
    setLoadingInv(true);
    SupabaseStorage.getAll(auth.user.id).then(function(data) {
      setInvoices(data || []);
      setLoadingInv(false);
    }).catch(function() { setLoadingInv(false); });
  };

  useEffect(function(){ refresh(); }, []);

  var _f = useState([]), filtered=_f[0], setFiltered=_f[1];
  useEffect(function() {
    if (!search) { setFiltered(invoices); return; }
    if (!auth.user) { setFiltered([]); return; }
    SupabaseStorage.search(search, auth.user.id).then(function(data) {
      setFiltered(data || []);
    });
  }, [search, invoices]);

  var handleDelete = function() {
    if(deleteId && auth.user){
      SupabaseStorage.remove(deleteId, auth.user.id).then(function() {
        refresh(); setDeleteId(null);
      }).catch(function(err) { console.error('Delete failed:', err); setDeleteId(null); });
    }
  };
  var handleEdit = function(inv) {
    ctx.loadInvoice(inv);
    // Navigate to home (parent handles this)
    if(window.__setPage) window.__setPage('home');
  };

  var formatDate = function(d) {
    if(!d) return '-';
    try { return new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}); }
    catch(e){return d;}
  };

  return html`<div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 fade-in">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Invoice History</h2>
        <p className="text-sm text-slate-500 mt-0.5">${filtered.length} invoice${filtered.length!==1?'s':''} found</p>
      </div>
      <div className="relative w-full sm:w-72">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input type="text" value=${search} onChange=${function(e){setSearch(e.target.value);}} placeholder="Search invoices..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm input-focus"/>
      </div>
    </div>

    ${loadingInv ? html`
      <div className="text-center py-20">
        <div className="w-10 h-10 border-3 border-slate-200 dark:border-slate-700 border-t-brand-500 rounded-full animate-spin mx-auto mb-4" style=${{ borderWidth: '3px' }}/>
        <p className="text-sm text-slate-400">Loading invoices...</p>
      </div>
    ` : filtered.length===0 ? html`
      <div className="text-center py-20">
        <svg className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        <p className="text-slate-400 font-medium">No invoices yet</p>
        <p className="text-sm text-slate-400 mt-1">Create your first invoice to get started</p>
      </div>
    ` : html`
      <div className="space-y-3">
        ${filtered.map(function(inv) {
          return html`<div key=${inv.id} className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-4 card-hover slide-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-100 to-purple-100 dark:from-brand-900/30 dark:to-purple-900/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                </div>
                <div>
                  <p className="font-semibold text-sm">${inv.invoiceNumber||'Untitled'}</p>
                  <p className="text-xs text-slate-500">${inv.clientName||'No client'} · ${formatDate(inv.savedAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold gradient-text mr-2">${formatCurrency((inv.totals&&inv.totals.grandTotal)||0, inv.currency)}</span>
                <button onClick=${function(){handleEdit(inv);}} className="p-2 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors" title="Edit">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </button>
                <button onClick=${function(){setDeleteId(inv.id);}} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>
          </div>`;
        })}
      </div>
    `}

    <${Modal} isOpen=${!!deleteId} onClose=${function(){setDeleteId(null);}} title="Delete Invoice" onConfirm=${handleDelete} confirmText="Delete">
      Are you sure you want to delete this invoice? This action cannot be undone.
    <//>
  </div>`;
}
