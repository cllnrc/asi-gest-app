# ASI-GEST

**Production Management System for Electronics Assembly**

ASI-GEST is a comprehensive web application for managing electronics manufacturing operations at Asitron, covering SMD assembly, PTH assembly, functional testing, and final testing workflows.

## Architecture

ASI-GEST uses a modern three-tier architecture:

```
┌─────────────────────────────────────────────────┐
│           Frontend (React + Vite)               │
│  - Ultra-compact UI (Tailwind CSS)             │
│  - Real-time production tracking                │
│  - TypeScript strict mode                       │
└─────────────────────────────────────────────────┘
                      ↓ REST API
┌─────────────────────────────────────────────────┐
│          Backend (FastAPI + SQLAlchemy)         │
│  - API endpoints for all operations             │
│  - Dual database access (ASI_GEST + ASITRON)   │
│  - CORS middleware for frontend integration     │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│         AsitronCore (Proprietary Package)       │
│  - Business logic (lotti, analytics)            │
│  - License-protected intellectual property      │
│  - Private GitHub repository                    │
└─────────────────────────────────────────────────┘
```

## Technology Stack

### Backend
- **Python 3.9+**
- **FastAPI 0.104+** - Modern async web framework
- **SQLAlchemy 2.0+** - Database ORM
- **pymssql 2.2+** - SQL Server connectivity
- **Pydantic 2.5+** - Data validation
- **Uvicorn** - ASGI server

### Frontend
- **React 18** - UI library
- **TypeScript 5.x** - Static typing (strict mode)
- **Vite 5.x** - Fast build tool
- **Tailwind CSS 3.x** - Utility-first CSS
- **Axios** - HTTP client
- **React Router 6** - Client-side routing

### Database
- **SQL Server** - Two databases:
  - `ASI_GEST` - Production data (read-write)
  - `ASITRON` - Gestionale data (read-only)

## Project Structure

```
asi-gest-app/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py          # Settings and environment
│   │   │   └── database.py        # Dual database engines
│   │   ├── models/                # SQLAlchemy models (8 tables)
│   │   │   ├── fase_tipo.py
│   │   │   ├── utente.py
│   │   │   ├── macchina.py
│   │   │   ├── config_commessa.py
│   │   │   ├── fase.py
│   │   │   ├── lotto.py
│   │   │   ├── documento_tecnico.py
│   │   │   └── log_evento.py
│   │   ├── routes/                # API endpoints (to be implemented)
│   │   ├── schemas/               # Pydantic schemas (to be implemented)
│   │   ├── services/              # Business logic layer (to be implemented)
│   │   └── main.py                # FastAPI application entry
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/                   # Axios client
│   │   ├── components/            # Reusable UI components
│   │   ├── pages/                 # Route pages
│   │   ├── types/                 # TypeScript type definitions
│   │   ├── hooks/                 # React custom hooks
│   │   └── App.tsx
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
└── README.md (this file)
```

## Installation

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn
- Access to SQL Server databases (ASI_GEST and ASITRON)
- AsitronCore package with valid license

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Install AsitronCore (proprietary):**
   ```bash
   pip install -e /path/to/asitron-core
   ```

5. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

6. **Initialize database (development only):**
   ```bash
   curl -X POST http://localhost:8000/init-db
   ```

7. **Run backend server:**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

   Backend will be available at: `http://localhost:8000`
   API documentation: `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

   Frontend will be available at: `http://localhost:5173`

4. **Build for production:**
   ```bash
   npm run build
   ```

   Output will be in `dist/` directory.

## Environment Configuration

Create `backend/.env` file with the following variables:

```env
# Application
APP_NAME=ASI-GEST
APP_VERSION=1.0.0
HOST=0.0.0.0
PORT=8000
DEBUG=true

# CORS (adjust for production)
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]

# Database ASI_GEST (read-write)
DB_ASI_GEST_SERVER=192.168.1.15
DB_ASI_GEST_PORT=1433
DB_ASI_GEST_DATABASE=ASI_GEST
DB_ASI_GEST_USER=your_username
DB_ASI_GEST_PASSWORD=your_password

# Database ASITRON (read-only)
DB_ASITRON_SERVER=192.168.1.15
DB_ASITRON_PORT=1433
DB_ASITRON_DATABASE=ASITRON
DB_ASITRON_USER=your_username
DB_ASITRON_PASSWORD=your_password
```

