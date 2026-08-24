import React, { useState } from 'react';
import { ChevronDown, ShoppingCart, Menu, X } from 'lucide-react';

export default function Navbar({ onStrategyChange }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex justify-center pt-4 sm:pt-6 px-3 sm:px-4 z-50 relative">
      <div className="bg-white rounded-full shadow-sm border border-neutral-200 pl-2 pr-2 py-2 w-full max-w-[760px] relative flex items-center">
        
        {/* Logo */}
        <div className="shrink-0 flex items-center ml-2">
          <svg viewBox="0 0 32 32" className="w-7 h-7 sm:w-8 sm:h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="3.5" fill="#ef4d23"/>
            <circle cx="16" cy="6" r="3.5" fill="#ef4d23"/>
            <circle cx="16" cy="26" r="3.5" fill="#ef4d23"/>
            <circle cx="6" cy="16" r="3.5" fill="#ef4d23"/>
            <circle cx="26" cy="16" r="3.5" fill="#ef4d23"/>
            <circle cx="8.9" cy="8.9" r="3.5" fill="#ef4d23"/>
            <circle cx="23.1" cy="23.1" r="3.5" fill="#ef4d23"/>
            <circle cx="8.9" cy="23.1" r="3.5" fill="#ef4d23"/>
            <circle cx="23.1" cy="8.9" r="3.5" fill="#ef4d23"/>
          </svg>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 ml-8 text-[14px] font-medium text-gray-700">
          <a href="#" className="flex items-center gap-1.5 text-black">
            <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
            Dashboard
          </a>
          <button onClick={() => onStrategyChange('AI')} className="hover:text-primary transition-colors">
            AI Strategy
          </button>
          <button onClick={() => onStrategyChange('COMPETITOR')} className="hover:text-primary transition-colors">
            Competitor Strategy
          </button>
          <a href="#" className="flex items-center gap-1 hover:text-black">
            Pages <ChevronDown size={14} color="#ef4d23" strokeWidth={3.5} />
          </a>
        </div>

        {/* Right Cluster */}
        <div className="ml-auto flex items-center gap-3 pr-1">
          <button className="hidden md:flex p-2 hover:bg-neutral-100 rounded-full text-neutral-600 transition-colors">
            <ShoppingCart size={18} />
          </button>
          <button className="bg-primary hover:bg-orange-600 text-white rounded-full flex items-center gap-2 pl-4 pr-1 py-1 transition-all active:scale-95 text-sm font-medium">
            <span className="hidden sm:inline">Get early access</span>
            <span className="sm:hidden">Early access</span>
            <div className="bg-white/20 p-1.5 rounded-full flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          </button>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-neutral-600 ml-1 rounded-full hover:bg-neutral-100"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-2 right-2 mt-2 bg-white rounded-2xl shadow-lg border border-neutral-200 p-4 z-50 flex flex-col gap-4 md:hidden">
          <a href="#" className="flex items-center gap-2 text-black font-medium">
            <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
            Dashboard
          </a>
          <button onClick={() => { onStrategyChange('AI'); setIsOpen(false); }} className="text-left font-medium text-gray-700 hover:text-primary">
            AI Strategy
          </button>
          <button onClick={() => { onStrategyChange('COMPETITOR'); setIsOpen(false); }} className="text-left font-medium text-gray-700 hover:text-primary">
            Competitor Strategy
          </button>
          <a href="#" className="flex items-center gap-1 font-medium text-gray-700">
            Pages <ChevronDown size={14} color="#ef4d23" strokeWidth={3.5} />
          </a>
        </div>
      )}
    </div>
  );
}
