// ── Auth Page: Login / Sign Up ──

function AuthPage() {
  var _m = useState('login'), mode = _m[0], setMode = _m[1];
  var _e = useState(''), email = _e[0], setEmail = _e[1];
  var _p = useState(''), password = _p[0], setPassword = _p[1];
  var _c = useState(''), confirm = _c[0], setConfirm = _c[1];
  var _s = useState(false), submitting = _s[0], setSubmitting = _s[1];
  var _msg = useState(null), message = _msg[0], setMessage = _msg[1];
  var _err = useState(null), formError = _err[0], setFormError = _err[1];
  var _showPw = useState(false), showPw = _showPw[0], setShowPw = _showPw[1];

  var auth = useContext(AuthContext);

  var switchMode = function() {
    setMode(mode === 'login' ? 'signup' : 'login');
    setEmail(''); setPassword(''); setConfirm('');
    setFormError(null); setMessage(null);
    auth.clearError();
  };

  var validate = function() {
    if (!email.trim()) return 'Please enter your email address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (mode === 'signup' && password !== confirm) return 'Passwords do not match.';
    return null;
  };

  var _confirmEmail = useState(null), confirmEmail = _confirmEmail[0], setConfirmEmail = _confirmEmail[1];

  var handleSubmit = function(e) {
    e.preventDefault();
    var err = validate();
    if (err) { setFormError(err); return; }
    setFormError(null);
    setMessage(null);
    setSubmitting(true);

    var promise = mode === 'login'
      ? auth.signIn(email, password)
      : auth.signUp(email, password);

    promise.then(function(result) {
      setSubmitting(false);
      if (!result.success) {
        setFormError(result.error);
      } else if (result.needsConfirmation) {
        setConfirmEmail(email);
        setPassword(''); setConfirm('');
      }
    }).catch(function(err) {
      setSubmitting(false);
      var msg = (err && err.message) || 'Something went wrong. Please try again.';
      setFormError(msg);
    });
  };

  var handleResend = function() {
    if (!confirmEmail) return;
    setSubmitting(true);
    setMessage(null);
    SupaAuth.resend(confirmEmail).then(function(result) {
      setSubmitting(false);
      if (result && result.error) {
        setFormError(result.error.message);
      } else {
        setMessage('Confirmation email resent! Please check your inbox.');
      }
    }).catch(function() {
      setSubmitting(false);
      setMessage('Confirmation email resent! Please check your inbox.');
    });
  };

  var handleGoogleSignIn = function() {
    setFormError(null);
    setMessage(null);
    setSubmitting(true);
    auth.signInWithGoogle().then(function(result) {
      if (!result.success) {
        setSubmitting(false);
        setFormError(result.error);
      }
      // If successful, onAuthStateChange will handle navigation automatically
    });
  };

  var handleBackToLogin = function() {
    setConfirmEmail(null);
    setMode('login');
    setEmail(confirmEmail || '');
    setMessage('Email confirmed? Sign in to continue.');
    setFormError(null);
  };

  // Password strength
  var getStrength = function(pw) {
    if (!pw) return { pct: 0, label: '', color: '' };
    var s = 0;
    if (pw.length >= 6) s++;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    var levels = [
      { pct: 20, label: 'Very Weak', color: 'bg-red-500' },
      { pct: 40, label: 'Weak', color: 'bg-orange-500' },
      { pct: 60, label: 'Fair', color: 'bg-yellow-500' },
      { pct: 80, label: 'Strong', color: 'bg-emerald-400' },
      { pct: 100, label: 'Very Strong', color: 'bg-emerald-500' }
    ];
    return levels[Math.min(s, levels.length) - 1] || levels[0];
  };

  var strength = mode === 'signup' ? getStrength(password) : null;

  var eyeIcon = html`<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d=${showPw ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.879L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0zm7.5 0c-1.275 4.057-5.064 7-9.5 7s-8.225-2.943-9.5-7c1.275-4.057 5.064-7 9.5-7s8.225 2.943 9.5 7z"}/></svg>`;
  // ── Email confirmation screen ──
  if (confirmEmail) {
    return html`<div className="auth-page min-h-screen flex items-center justify-center p-4">
      <div className="auth-backdrop"/>
      <div className="auth-card w-full max-w-md relative z-10 fade-in">
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Check Your Email</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">We sent a confirmation link to</p>
          <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 mt-1">${confirmEmail}</p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 space-y-2">
          <div className="flex items-start gap-2.5">
            <svg className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
            <p className="text-xs text-slate-600 dark:text-slate-300">Click the confirmation link in the email</p>
          </div>
          <div className="flex items-start gap-2.5">
            <svg className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
            <p className="text-xs text-slate-600 dark:text-slate-300">Check your spam/junk folder if you don't see it</p>
          </div>
          <div className="flex items-start gap-2.5">
            <svg className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
            <p className="text-xs text-slate-600 dark:text-slate-300">Come back here and sign in after confirming</p>
          </div>
        </div>

        ${message && html`<div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
          ${message}
        </div>`}

        ${formError && html`<div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
          ${formError}
        </div>`}

        <div className="space-y-3">
          <button onClick=${handleResend} disabled=${submitting}
            className=${"w-full py-3 px-4 rounded-xl text-sm font-semibold border-2 border-brand-500 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all duration-200 " + (submitting ? 'opacity-70 cursor-not-allowed' : '')}>
            ${submitting ? 'Sending...' : 'Resend Confirmation Email'}
          </button>
          <button onClick=${handleBackToLogin}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold auth-submit-btn text-white transition-all duration-200">
            Back to Sign In
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50 text-center">
          <p className="text-[11px] text-slate-300 dark:text-slate-600">Protected by Supabase Authentication</p>
        </div>
      </div>
    </div>`;
  }

  // ── Login / Signup form ──
  return html`<div className="auth-page min-h-screen flex items-center justify-center p-4">
    <div className="auth-backdrop"/>
    <div className="auth-card w-full max-w-md relative z-10 fade-in">
      <!-- Logo -->
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/30">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        </div>
        <h1 className="text-2xl font-bold gradient-text mb-1">Smart Invoice</h1>
        <p className="text-sm text-slate-400">${mode === 'login' ? 'Welcome back! Sign in to continue.' : 'Create your account to get started.'}</p>
      </div>

      <!-- Success message -->
      ${message && html`<div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
        ${message}
      </div>`}

      <!-- Error message -->
      ${formError && html`<div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
        ${formError}
      </div>`}

      <!-- Form -->
      <form onSubmit=${handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Email Address</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            <input id="auth-email" type="email" value=${email} onChange=${function(e){setEmail(e.target.value);}} placeholder="you@example.com"
              className="auth-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"/>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Password</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            <input id="auth-password" type=${showPw ? 'text' : 'password'} value=${password} onChange=${function(e){setPassword(e.target.value);}} placeholder="••••••••"
              className="auth-input w-full pl-10 pr-10 py-3 rounded-xl text-sm"/>
            <button type="button" onClick=${function(){setShowPw(!showPw);}} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">${eyeIcon}</button>
          </div>
          ${mode === 'signup' && password && html`<div className="mt-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div className=${"h-full rounded-full transition-all duration-300 " + strength.color} style=${{ width: strength.pct + "%" }}/>
              </div>
              <span className="text-[10px] font-medium text-slate-400 min-w-fit">${strength.label}</span>
            </div>
          </div>`}
        </div>

        ${mode === 'signup' && html`<div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Confirm Password</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            <input id="auth-confirm" type="password" value=${confirm} onChange=${function(e){setConfirm(e.target.value);}} placeholder="••••••••"
              className="auth-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"/>
          </div>
        </div>`}

        <button type="submit" disabled=${submitting} id="auth-submit"
          className=${"auth-submit-btn w-full py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-200 " + (submitting ? 'opacity-70 cursor-not-allowed' : '')}>
          ${submitting ? html`<span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
            ${mode === 'login' ? 'Signing In...' : 'Creating Account...'}
          </span>` : (mode === 'login' ? 'Sign In' : 'Create Account')}
        </button>
      </form>

      <!-- Divider -->
      <div className="mt-6 flex items-center justify-between">
        <span className="w-1/5 border-b border-slate-200 dark:border-slate-700 lg:w-1/4"></span>
        <span className="text-xs text-center text-slate-500 uppercase dark:text-slate-400 font-medium">or continue with</span>
        <span className="w-1/5 border-b border-slate-200 dark:border-slate-700 lg:w-1/4"></span>
      </div>

      <!-- Google Button -->
      <div className="mt-6">
        <button type="button" onClick=${handleGoogleSignIn} disabled=${submitting} className=${"w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm " + (submitting ? 'opacity-70 cursor-not-allowed' : '')}>
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Google
        </button>
      </div>

      <!-- Toggle mode -->
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-400">
          ${mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick=${switchMode} className="text-brand-500 hover:text-brand-600 font-semibold transition-colors">
            ${mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>

      <!-- Footer -->
      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50 text-center">
        <p className="text-[11px] text-slate-300 dark:text-slate-600">Protected by Supabase Authentication</p>
      </div>
    </div>
  </div>`;
}
