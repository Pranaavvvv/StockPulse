import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DashboardPreview from './components/DashboardPreview';
import DashboardLayout from './components/DashboardLayout';
import LiveCatalog from './components/LiveCatalog';
import AgenticActivity from './components/AgenticActivity';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

const generateMockHistory = (currentPrice) => {
  const data = [];
  let price = currentPrice * 0.9;
  for (let i = 0; i < 7; i++) {
    data.push({ day: `Day ${i+1}`, price: parseFloat(price.toFixed(2)) });
    price += (Math.random() * 5 - 2);
  }
  data.push({ day: 'Today', price: currentPrice });
  return data;
};

function LandingPage({ onStrategyChange }) {
  return (
    <div className="w-full bg-page p-3 sm:p-4 min-h-screen">
      <div className="relative w-full h-[calc(100vh-24px)] sm:h-[calc(100vh-32px)] overflow-hidden bg-hero rounded-2xl sm:rounded-3xl shadow-xl border border-black/5">
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <video 
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260424_064411_9e9d7f84-9277-41f4-ab10-59172d89e6be.mp4"
            poster="https://images.unsplash.com/photo-1557683316-973673baf926?w=1600&q=60"
            autoPlay 
            loop 
            muted 
            playsInline 
            preload="auto"
            disableRemotePlayback
            webkit-playsinline="true"
            x5-playsinline="true"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>
        </div>
        <div className="relative z-10 w-full h-full flex flex-col overflow-y-auto overflow-x-hidden pb-10">
          <Navbar onStrategyChange={onStrategyChange} />
          <Hero />
          <div className="mt-8">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [pricingSuggestions, setPricingSuggestions] = useState([]);
  const [reorderSuggestions, setReorderSuggestions] = useState([]);
  const [streams, setStreams] = useState({});
  const [activeStrategy, setActiveStrategy] = useState('AI');

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchSuggestions, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`);
      let data = await res.json();
      data = data.map(p => ({
        ...p,
        history: generateMockHistory(p.currentPrice)
      }));
      setProducts(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const pRes = await fetch(`${API_BASE}/pricing-suggestions`);
      setPricingSuggestions(await pRes.json());
      
      const rRes = await fetch(`${API_BASE}/reorder-suggestions`);
      setReorderSuggestions(await rRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  const simulateSale = async (id) => {
    try {
      await fetch(`${API_BASE}/products/${id}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: 1 })
      });
      
      fetchProducts();
      streamReasoning(id);
    } catch(e) {
      console.error(e);
    }
  };

  const streamReasoning = (id) => {
    setStreams(prev => ({ ...prev, [id]: "" }));
    const eventSource = new EventSource(`${API_BASE}/products/${id}/suggest-pricing/stream`);
    eventSource.onmessage = (event) => {
      setStreams(prev => ({ ...prev, [id]: prev[id] + event.data + "\n" }));
    };
    eventSource.onerror = () => eventSource.close();
  };

  const handleAction = async (type, id, status) => {
    try {
      await fetch(`${API_BASE}/${type}-suggestions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      toast.success(`Action successfully ${status.toLowerCase()}`, { theme: "colored", autoClose: 2000 });
      
      fetchProducts();
      fetchSuggestions();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStrategyChange = async (strategyName) => {
    try {
      await fetch(`${API_BASE}/admin/strategy?name=${strategyName}`, { method: 'POST' });
      setActiveStrategy(strategyName);
      toast.info(`🧠 Strategy dynamically switched to: ${strategyName}`, {
        position: "top-center",
        autoClose: 3000,
        theme: "dark"
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage onStrategyChange={handleStrategyChange} />} />
          <Route path="/dashboard" element={<DashboardLayout activeStrategy={activeStrategy} onStrategyChange={handleStrategyChange} pricingSuggestions={pricingSuggestions} reorderSuggestions={reorderSuggestions} />}>
            <Route index element={<Navigate to="catalog" replace />} />
            <Route path="catalog" element={
              <LiveCatalog products={products} onSimulateSale={simulateSale} />
            } />
            <Route path="activity" element={
              <AgenticActivity 
                pricingSuggestions={pricingSuggestions} 
                reorderSuggestions={reorderSuggestions} 
                onAction={handleAction} 
                streams={streams} 
              />
            } />
          </Route>
        </Routes>
      </BrowserRouter>
      
      {/* Toast Notifications Container */}
      <ToastContainer />
    </>
  );
}

export default App;
