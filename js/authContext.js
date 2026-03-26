// ── Auth Context Provider ──

var AuthContext = createContext();

function AuthProvider(props) {
  var _u = useState(null), user = _u[0], setUser = _u[1];
  var _l = useState(true), loading = _l[0], setLoading = _l[1];
  var _e = useState(null), error = _e[0], setError = _e[1];

  // Check session on mount + listen for auth changes
  useEffect(function() {
    // Get initial session
    SupaAuth.getSession().then(function(result) {
      var session = result.data && result.data.session;
      setUser(session ? session.user : null);
      setLoading(false);
    });

    // Listen for auth state changes (login/logout only)
    var subscription = SupaAuth.onAuthStateChange(function(event, session) {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        setUser(session ? session.user : null);
      }
    });

    return function() {
      if (subscription && subscription.data && subscription.data.subscription) {
        subscription.data.subscription.unsubscribe();
      }
    };
  }, []);

  var handleSignUp = useCallback(function(email, password) {
    setError(null);
    return SupaAuth.signUp(email, password).then(function(result) {
      if (result.error) {
        var msg = result.error.message || 'Signup failed';
        // Friendly message for rate limits
        if (result.error.status === 429 || msg.indexOf('rate limit') !== -1 || msg.indexOf('429') !== -1) {
          msg = 'Too many signup attempts. Please wait a few minutes and try again.';
        }
        setError(msg);
        return { success: false, error: msg };
      }
      // Check if email confirmation is required
      if (result.data && result.data.user && !result.data.session) {
        return { success: true, needsConfirmation: true };
      }
      // Auto-logged in (no email confirmation required)
      if (result.data && result.data.session) {
        setUser(result.data.session.user);
      }
      return { success: true };
    }).catch(function(err) {
      var msg = (err && err.message) || 'Signup failed. Please try again.';
      if (msg.indexOf('rate limit') !== -1 || msg.indexOf('429') !== -1) {
        msg = 'Too many signup attempts. Please wait a few minutes and try again.';
      }
      setError(msg);
      return { success: false, error: msg };
    });
  }, []);

  var handleSignIn = useCallback(function(email, password) {
    setError(null);
    return SupaAuth.signIn(email, password).then(function(result) {
      if (result.error) {
        setError(result.error.message);
        return { success: false, error: result.error.message };
      }
      return { success: true };
    }).catch(function(err) {
      var msg = (err && err.message) || 'Login failed. Please try again.';
      setError(msg);
      return { success: false, error: msg };
    });
  }, []);

  var handleGoogleSignIn = useCallback(function() {
    setError(null);
    return SupaAuth.signInWithGoogle().then(function(result) {
      if (result.error) {
        setError(result.error.message);
        return { success: false, error: result.error.message };
      }
      return { success: true };
    }).catch(function(err) {
      var msg = (err && err.message) || 'Google Login failed. Please try again.';
      setError(msg);
      return { success: false, error: msg };
    });
  }, []);

  var handleSignOut = useCallback(function() {
    setLoading(true);
    return SupaAuth.signOut().then(function() {
      setUser(null);
      setLoading(false);
    });
  }, []);

  var clearError = useCallback(function() { setError(null); }, []);

  return html`<${AuthContext.Provider} value=${{
    user: user,
    loading: loading,
    error: error,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signInWithGoogle: handleGoogleSignIn,
    signOut: handleSignOut,
    clearError: clearError
  }}>${props.children}<//>`;
}
