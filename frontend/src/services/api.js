import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

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
