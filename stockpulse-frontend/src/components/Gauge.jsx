import React from 'react';

export default function Gauge({ value, color = "#ef4d23", showLabels = false, min = 0, max = 100 }) {
  const TOTAL_TICKS = 40;
  const activeTicks = Math.round((value / 100) * TOTAL_TICKS);
  
  const ticks = Array.from({ length: TOTAL_TICKS }).map((_, i) => {
    // Math.PI to 2 * Math.PI
    const angle = Math.PI + (i / (TOTAL_TICKS - 1)) * Math.PI;
    const isActive = i < activeTicks;
    
    // r=80, length=10
    const r1 = 70; // r - 10
    const r2 = 80;
    
    const x1 = 100 + r1 * Math.cos(angle);
    const y1 = 100 + r1 * Math.sin(angle);
    const x2 = 100 + r2 * Math.cos(angle);
    const y2 = 100 + r2 * Math.sin(angle);

    return (
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={isActive ? color : "#d4d4d8"}
        strokeWidth="2.5"
        strokeLinecap="round"
        className="transition-colors duration-500 ease-out"
      />
    );
  });

  return (
    <div className="flex flex-col items-center w-full" style={{ maxWidth: '260px' }}>
      <svg viewBox="0 0 200 120" className="w-full h-auto overflow-visible">
        {ticks}
        <text 
          x="100" 
          y="105" 
          textAnchor="middle" 
          fontSize="22" 
          fontWeight="600"
          fill="#111827"
        >
          {Math.round(value)}%
        </text>
      </svg>
      {showLabels && (
        <div className="w-full flex justify-between px-4 mt-2 text-[11px] font-semibold text-neutral-500 tracking-wide uppercase">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}
