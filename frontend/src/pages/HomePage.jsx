import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity, BarChart2, Layers, ShoppingCart, ArrowRight, TrendingUp,
  Brain, Shield, Zap, Globe, Database, Star, CheckCircle, Calculator,
  LineChart, RefreshCw, Bell, Users, Lock
} from 'lucide-react';

const HomePage = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
          }
        });
      },
      { threshold: 0.1 }
    );
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));
    return () => elements.forEach((el) => observer.unobserve(el));
  }, []);

  const features = [
    {
      title: 'Live Dashboard',
      description: 'Track real-time market data with interactive candlestick charts, automated volume tracking, and follow your favorite stocks.',
      icon: <Activity size={32} className="text-blue-500 mb-4" />,
      link: '/dashboard',
      border: 'hover:border-blue-500/50 hover:shadow-blue-500/20'
    },
    {
      title: 'AI Price Predictions',
      description: 'Leverage our LSTM neural-network model to map historic patterns into forward-looking price forecasts over a 30-minute horizon.',
      icon: <BarChart2 size={32} className="text-purple-500 mb-4" />,
      link: '/predictions',
      border: 'hover:border-purple-500/50 hover:shadow-purple-500/20'
    },
    {
      title: 'Market Overview',
      description: 'Instantly analyze 100+ top equities scored by daily growth, volatility, and a smart Buy / Hold / Sell recommendation engine.',
      icon: <Layers size={32} className="text-orange-500 mb-4" />,
      link: '/comparison',
      border: 'hover:border-orange-500/50 hover:shadow-orange-500/20'
    },
    {
      title: 'Paper Trading Simulator',
      description: 'Test strategies risk-free with a $100,000 virtual balance. Place orders with a professional confirmation flow and track your P&L.',
      icon: <ShoppingCart size={32} className="text-emerald-500 mb-4" />,
      link: '/demotrading',
      border: 'hover:border-emerald-500/50 hover:shadow-emerald-500/20'
    },
    {
      title: 'Financial Calculators',
      description: 'Compute SIP returns, SWP drawdowns, brokerage charges, and required margin — all in one dedicated, real-time calculator hub.',
      icon: <Calculator size={32} className="text-pink-500 mb-4" />,
      link: '/calculators',
      border: 'hover:border-pink-500/50 hover:shadow-pink-500/20'
    },
    {
      title: 'Compare Stocks',
      description: 'Place two stocks side-by-side and compare price history, growth trends, and volatility on a single synchronized chart view.',
      icon: <LineChart size={32} className="text-cyan-500 mb-4" />,
      link: '/comparetwo',
      border: 'hover:border-cyan-500/50 hover:shadow-cyan-500/20'
    },
  ];

  const modelDetails = [
    {
      icon: <Brain size={28} className="text-purple-400" />,
      title: 'LSTM Neural Network',
      desc: 'Our core prediction engine is built on a Long Short-Term Memory (LSTM) Recurrent Neural Network — the gold-standard architecture for time-series forecasting. It\'s specifically designed to capture long-range temporal dependencies in sequential stock price data.'
    },
    {
      icon: <Database size={28} className="text-blue-400" />,
      title: 'TensorFlow / Keras Backend',
      desc: 'The model is implemented using Google\'s TensorFlow and Keras frameworks. It is trained on 2 years of historical daily closing prices fetched live from Yahoo Finance, then serialized and stored for fast real-time inference.'
    },
    {
      icon: <RefreshCw size={28} className="text-emerald-400" />,
      title: 'On-Demand Retraining',
      desc: 'You can retrain the LSTM model on the latest available data at any time by clicking the "Retrain Model" button on the Predictions page. This ensures the model always reflects the most recent market behavior and seasonal patterns.'
    },
    {
      icon: <LineChart size={28} className="text-orange-400" />,
      title: 'MinMax Scaling & Windowed Input',
      desc: 'Before training, all price data is normalized to a [0,1] range using MinMax Scaling. The model receives a sliding 60-day lookback window as input and learns to predict the closing price for the next N intervals forward.'
    },
  ];

  const specialFeatures = [
    { icon: <Shield size={20} className="text-emerald-400" />, text: 'Google OAuth Sign-In — secure, one-click login' },
    { icon: <Database size={20} className="text-blue-400" />, text: 'MongoDB Atlas cloud database — data syncs across all your devices' },
    { icon: <Users size={20} className="text-purple-400" />, text: 'Per-account isolation — every user\'s portfolio is privately scoped' },
    { icon: <Bell size={20} className="text-orange-400" />, text: 'Price alert system — get notified when a stock crosses your target' },
    { icon: <Globe size={20} className="text-cyan-400" />, text: 'Multi-currency support — view prices in USD, INR, EUR, GBP, and more' },
    { icon: <Zap size={20} className="text-yellow-400" />, text: 'Auto-refresh every 5 minutes — live prices without manual reload' },
    { icon: <Lock size={20} className="text-red-400" />, text: 'Confirmation modals on all trades — no accidental orders' },
    { icon: <Star size={20} className="text-pink-400" />, text: 'Follow stocks — personalized feed of your watchlist in the sidebar' },
  ];

  return (
    <div className="space-y-16 pb-16 overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative w-full py-20 lg:py-32 flex flex-col items-center justify-center text-center px-4 overflow-hidden rounded-3xl bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder shadow-xl">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-700"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6 border border-primary/20">
            <TrendingUp size={16} /> AI-Powered Stock Intelligence Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-gray-400 tracking-tight leading-tight mb-6">
            Welcome to <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Stock Analysis & Prediction</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mb-10 leading-relaxed font-medium">
            A full-stack financial workstation combining real-time market data, deep-learning price forecasting, and a professional-grade paper trading simulator — all in one platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <NavLink to="/dashboard" className="px-8 py-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-lg transition-all shadow-lg shadow-primary/30 flex items-center justify-center transform hover:-translate-y-1">
              Launch Dashboard <ArrowRight size={20} className="ml-2" />
            </NavLink>
            <NavLink to="/predictions" className="px-8 py-4 rounded-xl bg-white dark:bg-darkBg border-2 border-gray-200 dark:border-darkBorder text-gray-800 dark:text-white font-bold text-lg transition-all hover:border-primary/50 flex items-center justify-center transform hover:-translate-y-1">
              <Brain size={20} className="mr-2 text-purple-500" /> View AI Predictions
            </NavLink>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
        {[
          { value: '100+', label: 'Top Equities Tracked', color: 'text-gray-900 dark:text-white' },
          { value: 'LSTM', label: 'AI Neural Network', color: 'text-purple-500' },
          { value: '$100k', label: 'Paper Trading Balance', color: 'text-emerald-500' },
          { value: 'Live', label: 'Real-Time Data Feed', color: 'text-blue-500' },
        ].map((s, i) => (
          <div key={i} className="p-6 text-center bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-2xl shadow-sm">
            <h3 className={`text-4xl font-black mb-2 ${s.color}`}>{s.value}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </section>

      {/* ── Feature Modules ── */}
      <section className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Explore Every Module</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Each section of the platform is purpose-built for a specific financial workflow.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <NavLink to={f.link} key={i} className={`block bg-white dark:bg-darkCard p-8 rounded-3xl border border-gray-100 dark:border-darkBorder shadow-sm transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl ${f.border}`}>
              {f.icon}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{f.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{f.description}</p>
              <div className="mt-6 flex items-center text-primary font-bold text-sm">
                Open Module <ArrowRight size={14} className="ml-2" />
              </div>
            </NavLink>
          ))}
        </div>
      </section>

      {/* ── AI Model Deep-Dive ── */}
      <section className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold text-sm mb-4 border border-purple-200 dark:border-purple-700/50">
            <Brain size={16} /> How The AI Model Works
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Built on Deep Learning</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Our prediction engine is not a simple moving average. It's a trained neural network that understands time-series patterns in stock data.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modelDetails.map((m, i) => (
            <div key={i} className="bg-white dark:bg-darkCard p-6 rounded-2xl border border-gray-100 dark:border-darkBorder shadow-sm hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-gray-50 dark:bg-darkBg">{m.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{m.title}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{m.desc}</p>
            </div>
          ))}
        </div>

        {/* Model Architecture Diagram */}
        <div className="mt-8 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700/30 rounded-3xl p-8 text-center">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Model Architecture</h3>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { label: 'Raw Price Data', sub: 'Yahoo Finance API', color: 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300' },
              { label: '→', sub: '', color: 'bg-transparent border-transparent text-gray-400 text-2xl font-black' },
              { label: 'MinMax Scaler', sub: 'Normalize [0,1]', color: 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300' },
              { label: '→', sub: '', color: 'bg-transparent border-transparent text-gray-400 text-2xl font-black' },
              { label: '60-Day Window', sub: 'Sliding Input', color: 'bg-orange-100 dark:bg-orange-900/40 border-orange-300 dark:border-orange-600 text-orange-700 dark:text-orange-300' },
              { label: '→', sub: '', color: 'bg-transparent border-transparent text-gray-400 text-2xl font-black' },
              { label: 'LSTM Layer ×2', sub: '50 Units Each', color: 'bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300' },
              { label: '→', sub: '', color: 'bg-transparent border-transparent text-gray-400 text-2xl font-black' },
              { label: 'Dense Output', sub: 'Predicted Price', color: 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300' },
            ].map((node, i) => (
              node.sub === '' ? (
                <span key={i} className="text-2xl font-black text-gray-400">{node.label}</span>
              ) : (
                <div key={i} className={`px-4 py-3 rounded-xl border font-semibold text-center ${node.color}`}>
                  <div className="text-sm font-bold">{node.label}</div>
                  <div className="text-xs opacity-70 mt-0.5">{node.sub}</div>
                </div>
              )
            ))}
          </div>
        </div>
      </section>

      {/* ── Special Features ── */}
      <section className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
        <div className="bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-3xl p-10 shadow-sm">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-4 border border-emerald-200 dark:border-emerald-700/50">
              <Zap size={16} /> Platform Highlights
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Special Features</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {specialFeatures.map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-darkBg border border-gray-100 dark:border-darkBorder">
                <div className="mt-0.5 shrink-0 p-1.5 rounded-lg bg-white dark:bg-darkCard shadow-sm">{f.icon}</div>
                <p className="text-gray-700 dark:text-gray-300 font-medium text-sm leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Built With</h2>
          <p className="text-gray-500 dark:text-gray-400">Enterprise-grade tools used in real-world production environments.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {[
            { name: 'React', role: 'Frontend UI', color: 'text-blue-500' },
            { name: 'FastAPI', role: 'Python Backend', color: 'text-emerald-500' },
            { name: 'TensorFlow', role: 'AI/ML Engine', color: 'text-orange-500' },
            { name: 'MongoDB', role: 'Cloud Database', color: 'text-green-500' },
            { name: 'Vercel', role: 'Frontend Host', color: 'text-gray-700 dark:text-gray-300' },
            { name: 'Render', role: 'Backend Host', color: 'text-purple-500' },
          ].map((t, i) => (
            <div key={i} className="p-4 text-center bg-white dark:bg-darkCard rounded-2xl border border-gray-100 dark:border-darkBorder shadow-sm hover:shadow-md transition-all">
              <p className={`text-base font-extrabold ${t.color}`}>{t.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-darkCard dark:to-darkBg p-12 rounded-3xl text-center shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.8),transparent_60%)]"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold text-white mb-4">Ready to Predict the Market?</h2>
          <p className="text-gray-400 font-medium mb-8 max-w-lg mx-auto">Sign in with Google, follow your favourite stocks, and let our LSTM model do the heavy lifting.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <NavLink to="/predictions" className="inline-flex items-center px-8 py-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold transition-all shadow-lg hover:shadow-primary/50 transform hover:scale-105">
              <Brain size={18} className="mr-2" /> Launch AI Predictions
            </NavLink>
            <NavLink to="/demotrading" className="inline-flex items-center px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all border border-white/20">
              <ShoppingCart size={18} className="mr-2" /> Start Paper Trading
            </NavLink>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
