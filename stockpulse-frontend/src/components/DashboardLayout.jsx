import React, { useEffect, useRef, useState } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Activity, ChevronLeft, Brain, Cpu, Menu, X } from 'lucide-react';
import { toast } from 'react-toastify';

export default function DashboardLayout({ activeStrategy, onStrategyChange, pricingSuggestions, reorderSuggestions }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const prevCountRef = useRef((pricingSuggestions?.length || 0) + (reorderSuggestions?.length || 0));

  useEffect(() => {
    const currentCount = (pricingSuggestions?.length || 0) + (reorderSuggestions?.length || 0);
    
    if (currentCount > prevCountRef.current) {
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

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-white overflow-hidden text-gray-900 font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={closeMobileMenu}></div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 md:relative transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out border-r border-gray-100 bg-gray-50/50 flex flex-col h-full shrink-0`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 bg-white">
          <Link to="/" onClick={closeMobileMenu} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft size={18} />
            <span className="font-semibold text-sm">Exit Dashboard</span>
          </Link>
          <button onClick={closeMobileMenu} className="md:hidden text-gray-500 hover:text-gray-900">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 py-8 px-4 flex flex-col gap-2 overflow-y-auto">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Commerce Engine</p>
          
          <NavLink 
            to="/dashboard/catalog" 
            onClick={closeMobileMenu}
            className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'}`}
          >
            <LayoutDashboard size={18} />
            Live Catalog
          </NavLink>
          
          <NavLink 
            to="/dashboard/activity" 
            onClick={closeMobileMenu}
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
              onClick={() => { onStrategyChange('AI'); closeMobileMenu(); }} 
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${activeStrategy === 'AI' ? 'bg-orange-50 text-primary border border-orange-100 shadow-[0_2px_10px_rgba(239,77,35,0.1)]' : 'text-gray-500 bg-gray-50 hover:bg-gray-100 border border-transparent'}`}
            >
              <Brain size={18} className={activeStrategy === 'AI' ? 'text-primary' : 'text-gray-400'} />
              Agentic AI
            </button>
            <button 
              onClick={() => { onStrategyChange('COMPETITOR'); closeMobileMenu(); }} 
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${activeStrategy === 'COMPETITOR' ? 'bg-orange-50 text-primary border border-orange-100 shadow-[0_2px_10px_rgba(239,77,35,0.1)]' : 'text-gray-500 bg-gray-50 hover:bg-gray-100 border border-transparent'}`}
            >
              <Cpu size={18} className={activeStrategy === 'COMPETITOR' ? 'text-primary' : 'text-gray-400'} />
              Competitor Match
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative bg-white w-full">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-100 h-16 flex items-center justify-between px-4 md:px-10 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={toggleMobileMenu} className="md:hidden p-1.5 -ml-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">
              <Menu size={20} />
            </button>
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(239,77,35,0.5)]"></span>
            <span className="font-bold text-gray-900 tracking-tight text-sm md:text-base">StockPulse Engine Live</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 md:px-3 py-1 md:py-1.5 bg-green-50 text-green-700 rounded-full text-[10px] md:text-xs font-bold border border-green-100 shadow-inner">
             <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-green-500"></span>
             </span>
             <span className="hidden sm:inline">Systems Optimal</span>
             <span className="sm:hidden">Optimal</span>
          </div>
        </div>
        
        {/* Outlet for Sub-pages */}
        <div className="p-4 md:p-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </div>

    </div>
  );
}
