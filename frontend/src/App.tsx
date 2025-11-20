/**
 * ASI-GEST Main App Component
 * © 2025 Enrico Callegaro - Tutti i diritti riservati.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Commesse from './pages/Commesse';
import DocUT from './pages/DocUT';
import Lotti from './pages/Lotti';
import SMD from './pages/SMD';
import PTH from './pages/PTH';
import Collaudo from './pages/Collaudo';
import Utenti from './pages/Utenti';
import Macchine from './pages/Macchine';
import NumeroCommessa from './pages/NumeroCommessa';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="commesse" element={<Commesse />} />
          <Route path="doc-ut" element={<DocUT />} />
          <Route path="lotti" element={<Lotti />} />
          <Route path="smd" element={<SMD />} />
          <Route path="pth" element={<PTH />} />
          <Route path="collaudo" element={<Collaudo />} />
          <Route path="utenti" element={<Utenti />} />
          <Route path="macchine" element={<Macchine />} />
          <Route path="numero-commessa" element={<NumeroCommessa />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
