import React, { createContext, useContext, useState, useEffect } from 'react';

const UserDataContext = createContext();

export const useUserData = () => useContext(UserDataContext);

export const UserDataProvider = ({ children }) => {
  const [followedStocks, setFollowedStocks] = useState(() => {
    const saved = localStorage.getItem('followedStocks');
    return saved ? JSON.parse(saved) : ['AAPL', 'MSFT'];
  });

  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const [viewHistory, setViewHistory] = useState(() => {
    const saved = localStorage.getItem('viewHistory');
    return saved ? JSON.parse(saved) : ['AAPL'];
  });

  const [priceAlerts, setPriceAlerts] = useState(() => {
    const saved = localStorage.getItem('priceAlerts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('followedStocks', JSON.stringify(followedStocks));
  }, [followedStocks]);

  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    localStorage.setItem('viewHistory', JSON.stringify(viewHistory));
  }, [viewHistory]);

  useEffect(() => {
    localStorage.setItem('priceAlerts', JSON.stringify(priceAlerts));
  }, [priceAlerts]);

  const toggleFollowStock = (ticker) => {
    if (!ticker) return;
    setFollowedStocks((prev) => 
      prev.includes(ticker) 
        ? prev.filter((t) => t !== ticker) 
        : [...prev, ticker]
    );
  };

  const isFollowing = (ticker) => {
    return followedStocks.includes(ticker);
  };

  const addSearchHistory = (ticker) => {
    if (!ticker) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter((t) => t !== ticker);
      return [ticker, ...filtered].slice(0, 10); // Keep last 10
    });
  };

  const addViewHistory = (ticker) => {
    if (!ticker) return;
    setViewHistory((prev) => {
      const filtered = prev.filter((t) => t !== ticker);
      return [ticker, ...filtered].slice(0, 10); // Keep last 10
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
    setViewHistory([]);
  };

  const addPriceAlert = (ticker, targetPrice, condition) => {
    if (!ticker || !targetPrice) return;
    setPriceAlerts((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        ticker: ticker.toUpperCase(),
        targetPrice: parseFloat(targetPrice),
        condition, // 'above' or 'below'
        isTriggered: false
      }
    ]);
  };

  const removePriceAlert = (id) => {
    setPriceAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const markAlertAsTriggered = (id) => {
    setPriceAlerts((prev) => prev.map((alert) => 
      alert.id === id ? { ...alert, isTriggered: true } : alert
    ));
  };

  return (
    <UserDataContext.Provider value={{
      followedStocks,
      toggleFollowStock,
      isFollowing,
      searchHistory,
      addSearchHistory,
      viewHistory,
      addViewHistory,
      clearHistory,
      priceAlerts,
      addPriceAlert,
      removePriceAlert,
      markAlertAsTriggered
    }}>
      {children}
    </UserDataContext.Provider>
  );
};
