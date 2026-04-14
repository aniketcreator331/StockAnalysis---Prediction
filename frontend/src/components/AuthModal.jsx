import React, { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { authApi } from '../services/api';

const AuthModal = ({ isOpen, onClose, defaultIsLogin = true, setUser }) => {
  const [isLogin, setIsLogin] = useState(defaultIsLogin);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError('');
        const data = await authApi.googleLogin(tokenResponse.access_token);
        setUser(data.user);
        onClose();
      } catch (error) {
        setError("Google login failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google Login Failed');
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      setError("Please fill out all fields");
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const data = await authApi.login(email, password);
        setUser(data.user);
        onClose();
      } else {
        const data = await authApi.register(email, password, name);
        setUser(data.user);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in-up">
      <div className="bg-white dark:bg-darkCard rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col pointer-events-auto">
        <div className="flex justify-between items-center p-6 pb-2">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-darkBorder rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 pt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {isLogin ? 'Sign in to access your portfolio and saved watchlists.' : 'Join StockIQ for advanced AI market predictions.'}
          </p>

          <button 
            type="button"
            onClick={() => handleGoogleLogin()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-darkBorder/70 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-200 dark:border-darkBorder"></div>
            <span className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Or continue with email</span>
            <div className="flex-1 border-t border-gray-200 dark:border-darkBorder"></div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 border border-rose-200 dark:border-rose-900/50">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold shadow-md shadow-primary/30 flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
            >
              {loading ? (
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full block"></span>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-primary hover:underline font-bold"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
