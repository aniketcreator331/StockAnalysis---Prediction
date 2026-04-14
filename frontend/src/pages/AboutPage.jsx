import React, { useState } from 'react';
import {
  Activity, Code2, Brain, Globe, Mail, MessageSquare, Zap, Shield,
  TrendingUp, BarChart2, Target, Users, Star, Award, Cpu, Layers,
  ArrowRight, Github, Linkedin, Phone, CheckCircle, Rocket, Heart
} from 'lucide-react';

// ── Team Members ──────────────────────────────────────────────────────────────
const TEAM = [
  {
    name: 'Aniket',
    role: 'Lead Developer & Architect',
    avatar: 'AN',
    color: 'from-blue-500 to-indigo-600',
    skills: ['React', 'FastAPI', 'ML Models', 'System Design'],
    bio: 'Leads the full-stack architecture, AI integration, and overall product vision.',
    icon: Code2,
  },
  {
    name: 'Arun',
    role: 'Backend & Data Engineer',
    avatar: 'AR',
    color: 'from-emerald-500 to-teal-600',
    skills: ['Python', 'FastAPI', 'MongoDB', 'Data Pipelines'],
    bio: 'Architects the data fetching layer, API design, and real-time market data feeds.',
    icon: Cpu,
  },
  {
    name: 'Prasoon',
    role: 'AI / ML Specialist',
    avatar: 'PR',
    color: 'from-purple-500 to-violet-600',
    skills: ['Machine Learning', 'Time Series', 'LSTM', 'Prediction Models'],
    bio: 'Designs and trains the AI prediction engine powering stock forecasts.',
    icon: Brain,
  },
  {
    name: 'Himanshu',
    role: 'UI/UX & Frontend Developer',
    avatar: 'HI',
    color: 'from-rose-500 to-pink-600',
    skills: ['React', 'TailwindCSS', 'Data Visualization', 'Design Systems'],
    bio: 'Crafts the visual experience — charts, dashboards, and the sleek interface.',
    icon: Layers,
  },
];

// ── Tech Stack ────────────────────────────────────────────────────────────────
const TECH_STACK = [
  { category: 'Frontend', color: 'blue', items: ['React 18', 'Vite', 'TailwindCSS', 'Recharts', 'Lucide Icons', 'React Router v6'] },
  { category: 'Backend',  color: 'emerald', items: ['Python 3.11', 'FastAPI', 'Uvicorn', 'PyMongo', 'yfinance', 'scikit-learn'] },
  { category: 'AI / ML',  color: 'purple', items: ['LSTM Neural Nets', 'Time-Series Forecasting', 'Black-Scholes Options Pricing', 'Sentiment Analysis'] },
  { category: 'Database', color: 'amber',  items: ['MongoDB Atlas', 'LocalStorage (Client)', 'In-memory Caching', 'REST API Layer'] },
];

// ── Features ──────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: TrendingUp,  title: 'Live Market Data',      desc: 'Real-time stock prices, volume, and market breadth across global exchanges.' },
  { icon: Brain,       title: 'AI Price Prediction',   desc: 'LSTM-powered machine learning models for short-term price forecasting.' },
  { icon: BarChart2,   title: 'Advanced Charting',     desc: 'Candlestick, OHLC, and custom chart overlays with 20+ technical indicators.' },
  { icon: Zap,         title: 'Intraday & F&O',        desc: 'Simulated intraday trading with 5x leverage, futures & options with real Black-Scholes pricing.' },
  { icon: Shield,      title: 'Demo Trading',          desc: 'Risk-free paper trading with a virtual ₹1,00,000 portfolio and real market prices.' },
  { icon: Target,      title: 'Portfolio Analytics',   desc: 'Detailed P&L tracking, sector allocation, risk metrics, and performance attribution.' },
  { icon: Layers,      title: 'Options Chain',         desc: 'Live options chain with CE/PE greeks — Delta, Theta, Gamma, Vega — powered by Black-Scholes.' },
  { icon: Globe,       title: 'Scarlet AI Assistant',  desc: 'A context-aware AI chatbot providing market insights, definitions, and live data on demand.' },
];

