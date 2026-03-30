import React, { useState } from 'react';
import { Calculator, TrendingUp, Briefcase, Activity, DollarSign } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

const SIPCalculator = () => {
  const { formatPrice } = useCurrency();
  const [monthlyInvest, setMonthlyInvest] = useState(5000);
  const [returnRate, setReturnRate] = useState(12);
  const [years, setYears] = useState(10);

  const calculateSIP = () => {
    const months = years * 12;
    const monthlyRate = returnRate / 12 / 100;
    const totalInvested = monthlyInvest * months;

    let futureValue = 0;
    if (monthlyRate === 0) {
      futureValue = totalInvested;
    } else {
      futureValue = monthlyInvest * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    }
    const estimatedReturns = futureValue - totalInvested;

    return { totalInvested, estimatedReturns, futureValue };
  };

  const { totalInvested, estimatedReturns, futureValue } = calculateSIP();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Monthly Investment</label>
            <input type="number" min="0" value={monthlyInvest} onChange={e => setMonthlyInvest(Number(e.target.value) || 0)} className="w-full px-4 py-2 border border-gray-200 dark:border-darkBorder rounded-xl bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Expected Return Rate (p.a %)</label>
            <input type="number" min="0" value={returnRate} onChange={e => setReturnRate(Number(e.target.value) || 0)} className="w-full px-4 py-2 border border-gray-200 dark:border-darkBorder rounded-xl bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Time Period (Years)</label>
            <input type="number" min="1" value={years} onChange={e => setYears(Number(e.target.value) || 1)} className="w-full px-4 py-2 border border-gray-200 dark:border-darkBorder rounded-xl bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100" />
          </div>
        </div>
        
        <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-6 flex flex-col justify-center space-y-4">
           <div>
             <p className="text-gray-500 dark:text-gray-400 font-semibold mb-1 text-sm">Invested Amount</p>
             <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatPrice(totalInvested)}</p>
           </div>
           <div>
             <p className="text-gray-500 dark:text-gray-400 font-semibold mb-1 text-sm">Est. Returns</p>
             <p className="text-xl font-bold text-green-500">+{formatPrice(estimatedReturns)}</p>
           </div>
           <div className="pt-4 border-t border-primary/20 mt-4">
             <p className="text-gray-500 dark:text-gray-400 font-bold mb-1">Total Value</p>
             <p className="text-3xl font-extrabold text-primary">{formatPrice(futureValue)}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

const SWPCalculator = () => {
  const { formatPrice } = useCurrency();
  const [totalInvest, setTotalInvest] = useState(1000000);
  const [withdrawal, setWithdrawal] = useState(10000);
  const [returnRate, setReturnRate] = useState(8);
  const [years, setYears] = useState(10);

  const calculateSWP = () => {
    let balance = totalInvest;
    let totalWithdrawn = 0;
    const months = years * 12;
    const monthlyRate = returnRate / 12 / 100;

    for (let i = 0; i < months; i++) {
        balance = balance + (balance * monthlyRate) - withdrawal;
        if(balance < 0) balance = 0;
        totalWithdrawn += withdrawal;
        if(balance === 0) break; // Fund empty
    }

    return { totalWithdrawn, finalBalance: Math.max(0, balance) };
  };

  const { totalWithdrawn, finalBalance } = calculateSWP();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Total Investment</label>
            <input type="number" min="0" value={totalInvest} onChange={e => setTotalInvest(Number(e.target.value) || 0)} className="w-full px-4 py-2 border border-gray-200 dark:border-darkBorder rounded-xl bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Withdrawal per month</label>
            <input type="number" min="0" value={withdrawal} onChange={e => setWithdrawal(Number(e.target.value) || 0)} className="w-full px-4 py-2 border border-gray-200 dark:border-darkBorder rounded-xl bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Expected Return Rate (p.a %)</label>
            <input type="number" min="0" value={returnRate} onChange={e => setReturnRate(Number(e.target.value) || 0)} className="w-full px-4 py-2 border border-gray-200 dark:border-darkBorder rounded-xl bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Time Period (Years)</label>
            <input type="number" min="1" value={years} onChange={e => setYears(Number(e.target.value) || 1)} className="w-full px-4 py-2 border border-gray-200 dark:border-darkBorder rounded-xl bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100" />
          </div>
        </div>
        
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-500/20 rounded-2xl p-6 flex flex-col justify-center space-y-4">
           <div>
             <p className="text-gray-500 dark:text-gray-400 font-semibold mb-1 text-sm">Total Investment</p>
             <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatPrice(totalInvest)}</p>
           </div>
           <div>
             <p className="text-gray-500 dark:text-gray-400 font-semibold mb-1 text-sm">Total Withdrawn</p>
             <p className="text-xl font-bold text-orange-500">{formatPrice(totalWithdrawn)}</p>
           </div>
           <div className="pt-4 border-t border-orange-200 dark:border-orange-500/20 mt-4">
             <p className="text-gray-500 dark:text-gray-400 font-bold mb-1">Final Balance</p>
             <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{formatPrice(finalBalance)}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

