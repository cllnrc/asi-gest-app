# 02 - ASI-GEST Architecture

> **Architettura Sistema, Stack Tecnologico, Component Breakdown**

---

## 🏗️ System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER (Client)                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │   React 18 + TypeScript + Vite                      │   │
│  │   - Tailwind CSS (layout compatto)                  │   │
│  │   - React Router (SPA)                              │   │
│  │   - Axios (HTTP client)                             │   │
│  │   - State: Context API + Hooks                      │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS / REST API (JSON)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                BACKEND SERVER (Python)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         FastAPI Application                          │  │
│  │   - REST endpoints                                   │  │
│  │   - Request validation (Pydantic)                    │  │
│  │   - CORS middleware                                  │  │
│  │   - Error handling                                   │  │
│  └───────────┬─────────────────────────┬────────────────┘  │
│              │                         │                    │
│  ┌───────────▼───────────┐  ┌──────────▼─────────────┐    │
│  │   AsitronCore         │  │  SQLAlchemy ORM        │    │
│  │   (Proprietario)      │  │  - Models              │    │
│  │   - Business Logic    │  │  - Database Access     │    │
│  │   - Analytics         │  │  - Sessions            │    │
│  │   - License Check     │  └──────────┬─────────────┘    │
│  │   - Query Builders    │             │                   │
│  └───────────────────────┘             │                   │
└────────────────────────────────────────┼───────────────────┘
                                         │
                    ┌────────────────────▼────────────────┐
                    │   SQL SERVER (On-Premise)           │
                    │                                     │
                    │  ┌───────────────────────────────┐ │
                    │  │  Database: ASITRON            │ │
                    │  │  (Gestionale - Read-Only)     │ │
                    │  │  - COMMESSE                   │ │
                    │  │  - ARTICOLI                   │ │
                    │  │  - CLIENTI                    │ │
                    │  └───────────────────────────────┘ │
                    │                                     │
                    │  ┌───────────────────────────────┐ │
                    │  │  Database: ASI_GEST           │ │
                    │  │  (Production Data - R/W)      │ │
                    │  │  - FaseTipo                   │ │
                    │  │  - Utenti                     │ │
                    │  │  - Macchine                   │ │
                    │  │  - ConfigCommessa             │ │
                    │  │  - Fasi                       │ │
                    │  │  - Lotti                      │ │
                    │  │  - DocumentiTecnici           │ │
                    │  │  - LogEventi                  │ │
                    │  │  - vw_AvanzamentoCommesse     │ │
                    │  └───────────────────────────────┘ │
                    └─────────────────────────────────────┘
