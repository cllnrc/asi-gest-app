# ASI-GEST - Guida Avvio Rapido

## 🚀 Avvio Automatico

Sono disponibili **3 file batch** per avviare automaticamente ASI-GEST:

### 1. `start-asi-gest.bat` (⭐ CONSIGLIATO)
**Usa questo se hai Python installato su WSL**

Doppio click su `start-asi-gest.bat` per:
- ✅ Avviare backend FastAPI (porta 8000) tramite WSL
- ✅ Avviare frontend React (porta 5173)
- ✅ Aprire automaticamente il browser su http://localhost:5173

### 2. `start-asi-gest-windows.bat`
**Usa questo se hai Python installato direttamente su Windows** (non WSL)

Stesso comportamento del file precedente, ma usa Python nativo Windows.

### 3. `stop-asi-gest.bat`
**Per fermare tutti i servizi**

Doppio click per terminare:
- Backend (porta 8000)
- Frontend (porta 5173)
- Finestre terminale associate

---

## 📋 Prerequisiti

Prima di usare i batch file, assicurati di avere:

### Backend (Python):
```bash
# Su WSL o Windows PowerShell nella cartella backend/
cd backend
python -m venv venv
source venv/bin/activate  # Su WSL
# oppure
venv\Scripts\activate     # Su Windows

pip install -r requirements.txt
```

### Frontend (Node.js):
```bash
# Nella cartella frontend/
cd frontend
npm install
```

### Database:
- SQL Server raggiungibile in rete
- File `.env` configurato in `backend/.env` con credenziali corrette

---

## 🌐 URL Servizi

Dopo l'avvio:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🔧 Risoluzione Problemi

### Problema: "Porta già in uso"
Soluzione: Esegui `stop-asi-gest.bat` e riprova

### Problema: "WSL non trovato"
Soluzione: Usa `start-asi-gest-windows.bat` invece

### Problema: "npm non trovato"
Soluzione: Installa Node.js da https://nodejs.org/

### Problema: "Python non trovato"
Soluzione: Installa Python 3.9+ da https://www.python.org/

### Problema: "Errore connessione database"
Soluzione: Verifica `backend/.env` con credenziali SQL Server corrette

---

## 📞 Supporto

Per problemi o domande:
- Email: lab.creative.ai@gmail.com
- GitHub Issues: [link al repository]

---

© 2025 Enrico Callegaro - Tutti i diritti riservati
