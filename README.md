# NAVORA — Autonomous Worldwide AI Travel Operating Platform

> **"More Than Travel"** — An end-to-end, multi-agent AI travel operating platform managing the entire journey lifecycle: **Discover → Plan → Compare → Book → Travel → Return**.

---

## 🌟 Key Capabilities & Features

1. **Discovery & Exploration Engine**
   - Immersive 3D/hero catalog of global & Indian destinations (Goa, Tokyo, Paris, Kerala, Jaipur, Iceland, Bali, Swiss Alps).
   - Rich editorial content, seasonal insights, weather indicators, and category filtering (Beaches, Heritage, Luxury, Adventure, Nightlife).

2. **Autonomous Multi-Agent AI System**
   - **Orchestrator Agent**: Context-aware intent router supporting natural queries in **English, Telugu, Hindi, Tamil, Kannada, and Malayalam**.
   - **Specialized Agents**: Destination, Weather/Risk, Transport (Flight/Train/Bus), Hotel, Activity, Restaurant (Dietary-aware), Shopping, Local Experience/Agency, Budget & Cash Flow, Itinerary Builder, Live Trip Monitoring, Dynamic Replanning, Rewards (NAVORA Coins), and Emergency/Safety Agents.

3. **Plan A / B / C Multi-Tier Itinerary Generation**
   - Instant generation of 3 distinct, fully-costed travel plans:
     - **Plan A (Luxury / Express)**: High-speed transit, 5★ resorts, premium activities.
     - **Plan B (Balanced / Recommended)**: Optimal blend of price, comfort, and top-rated experiences.
     - **Plan C (Budget / Saver)**: Eco-transit, boutique stays, free & local activities.

4. **Interactive Itinerary & Drag-and-Drop Builder**
   - Day-by-day activity timelines with dynamic reordering, time calculation, route mapping, and cost tracking.

5. **Side-by-Side Transport & Hotel Comparison**
   - Interactive comparison table evaluating price, speed, carbon footprint, amenities, and user ratings across multi-modal options.

6. **Unified Booking & Financial Center**
   - Mock/Sandbox integration with Razorpay, Stripe, UPI, Credit Cards, and Net Banking.
   - Smart Expense Splitting & Debt Settlement engine calculating the minimal set of peer-to-peer transfers.

7. **Real-Time Trip Monitoring & Dynamic Replanning**
   - Live transit delay monitoring, weather hazard alerts, and proactive AI re-routing.

8. **Safety & Emergency Dossier**
   - Offline-capable emergency SOS guide with nearest hospital, embassy, police contacts, and safety ratings.

9. **NAVORA Coins & Community**
   - Gamified rewards engine with coins earned on bookings & reviews, redeemable for discount vouchers.

---

## 🏗️ Technology Stack

- **Frontend**: Next.js 16 (React 19, Turbopack, App Router, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion aesthetics).
- **Backend**: FastAPI (Python 3.10+, Async routes, Pydantic v2, SQLAlchemy ORM, Alembic migrations).
- **Database**: SQLite (default dev / sandbox) / PostgreSQL (production-ready).
- **AI Engine**: Google Gemini API via official `google-generativeai` SDK with custom fallback engine.
- **Testing**: pytest & pytest-asyncio for backend; Next.js TypeScript compilation & static export build checks for frontend.
- **Deployment**: Docker, Docker Compose, Nginx reverse proxy.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js >= 18.x & npm >= 9.x
- Python >= 3.10
- Git

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
The FastAPI backend will start at `http://localhost:8000` with interactive API docs at `http://localhost:8000/docs`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
The Next.js frontend will start at `http://localhost:3000`.

---

## 🧪 Running Tests & Build Verification

### Backend Tests
```bash
cd backend
python -m pytest
```

### Frontend Build Verification
```bash
cd frontend
npm run build
```

---

## 📜 License
NAVORA Platform © 2026. All rights reserved.
