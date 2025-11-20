# 06 - ASI-GEST Frontend

> **React SPA, Layout Compatto, Pagine e Componenti, TypeScript**

---

## 🎯 Frontend Overview

### Caratteristiche Principali

- **Single Page Application (SPA)** - React 18 + TypeScript
- **Layout ultra-compatto** - Ottimizzato per tablet touch (stile ASI-TRACE)
- **Responsive** - Ma focus su desktop/tablet 10"+
- **Veloce** - Vite build tool, bundle ottimizzato
- **Type-safe** - TypeScript per ridurre bug

---

## 📁 Struttura Progetto Frontend

```
frontend/
├── public/
│   └── favicon.ico
│
├── src/
│   ├── main.tsx              # Entry point
│   ├── App.tsx               # Root component + Router
│   ├── index.css             # Global styles
│   │
│   ├── components/           # Componenti riusabili
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Table.tsx
│   │   ├── Modal.tsx
│   │   ├── Button.tsx
│   │   └── ...
│   │
│   ├── pages/                # Route pages
│   │   ├── HomePage.tsx
│   │   ├── CommessePage.tsx
│   │   ├── ConfigPage.tsx
│   │   ├── LottiSMDPage.tsx
│   │   ├── LottiPTHPage.tsx
│   │   ├── LottiControlliPage.tsx
│   │   └── AvanzamentoPage.tsx
│   │
│   ├── api/                  # HTTP client
│   │   ├── client.ts
│   │   ├── commesse.ts
│   │   ├── lotti.ts
│   │   └── ...
│   │
│   ├── types/                # TypeScript types
│   │   ├── index.ts
│   │   ├── commesse.ts
│   │   ├── lotti.ts
│   │   └── ...
│   │
│   └── utils/                # Helpers
│       ├── formatters.ts
│       └── validators.ts
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## ⚙️ Configuration

### File: `package.json`

```json
{
  "name": "asi-gest-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.3.3",
    "vite": "^5.0.8"
  }
}
```

### File: `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
```

### File: `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        '9': '9px',
        '10': '10px',
        '11': '11px',
      }
    },
  },
  plugins: [],
}
```

---

## 🎨 Layout Compatto (stile ASI-TRACE)

### File: `src/components/Layout.tsx`

```typescript
import { Link, Outlet, useLocation } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const linkClass = (path: string) => 
    `hover:underline ${isActive(path) ? 'font-bold' : ''}`;
  
  return (
    <div className="flex flex-col h-screen">
      {/* Header compatto h-10 (40px) */}
      <header className="h-10 bg-blue-600 text-white flex items-center px-4 shadow-md">
        <div className="text-[11px] font-semibold mr-8">ASI-GEST</div>
        <nav className="flex gap-4 text-[11px]">
          <Link to="/" className={linkClass('/')}>
            Dashboard
          </Link>
          <Link to="/commesse" className={linkClass('/commesse')}>
            Commesse
          </Link>
          <Link to="/config" className={linkClass('/config')}>
            Config
          </Link>
          <Link to="/smd" className={linkClass('/smd')}>
            SMD
          </Link>
          <Link to="/pth" className={linkClass('/pth')}>
            PTH
          </Link>
          <Link to="/controlli" className={linkClass('/controlli')}>
            Controlli
          </Link>
          <Link to="/avanzamento" className={linkClass('/avanzamento')}>
            Avanzamento
          </Link>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-2 bg-gray-50">
        <Outlet />
      </main>

      {/* Footer minimale h-6 */}
      <footer className="h-6 bg-gray-100 text-[9px] flex items-center justify-center text-gray-600 border-t">
        © 2025 ASI-GEST v1.0 - Developed by Enrico
      </footer>
    </div>
  );
}
```

### File: `src/App.tsx`

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CommessePage from './pages/CommessePage';
import ConfigPage from './pages/ConfigPage';
import LottiSMDPage from './pages/LottiSMDPage';
import LottiPTHPage from './pages/LottiPTHPage';
import LottiControlliPage from './pages/LottiControlliPage';
import AvanzamentoPage from './pages/AvanzamentoPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/commesse" element={<CommessePage />} />
          <Route path="/config" element={<ConfigPage />} />
          <Route path="/smd" element={<LottiSMDPage />} />
          <Route path="/pth" element={<LottiPTHPage />} />
          <Route path="/controlli" element={<LottiControlliPage />} />
          <Route path="/avanzamento" element={<AvanzamentoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

## 🧩 Componenti Riusabili

### File: `src/components/Table.tsx`

```typescript
/**
 * Tabella ultra-compatta stile ASI-TRACE.
 */

