import axios from 'axios';

let base = import.meta.env.VITE_API_BASE_URL || 'https://stockanalysis-prediction.onrender.com/api';
if (import.meta.env.VITE_API_BASE_URL && !import.meta.env.VITE_API_BASE_URL.endsWith('/api')) {
  base = base + '/api';
}
const API_BASE_URL = base;

export const stockApi = {
  getDashboardData: async (ticker) => {
    const response = await axios.get(`${API_BASE_URL}/dashboard/${ticker}`);
    return response.data;
  },
  
  getChartData: async (ticker, period = "3mo", interval = "1d") => {
    const response = await axios.get(`${API_BASE_URL}/chart/${ticker}?period=${period}&interval=${interval}`);
    return response.data;
  },
  
  getPredictionData: async (ticker) => {
    const response = await axios.get(`${API_BASE_URL}/predict/${ticker}`);
    return response.data;
  },

  trainModel: async (ticker) => {
    const response = await axios.post(`${API_BASE_URL}/train/${ticker}`);
    return response.data;
  },

  getTopStocks: async () => {
    const response = await axios.get(`${API_BASE_URL}/top-stocks`);
    return response.data;
  },

  getRecommendations: async () => {
    const response = await axios.get(`${API_BASE_URL}/recommendations`);
    return response.data;
  }
};

export const authApi = {
  register: async (email, password) => {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, { email, password });
    return response.data;
  },
  login: async (email, password) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    return response.data;
  },
  googleLogin: async (token) => {
    const response = await axios.post(`${API_BASE_URL}/auth/google`, { token });
    return response.data;
  }
};
