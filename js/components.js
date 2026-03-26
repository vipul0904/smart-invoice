// ── UI Components: Header, Footer, Modal, Reusable Form Inputs ──

function ThemeToggle() {
  var ctx = useContext(ThemeContext), theme=ctx.theme, toggleTheme=ctx.toggleTheme;
  var sunSvg = html`<svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/></svg>`;
  var moonSvg = html`<svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>`;
  return html`<button onClick=${toggleTheme} className="relative w-14 h-7 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors duration-300 btn-press" aria-label="Toggle theme">
    <div className=${"absolute top-0.5 w-6 h-6 rounded-full bg-white dark:bg-slate-900 shadow-md transition-transform duration-300 flex items-center justify-center "+(theme==='dark'?'translate-x-7':'translate-x-0.5')}>${theme==='dark'?moonSvg:sunSvg}</div></button>`;
}

function Header(props) {
  var currentPage=props.currentPage, setPage=props.setPage;
  var auth = useContext(AuthContext);
  var userEmail = auth.user && auth.user.email ? auth.user.email : '';
  var userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : '?';
  var _showMenu = useState(false), showMenu=_showMenu[0], setShowMenu=_showMenu[1];

  var handleSignOut = function() {
    setShowMenu(false);
    auth.signOut();
  };

  return html`<header className="glass sticky top-0 z-50 border-b border-slate-200/50 dark:border-slate-700/50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3 cursor-pointer" onClick=${function(){setPage('home');}}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        </div>
        <div><h1 className="text-lg font-bold gradient-text">Smart Invoice</h1><p className="text-[10px] text-slate-400 -mt-0.5 tracking-wider uppercase">Generator</p></div>
      </div>
      <nav className="flex items-center gap-1">
        <button onClick=${function(){setPage('home');}} className=${"px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 "+(currentPage==='home'?'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400':'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800')}>Create</button>
        <button onClick=${function(){setPage('history');}} className=${"px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 "+(currentPage==='history'?'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400':'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800')}>History</button>
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"/><${ThemeToggle}/>
        <div className="relative ml-2">
          <button onClick=${function(){setShowMenu(!showMenu);}} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" id="user-menu-btn">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">${userInitial}</div>
            <span className="text-xs text-slate-500 dark:text-slate-400 max-w-[100px] truncate hidden sm:block">${userEmail}</span>
            <svg className=${"w-3 h-3 text-slate-400 transition-transform " + (showMenu ? 'rotate-180' : '')} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
          </button>
          ${showMenu && html`<div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 fade-in" id="user-dropdown">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50">
              <p className="text-xs text-slate-400">Signed in as</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">${userEmail}</p>
            </div>
            <button onClick=${handleSignOut} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" id="sign-out-btn">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              Sign Out
            </button>
          </div>`}
        </div>
      </nav>
    </div>
  </header>`;
}

function Footer() {
  return html`<footer className="border-t border-slate-200/50 dark:border-slate-700/50 py-6 mt-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center"><p className="text-sm text-slate-400">© ${new Date().getFullYear()} Smart Invoice Generator. Built with ❤️</p></div>
  </footer>`;
}

function Modal(props) {
  if(!props.isOpen) return null;
  return html`<div className="fixed inset-0 z-[100] flex items-center justify-center modal-backdrop fade-in" onClick=${props.onClose}>
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 scale-in" onClick=${function(e){e.stopPropagation();}}>
      <h3 className="text-lg font-semibold mb-2">${props.title}</h3>
      <div className="text-slate-500 dark:text-slate-400 text-sm mb-6">${props.children}</div>
      <div className="flex gap-3 justify-end">
        <button onClick=${props.onClose} className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors btn-press">Cancel</button>
        ${props.onConfirm && html`<button onClick=${props.onConfirm} className=${"px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors btn-press "+(props.confirmColor||'bg-red-500 hover:bg-red-600')}>${props.confirmText||'Confirm'}</button>`}
      </div>
    </div>
  </div>`;
}

function FormInput(props) {
  return html`<div className=${props.className||''}>
    ${props.label && html`<label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">${props.label}</label>`}
    <input type=${props.type||'text'} value=${props.value} onChange=${props.onChange} placeholder=${props.placeholder} min=${props.min} max=${props.max} step=${props.step} disabled=${props.disabled}
      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm input-focus transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"/>
  </div>`;
}

function FormTextarea(props) {
  return html`<div className=${props.className||''}>
    ${props.label && html`<label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">${props.label}</label>`}
    <textarea value=${props.value} onChange=${props.onChange} placeholder=${props.placeholder} rows=${props.rows||3}
      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm input-focus transition-all resize-none placeholder:text-slate-300 dark:placeholder:text-slate-600"/>
  </div>`;
}

function FormSelect(props) {
  return html`<div className=${props.className||''}>
    ${props.label && html`<label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">${props.label}</label>`}
    <select value=${props.value} onChange=${props.onChange} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm input-focus transition-all">
      ${(props.options||[]).map(function(opt){ return html`<option key=${opt.value} value=${opt.value}>${opt.label}</option>`; })}
    </select>
  </div>`;
}

function SectionCard(props) {
  return html`<div className=${"bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-5 card-hover fade-in "+(props.className||'')}>
    ${props.title && html`<div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-700/30">
      ${props.icon}<h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">${props.title}</h3>
    </div>`}
    ${props.children}
  </div>`;
}
