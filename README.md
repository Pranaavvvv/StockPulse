# StockPulse: Agentic Commerce Advisor

StockPulse is a reactive, agentic commerce engine. When inventory crosses a threshold or demand velocity spikes, the system automatically detects it, uses AI to recommend a price adjustment and reorder quantity, and queues both recommendations for human approval.

## 🚀 5-Minute Quickstart (Runs from README)

This project is built to run flawlessly on your local machine with zero complex setup. It uses an in-memory H2 database seeded with test products.

### Prerequisites
- Java 17+
- Node.js 18+
- Maven

### 1. Start the Backend (Spring Boot)
Open your terminal and navigate to the backend directory:
```bash
cd stockpulse-backend
```

*(Optional)* Export your Gemini API Key. If you skip this step, the system will **gracefully fall back** to a deterministic Rule-Based Strategy!
```bash
# Windows (PowerShell)
$env:LLM_API_KEY="your_api_key_here"

# Mac/Linux
export LLM_API_KEY="your_api_key_here"
```

Start the backend server:
```bash
mvn spring-boot:run
```
*The backend runs on `http://localhost:8080`.*

### 2. Start the Frontend (React + Vite)
Open a **new** terminal window and navigate to the frontend directory:
```bash
cd stockpulse-frontend
npm install
npm run dev
```
*The frontend runs on `http://localhost:5173`.*

---

## 🎮 How to Evaluate the Agentic Loop

Open the frontend dashboard at `http://localhost:5173`. 

### Demo Path 1: Inventory Low (Protect Margin vs Clearance)
1. Locate **PRD-003 (Organic Cotton T-Shirt)**. 
2. It currently has `8` stock with a threshold of `15`. Click **"Simulate Sale"**.
3. Watch the right sidebar. The Agentic Loop intercepts the stock event asynchronously and automatically queues a **Price Adjustment** and **Reorder Recommendation**.
4. Observe the live AI reasoning stream evaluating the clearance vs margin tradeoffs.
5. Click **Approve** and watch the live catalog instantly update.

### Demo Path 2: Demand Spike (Viral Product)
1. Locate **PRD-008 (Hoodie — Heather Grey)**.
2. Click **"Simulate Sale"** 3-4 times rapidly to simulate a viral demand spike.
3. The system detects the velocity crossing the category average and triggers the **DEMAND_SPIKE** loop, surfacing new AI suggestions to capitalize on the momentum.

### Demo Path 3: Runtime Strategy Hot-Swapping (Sprint 2 Ready)
1. At the top of the dashboard, click **"Use Competitor Strategy"**.
2. Simulate a sale on any product.
3. Observe how the system instantly hot-swaps to an entirely new set of commerce logic (scraping mocked competitor prices) **without a JVM restart**, proving the architectural resilience of the `AdvisorRegistry`.

---

## 📐 Architecture & ADR
Please read the [ADR.md](./stockpulse-backend/ADR.md) in the backend directory for a detailed breakdown of the 6 critical architectural decisions, including:
- Unified vs Split Contracts
- LLM Resiliency & Graceful Degradation
- Idempotent `@Async` Event Listeners
