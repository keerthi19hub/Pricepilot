# PricePilot — Shop Smart. Choose Better.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_%2B_Vite-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Language-Python_3.11+-3776AB?logo=python)](https://python.org)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**PricePilot** is a modern, universal shopping intelligence platform that helps users discover products across 12 comprehensive categories, compare prices across major retailers, evaluate quality benchmarks, and uncover true value-for-money.

Rather than merely sorting products by the cheapest sticker price, PricePilot computes a transparent, explainable **Value-for-Money (VFM) Index** by balancing **Quality Evidence (50%)**, **Affordability (30%)**, and **Reliability Support (20%)**.

---

## 🚀 Key Working Features

1. **Universal Product Search & Natural Language Query Parser**
   - Parses complex queries like *"Best smartphone under ₹15,000"*, *"Good skincare under ₹500"*, or *"Affordable washing machine for a family"*.
   - Dynamically filters by category, brand, price slider, Bayesian-adjusted ratings, and category-specific specs (RAM, storage, skin concern, appliance capacity).

2. **Intelligent 3-Pillar Value-for-Money Engine**
   - **Quality Score (50%)**: Hardware benchmarks, build tier, and Bayesian customer rating smoothing ($prior = 4.0$, weight = 30) preventing low-sample 5★ bias.
   - **Affordability Score (30%)**: Price savings relative to budget and normalized unit pricing (per 100ml for serums, per 100g for powders, per piece for multipacks).
   - **Reliability Score (20%)**: Documented manufacturer warranty (months), retailer return windows, and authorized service trust.
   - Delivers 3 distinct recommendation badges:
     - 🌟 **Best Overall Value**: The optimal balanced option.
     - 💰 **Best Budget Pick**: Affordable choice meeting solid quality standards.
     - 🏆 **Best Quality Within Budget**: Highest specification tier inside stated budget.

3. **Variant-Sensitive Product Matching & Duplicate Detection**
   - Identifies equivalent products listed across retailers.
   - Discriminator preservation: strictly prevents merging distinct variants (e.g., 128GB vs 256GB storage, shoe sizes, appliance capacities, skincare ml).
   - Flags ambiguous matches as `TENTATIVE` for human admin review.

4. **Cross-Retailer Price Comparison**
   - Compares live & verified listings across **Amazon India, Flipkart, Croma, Reliance Digital, Nykaa, Myntra**, and more.
   - Breaks down listed price, delivery speed, shipping costs, estimated total purchase cost, warranty, and return policy.

5. **Historical Price Tracking & Deal Insights**
   - Real, multi-point historical price observation charts rendered with Recharts.
   - Calculates 60-day lowest, highest, and recorded average prices.
   - Displays cautious deal indicators (*"Lowest Price Recorded"*, *"Good Deal"*, *"Fair Price"*).
   - Explicit integrity rule: If fewer than 3 historical observations exist, cleanly shows *"Price history is not yet available"* rather than fabricating charts.

6. **Side-by-Side Product Comparison Workspace**
   - Compares 2 to 4 products side-by-side with an interactive *"Highlight Differences Only"* toggle.
   - Automatically formulates a definitive **PricePilot Verdict** with comparative advantages.

7. **12 Comprehensive Multi-Category Directory**
   - Electronics, Beauty & Skincare, Fashion, Home & Kitchen, Appliances, Grocery & Household, Health & Wellness, Baby & Kids, Books & Stationery, Sports & Fitness, Automotive, Travel & Lifestyle.

8. **Admin Operations & Telemetry Console**
   - Batch CSV dataset upload with validation audit logging.
   - Interactive duplicate candidate review (Confirm / Reject).
   - Retailer connection and data-source toggle.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PricePilot Web Interface                     │
│       React 18 + TypeScript + Vite + Tailwind CSS + Recharts    │
└─────────────────────────────────┬───────────────────────────────┘
                                  │ JSON REST API
