import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import httpClient from '../services/httpClient';

const UserDataContext = createContext(null);

const API_BASE = (() => {
  let base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
  if (!base.endsWith('/api')) base += '/api';
  return base;
})();

export const UserDataProvider = ({ children }) => {
  const { userEmail } = useAuth();

  const [followedStocks, setFollowedStocks] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [viewHistory, setViewHistory] = useState([]);
  const [demoBalance, setDemoBalance] = useState(100000);
  const [demoPortfolio, setDemoPortfolio] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // ── Load from MongoDB when user logs in ──
  useEffect(() => {
    if (!userEmail) {
      setFollowedStocks([]);
      setSearchHistory([]);
      setViewHistory([]);
      setDemoBalance(100000);
      setDemoPortfolio([]);
      setLoaded(false);
      return;
    }

    const load = async () => {
      try {
        const res = await httpClient.get(`${API_BASE}/userdata/${encodeURIComponent(userEmail)}`);
        const d = res.data;
        setFollowedStocks(d.followedStocks || []);
        setSearchHistory(d.searchHistory || []);
        setViewHistory(d.viewHistory || []);
        setDemoBalance(d.demoBalance ?? 100000);
        setDemoPortfolio(d.demoPortfolio || []);
      } catch {
        // Fallback to localStorage if API unreachable
        const ls = (key) => {
          try { return JSON.parse(localStorage.getItem(`${key}_${userEmail}`)); } catch { return null; }
        };
        setFollowedStocks(ls('followedStocks') || []);
        setSearchHistory(ls('searchHistory') || []);
        setViewHistory(ls('viewHistory') || []);
        setDemoBalance(ls('demoBalance') ?? 100000);
        setDemoPortfolio(ls('demoPortfolio') || []);
      } finally {
        setLoaded(true);
      }
    };

    load();
  }, [userEmail]);

  // ── Save to MongoDB whenever data changes ──
  const saveToCloud = useCallback(
    async (patch) => {
      if (!userEmail) return;
      const payload = {
        email: userEmail,
        followedStocks,
        searchHistory,
        viewHistory,
        demoBalance,
        demoPortfolio,
        ...patch,
      };
      try {
        await httpClient.post(`${API_BASE}/userdata`, payload);
      } catch {
        // Silently fail — data is already in state
      }
    },
    [userEmail, followedStocks, searchHistory, viewHistory, demoBalance, demoPortfolio]
  );

  // ── Public helpers ──
  const toggleFollow = (ticker) => {
    const next = followedStocks.includes(ticker)
      ? followedStocks.filter((s) => s !== ticker)
      : [...followedStocks, ticker];
    setFollowedStocks(next);
    saveToCloud({ followedStocks: next });
  };

  const addSearchHistory = (ticker) => {
    const next = [ticker, ...searchHistory.filter((s) => s !== ticker)].slice(0, 10);
    setSearchHistory(next);
    saveToCloud({ searchHistory: next });
  };

  const addViewHistory = (ticker) => {
    const next = [ticker, ...viewHistory.filter((s) => s !== ticker)].slice(0, 10);
    setViewHistory(next);
    saveToCloud({ viewHistory: next });
  };

  const updateDemoBalance = (balance, portfolio) => {
    setDemoBalance(balance);
    setDemoPortfolio(portfolio);
    saveToCloud({ demoBalance: balance, demoPortfolio: portfolio });
  };

  return (
    <UserDataContext.Provider value={{
      followedStocks,
      searchHistory,
      viewHistory,
      demoBalance,
      demoPortfolio,
      loaded,
      toggleFollow,
      addSearchHistory,
      addViewHistory,
      updateDemoBalance,
      isFollowed: (ticker) => followedStocks.includes(ticker),
    }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => useContext(UserDataContext);
