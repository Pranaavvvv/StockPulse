import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center px-4 pt-10 sm:pt-16 pb-8 sm:pb-12 text-center relative z-10">
      
      {/* Badge */}
      <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-sm text-[13px] font-medium text-gray-800">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
        StockPulse Engine
      </div>

      {/* Headline */}
      <h1 
        className="mt-5 sm:mt-6 max-w-4xl text-gray-900"
        style={{
          fontSize: 'clamp(36px, 8vw, 72px)',
          lineHeight: '1.05',
          fontWeight: '500',
          letterSpacing: '-0.02em'
        }}
      >
        Shaping <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}>Commerce</span><br />of tomorrow
      </h1>

      {/* Subtitle */}
      <p 
        className="mt-4 sm:mt-6 text-neutral-700 px-2 max-w-2xl mx-auto"
        style={{ fontSize: 'clamp(13px, 3.5vw, 16px)' }}
      >
        The All-In-One Agentic Advisor Powering the Future of Merchandising and Supply Chain Operations.
      </p>

      {/* CTA Button */}
      <button 
        onClick={() => navigate('/dashboard')}
        className="mt-6 sm:mt-8 inline-flex items-center gap-3 bg-dark text-white rounded-full pl-6 sm:pl-7 pr-2 py-2 sm:py-2.5 text-[14px] font-medium hover:bg-gray-800 transition-colors active:scale-95 shadow-lg shadow-black/10"
      >
        Access Dashboard
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/15 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </div>
      </button>

    </div>
  );
}