// ── Timeline ──────────────────────────────────────────────────────────────────
const TIMELINE = [
  { period: 'Phase 1', label: 'Foundation', desc: 'Core live dashboard, stock search, candlestick charts, and FastAPI backend setup.' },
  { period: 'Phase 2', label: 'Intelligence', desc: 'AI prediction module with LSTM models, market comparison tools, and tickers directory.' },
  { period: 'Phase 3', label: 'Trading',     desc: 'Demo trading engine with order management, portfolio tracking, and advanced calculators.' },
  { period: 'Phase 4', label: 'AI & F&O',   desc: 'Scarlet AI assistant, intraday trading with leverage, F&O simulation and options chain.' },
  { period: 'Phase 5', label: 'Polish',      desc: 'Portfolio analytics, risk dashboard, dark mode, currency support, and responsive design.' },
];

// ── Color util ────────────────────────────────────────────────────────────────
const colorMap = {
  blue:   { badge:'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',   border:'border-blue-200 dark:border-blue-800/40',   icon:'text-blue-500' },
  emerald:{ badge:'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300', border:'border-emerald-200 dark:border-emerald-800/40', icon:'text-emerald-500' },
  purple: { badge:'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',   border:'border-purple-200 dark:border-purple-800/40', icon:'text-purple-500' },
  amber:  { badge:'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',     border:'border-amber-200 dark:border-amber-800/40',   icon:'text-amber-500' },
  rose:   { badge:'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',       border:'border-rose-200 dark:border-rose-800/40',     icon:'text-rose-500' },
};

