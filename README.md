# 💰 PricePilot — Smart E-Commerce Price Intelligence Platform

> **A modern full-stack shopping intelligence platform to track, compare, and analyse product prices across retailers in real time.**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)

---

## Problem Statement

Fragmented online pricing makes it difficult for consumers to track real-time price trends, discounts, and optimal buying windows across multiple retailers.

## Solution Architecture

```
┌─────────────────────────────────────────────────┐
│         PricePilot Full-Stack Platform          │
│                                                 │
│  ┌──────────────┐      ┌───────────────────┐   │
│  │  Next.js /   │ HTTP │    FastAPI         │   │
│  │  TypeScript  │◄────►│    Backend         │   │
│  │  Frontend    │      │  (REST endpoints)  │   │
│  └──────────────┘      └────────┬──────────┘   │
│                                 │               │
│                        ┌────────▼──────────┐    │
│                        │  Price Database   │    │
│                        │  (historical data │    │
│                        │   + tracking)     │    │
│                        └───────────────────┘    │
│                                                 │
│            🐳 Docker Compose Orchestration      │
└─────────────────────────────────────────────────┘
```

## Key Features

- **Real-Time Price Tracking:** Monitor product prices across multiple retail sources.
- **Historical Price Analysis:** Time-series data to identify seasonal trends and discount windows.
- **Automated Discount Detection:** Alerts when prices drop below user-defined thresholds.
- **Fully Containerised:** Docker + Docker Compose for one-command deployment.
- **RESTful API:** Clean FastAPI endpoints with automatic OpenAPI docs.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | TypeScript · Next.js · CSS |
| Backend API | Python · FastAPI |
| Containerisation | Docker · Docker Compose |
| Data | Historical price store (JSON/SQLite) |

## Quickstart

```bash
# 1. Clone
git clone https://github.com/keerthi19hub/Pricepilot.git
cd Pricepilot

# 2. Launch with Docker Compose
docker compose up --build

# Frontend: http://localhost:3000
# API docs: http://localhost:8000/docs
```

## Manual Setup (without Docker)

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Author

**Keerthi N** — End-to-end system architecture, API route engineering, data models, container configuration, and responsive UI design.

*Alliance University, BCA — 2026*

---

Released under the [MIT License](https://opensource.org/licenses/MIT).