## Development Workflow

### Backend Development
1. Activate virtual environment: `source venv/bin/activate`
2. Run with auto-reload: `uvicorn app.main:app --reload`
3. Test with FastAPI docs: `http://localhost:8000/docs`
4. Add new routes in `app/routes/`
5. Add new models in `app/models/`
6. Add business logic in AsitronCore package

### Frontend Development
1. Run dev server: `npm run dev`
2. API calls automatically proxy to `http://localhost:8000/api`
3. Add new pages in `src/pages/`
4. Add new components in `src/components/`
5. TypeScript strict mode enabled - fix all type errors

### Git Workflow
```bash
git add .
git commit -m "Description of changes"
git push origin main
```

## Database Schema

### ASI_GEST Tables (8 core tables)

1. **FaseTipo** - Phase type definitions (SMD, PTH, TEST_FUNZ, TEST_FINALE)
2. **Utenti** - User accounts for operators
3. **Macchine** - Machine registry (pick&place, soldering, test equipment)
4. **ConfigCommessa** - Work order configuration and phase definitions
5. **Fasi** - Active production phases for work orders
6. **Lotti** - Production batches with input/output/waste tracking
7. **DocumentiTecnici** - Technical documentation links
8. **LogEventi** - System event logging

### ASITRON Tables (read-only)

- **TESTEORDINIPROD** + **RIGHEORDPROD** - Work orders and line items
- **ANAGRAFICAARTICOLI** - Product catalog
- **ANAGRAFICACF** - Customer/supplier registry
- **TESTEDOCUMENTI** + **RIGHEDOCUMENTI** - Documents (orders, invoices, DDT)

See `/mnt/asi-trace/docs/MAPPING_GESTIONALE_REALE_ASI_GEST.md` for detailed mapping.

## API Endpoints

### Health & Status
- `GET /` - API info
- `GET /health` - Health check
- `POST /init-db` - Initialize database (dev only)

### Production Management (to be implemented)
- `GET /api/lotti` - List batches
- `POST /api/lotti` - Create new batch
- `PUT /api/lotti/{id}` - Close batch
- `GET /api/fasi` - List active phases
- `POST /api/fasi` - Create new phase
- `GET /api/config` - List work order configs

### Gestionale Integration (to be implemented)
- `GET /api/gestionale/commesse` - List work orders
- `GET /api/gestionale/articoli` - List products
- `GET /api/gestionale/clienti` - List customers

## AsitronCore Integration

This application requires the proprietary **AsitronCore** package, which contains:

- Business logic for batch management (`asitron_core.business.lotti`)
- Analytics and reporting (`asitron_core.business.analytics`)
- License validation mechanism
- Intellectual property protection

AsitronCore is distributed via private GitHub repository: `https://github.com/cllnrc/asitron-core`

**License:** The package checks license validity on import. Development license expires 2027-12-31.

## Copyright & License

**© 2025 Enrico Callegaro - Tutti i diritti riservati.**

This application and its core business logic are proprietary software developed by Enrico Callegaro using personal resources (€720 in AI subscriptions).

The intellectual property is protected under Italian Civil Code Art. 2590 and may be licensed to Asitron S.r.l. for commercial use.

**AsitronCore package:** Private repository - All rights reserved
**ASI-GEST application:** Public repository - Usage restricted to authorized installations with valid AsitronCore license

## Support & Documentation

- **Project specifications:** `/mnt/asi-gest/docs/Specifiche/`
- **Database mapping:** `/mnt/asi-trace/docs/MAPPING_GESTIONALE_REALE_ASI_GEST.md`
- **API documentation:** `http://localhost:8000/docs` (when backend running)
- **Developer:** Enrico Callegaro (lab.creative.ai@gmail.com)

## Roadmap

- [x] Phase 1: Backend structure + database models
- [x] Phase 2: Frontend structure + ultra-compact UI
- [ ] Phase 3: API endpoints implementation
- [ ] Phase 4: Gestionale integration
- [ ] Phase 5: Real-time dashboard
- [ ] Phase 6: PDF DHR generation (IPC-1782 compliance)
- [ ] Phase 7: Barcode scanning integration
- [ ] Phase 8: Production deployment

---

**Built with FastAPI, React, and AsitronCore**