import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  className?: string;
}

export default function Table<T extends { id?: number | string }>({ 
  columns, 
  data, 
  onRowClick,
  className = '' 
}: TableProps<T>) {
  
  const getCellValue = (row: T, column: Column<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    return row[column.accessor];
  };
  
  return (
    <div className={`overflow-auto ${className}`}>
      <table className="w-full text-[10px] border-collapse">
        <thead>
          <tr className="bg-gray-200 border-b border-gray-300">
            {columns.map((col, idx) => (
              <th 
                key={idx}
                className="py-0.5 px-1 text-left font-semibold"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td 
                colSpan={columns.length} 
                className="py-4 px-2 text-center text-gray-500"
              >
                Nessun dato disponibile
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-gray-200 hover:bg-blue-50 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td 
                    key={colIdx}
                    className={`py-0.5 px-1 ${col.className || ''}`}
                  >
                    {getCellValue(row, col)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
```

### File: `src/components/Modal.tsx`

```typescript
/**
 * Modal component riusabile.
 */

import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'md' 
}: ModalProps) {
  
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl'
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full mx-4`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-sm font-semibold">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        {/* Body */}
        <div className="p-4 max-h-[70vh] overflow-auto text-[11px]">
          {children}
        </div>
      </div>
    </div>
  );
}
```

---

## 📄 Pagine Principali

### File: `src/pages/HomePage.tsx`

```typescript
/**
 * Home page / Dashboard base.
 */

import { useEffect, useState } from 'react';
import { getDashboardKPI } from '../api/dashboard';

interface DashboardKPI {
  lotti_completati_settimana: number;
  scarti_percentuale_media: number;
  top_operatori: Array<{ nome: string; pezzi: number }>;
}

export default function HomePage() {
  const [kpi, setKPI] = useState<DashboardKPI | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadKPI();
  }, []);
  
  const loadKPI = async () => {
    try {
      setLoading(true);
      const data = await getDashboardKPI();
      setKPI(data);
    } catch (error) {
      console.error('Errore caricamento KPI:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className="p-4">Caricamento...</div>;
  }
  
  if (!kpi) {
    return <div className="p-4">Errore caricamento dati</div>;
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-lg font-bold mb-4">Dashboard ASI-GEST</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-[10px] text-gray-600 mb-1">Lotti Settimana</div>
          <div className="text-2xl font-bold text-blue-600">
            {kpi.lotti_completati_settimana}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <div className="text-[10px] text-gray-600 mb-1">Scarti % Media</div>
          <div className="text-2xl font-bold text-orange-600">
            {kpi.scarti_percentuale_media}%
          </div>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <div className="text-[10px] text-gray-600 mb-1">Top Operatore</div>
          <div className="text-sm font-semibold">
            {kpi.top_operatori[0]?.nome || 'N/A'}
          </div>
          <div className="text-[10px] text-gray-500">
            {kpi.top_operatori[0]?.pezzi || 0} pz
          </div>
        </div>
      </div>
      
      {/* Top Operatori */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-sm font-semibold mb-2">Top 5 Operatori (7gg)</h2>
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b">
              <th className="text-left py-1">Operatore</th>
              <th className="text-right py-1">Pezzi</th>
            </tr>
          </thead>
          <tbody>
            {kpi.top_operatori.map((op, idx) => (
              <tr key={idx} className="border-b">
                <td className="py-1">{op.nome}</td>
                <td className="text-right py-1">{op.pezzi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### File: `src/pages/LottiSMDPage.tsx`

```typescript
/**
 * Pagina gestione lotti SMD.
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { getLottiByFase, createLotto, closeLotto } from '../api/lotti';
import { Lotto } from '../types';

export default function LottiSMDPage() {
  const [searchParams] = useSearchParams();
  const faseId = searchParams.get('fase_id');
  
  const [lotti, setLotti] = useState<Lotto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedLotto, setSelectedLotto] = useState<Lotto | null>(null);
  
  useEffect(() => {
    if (faseId) {
      loadLotti(parseInt(faseId));
    }
  }, [faseId]);
  
  const loadLotti = async (fId: number) => {
    try {
      setLoading(true);
      const data = await getLottiByFase(fId);
      setLotti(data);
    } catch (error) {
      console.error('Errore caricamento lotti:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleNuovoLotto = () => {
    setSelectedLotto(null);
    setShowModal(true);
  };
  
  const handleChiudiLotto = (lotto: Lotto) => {
    setSelectedLotto(lotto);
    setShowModal(true);
  };
  
  const columns = [
    { header: 'Prog', accessor: 'Progressivo' as const },
    { header: 'Inizio', accessor: (row: Lotto) => new Date(row.DataInizio).toLocaleString() },
    { header: 'Fine', accessor: (row: Lotto) => row.DataFine ? new Date(row.DataFine).toLocaleString() : '-' },
    { header: 'Output', accessor: 'QtaOutput' as const },
    { header: 'Scarti', accessor: 'QtaScarti' as const },
    { header: 'Operatore', accessor: 'operatore_nome' as const },
    { 
      header: 'Azioni', 
      accessor: (row: Lotto) => !row.DataFine ? (
        <button 
          onClick={() => handleChiudiLotto(row)}
          className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded hover:bg-green-600"
        >
          Chiudi
        </button>
      ) : null
    },
  ];
  
  if (!faseId) {
    return <div className="p-4">Seleziona una fase SMD</div>;
  }
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold">Lotti SMD - Fase {faseId}</h1>
        <button 
          onClick={handleNuovoLotto}
          className="bg-blue-600 text-white px-4 py-2 text-[11px] rounded hover:bg-blue-700"
        >
          + Nuovo Lotto
        </button>
      </div>
      
      {loading ? (
        <div>Caricamento...</div>
      ) : (
        <div className="bg-white p-2 rounded shadow">
          <Table 
            columns={columns}
            data={lotti}
          />
        </div>
      )}
      
      {/* Modal per nuovo/chiudi lotto */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedLotto ? 'Chiudi Lotto' : 'Nuovo Lotto'}
      >
        {/* Form qui - implementazione nel task specifico */}
        <div>Form lotto (TODO)</div>
      </Modal>
    </div>
  );
}
```

---

## 🔌 API Client

### File: `src/api/client.ts`

```typescript
/**
 * Axios client configurato.
 */

import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor per error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default apiClient;
```

### File: `src/api/lotti.ts`

```typescript
/**
 * API calls per lotti.
 */

import apiClient from './client';
import { Lotto, LottoCreate, LottoUpdate } from '../types';

export const getLottiByFase = async (faseId: number): Promise<Lotto[]> => {
  const response = await apiClient.get(`/lotti/smd/fase/${faseId}`);
  return response.data;
};

export const createLotto = async (data: LottoCreate): Promise<Lotto> => {
  const response = await apiClient.post('/lotti/smd', data);
  return response.data;
};

export const closeLotto = async (lottoId: number, data: LottoUpdate): Promise<Lotto> => {
  const response = await apiClient.patch(`/lotti/smd/${lottoId}`, data);
  return response.data;
};
```

### File: `src/api/dashboard.ts`

```typescript
import apiClient from './client';

export const getDashboardKPI = async (giorni: number = 7) => {
  const response = await apiClient.get(`/dashboard/kpi?giorni=${giorni}`);
  return response.data;
};
```

---

## 📝 TypeScript Types

### File: `src/types/index.ts`

```typescript
export interface Lotto {
  LottoID: number;
  FaseID: number;
  Progressivo: number;
  DataInizio: string;
  DataFine: string | null;
  QtaInput: number | null;
  QtaOutput: number;
  QtaScarti: number;
  OperatoreID: number | null;
  MacchinaID: number | null;
  ProgrammaFeeder: string | null;
  TempoSetupMin: number | null;
  TipoScarto: string | null;
  NoteScarti: string | null;
  Note: string | null;
  operatore_nome?: string;
  macchina_codice?: string;
}

export interface LottoCreate {
  FaseID: number;
  DataInizio: string;
  QtaInput?: number;
  QtaOutput: number;
  QtaScarti: number;
  OperatoreID?: number;
  MacchinaID?: number;
  ProgrammaFeeder?: string;
  TempoSetupMin?: number;
  Note?: string;
}

export interface LottoUpdate {
  DataFine: string;
  QtaOutput: number;
  QtaScarti: number;
  OperatoreID?: number;
  MacchinaID?: number;
  TipoScarto?: string;
  NoteScarti?: string;
  Note?: string;
}
```

---

## 🚀 Run Frontend

### Development

```bash
cd frontend/

# Install deps
npm install

# Run dev server
npm run dev

# Open http://localhost:5173
```

### Production Build

```bash
# Build
npm run build

# Output in dist/
# Deploy dist/ contents to web server
```

---

**DOCUMENTO SUCCESSIVO:** [07_INTEGRATION.md](07_INTEGRATION.md)
