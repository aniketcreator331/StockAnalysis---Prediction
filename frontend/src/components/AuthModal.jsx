import React, { useState } from 'react';
import { X, Mail, Lock, User, UserPlus, LogIn } from 'lucide-react';
import { authApi } from '../services/api';
import { GoogleLogin } from '@react-oauth/google';

const AuthModal = ({ isOpen, onClose, initialMode = 'login', onLoginSuccess }) => {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      if (mode === 'login') {
        data = await authApi.login(email, password);
      } else {
        data = await authApi.register(email, password);
      }
      
      console.log(`${mode} successful:`, data);
      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }
      onClose();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const data = await authApi.googleLogin(credentialResponse.credential);
      console.log("Google login successful:", data);
      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }
      onClose();
    } catch (error) {
      console.error("Google login failed:", error);
      setError("Google authentication failed.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div 
        className="bg-white dark:bg-darkCard w-full max-w-md rounded-2xl shadow-xl border border-gray-200 dark:border-darkBorder overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-darkBorder">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800 dark:text-gray-100">
            {mode === 'login' ? <><LogIn size={20} /> Sign In</> : <><UserPlus size={20} /> Create Account</>}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-darkBorder transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-darkBorder rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white dark:bg-darkBg text-gray-900 dark:text-gray-100 placeholder-gray-400 transition-colors"
                  placeholder="you@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-darkBorder rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white dark:bg-darkBg text-gray-900 dark:text-gray-100 placeholder-gray-400 transition-colors"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 mt-2"
            >
              {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Register')}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center space-x-4">
            <span className="h-px w-full bg-gray-200 dark:bg-darkBorder"></span>
            <span className="text-sm text-gray-500 font-medium">OR</span>
            <span className="h-px w-full bg-gray-200 dark:bg-darkBorder"></span>
          </div>

          <div className="mt-6 flex justify-center">
             <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login Failed')}
              />
          </div>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              {mode === 'login' ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
