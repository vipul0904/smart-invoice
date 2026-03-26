// ── Supabase Client + Auth Helpers ──

var SUPABASE_URL = 'https://rjhtsljuyebazwaduste.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqaHRzbGp1eWViYXp3YWR1c3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzOTQ3NjAsImV4cCI6MjA4OTk3MDc2MH0.nqyjhfFudFaig3jgjPhsH729torHy_k_jVqC5WnrDH4';

// Safely initialize Supabase client (handles CDN load failures gracefully)
var supabaseClient = null;
try {
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } else {
    console.error('Supabase JS library not loaded. Check your internet connection or CDN availability.');
  }
} catch(e) {
  console.error('Failed to initialize Supabase client:', e);
}

// Auth helper functions (safe wrappers that handle missing client)
var SupaAuth = {
  signUp: function(email, password) {
    if (!supabaseClient) return Promise.reject(new Error('Supabase not initialized'));
    return supabaseClient.auth.signUp({ email: email, password: password });
  },
  signIn: function(email, password) {
    if (!supabaseClient) return Promise.reject(new Error('Supabase not initialized'));
    return supabaseClient.auth.signInWithPassword({ email: email, password: password });
  },
  signInWithGoogle: function() {
    if (!supabaseClient) return Promise.reject(new Error('Supabase not initialized'));
    return supabaseClient.auth.signInWithOAuth({ provider: 'google' });
  },
  signOut: function() {
    if (!supabaseClient) return Promise.reject(new Error('Supabase not initialized'));
    return supabaseClient.auth.signOut();
  },
  getSession: function() {
    if (!supabaseClient) return Promise.resolve({ data: { session: null } });
    return supabaseClient.auth.getSession();
  },
  onAuthStateChange: function(callback) {
    if (!supabaseClient) return { data: { subscription: { unsubscribe: function(){} } } };
    return supabaseClient.auth.onAuthStateChange(callback);
  },
  resend: function(email) {
    if (!supabaseClient) return Promise.reject(new Error('Supabase not initialized'));
    return supabaseClient.auth.resend({ type: 'signup', email: email });
  }
};
