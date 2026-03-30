import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, BarChart2, Layers, BookOpen, ShoppingCart, ArrowRight, TrendingUp } from 'lucide-react';

const HomePage = () => {
  // Simple intersection observer to trigger scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const features = [
    {
      title: 'Live Dashboard',
      description: 'Track real-time market data with interactive candlestick charts, automated volume tracking, and personalized boundary alert systems.',
      icon: <Activity size={32} className="text-blue-500 mb-4" />,
      link: '/dashboard',
      bgClass: 'hover:border-blue-500/50 hover:shadow-blue-500/20'
    },
    {
      title: 'AI Price Predictions',
      description: 'Leverage our neural-network LSTM machine learning models to map historic patterns into predictive future stock trends.',
      icon: <BarChart2 size={32} className="text-purple-500 mb-4" />,
      link: '/predictions',
      bgClass: 'hover:border-purple-500/50 hover:shadow-purple-500/20'
    },
    {
      title: 'Market Overview',
      description: 'Analyze an actively maintained basket of 100 top tech equities scoring them instantly by their Daily Growth and Volatility attributes.',
      icon: <Layers size={32} className="text-orange-500 mb-4" />,
      link: '/comparison',
      bgClass: 'hover:border-orange-500/50 hover:shadow-orange-500/20'
    },
    {
      title: 'Paper Trading Simulator',
      description: 'Test your trading strategies risk-free. Get a $100,000 starting mock balance and buy/sell real stock indexes live on the market.',
      icon: <ShoppingCart size={32} className="text-emerald-500 mb-4" />,
      link: '/demotrading',
      bgClass: 'hover:border-emerald-500/50 hover:shadow-emerald-500/20'
    }
  ];

  return (
    <div className="space-y-16 pb-12 overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative w-full py-20 lg:py-32 flex flex-col items-center justify-center text-center px-4 overflow-hidden rounded-3xl bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder shadow-xl shadow-gray-200/40 dark:shadow-black/20">
        
        {/* Background Decorative animated elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-700"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center animate-fade-in-up duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6 border border-primary/20">
            <TrendingUp size={16} /> Welcome to the Next Generation
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-gray-400 tracking-tight leading-tight mb-6">
            Welcome to <br className="hidden md:block"/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Stock Analysis & Prediction</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mb-10 leading-relaxed font-medium">
            The all-in-one financial workstation integrating comprehensive asset exploration, machine learning forecasting, and zero-risk portfolio simulations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <NavLink to="/dashboard" className="px-8 py-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-lg transition-all shadow-lg shadow-primary/30 flex items-center justify-center transform hover:-translate-y-1">
              Launch Dashboard <ArrowRight size={20} className="ml-2" />
            </NavLink>
            <NavLink to="/demotrading" className="px-8 py-4 rounded-xl bg-white dark:bg-darkBg border-2 border-gray-200 dark:border-darkBorder text-gray-800 dark:text-white font-bold text-lg transition-all hover:border-gray-300 dark:hover:border-gray-500 flex items-center justify-center transform hover:-translate-y-1">
              Try Paper Trading
            </NavLink>
          </div>
        </div>
      </section>

      {/* Stats Section with Scroll Animation */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-on-scroll opacity-0 translate-y-8 duration-700 transition-all">
         <div className="p-6 text-center bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-2xl shadow-sm">
           <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-2">100+</h3>
           <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Top Equities</p>
         </div>
         <div className="p-6 text-center bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-2xl shadow-sm">
           <h3 className="text-4xl font-black text-blue-500 mb-2">Real-Time</h3>
           <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Live Updates</p>
         </div>
         <div className="p-6 text-center bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-2xl shadow-sm">
           <h3 className="text-4xl font-black text-purple-500 mb-2">LSTM</h3>
           <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">AI Integration</p>
         </div>
         <div className="p-6 text-center bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-2xl shadow-sm">
           <h3 className="text-4xl font-black text-emerald-500 mb-2">$100k</h3>
           <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Demo Balance</p>
         </div>
      </section>

      {/* Application Features Grid */}
      <section className="animate-on-scroll opacity-0 translate-y-8 duration-1000 delay-200 transition-all">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Explore Our Features</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Select a module below to start analyzing market data, tracking trends, or comparing your favorite assets.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <NavLink 
              to={feature.link} 
              key={idx}
              className={`block bg-white dark:bg-darkCard p-8 rounded-3xl border border-gray-100 dark:border-darkBorder shadow-sm transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl ${feature.bgClass}`}
            >
              {feature.icon}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{feature.description}</p>
              
              <div className="mt-8 flex items-center text-primary font-bold">
                Access Module <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </NavLink>
          ))}
        </div>
      </section>
      
      {/* Call to Action ending */}
      <section className="animate-on-scroll opacity-0 translate-y-8 duration-700 transition-all bg-gradient-to-br from-gray-900 to-gray-800 dark:from-darkCard dark:to-darkBg p-12 rounded-3xl text-center shadow-2xl relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCc+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSdnJyB4MT0nMTAlJyB5MT0nMTAlJyB4Mj0nMTAwJScgeTI9JzEwMCUnPjxzdG9wIG9mZnNldD0nMCUnIHN0b3AtY29sb3I9JyNmZmYnIHN0b3Atb3BhY2l0eT0nMC4wNScvPjxzdG9wIG9mZnNldD0nMTAwJScgc3RvcC1jb2xvcj0nIzAwMCcgc3RvcC1vcGFjaXR5PScwLjA1Jy8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9JzQwJyBoZWlnaHQ9JzQwJyBmaWxsPSd1cmwoI2cpJy8+PC9zdmc+')] opacity-20 pointer-events-none"></div>
         <div className="relative z-10">
           <h2 className="text-3xl font-extrabold text-white mb-4">Ready to Predict the Future?</h2>
           <p className="text-gray-400 font-medium mb-8 max-w-lg mx-auto">Make smarter asset decisions utilizing the advanced power of our background Tensor-Flow predictive modeling.</p>
           <NavLink to="/predictions" className="inline-flex items-center px-8 py-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold transition-all shadow-lg hover:shadow-primary/50 transform hover:scale-105">
              Launch AI Predictions 
           </NavLink>
         </div>
      </section>

    </div>
  );
};

export default HomePage;
