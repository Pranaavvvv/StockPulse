import React from 'react';
import Gauge from './Gauge';
import { Activity, Box, Zap, Sparkles } from 'lucide-react';

export default function AgenticActivity({ pricingSuggestions, reorderSuggestions, onAction, streams }) {
  
  const pendingActions = [...pricingSuggestions.map(s => ({...s, type: 'pricing'})), ...reorderSuggestions.map(s => ({...s, type: 'reorder'}))]
    .sort((a, b) => b.confidence - a.confidence);

  const getTriggerText = (reason) => {
    if (reason === 'INVENTORY_LOW') return 'Triggered by Low Inventory';
    if (reason === 'DEMAND_SPIKE') return 'Triggered by Demand Spike';
    return 'Triggered Manually';
  };

  const getTriggerIcon = (reason) => {
    if (reason === 'INVENTORY_LOW') return <Box size={16} className="text-red-500" />;
    if (reason === 'DEMAND_SPIKE') return <Zap size={16} className="text-purple-500" />;
    return <Activity size={16} className="text-blue-500" />;
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Agentic Activity Feed</h1>
        <p className="text-gray-500">Real-time decisions proposed by the Commerce Engine. Review reasoning and approve.</p>
      </div>

      {pendingActions.length > 0 ? (
        <div className="flex flex-col gap-8">
          {pendingActions.map((action, idx) => (
            <div key={`${action.type}-${action.id}`} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] transition-all animate-in slide-in-from-bottom-8 duration-700 flex flex-col xl:flex-row gap-8">
              
              {/* Left Column: Context & Action */}
              <div className="xl:w-1/3 flex flex-col border-r border-gray-100 pr-8">
                <div className="flex items-center gap-2 mb-6 bg-gray-50 self-start px-4 py-2 rounded-xl border border-gray-200">
                  {getTriggerIcon(action.triggerReason)}
                  <span className="text-sm font-bold text-gray-700">{getTriggerText(action.triggerReason)}</span>
                </div>
                
                <h3 className="font-bold text-2xl mb-2 text-gray-900 leading-tight">{action.product.name}</h3>
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-6">
                  Proposing {action.type === 'pricing' ? 'Price Adjustment' : 'Inventory Reorder'}
                </p>
                
                {/* Confidence Metric */}
                <div className="mb-8 flex flex-col items-center bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                  <p className="text-[11px] text-gray-500 font-bold tracking-widest mb-2 uppercase text-center">AI Confidence Score</p>
                  <Gauge value={action.confidence * 100} color="#ef4d23" />
                </div>

                <div className="flex gap-4 mt-auto">
                  <button onClick={() => onAction(action.type, action.id, 'REJECTED')} className="flex-1 py-3.5 text-sm font-bold text-gray-500 rounded-xl bg-gray-50 hover:bg-gray-100 hover:text-gray-900 transition-colors border border-transparent hover:border-gray-200">
                    Reject
                  </button>
                  <button onClick={() => onAction(action.type, action.id, 'ACCEPTED')} className="flex-1 py-3.5 text-sm font-bold rounded-xl bg-dark text-white hover:bg-gray-800 shadow-md hover:shadow-lg transition-all active:scale-[0.98]">
                    Approve Action
                  </button>
                </div>
              </div>

              {/* Right Column: Reasoning & Live Stream */}
              <div className="xl:w-2/3 flex flex-col bg-gray-50/50 rounded-3xl p-8 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={18} className="text-primary" />
                  <h4 className="text-lg font-bold text-gray-900">Agentic Reasoning</h4>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
                  <p className="text-[15px] text-gray-800 leading-relaxed font-medium">
                    "{action.reasoning}"
                  </p>
                </div>

                {action.type === 'pricing' && streams[action.product.id] && (
                  <div className="flex-1 flex flex-col">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Live LLM Thought Stream
                    </h4>
                    <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-6 shadow-inner overflow-hidden flex flex-col">
                      <div className="text-[14px] font-mono text-gray-700 leading-relaxed overflow-y-auto whitespace-pre-wrap break-words">
                        {streams[action.product.id]}
                        <span className="inline-block w-1.5 h-4 ml-1 bg-emerald-500 animate-pulse align-middle"></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 bg-white rounded-3xl p-16 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
          </div>
          <p className="text-gray-900 font-bold text-2xl mb-2">Systems Optimal</p>
          <p className="text-gray-500 text-base max-w-sm text-center">No agentic interventions required. Catalog health is normal.</p>
        </div>
      )}
    </div>
  );
}