const BrokerageCalculator = () => {
  const { formatPrice } = useCurrency();
  const [buyPrice, setBuyPrice] = useState(100);
  const [sellPrice, setSellPrice] = useState(110);
  const [qty, setQty] = useState(100);

  const calculateBrokerage = () => {
    const buyValue = buyPrice * qty;
    const sellValue = sellPrice * qty;
    const turnover = buyValue + sellValue;
    
    // Simplistic standard brokerage assumptions for Indian equity delivery (0.01% or flat)
    const brokerage = Math.min(20, turnover * 0.0001); // capped at flat 20 roughly per order
    const stt = sellValue * 0.001; 
    const exchangeTxnCharge = turnover * 0.0000345;
    const gst = (brokerage + exchangeTxnCharge) * 0.18;
    const stampDuty = buyValue * 0.00015;
    const totalTaxAndCharges = brokerage + stt + exchangeTxnCharge + gst + stampDuty;
    
    const pnl = sellValue - buyValue;
    const netPnl = pnl - totalTaxAndCharges;

    return { turnover, brokerage, totalTaxAndCharges, pnl, netPnl };
  };

  const { turnover, brokerage, totalTaxAndCharges, pnl, netPnl } = calculateBrokerage();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Buy Price</label>
            <input type="number" min="0" value={buyPrice} onChange={e => setBuyPrice(Number(e.target.value) || 0)} className="w-full px-4 py-2 border border-gray-200 dark:border-darkBorder rounded-xl bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Sell Price</label>
            <input type="number" min="0" value={sellPrice} onChange={e => setSellPrice(Number(e.target.value) || 0)} className="w-full px-4 py-2 border border-gray-200 dark:border-darkBorder rounded-xl bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
            <input type="number" min="1" value={qty} onChange={e => setQty(Number(e.target.value) || 1)} className="w-full px-4 py-2 border border-gray-200 dark:border-darkBorder rounded-xl bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100" />
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-6 flex flex-col justify-center space-y-3">
           <div className="flex justify-between">
             <span className="text-gray-500 dark:text-gray-400 font-semibold text-sm">Turnover</span>
             <span className="font-bold text-gray-900 dark:text-gray-100">{formatPrice(turnover)}</span>
           </div>
           <div className="flex justify-between">
             <span className="text-gray-500 dark:text-gray-400 font-semibold text-sm">Brokerage</span>
             <span className="font-bold text-gray-900 dark:text-gray-100">{formatPrice(brokerage)}</span>
           </div>
           <div className="flex justify-between">
             <span className="text-gray-500 dark:text-gray-400 font-semibold text-sm">Total Tax & Charges</span>
             <span className="font-bold text-red-500">-{formatPrice(totalTaxAndCharges)}</span>
           </div>
           
           <div className="pt-4 border-t border-blue-200 dark:border-blue-500/20 mt-4">
             <div className="flex justify-between mb-2">
               <span className="text-gray-500 dark:text-gray-400 font-bold">Net P&L</span>
               <span className={`text-xl font-extrabold ${netPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                 {netPnl >= 0 ? '+' : ''}{formatPrice(netPnl)}
               </span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const MarginCalculator = () => {
    const { formatPrice } = useCurrency();
    const [price, setPrice] = useState(500);
    const [qty, setQty] = useState(200);
    const [marginMultiplier, setMarginMultiplier] = useState(5);
  
    const calculateMargin = () => {
      const totalValue = price * qty;
      const marginReq = totalValue / marginMultiplier;
      return { totalValue, marginReq };
    };
  
    const { totalValue, marginReq } = calculateMargin();
  
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Stock Price</label>
              <input type="number" min="0" value={price} onChange={e => setPrice(Number(e.target.value) || 0)} className="w-full px-4 py-2 border border-gray-200 dark:border-darkBorder rounded-xl bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
              <input type="number" min="1" value={qty} onChange={e => setQty(Number(e.target.value) || 1)} className="w-full px-4 py-2 border border-gray-200 dark:border-darkBorder rounded-xl bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Provided Leverage/Margin (x)</label>
              <input type="number" min="1" max="100" value={marginMultiplier} onChange={e => setMarginMultiplier(Number(e.target.value) || 1)} className="w-full px-4 py-2 border border-gray-200 dark:border-darkBorder rounded-xl bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100" />
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-500/20 rounded-2xl p-6 flex flex-col justify-center space-y-4">
             <div>
               <p className="text-gray-500 dark:text-gray-400 font-semibold mb-1 text-sm">Total Trade Value</p>
               <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatPrice(totalValue)}</p>
             </div>
             <div className="pt-4 border-t border-purple-200 dark:border-purple-500/20 mt-4">
               <p className="text-gray-500 dark:text-gray-400 font-bold mb-1">Margin Required (Cash)</p>
               <p className="text-3xl font-extrabold text-purple-500">{formatPrice(marginReq)}</p>
             </div>
          </div>
        </div>
      </div>
    );
};

const CalculatorsPage = () => {
  const [activeTab, setActiveTab] = useState('sip');

  const tabs = [
    { id: 'sip', label: 'SIP Calculator' },
    { id: 'swp', label: 'SWP Calculator' },
    { id: 'brokerage', label: 'Brokerage Calculator' },
    { id: 'margin', label: 'Margin Calculator' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-darkCard p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-darkBorder">
        <div>
          <h1 className="text-2xl font-bold tracking-wide text-gray-900 dark:text-white flex items-center">
            <Calculator className="text-primary mr-3" />
            Financial Calculators
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Compute your investments, margin, and brokerage across multiple dynamic modules.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-darkCard rounded-3xl shadow-sm border border-gray-100 dark:border-darkBorder overflow-hidden">
        <div className="flex border-b border-gray-100 dark:border-darkBorder overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-6 text-sm font-extrabold tracking-widest whitespace-nowrap transition-colors ${
                activeTab === tab.id 
                  ? 'border-b-2 border-primary text-primary bg-primary/5' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
               {tab.label}
            </button>
          ))}
        </div>
        
        <div className="p-8">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === 'sip' && <SIPCalculator />}
                {activeTab === 'swp' && <SWPCalculator />}
                {activeTab === 'brokerage' && <BrokerageCalculator />}
                {activeTab === 'margin' && <MarginCalculator />}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorsPage;
