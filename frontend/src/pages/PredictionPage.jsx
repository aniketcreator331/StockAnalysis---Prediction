import React, { useState, useEffect } from 'react';
import { stockApi } from '../services/api';
import PredictionLineChart from '../charts/PredictionLineChart';
import { BrainCircuit, Activity, Settings, Search } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

const PredictionPage = () => {
  const { formatPrice } = useCurrency();
  const [ticker, setTicker] = useState('AAPL');
  const [searchQuery, setSearchQuery] = useState('AAPL');
  const [historicalData, setHistoricalData] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trainingLoader, setTrainingLoader] = useState(false);
  const [trainingSuccess, setTrainingSuccess] = useState(false);

  const fetchPredictionData = async () => {
    setLoading(true);
    try {
      const dbData = await stockApi.getChartData(ticker, '1d', '5m');
      if (dbData && dbData.length > 0) {
        setHistoricalData(dbData);
      } else {
        const dbDataRes = await stockApi.getChartData(ticker, '5d', '15m');
        setHistoricalData(dbDataRes || []);
      }
      
      const predRes = await stockApi.getPredictionData(ticker);
      if (predRes && predRes.predictions) {
        setPredictions(predRes.predictions);
      }
    } catch (error) {
      console.error("Error fetching prediction data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictionData();
  }, [ticker]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setTicker(searchQuery.toUpperCase());
    }
  };

  const handleTrainModel = async () => {
    setTrainingLoader(true);
    setTrainingSuccess(false);
    try {
      await stockApi.trainModel(ticker);
      setTrainingSuccess(true);
      fetchPredictionData();
      
      setTimeout(() => setTrainingSuccess(false), 5000);
    } catch (error) {
      console.error("Failed to train model", error);
    } finally {
      setTrainingLoader(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-darkBorder">
        <div>
          <h1 className="text-2xl font-bold tracking-wide text-gray-900 dark:text-white flex items-center">
            <BrainCircuit className="text-primary mr-3" />
            AI Price Prediction
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            LSTM Neural Network forecasting next 30 minutes.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <form onSubmit={handleSearch} className="relative w-full md:w-48">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ticker..." 
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white transition-all"
            />
          </form>

          <button 
            onClick={handleTrainModel}
            disabled={trainingLoader}
            className={`px-6 py-2 rounded-xl text-sm font-medium flex items-center transition-all ${
              trainingLoader ? 'bg-gray-200 dark:bg-darkBorder text-gray-500 cursor-not-allowed' : 'bg-primary hover:bg-blue-600 text-white shadow-lg shadow-primary/30'
            }`}
          >
            {trainingLoader ? (
              <span className="animate-spin mr-2 border-2 border-gray-400 border-t-gray-700 dark:border-gray-500 dark:border-t-white rounded-full w-4 h-4"></span>
            ) : (
              <Settings size={16} className="mr-2" />
            )}
            {trainingLoader ? 'Training Model...' : 'Retrain LSTM Model'}
          </button>
        </div>
      </div>

      {trainingSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-xl flex items-center">
          <Activity size={18} className="mr-2" />
          Model successfully retrained on latest historical data. Results applied.
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-darkBorder">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex justify-between items-center">
            <span>Forecast for {ticker}</span>
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">Prediction Horizon: 30 Mins</span>
          </h2>
          <PredictionLineChart historicalData={historicalData} predictedData={predictions} />
          
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-6 border-t border-gray-100 dark:border-darkBorder">
            {predictions.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-400 dark:text-gray-500">
                No prediction data available. Try clicking "Retrain LSTM Model" above.
              </div>
            ) : (
              predictions.map((p, i) => (
                <div key={i} className="text-center p-4 rounded-xl bg-gray-50 dark:bg-darkBg border border-gray-100 dark:border-darkBorder">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    +{(i + 1) * 5} min
                  </p>
                  <p className="text-lg font-bold text-emerald-500">{formatPrice(p)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionPage;
