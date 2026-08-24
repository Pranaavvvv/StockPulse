import React, { useEffect, useRef } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Activity, ChevronLeft, Brain, Cpu } from 'lucide-react';
import { toast } from 'react-toastify';

export default function DashboardLayout({ activeStrategy, onStrategyChange, pricingSuggestions, reorderSuggestions }) {
  const navigate = useNavigate();
  const location = useLocation();
  const prevCountRef = useRef((pricingSuggestions?.length || 0) + (reorderSuggestions?.length || 0));

  useEffect(() => {
    const currentCount = (pricingSuggestions?.length || 0) + (reorderSuggestions?.length || 0);
    
    // If the number of pending agentic actions INCREASES, it means the Agentic Loop fired
    if (currentCount > prevCountRef.current) {
      // Only auto-route if we are NOT already on the activity page
      if (!location.pathname.includes('/activity')) {
        toast.error("🚨 Agentic Engine detected anomaly! Rerouting to Activity Feed...", {
          position: "top-right",
          theme: "dark",
          autoClose: 3000
        });
        setTimeout(() => {
           navigate('/dashboard/activity');
        }, 800);
      }
    }
    
    prevCountRef.current = currentCount;
  }, [pricingSuggestions, reorderSuggestions, navigate, location]);
  return (
    <div className="flex h-screen bg-white overflow-hidden text-gray-900 font-sans">
      
      {/* Sidebar */}
      <div className="w-64 shrink-0 border-r border-gray-100 bg-gray-50/50 flex flex-col h-full">
        <div className="h-16 flex items-center px-6 border-b border-gray-100 bg-white">
          <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft size={18} />
            <span className="font-semibold text-sm">Exit Dashboard</span>
          </Link>
        </div>
        
        <div className="flex-1 py-8 px-4 flex flex-col gap-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Commerce Engine</p>
          
          <NavLink 
            to="/dashboard/catalog" 
            className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'}`}
          >
            <LayoutDashboard size={18} />
            Live Catalog
          </NavLink>
          
          <NavLink 
            to="/dashboard/activity" 
            className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'}`}
          >
            <Activity size={18} />
            Agentic Activity
          </NavLink>
        </div>

        {/* Strategy Swapper at bottom of Sidebar */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-3">Active Strategy</p>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => onStrategyChange('AI')} 
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${activeStrategy === 'AI' ? 'bg-orange-50 text-primary border border-orange-100 shadow-[0_2px_10px_rgba(239,77,35,0.1)]' : 'text-gray-500 bg-gray-50 hover:bg-gray-100 border border-transparent'}`}
            >
              <Brain size={18} className={activeStrategy === 'AI' ? 'text-primary' : 'text-gray-400'} />
              Agentic AI
            </button>
            <button 
              onClick={() => onStrategyChange('COMPETITOR')} 
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${activeStrategy === 'COMPETITOR' ? 'bg-orange-50 text-primary border border-orange-100 shadow-[0_2px_10px_rgba(239,77,35,0.1)]' : 'text-gray-500 bg-gray-50 hover:bg-gray-100 border border-transparent'}`}
            >
              <Cpu size={18} className={activeStrategy === 'COMPETITOR' ? 'text-primary' : 'text-gray-400'} />
              Competitor Match
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative bg-white">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100 h-16 flex items-center justify-between px-10 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(239,77,35,0.5)]"></span>
            <span className="font-bold text-gray-900 tracking-tight">StockPulse Engine Live</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100 shadow-inner">
             <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
             </span>
             Systems Optimal
          </div>
        </div>
        
        {/* Outlet for Sub-pages */}
        <div className="p-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </div>

    </div>
  );
}
