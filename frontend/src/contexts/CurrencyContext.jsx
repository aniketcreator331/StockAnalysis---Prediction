import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD');
  const [rates, setRates] = useState({ USD: 1, INR: 83.5, EUR: 0.92, GBP: 0.79, JPY: 150.0 });
  
  useEffect(() => {
    // Fetch latest rates based on USD
    const fetchRates = async () => {
      try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await res.json();
        if (data && data.rates) {
          setRates(data.rates);
        }
      } catch (error) {
        console.error('Failed to fetch exchange rates, using fallbacks', error);
      }
    };
    fetchRates();
  }, []);

  const formatPrice = (priceInUSD) => {
    if (priceInUSD === null || priceInUSD === undefined) return '0.00';
    const rate = rates[currency] || 1;
    const converted = priceInUSD * rate;
    return formatLocalPrice(converted);
  };

  const formatLocalPrice = (localValue) => {
    if (localValue === null || localValue === undefined) return '0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(localValue);
  };

  const getConvertedValue = (priceInUSD) => {
    if (priceInUSD === null || priceInUSD === undefined) return 0;
    const rate = rates[currency] || 1;
    return priceInUSD * rate;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, formatLocalPrice, getConvertedValue }}>
      {children}
    </CurrencyContext.Provider>
  );
};
