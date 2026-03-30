import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const UserDataContext = createContext();

export const useUserData = () => useContext(UserDataContext);

export const UserDataProvider = ({ children }) => {
  const { userEmail } = useAuth();

  const getSavedData = (key, defaultVal) => {
    const saved = localStorage.getItem(`${key}_${userEmail}`);
    return saved ? JSON.parse(saved) : defaultVal;
  };

  const [followedStocks, setFollowedStocks] = useState(() => getSavedData('followedStocks', ['AAPL', 'MSFT']));

  const [searchHistory, setSearchHistory] = useState(() => getSavedData('searchHistory', []));
  const [viewHistory, setViewHistory] = useState(() => getSavedData('viewHistory', ['AAPL']));
  const [priceAlerts, setPriceAlerts] = useState(() => getSavedData('priceAlerts', []));

  useEffect(() => {
    setFollowedStocks(getSavedData('followedStocks', ['AAPL', 'MSFT']));
    setSearchHistory(getSavedData('searchHistory', []));
    setViewHistory(getSavedData('viewHistory', ['AAPL']));
    setPriceAlerts(getSavedData('priceAlerts', []));
  }, [userEmail]);

  useEffect(() => {
    localStorage.setItem(`followedStocks_${userEmail}`, JSON.stringify(followedStocks));
  }, [followedStocks, userEmail]);

  useEffect(() => {
    localStorage.setItem(`searchHistory_${userEmail}`, JSON.stringify(searchHistory));
  }, [searchHistory, userEmail]);

  useEffect(() => {
    localStorage.setItem(`viewHistory_${userEmail}`, JSON.stringify(viewHistory));
  }, [viewHistory, userEmail]);

  useEffect(() => {
    localStorage.setItem(`priceAlerts_${userEmail}`, JSON.stringify(priceAlerts));
  }, [priceAlerts, userEmail]);

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