```

---

## 📦 Component Breakdown

### Frontend Layer (React SPA)

**Technology:**
- React 18.2+
- TypeScript 5.x
- Vite 5.x (build tool)
- Tailwind CSS 3.x

**Key Features:**
- Single Page Application (SPA)
- Layout ultra-compatto per tablet touch (come ASI-TRACE)
- Responsive ma ottimizzato per desktop/tablet 10"+
- No server-side rendering (client-side only)

**Struttura:**
```
frontend/
├── src/
│   ├── main.tsx              # Entry point
│   ├── App.tsx               # Root + Router
│   ├── components/           # Reusable
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   ├── Table.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   ├── pages/                # Route pages
│   │   ├── HomePage.tsx
│   │   ├── CommessePage.tsx
│   │   ├── LottiSMDPage.tsx
│   │   └── ...
│   ├── api/                  # HTTP client
│   │   ├── client.ts
│   │   ├── commesse.ts
│   │   └── ...
│   ├── types/                # TypeScript types
│   └── utils/                # Helpers
└── ...
```

### Backend Layer (FastAPI)

**Technology:**
- FastAPI 0.104+
- Python 3.9+
- SQLAlchemy 2.0+ (ORM)
- Pydantic v2 (validation)
- pymssql (SQL Server driver)
- Uvicorn (ASGI server)

**Key Features:**
- RESTful API
- Automatic OpenAPI documentation
- Async support (where beneficial)
- Input validation via Pydantic
- CORS enabled for frontend

**Struttura:**
```
backend/
├── app/
│   ├── main.py               # FastAPI app
│   ├── config.py             # Settings
│   ├── database.py           # DB connections
│   ├── models/               # SQLAlchemy models
│   ├── schemas/              # Pydantic schemas
│   ├── api/                  # Route handlers
│   ├── crud/                 # CRUD operations
│   └── utils/
├── tests/
├── requirements.txt
└── .env
```

### Core Engine Layer (AsitronCore)

**Technology:**
- Pure Python 3.9+
- Compilabile con Cython (optional)
- Distribuito come wheel (.whl)

**Key Features:**
- 🔒 Proprietario e compilato
- Business logic separata
- License check automatico
- Reusabile per altri clienti

### Database Layer (SQL Server)

**Two Databases:**

1. **ASITRON (Gestionale)** - Read-Only
   - Commesse
   - Articoli
   - Clienti
   - Accesso: SELECT only

2. **ASI_GEST (Produzione)** - Read-Write
   - 8 tabelle core
   - Views
   - Indexes

---

## 🔧 Technology Stack Dettagliato

### Frontend Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| UI Library | React | 18.2+ | Component-based UI |
| Language | TypeScript | 5.x | Type safety |
| Build Tool | Vite | 5.x | Fast dev server |
| Styling | Tailwind CSS | 3.x | Utility-first CSS |
| Routing | React Router | 6.x | Client-side routing |
| HTTP Client | Axios | 1.6+ | API calls |
| State Management | React Context | - | No Redux |
| Date Handling | date-fns | 2.30+ | Date formatting |

### Backend Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | FastAPI | 0.104+ | REST API |
| Language | Python | 3.9+ | Backend |
| ORM | SQLAlchemy | 2.0+ | Database abstraction |
| Validation | Pydantic | 2.x | Request validation |
| DB Driver | pymssql | 2.2+ | SQL Server |
| Server | Uvicorn | 0.24+ | ASGI server |
| Migrations | Alembic | 1.12+ | Schema versioning |
| Testing | Pytest | 7.4+ | Unit tests |

### Database Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| DBMS | SQL Server | 2019+ | Già presente |
| Driver | pymssql | 2.2+ | Python ↔ SQL |
| ORM | SQLAlchemy | 2.0+ | ORM |

---

## 🔌 Integration Points

### 1. Frontend ↔ Backend

**Protocol:** REST API over HTTPS  
**Format:** JSON  

### 2. Backend ↔ AsitronCore

**Type:** Python package import  

### 3. Backend ↔ Database ASI_GEST

**Type:** SQLAlchemy ORM  

### 4. Backend ↔ Database ASITRON

**Type:** Raw SQL queries (Read-Only)

---

## 🎯 Architectural Decisions

### Decision 1: Monolith vs Microservices
**Scelta:** Monolith  
**Rationale:** Team small, dominio coeso, deploy semplice

### Decision 2: REST vs GraphQL
**Scelta:** REST  
**Rationale:** Più semplice, auto-doc FastAPI

### Decision 3: SPA vs SSR
**Scelta:** SPA  
**Rationale:** App interna, no SEO needed

### Decision 4: SQL vs NoSQL
**Scelta:** SQL  
**Rationale:** Relazioni forti, ACID critical

### Decision 5: Core Separato
**Scelta:** Core separato  
**Rationale:** IP protection, reusability

---

## 🔐 Security Considerations

### v1.0 (Minimal Security)
- ✅ CORS configurato
- ✅ Input validation
- ✅ SQL injection prevention
- ❌ NO Authentication (v1)

### v2.0+ (Enhanced)
- JWT authentication
- RBAC
- Audit trail completo

---

**DOCUMENTO SUCCESSIVO:** [03_DATABASE.md](03_DATABASE.md)
