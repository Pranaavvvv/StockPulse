import React from 'react';
import { TrendingDown, TrendingUp, ChevronDown, X } from 'lucide-react';
import Gauge from './Gauge';

export default function DashboardPreview() {
  return (
    <div className="px-3 sm:px-4 w-full relative z-10 pb-10">
      <div className="bg-[#f5f2ee] rounded-3xl p-4 sm:p-6 w-full max-w-[880px] mx-auto shadow-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          
          {/* Card 1 — Clicks */}
          <div className="bg-white rounded-2xl p-5 flex flex-col shadow-sm border border-neutral-100">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ef4d23]"></span>
                <span className="text-sm font-semibold text-gray-900">Clicks</span>
              </div>
              <span className="text-[13px] text-neutral-500 font-medium">This Month</span>
            </div>
            
            <div className="flex items-end gap-3 mb-1">
              <span className="text-[28px] font-semibold text-gray-900 leading-none">6,896</span>
              <div className="flex items-center gap-1 bg-red-50 text-red-600 rounded-full px-2 py-0.5 text-[11px] font-bold mb-1">
                <TrendingDown size={12} strokeWidth={3} />
                -3,382 (33%)
              </div>
            </div>
            <p className="text-[11px] text-neutral-400 mb-6">Compared to yesterday</p>
            
            <div className="flex flex-col items-center justify-center flex-1 mb-4 relative mt-2">
              <p className="text-[10px] text-neutral-400 absolute -top-4 font-medium">Month Target achieved</p>
              <Gauge value={92} color="#ef4d23" showLabels={true} min="389K" max="425K" />
            </div>
            
            <div className="mt-auto bg-neutral-100 rounded-full p-1 flex">
              <button className="flex-1 text-[11px] font-semibold text-gray-900 bg-white shadow-sm rounded-full py-1">Impressions</button>
              <button className="flex-1 text-[11px] font-semibold text-neutral-500 py-1">Clicks</button>
            </div>
          </div>

          {/* Card 2 — Form */}
          <div className="bg-white rounded-2xl p-5 flex flex-col gap-3 shadow-sm border border-neutral-100">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-neutral-700 font-medium">Show figures for</label>
              <button className="flex justify-between items-center border border-neutral-200 rounded-lg px-3 py-2 text-sm text-gray-900 font-medium hover:bg-gray-50">
                This month <ChevronDown size={16} className="text-neutral-400" />
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-neutral-700 font-medium">Compare period by</label>
              <button className="flex justify-between items-center border border-neutral-200 rounded-lg px-3 py-2 text-sm text-gray-900 font-medium hover:bg-gray-50">
                Month-to-date (MTD) <ChevronDown size={16} className="text-neutral-400" />
              </button>
            </div>
            
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-[12px] text-neutral-700 font-medium">Ste targets (This month)</label>
              <div className="flex items-center border border-neutral-200 rounded-lg px-3 py-2 bg-gray-50">
                <span className="text-neutral-400 text-sm mr-2">#</span>
                <span className="text-gray-900 text-sm font-medium">10</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-neutral-700 font-medium">Ste targets (This year)</label>
              <div className="flex items-center border border-neutral-200 rounded-lg px-3 py-2 bg-gray-50">
                <span className="text-neutral-400 text-sm mr-2">#</span>
                <span className="text-gray-900 text-sm font-medium">100</span>
              </div>
            </div>
            
            <div className="mt-auto pt-4 flex items-center">
              <button className="bg-[#ef4d23] text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-orange-600">Save</button>
              <button className="ml-4 text-sm font-medium text-neutral-500 underline hover:text-neutral-700">Cancel</button>
              <button className="ml-auto text-neutral-400 hover:text-neutral-600"><X size={20} /></button>
            </div>
          </div>

          {/* Card 3 — Video Starts */}
          <div className="bg-white rounded-2xl p-5 flex flex-col shadow-sm border border-neutral-100">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ef4d23]"></span>
                <span className="text-sm font-semibold text-gray-900">Video Starts</span>
              </div>
              <span className="text-[13px] text-neutral-500 font-medium">today</span>
            </div>
            
            <div className="flex items-end gap-3 mb-1">
              <span className="text-[28px] font-semibold text-gray-900 leading-none">0</span>
              <div className="flex items-center gap-1 bg-neutral-100 text-neutral-600 rounded-full px-2 py-0.5 text-[11px] font-bold mb-1">
                <TrendingUp size={12} strokeWidth={3} />
                0
              </div>
            </div>
            <p className="text-[11px] text-neutral-400 mb-6">Compared to yesterday</p>
            
            <div className="flex flex-col items-center justify-center flex-1 mb-4 mt-2">
              <Gauge value={68} color="#9ca3af" showLabels={false} />
            </div>
            
            <div className="mt-auto bg-neutral-100 rounded-full p-1 flex">
              <button className="flex-1 text-[11px] font-semibold text-gray-900 bg-white shadow-sm rounded-full py-1">Video Clicks</button>
              <button className="flex-1 text-[11px] font-semibold text-neutral-500 py-1">Video Starts</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
