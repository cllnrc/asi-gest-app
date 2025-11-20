# ASI-GEST - Note di Sessione

> Documento di stato corrente della sessione di sviluppo
> Ultimo aggiornamento: 20 Novembre 2025

---

## Stato Progetto

### Lavoro Completato Oggi

1. ✅ **Creato documento LOGICA_OPERATIVA.md**
   - Regole di business complete
   - Flusso produttivo documentato
   - Prerequisiti DocUT (4 campi obbligatori)
   - Stati e transizioni fasi/lotti

2. ✅ **Rinominato RIFCOMMCLI → Numero Commessa**
   - Pagina frontend rinominata: `NumeroCommessa.tsx`
   - Campo Utente ora è dropdown con caricamento da tabella UTENTI
   - Routes e navigazione aggiornate
   - Commit e push completati (commit `94b4eca`)

3. ✅ **Aggiunta directory Specifiche/**
   - Tutta la documentazione del progetto
   - 14 file markdown con specifiche complete

---

## Problema Aperto - Connessione Database

### Situazione
- **Problema:** Non riesco a connettermi al SQL Server da WSL
- **Server:** 192.168.1.15:1433
- **Errore:** "No route to host" / "Destination Host Unreachable"
- **Credenziali:** sa/Nde962005 (nel .env)
- **Working directory:** `/mnt/server-d/Asi-Gest/asi-gest-app/` (mount di rete funzionante)
- **IP attuale:** 192.168.1.222

### Cosa Verificare
1. Firewall Windows sul server SQL (192.168.1.15)
2. SQL Server configurato per connessioni remote?
3. Porta 1433 aperta?
4. Forse serve connettersi da Windows invece che da WSL?

---

## Task da Completare

### Query da Eseguire su ASITRON
Verificare se esiste un campo "relazione" o simile che mappa codice cliente → codice articolo interno:

```sql
SELECT COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'ANAGRAFICAARTICOLI'
ORDER BY ORDINAL_POSITION
```

**Perché:** L'utente ha chiesto di verificare se esiste un campo che contiene come il cliente chiama l'articolo (diverso dal codice interno).

### Prossimo Sviluppo
- **Gestione Commesse** - da rivedere secondo il documento LOGICA_OPERATIVA
- Integrare il "Numero Commessa" come riferimento centrale
- Implementare prerequisiti DocUT prima della produzione

---

## Contesto Importante

### Ruoli
- **Sviluppatore:** Claude (io)
- **Supervisore:** Utente (non scrive codice, solo supervisione)

### Architettura Applicazione
- **Backend:** FastAPI + SQLAlchemy + Python
- **Frontend:** React + TypeScript + Vite + Tailwind
- **Database:** SQL Server (doppio: ASI_GEST write, ASITRON read-only)

### Documenti Fondamentali

⭐ **LEGGI SEMPRE PRIMA DI INIZIARE:**

1. **`/LOGICA_OPERATIVA.md`**
   - Regole di business complete
   - Flusso operativo dell'applicazione
   - Prerequisiti, stati, validazioni
   - **Leggi questo per capire COME funziona l'app**

2. **`/Specifiche/00_INDEX.md`**
   - Indice della documentazione completa
   - Architettura, database, backend, frontend
   - **Leggi questo per capire COSA è l'app**

### Altri File Chiave
- `/backend/.env` - Credenziali database
- `/backend/app/routes/` - API endpoints
- `/frontend/src/pages/` - Pagine React

### Branch Git
- `claude/fix-browser-display-011CV5yGL9JZvhatUnCtt9Rh`

---

## Note per Prossima Sessione

1. **PRIMA COSA:** Verificare connessione database
   - Se ancora non funziona, chiedere all'utente di eseguire query SQL

2. **Leggere questo file** per riprendere il contesto

3. **Verificare campo RELAZIONE** in ANAGRAFICAARTICOLI

4. **Continuare con gestione Commesse** secondo LOGICA_OPERATIVA.md

---

## Comandi Utili

```bash
# Posizione progetto
cd /mnt/server-d/Asi-Gest/asi-gest-app/

# Attiva venv backend
cd backend && source venv/bin/activate

# Test connessione DB
python3 -c "from app.core.database import get_db_asitron; db=next(get_db_asitron()); print(db.execute(text('SELECT @@VERSION')).scalar())"

# Avvia backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Avvia frontend
cd frontend && npm run dev

# Git status
git status --short
```

---

**Nota:** Questo file va aggiornato alla fine di ogni sessione con lo stato corrente.
