// ── Main App Component ──

function AppContent() {
  var _s = useState('home'), page=_s[0], setPage=_s[1];
  var auth = useContext(AuthContext);
  // Expose setPage globally for HistoryPage edit navigation
  window.__setPage = setPage;

  // Show loading spinner during session check
  if (auth.loading && !auth.user) {
    return html`<div className="min-h-screen flex items-center justify-center flex-col gap-3">
      <div className="w-10 h-10 border-3 border-slate-200 dark:border-slate-700 border-t-brand-500 rounded-full animate-spin" style=${{ borderWidth: '3px' }}/>
      <p className="text-sm text-slate-400">Checking authentication...</p>
    </div>`;
  }

  // Not logged in → show auth page
  if (!auth.user) {
    return html`<${AuthPage}/>`;
  }

  // Logged in → show invoice app
  return html`<${ThemeProvider}>
    <${InvoiceProvider}>
      <div className="min-h-screen flex flex-col">
        <${Header} currentPage=${page} setPage=${setPage}/>
        <main className="flex-1">
          ${page === 'home' ? html`<${HomePage}/>` : html`<${HistoryPage}/>`}
        </main>
        <${Footer}/>
      </div>
    <//>>
  <//>>`;
}

function App() {
  return html`<${AuthProvider}>
    <${AppContent}/>
  <//>>`;
}

// ── Mount ──
var root = ReactDOM.createRoot(document.getElementById('root'));
root.render(html`<${App}/>`);
