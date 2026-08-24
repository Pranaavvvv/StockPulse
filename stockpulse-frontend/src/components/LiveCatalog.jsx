import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function LiveCatalog({ products, onSimulateSale }) {
  const navigate = useNavigate();

  const handleSimulate = (p) => {
    onSimulateSale(p.id);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Live Catalog</h1>
        <p className="text-gray-500">Simulate sales below. When thresholds are breached, the Agentic loop will automatically intercept.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {products.map(p => {
          const stockPercent = Math.min(100, Math.max(0, (p.stockLevel / (p.reorderThreshold * 3)) * 100));
          const isLowStock = p.stockLevel <= p.reorderThreshold;

          return (
            <div key={p.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_12px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex flex-col group relative overflow-hidden">
              
              {isLowStock && (
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
              )}

              <div className="flex justify-between items-start mb-4 mt-1">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg ${p.category === 'ELECTRONICS' ? 'bg-blue-50 text-blue-600' : p.category === 'APPAREL' ? 'bg-pink-50 text-pink-600' : 'bg-purple-50 text-purple-600'}`}>
                  {p.category}
                </span>
                <span className="text-xs font-mono text-gray-300 font-medium">{p.sku}</span>
              </div>
              
              <h3 className="font-bold text-gray-900 text-lg mb-6 leading-snug h-12">{p.name}</h3>
              
              {/* Visual Stock Depletion Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <span className={`text-sm font-bold ${isLowStock ? 'text-red-500' : 'text-emerald-500'}`}>
                    {p.stockLevel} Units Left
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Threshold: {p.reorderThreshold}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ease-out ${isLowStock ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${stockPercent}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex justify-between items-end mb-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                <div>
                  <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest mb-1">Current Price</p>
                  <p className="text-2xl font-bold text-gray-900">${p.currentPrice.toFixed(2)}</p>
                </div>
                {p.marginFloor && (
                  <div className="text-right">
                    <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest mb-1">Margin Floor</p>
                    <p className="text-sm font-bold text-gray-400">${p.marginFloor.toFixed(2)}</p>
                  </div>
                )}
              </div>

              <div className="h-16 w-full mb-6 opacity-40 group-hover:opacity-100 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={p.history}>
                    <Tooltip contentStyle={{fontSize: '11px', borderRadius: '8px', border: 'none', boxShadow: '0 8px 16px -1px rgb(0 0 0 / 0.1)'}} />
                    <Line type="monotone" dataKey="price" stroke="#ef4d23" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <button 
                onClick={() => handleSimulate(p)}
                className={`mt-auto w-full py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] ${
                  isLowStock 
                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 shadow-sm' 
                    : 'bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white shadow-sm'
                }`}
              >
                Simulate Sale (-1)
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
