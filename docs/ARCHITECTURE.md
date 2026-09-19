# NAVORA Architecture & System Design Document

NAVORA is built as a high-performance, modular, multi-agent AI travel operating platform.

---

## 🏛️ High-Level System Architecture

```
                               ┌──────────────────────────────────────────────┐
                               │           Web Client (Next.js 16)            │
                               │  - Dashboard & Travel Workspaces            │
                               │  - Dynamic Multilingual AI Assistant Widget  │
                               │  - Interactive 3D Maps & Drag-Drop Builder  │
                               └──────────────────────┬───────────────────────┘
                                                      │ HTTPS / REST / WebSockets
                                                      ▼
                               ┌──────────────────────────────────────────────┐
                               │         FastAPI Backend Application          │
                               │  - CORS / GZip / Rate Limiting Middleware   │
                               │  - JWT & Cookie Auth / 2FA Engine           │
                               └──────────────────────┬───────────────────────┘
                                                      │
                       ┌──────────────────────────────┼──────────────────────────────┐
                       ▼                              ▼                              ▼
          ┌──────────────────────────┐   ┌──────────────────────────┐   ┌──────────────────────────┐
          │   Orchestrator Engine    │   │      Catalog & Search    │   │    Commerce & Payments   │
          │ - Intent Router          │   │ - Destinations & Places  │   │ - Booking Center         │
          │ - Gemini LLM Provider    │   │ - Multi-modal Transit    │   │ - Razorpay / Stripe      │
          │ - Language Normalizer    │   │ - Hotels & Dining        │   │ - Group Expense Splitter │
          └────────────┬─────────────┘   └────────────┬─────────────┘   └────────────┬─────────────┘
                       │                              │                              │
                       ▼                              ▼                              ▼
          ┌──────────────────────────┐   ┌──────────────────────────┐   ┌──────────────────────────┐
          │    14 Specialized AI     │   │      SQLite / Postgres   │   │     External APIs &      │
          │          Agents          │   │      SQLAlchemy ORM      │   │     Mock Integrations    │
          └──────────────────────────┘   └──────────────────────────┘   └──────────────────────────┘
```

---

## 🤖 Multi-Agent Orchestration Architecture

NAVORA implements a **Hierarchical Multi-Agent Graph Architecture**:

1. **Central Orchestrator (`NavoraAITripOrchestrator`)**:
   - Classifies query intent based on keywords, semantically parsed tokens, and user profile state.
   - Routes request to one or more specialized sub-agents.
   - Aggregates structured tools output and feeds it into the Gemini LLM for synthesis.

2. **Specialized Agent Catalog**:
   - `DestinationAgent`: Resolves destination highlights, best travel times, and curated spots.
   - `WeatherRiskAgent`: Analyzes real-time and seasonal weather metrics, hazard warnings, and packing advice.
   - `TransportAgent`: Evaluates flights, trains, intercity buses, cab rentals, and transit durations.
   - `HotelAgent`: Filters accommodations by budget tier, star rating, neighborhood, and amenities.
   - `ActivityAgent`: Discovers cultural tours, adventure spots, tickets, and entry guidelines.
   - `RestaurantAgent`: Enforces dietary restrictions (Vegetarian, Vegan, Halal, Jain, Gluten-Free) and local food specialties.
   - `ShoppingAgent`: Recommends iconic local markets, souvenirs, and bargaining tips.
   - `AgencyAgent`: Connects travelers with verified local guides and tour operators.
   - `BudgetAgent`: Tracks live trip expenditure against target budget envelopes.
   - `ItineraryAgent`: Constructs daily timelines with geographical proximity optimization.
   - `TripMonitoringAgent`: Evaluates flight/train status and delay vectors.
   - `ReplanningAgent`: Offers instant alternate arrangements upon travel disruptions.
   - `RewardsAgent`: Calculates NAVORA Coins earnings and redemption eligibility.
   - `SafetyAgent`: Compiles emergency DOS dossiers (hospitals, police stations, embassy info).

---

## 💾 Database Schema Overview

NAVORA utilizes an SQL relational schema managed via SQLAlchemy ORM:
- **`users`**: User credentials, phone numbers, 2FA secrets, language preferences, emergency contacts.
- **`otps`**: Verification codes with expiry and attempt tracking.
- **`destinations`**: Rich destination catalog with images, categories, and editorial descriptions.
- **`transports`**: Multi-modal transit options with pricing, carbon emissions, and durations.
- **`hotels` / `activities` / `restaurants`**: Catalog entries with detailed metadata and ratings.
- **`trips`**: User trip plans with dates, budget targets, primary destination, and active status.
- **`itineraries` / `itinerary_items`**: Daily schedules with activity ordering, cost, and time slots.
- **`bookings`**: Booking records linked to trips with payment status.
- **`payments`**: Transaction records with provider reference IDs (Razorpay/Stripe).
- **`expenses` / `expense_splits`**: Group expenses with member debt allocations.
- **`coin_wallets` / `coin_transactions`**: Reward balances and earning logs.