export default function AboutPage() {
  const [hoveredMember, setHoveredMember] = useState(null);

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-10">

      {/* ── HERO ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 shadow-2xl p-10 text-center">
        {/* Glow blobs */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-purple-500/15 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

        <div className="relative z-10">
          {/* Logo mark */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 shadow-lg shadow-primary/40 mb-5">
            <Activity size={38} className="text-white" />
          </div>

          <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-4 mx-auto">
            <Rocket size={12} /> Built by Micro Tech
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
            Stock Analysis &amp;{' '}
            <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Prediction
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed mt-3">
            A full-stack, AI-driven financial workstation combining real-time market intelligence,
            deep-learning price forecasting, and a professional-grade paper trading simulator.
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Live Stock Feeds', value: '10,000+' },
              { label: 'AI Predictions',   value: 'LSTM v2'  },
              { label: 'Team Members',     value: '4' },
              { label: 'Pages & Modules',  value: '12+' },
            ].map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs text-gray-400 font-semibold mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MISSION ── */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-darkCard rounded-2xl border border-gray-100 dark:border-darkBorder shadow-sm p-7">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary"><Target size={20} /></div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Our Mission</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
            To democratize financial intelligence by building tools that were previously only
            available to professional traders and hedge funds — and making them accessible,
            intuitive, and free for every student, investor, and enthusiast.
          </p>
          <ul className="mt-4 space-y-2">
            {['Real-time data for everyone', 'AI that explains itself', 'Learn by doing with Demo Trading', 'Open, transparent, educational'].map((p, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle size={14} className="text-emerald-500 shrink-0" /> {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-darkCard rounded-2xl border border-gray-100 dark:border-darkBorder shadow-sm p-7">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-500"><Star size={20} /></div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">What Makes Us Different</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
            Unlike simple stock screeners, we combine live data, AI forecasting, options pricing,
            and a full trading simulator into a single unified workstation — with Scarlet, your
            personal AI financial assistant, always available.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {['Black-Scholes Pricing', 'LSTM Forecasting', 'Live F&O Chain', 'Scarlet AI', 'Multi-currency', 'Dark Mode'].map((t, i) => (
              <span key={i} className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── TEAM ── */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-500"><Users size={18} /></div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">The Micro Tech Team</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {TEAM.map((member, i) => {
            const Icon = member.icon;
            const isHover = hoveredMember === i;
            return (
              <div key={i}
                onMouseEnter={() => setHoveredMember(i)}
                onMouseLeave={() => setHoveredMember(null)}
                className={`bg-white dark:bg-darkCard rounded-2xl border border-gray-100 dark:border-darkBorder shadow-sm p-6 text-center transition-all duration-300 cursor-default
                  ${isHover ? 'shadow-lg -translate-y-1 border-primary/30 dark:border-primary/30' : ''}`}>
                {/* Avatar */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-extrabold text-xl mx-auto mb-4 shadow-lg`}>
                  {member.avatar}
                </div>
                <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">{member.name}</h3>
                <div className="flex items-center justify-center gap-1.5 mt-1 mb-3">
                  <Icon size={12} className="text-primary" />
                  <p className="text-xs font-semibold text-primary">{member.role}</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">{member.bio}</p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {member.skills.map((s, j) => (
                    <span key={j} className="text-[10px] bg-gray-100 dark:bg-darkBorder text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full font-semibold">{s}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── FEATURES GRID ── */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500"><Award size={18} /></div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Platform Features</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="bg-white dark:bg-darkCard rounded-2xl border border-gray-100 dark:border-darkBorder shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                  <Icon size={18} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── TECH STACK ── */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-500"><Code2 size={18} /></div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Tech Stack</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TECH_STACK.map((ts, i) => {
            const c = colorMap[ts.color] || colorMap.blue;
            return (
              <div key={i} className={`bg-white dark:bg-darkCard rounded-2xl border ${c.border} shadow-sm p-5`}>
                <h3 className={`text-xs font-extrabold uppercase tracking-widest mb-3 ${c.icon}`}>{ts.category}</h3>
                <div className="space-y-2">
                  {ts.items.map((item, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <ArrowRight size={10} className={c.icon} />
                      <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── TIMELINE ── */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-500"><Rocket size={18} /></div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Development Journey</h2>
        </div>
        <div className="relative">
          {/* Connector line */}
          <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary via-purple-400 to-pink-500 rounded-full hidden md:block" />
          <div className="space-y-4">
            {TIMELINE.map((t, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="hidden md:flex flex-col items-center shrink-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-xs font-extrabold shadow-lg z-10">
                    {i + 1}
                  </div>
                </div>
                <div className="flex-1 bg-white dark:bg-darkCard rounded-2xl border border-gray-100 dark:border-darkBorder shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{t.period}</span>
                    <h3 className="font-extrabold text-gray-900 dark:text-white">{t.label}</h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTACT / CTA ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 to-indigo-700 border border-primary/30 shadow-2xl p-8 text-center">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px), radial-gradient(circle at 70% 50%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="relative z-10">
          <Heart size={32} className="text-white mx-auto mb-3 opacity-80" />
          <h2 className="text-2xl font-extrabold text-white mb-2">Built with passion by Micro Tech</h2>
          <p className="text-primary-100 text-sm text-white/70 max-w-xl mx-auto mb-6">
            We're a team of B.Tech students passionate about finance, AI, and building tools that actually help people
            make smarter decisions in the market.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="mailto:stockgpt331@gmail.com"
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all">
              <Mail size={15} /> stockgpt331@gmail.com
            </a>
            <a href="https://wa.me/919784087841" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all">
              <Phone size={15} /> +91-9784087841
            </a>
          </div>
          <div className="mt-6 pt-5 border-t border-white/20 flex items-center justify-center gap-1.5 text-white/50 text-xs font-medium">
            <span>© 2026</span>
            <span className="font-extrabold text-white/70">Micro Tech</span>
            <span>· All rights reserved ·</span>
            <span>Made with ❤️ for the B.Tech community</span>
          </div>
        </div>
      </div>

    </div>
  );
}
