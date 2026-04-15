import React from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TickersPage = () => {
  const stockKeys = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corp.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc. (Google)' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'META', name: 'Meta Platforms (Facebook)' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
    { symbol: 'JNJ', name: 'Johnson & Johnson' },
    { symbol: 'V', name: 'Visa Inc.' },
    { symbol: 'WMT', name: 'Walmart Inc.' },
    { symbol: 'PG', name: 'Procter & Gamble Co.' },
    { symbol: 'MA', name: 'Mastercard Inc.' },
    { symbol: 'UNH', name: 'UnitedHealth Group' },
    { symbol: 'DIS', name: 'Walt Disney Co.' },
    { symbol: 'HD', name: 'Home Depot Inc.' },
    { symbol: 'BAC', name: 'Bank of America' },
    { symbol: 'XOM', name: 'Exxon Mobil' },
    { symbol: 'NFLX', name: 'Netflix Inc.' },
    { symbol: 'INTC', name: 'Intel Corp.' },
    { symbol: 'AMD', name: 'Advanced Micro Devices' },
    { symbol: 'CSCO', name: 'Cisco Systems' },
    { symbol: 'PFE', name: 'Pfizer Inc.' },
    { symbol: 'KO', name: 'Coca-Cola Co.' },
    { symbol: 'PEP', name: 'PepsiCo Inc.' },
    { symbol: 'ABBV', name: 'AbbVie Inc.' },
    { symbol: 'CVX', name: 'Chevron Corp.' },
    { symbol: 'COST', name: 'Costco Wholesale' },
    { symbol: 'MCD', name: 'McDonald\'s Corp.' },
    { symbol: 'T', name: 'AT&T Inc.' },
    { symbol: 'NKE', name: 'NIKE Inc.' },
    { symbol: 'ADBE', name: 'Adobe Inc.' },
    { symbol: 'CRM', name: 'Salesforce Inc.' },
    { symbol: 'ABT', name: 'Abbott Laboratories' },
    { symbol: 'ORCL', name: 'Oracle Corp.' },
    { symbol: 'QCOM', name: 'QUALCOMM Inc.' },
    { symbol: 'VZ', name: 'Verizon Communications' },
    { symbol: 'CMCSA', name: 'Comcast Corp.' },
    { symbol: 'IBM', name: 'IBM Corp.' },
    { symbol: 'TXN', name: 'Texas Instruments' },
    { symbol: 'AVGO', name: 'Broadcom Inc.' },
    { symbol: 'LLY', name: 'Eli Lilly & Co.' },
    { symbol: 'PM', name: 'Philip Morris Int.' },
    { symbol: 'UNP', name: 'Union Pacific' },
    { symbol: 'LIN', name: 'Linde plc' },
    { symbol: 'WFC', name: 'Wells Fargo & Co.' },
    { symbol: 'HON', name: 'Honeywell Int.' },
    { symbol: 'RTX', name: 'Raytheon Tech.' },
    { symbol: 'MDT', name: 'Medtronic plc' },
    { symbol: 'SLB', name: 'Schlumberger N.V.' },
    { symbol: 'BA', name: 'Boeing Co.' },
    { symbol: 'BMY', name: 'Bristol-Myers Squibb' },
    { symbol: 'GE', name: 'General Electric' },
    { symbol: 'PYPL', name: 'PayPal Holdings' },
    { symbol: 'INTU', name: 'Intuit Inc.' },
    { symbol: 'SBUX', name: 'Starbucks Corp.' },
    { symbol: 'SPGI', name: 'S&P Global Inc.' },
    { symbol: 'CAT', name: 'Caterpillar Inc.' },
    { symbol: 'GS', name: 'Goldman Sachs' },
    { symbol: 'C', name: 'Citigroup Inc.' },
    { symbol: 'MS', name: 'Morgan Stanley' },
    { symbol: 'BLK', name: 'BlackRock Inc.' },
    { symbol: 'SYK', name: 'Stryker Corp.' },
    { symbol: 'TMO', name: 'Thermo Fisher Sci.' },
    { symbol: 'GILD', name: 'Gilead Sciences' },
    { symbol: 'LMT', name: 'Lockheed Martin' },
    { symbol: 'MMM', name: '3M Company' },
    { symbol: 'AMGN', name: 'Amgen Inc.' },
    { symbol: 'DE', name: 'Deere & Co.' },
    { symbol: 'ISRG', name: 'Intuitive Surgical' },
    { symbol: 'NOW', name: 'ServiceNow Inc.' },
    { symbol: 'CVS', name: 'CVS Health Corp.' },
    { symbol: 'ZTS', name: 'Zoetis Inc.' },
    { symbol: 'AMD', name: 'Advanced Micro' },
    { symbol: 'TGT', name: 'Target Corp.' },
    { symbol: 'LOW', name: 'Lowe\'s Companies' },
    { symbol: 'TJX', name: 'TJX Companies' },
    { symbol: 'BIIB', name: 'Biogen Inc.' },
    { symbol: 'MO', name: 'Altria Group' },
    { symbol: 'CHTR', name: 'Charter Comm.' },
    { symbol: 'CB', name: 'Chubb Limited' },
    { symbol: 'CI', name: 'Cigna Corp.' },
    { symbol: 'BKBK', name: 'Burger King' },
    { symbol: 'MDLZ', name: 'Mondelez Int.' },
    { symbol: 'BDX', name: 'Becton Dickinson' },
    { symbol: 'FDX', name: 'FedEx Corp.' },
    { symbol: 'MMC', name: 'Marsh & McLennan' },
    { symbol: 'ITW', name: 'Illinois Tool Works' },
    { symbol: 'CME', name: 'CME Group Inc.' },
    { symbol: 'SO', name: 'Southern Company' },
    { symbol: 'DUK', name: 'Duke Energy' },
    { symbol: 'PGR', name: 'Progressive Corp.' },
    { symbol: 'ECL', name: 'Ecolab Inc.' },
    { symbol: 'FIS', name: 'Fidelity National' },
    { symbol: 'EW', name: 'Edwards Lifesciences' },
    { symbol: 'NSC', name: 'Norfolk Southern' },
    { symbol: 'WM', name: 'Waste Management' },
    { symbol: 'CSX', name: 'CSX Corp.' },
    { symbol: 'AON', name: 'Aon plc' },
    { symbol: 'KMB', name: 'Kimberly-Clark' },
    { symbol: 'PSA', name: 'Public Storage' },
    { symbol: 'NEM', name: 'Newmont Corp.' },
    { symbol: 'VLO', name: 'Valero Energy' },
    { symbol: 'D', name: 'Dominion Energy' },
    { symbol: 'MPC', name: 'Marathon Petroleum' },
    { symbol: 'COP', name: 'ConocoPhillips' },
    { symbol: 'EOG', name: 'EOG Resources' },
    { symbol: 'OXY', name: 'Occidental Petroleum' },
    { symbol: 'BKR', name: 'Baker Hughes' },
    { symbol: 'HAL', name: 'Halliburton Co.' },
    { symbol: 'KMI', name: 'Kinder Morgan' },
    { symbol: 'WMB', name: 'Williams Companies' },
    { symbol: 'F', name: 'Ford Motor Co.' },
    { symbol: 'GM', name: 'General Motors' },
    { symbol: 'HMC', name: 'Honda Motor Co.' },
    { symbol: 'TM', name: 'Toyota Motor' },
    { symbol: 'SONY', name: 'Sony Group Corp.' },
    { symbol: 'SAP', name: 'SAP SE' },
    { symbol: 'SNOW', name: 'Snowflake Inc.' },
    { symbol: 'PLTR', name: 'Palantir Tech.' },
    { symbol: 'ZM', name: 'Zoom Video' },
    { symbol: 'UBER', name: 'Uber Tech.' },
    { symbol: 'ABNB', name: 'Airbnb Inc.' },
    { symbol: 'SQ', name: 'Square Inc.' },
    { symbol: 'SHOP', name: 'Shopify Inc.' },
    { symbol: 'COIN', name: 'Coinbase Global' },
    { symbol: 'RBLX', name: 'Roblox Corp.' },
    { symbol: 'RELIANCE', name: 'Reliance Industries' },
    { symbol: 'TCS', name: 'Tata Consultancy Services' },
    { symbol: 'INFY', name: 'Infosys' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank' },
    { symbol: 'SBIN', name: 'State Bank of India' },
    { symbol: 'LT', name: 'Larsen & Toubro' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel' },
    { symbol: 'ITC', name: 'ITC Ltd.' },
    { symbol: 'AXISBANK', name: 'Axis Bank' },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank' },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance' },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever' },
    { symbol: 'ASIANPAINT', name: 'Asian Paints' },
    { symbol: 'SUNPHARMA', name: 'Sun Pharma' },
    { symbol: 'TATAMOTORS', name: 'Tata Motors' },
    { symbol: 'TITAN', name: 'Titan Company' },
    { symbol: 'MARUTI', name: 'Maruti Suzuki' },
    { symbol: 'WIPRO', name: 'Wipro' },
    { symbol: 'ADANIENT', name: 'Adani Enterprises' },
    { symbol: 'ADANIPORTS', name: 'Adani Ports' },
    { symbol: 'ONGC', name: 'Oil & Natural Gas Corp.' },
    { symbol: 'NTPC', name: 'NTPC Ltd.' },
    { symbol: 'POWERGRID', name: 'Power Grid Corp.' },
    { symbol: 'COALINDIA', name: 'Coal India' },
    { symbol: 'NESTLEIND', name: 'Nestle India' },
    { symbol: 'DRREDDY', name: 'Dr. Reddy\'s Laboratories' },
    { symbol: 'CIPLA', name: 'Cipla Ltd.' },
    { symbol: 'BPCL', name: 'Bharat Petroleum' },
    { symbol: 'ULTRACEMCO', name: 'UltraTech Cement' },
    { symbol: 'GRASIM', name: 'Grasim Industries' },
    { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv' },
    { symbol: 'EICHERMOT', name: 'Eicher Motors' },
    { symbol: 'M&M', name: 'Mahindra & Mahindra' },
    { symbol: 'DIVISLAB', name: 'Divi\'s Laboratories' },
    { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals' },
    { symbol: 'INDUSINDBK', name: 'IndusInd Bank' },
    { symbol: 'HCLTECH', name: 'HCL Technologies' },
    { symbol: 'TECHM', name: 'Tech Mahindra' },
    { symbol: 'TATACONSUM', name: 'Tata Consumer Products' },
    { symbol: 'HDFCLIFE', name: 'HDFC Life' },
    { symbol: 'SBILIFE', name: 'SBI Life Insurance' },
    { symbol: 'JSWSTEEL', name: 'JSW Steel' },
    { symbol: 'TATASTEEL', name: 'Tata Steel' },
    { symbol: 'CROMPTON', name: 'Crompton Greaves' },
    { symbol: 'TORNTPHARM', name: 'Torrent Pharmaceuticals' },
    { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto' },
    { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp' },
    { symbol: 'PIDILITIND', name: 'Pidilite Industries' },
    { symbol: 'BRITANNIA', name: 'Britannia Industries' },
  ];

  const navigate = useNavigate();

  const openDashboard = (symbol) => {
    navigate('/dashboard', { state: { ticker: symbol } });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-darkBorder">
        <div>
          <h1 className="text-2xl font-bold tracking-wide text-gray-900 dark:text-white flex items-center">
            <BookOpen className="text-primary mr-3" />
            Stock Keys Directory
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            A handy reference for common stock ticker symbols you can use across the application.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-darkBorder">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {stockKeys.map((stock, idx) => (
            <div
              key={idx}
              onClick={() => openDashboard(stock.symbol)}
              className="flex items-center p-4 border border-gray-200 dark:border-darkBorder rounded-xl hover:bg-primary/5 hover:border-primary/30 dark:hover:bg-primary/10 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mr-4 shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                {stock.symbol.substring(0, 2)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white tracking-wider">{stock.symbol}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate w-32 md:w-40">{stock.name}</p>
              </div>
              <ExternalLink size={14} className="text-gray-300 group-hover:text-primary transition-colors ml-2 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TickersPage;
