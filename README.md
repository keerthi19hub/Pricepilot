# 💰 PricePilot — Dynamic Pricing & E-Commerce Market Intelligence Platform

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=1E3A8A,2563EB,38BDF8&height=220&section=header&text=PricePilot&fontSize=42&fontColor=ffffff&fontAlignY=38&desc=Dynamic%20Pricing%20%26%20E-Commerce%20Market%20Intelligence&descSize=18&descAlignY=60&descAlign=50" width="100%" alt="PricePilot Header Banner" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Language-Python%203.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Frontend-Next.js%20%2F%20React-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Container-Docker%20%26%20Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

---

## 📌 Table of Contents

- [📖 Executive Summary](#-executive-summary)
- [🎯 Real-World Problem & Solution](#-real-world-problem--solution)
- [✨ Key Features & Capabilities](#-key-features--capabilities)
- [🏗️ System Architecture & Workflow](#️-system-architecture--workflow)
- [🛠️ Tech Stack Matrix](#️-tech-stack-matrix)
- [🐳 Containerized Orchestration (Docker)](#-containerized-orchestration-docker)
- [⚙️ Reproducible Quickstart & Setup](#️-reproducible-quickstart--setup)
- [📁 Project Structure](#-project-structure)
- [🔌 API Endpoints & Specification](#-api-endpoints--specification)
- [👩‍💻 Author & Contributions](#-author--contributions)

---

## 📖 Executive Summary

**PricePilot** is a production-grade full-stack e-commerce market intelligence and dynamic price tracking platform. Engineered with a high-throughput **FastAPI (Python)** asynchronous backend and an intuitive **TypeScript / Next.js** frontend, PricePilot monitors product price volatility across competing merchants, identifies discount anomalies, and visualizes historical pricing trends to empower shoppers and businesses with automated buying decisions.

---

## 🎯 Real-World Problem & Solution

- **The Problem:** Online retailers implement opaque dynamic pricing algorithms, constantly fluctuating costs based on browser cookies, demand spikes, and competitor catalogs. Consumers and procurement teams consistently overpay due to lack of consolidated cross-platform price history.
- **The Solution:** PricePilot normalizes cross-retailer pricing telemetry into unified product records. Its scheduled indexing engine calculates price drops, historical rolling minimums, and optimal purchasing windows, presenting these insights through high-performance REST APIs and reactive dashboards.

---

## ✨ Key Features & Capabilities

- **⚡ Asynchronous High-Throughput REST API:** Built with FastAPI, utilizing Pydantic data schemas, automatic OpenAPI (Swagger) documentation, and non-blocking I/O.
- **📈 Historical Price Volatility Tracking:** Ingests and stores time-series price points to plot price variance trends.
- **🏷️ Automated Deal & Discount Detection:** Algorithmic calculation of percentage markdown relative to 30-day trailing averages.
- **💻 Responsive TypeScript UI:** Next.js reactive frontend with server-side rendering, product catalog filtering, and instant search.
- **🐳 Turnkey Containerization:** Pre-configured multi-stage `Dockerfile` and `docker-compose.yml` for unified single-command deployment.

---

## 🏗️ System Architecture & Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PricePilot Platform Architecture                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
     ┌─────────────────────────────────┴────────────────────────────────┐
     ▼                                                                  ▼
┌───────────────────────────────┐                      ┌───────────────────────────────┐
│ Next.js Frontend (TypeScript) │◄───── HTTP/JSON ────►│     FastAPI Backend (Python)  │
│  - Product Grid & Filtering   │                      │  - Async RESTful Endpoints    │
│  - Volatility Charts          │                      │  - Pydantic Schema Validation │
└───────────────────────────────┘                      └───────────────┬───────────────┘
                                                                       │
                                                                       ▼
                                                       ┌───────────────────────────────┐
                                                       │ Data Store (Historical Cache) │
                                                       │  - Time-Series Price Catalog  │
                                                       └───────────────────────────────┘
                                                                       ▲
                                    Docker Compose Orchestrated        │
```

---

## 🛠️ Tech Stack Matrix

| Domain | Technology | Role |
| :--- | :--- | :--- |
| **Backend API** | FastAPI, Python 3.11+, Uvicorn | High-concurrency REST endpoints, schema serialization |
| **Frontend UI** | Next.js, React, TypeScript | Interactive catalog, reactive data binding, modern CSS |
| **DevOps & Cloud** | Docker, Docker Compose, Render | Multi-container packaging and cloud configuration |
| **Data Models** | Pydantic v2 | Type validation, request parsing, and error contracts |

---

## 🐳 Containerized Orchestration (Docker)

Launch the full-stack architecture with a single terminal command:
```bash
# Build and run backend and frontend containers
docker compose up --build -d

# Verify container health
docker compose ps
```
- Frontend accessible at: `http://localhost:3000`
- Backend API Docs accessible at: `http://localhost:8000/docs`

---

## ⚙️ Reproducible Quickstart & Setup (Manual)

### 1. Clone the Repository
```bash
git clone https://github.com/keerthi19hub/Pricepilot.git
cd Pricepilot
```

### 2. Configure Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows: source venv/bin/activate on Linux/Mac
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Configure Frontend (In a separate terminal)
```bash
cd ../frontend
npm install
npm run dev
```

---

## 📁 Project Structure

```text
Pricepilot/
├── backend/                # FastAPI application source
│   ├── main.py             # Server entry point and endpoint routing
│   ├── models.py           # Pydantic data schemas
│   └── requirements.txt    # Python backend dependencies
├── frontend/               # Next.js TypeScript web application
│   ├── package.json        # Node dependency manifest
│   ├── src/                # Component architecture and pages
│   └── public/             # Static UI assets
├── data/                   # Seed product data and historical price points
├── Dockerfile              # Backend container definition
├── docker-compose.yml      # Multi-service stack coordinator
├── render.yaml             # Render infrastructure-as-code deployment config
└── README.md               # Technical documentation
```

---

## 🔌 API Endpoints & Specification

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Service health status and version metadata |
| `GET` | `/products` | Retrieve catalog with pagination and category filtering |
| `GET` | `/products/{id}` | Inspect detailed price history and discount volatility |
| `POST` | `/products` | Ingest new product tracking records |

---

## 👩‍💻 Author & Contributions

**Keerthi N**  
- **GitHub:** [@keerthi19hub](https://github.com/keerthi19hub)  
- **Portfolio:** [keerthi19hub.github.io](https://keerthi19hub.github.io)  
- **Role:** Complete system architecture, FastAPI route engineering, TypeScript/Next.js frontend development, and Docker Compose orchestration.

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=1E3A8A,2563EB,38BDF8&height=100&section=footer" width="100%" alt="Footer Banner" />
</p>