┌─────────────────────────────────▼───────────────────────────────┐
│                    FastAPI Backend Application                  │
│               Python 3.11+ / Pydantic / SQLAlchemy              │
├────────────────────────────────┬────────────────────────────────┤
│ Core Engine Services:          │ API Routers:                   │
│  • ScoringEngine (VFM & Proof) │  • /api/products               │
│  • MatchingEngine (Variants)   │  • /api/recommendations        │
│  • PriceHistoryService         │  • /api/comparisons            │
│  • UnitPriceService            │  • /api/wishlist               │
│  • IngestionService (CSV/JSON) │  • /api/admin                  │
└────────────────────────────────┬────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────┐
│                        Database Storage                         │
│     SQLite (Zero-Setup Local Dev) / PostgreSQL (Production)     │
│  Products, Variants, Retailers, Listings, PriceObservations     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Quickstart & Local Setup

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** & **npm**

### 1. Backend Setup

```powershell
# Navigate to project root
cd c:\Users\keert\OneDrive\Desktop\RE

# Activate the virtual environment
.\.venv\Scripts\Activate.ps1

# Install backend dependencies (if not already installed)
pip install -r backend/requirements.txt

# Seed database with multi-category products and 60-day historical prices
python -m backend.app.seed.seed_data

# Start the FastAPI server (runs on http://localhost:8000)
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

Interactive API documentation (Swagger) is available at:
👉 **`http://localhost:8000/docs`**

---

### 2. Frontend Setup

```powershell
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies (already completed)
npm install

# Run the Vite development server (runs on http://localhost:5173)
npm run dev

# Or test production build
npm run build
```

Open your browser at:
👉 **`http://localhost:5173`**

---

## 🐳 Docker & Docker Compose Setup

Run the full stack (PostgreSQL + FastAPI Backend + Nginx Frontend) with one command:

```bash
docker-compose up --build
```
- Frontend: `http://localhost`
- Backend API & Docs: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432`

---

## 🔑 Default Accounts (Pre-Seeded)

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@pricepilot.com` | `admin123` | Full admin telemetry, CSV upload, match approval |
| **Shopper** | `shopper@pricepilot.com` | `shopper123` | Wishlist, personalized preferences, price alerts |

*(Instant one-click demo login buttons are provided on the login page).*

---

## 🧪 Automated Test Suite

Run the full test suite using `pytest`:

```powershell
python -m pytest backend/tests -v
```

### Test Coverage Summary:
- ✅ `test_scoring_engine_calculation`: Mathematical verification of Quality, Affordability, and Reliability weights.
- ✅ `test_scoring_engine_over_budget_penalty`: Verifies that exceeding budget triggers correct penalties.
- ✅ `test_matching_engine_variant_sensitivity`: Asserts that differing storage (128GB vs 256GB) is strictly rejected from false duplicate grouping.
- ✅ `test_matching_engine_exact_gtin_match`: Asserts 100% confidence on verified GTIN barcodes.
- ✅ `test_unit_price_service_calculations`: Verifies liquid normalization (₹ per 100ml) and weight normalization (₹ per 100g).
- ✅ `test_price_history_service_insufficient_data`: Asserts that < 3 observations cleanly returns `INSUFFICIENT_DATA`.
- ✅ `test_health_check_endpoint`: Verifies API health monitoring.
- ✅ `test_categories_endpoint`: Validates taxonomy structure and relevant filters.
- ✅ `test_universal_search_products`: Validates search querying and price ceilings.
- ✅ `test_product_detail_endpoint`: Verifies cross-retailer listings and VFM score breakdown.
- ✅ `test_product_price_history_endpoint`: Verifies historical observations series.
- ✅ `test_budget_finder_endpoint`: Validates the 3 recommendation tiers (Best Value, Best Budget, Best Quality).
- ✅ `test_comparison_workspace_endpoint`: Validates side-by-side spec comparison and verdict generation.
- ✅ `test_auth_registration`: Verifies user registration, bcrypt password hashing, and JWT token issuance.

---

## 🛡️ External Integrations & Transparency Statement

- **Currency**: All prices are in **Indian Rupees (₹ INR)**.
- **Data Freshness**: Product listings clearly indicate source type (`DEMO`, `IMPORT`, `PARTNER`).
- **No Unauthorized Scraping**: PricePilot connects only via permitted partner feeds or administrator-uploaded datasets (`data/sample_products.csv`).
- **No False Claims**: Demonstration prices are transparently labelled in the interface. Historical charts only render when verified records exist.

---

## 📜 License
MIT License. Built for rigorous computer science evaluation and real-world shopping intelligence.
