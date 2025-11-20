# 07 - ASI-GEST Integration with ASITRON ERP

> **Integrazione Read-Only con Gestionale, Query Strategy, Sync Approach**

---

## 🎯 Integration Overview

### Obiettivo

ASI-GEST deve **leggere dati** dal gestionale ASITRON esistente (SQL Server) per:
- Visualizzare commesse aperte
- Ottenere info articoli (codice, descrizione)
- Visualizzare clienti (per report)

**Principio chiave:** **READ-ONLY** - ASI-GEST NON modifica mai il database ASITRON.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│      ASI-GEST Backend               │
│                                     │
│  ┌──────────┐      ┌──────────┐   │
│  │ Session  │      │ Session  │   │
│  │ ASI_GEST │      │ ASITRON  │   │
│  │ (R/W)    │      │ (R/O)    │   │
│  └────┬─────┘      └────┬─────┘   │
└───────┼──────────────────┼─────────┘
        │                  │
        │                  │
   ┌────▼──────┐      ┌────▼──────┐
   │ SQL Server │      │ SQL Server│
   │ Database:  │      │ Database: │
   │ ASI_GEST   │      │ ASITRON   │
   └────────────┘      └───────────┘
```

**Due connessioni separate:**
1. `SessionLocal` → ASI_GEST (read-write)
2. `GestionaleSession` → ASITRON (read-only)

---

## 📊 Tabelle ASITRON da Leggere

### 1. COMMESSE

**Scopo:** Lista commesse aperte, dati ordine

**Colonne rilevanti:**
```sql
SELECT 
    ID,                      -- PK (int)
    ESERCIZIO,               -- Anno (int)
    NUMEROCOM,               -- Numero commessa (int)
    RIFCOMMCLI,              -- Riferimento cliente (varchar)
    CODART,                  -- Codice articolo (varchar)
    DESART,                  -- Descrizione articolo (varchar)
    QTA,                     -- Quantità ordine (int)
    DATACONSEGNA,            -- Data consegna (date)
    STATOCOMMESSA,           -- Stato: O=Aperta, C=Chiusa, A=Annullata (varchar)
    IDCLIENTE,               -- FK cliente (int)
    NOMECLIENTE              -- Nome cliente (varchar)
FROM COMMESSE
WHERE STATOCOMMESSA = 'O'  -- Solo aperte
ORDER BY ESERCIZIO DESC, NUMEROCOM DESC
```

### 2. ARTICOLI (se esiste tabella separata)

**Scopo:** Dettagli articolo aggiuntivi

```sql
SELECT
    CODICE,
    DESCRIZIONE,
    FAMIGLIA,
    CATEGORIA
FROM ARTICOLI
WHERE CODICE = ?
```

*(Nota: Potrebbe non esserci tabella separata, in tal caso dati già in COMMESSE)*

### 3. CLIENTI (opzionale per report)

```sql
SELECT
    ID,
    RAGIONESOCIALE,
    CITTA,
    PROVINCIA
FROM CLIENTI
WHERE ID = ?
```

---

## 🔌 Backend Integration Setup

### File: `app/database.py` (già visto in 05_BACKEND.md)

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Engine per ASITRON (read-only)
gestionale_engine = create_engine(
    settings.GESTIONALE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10
)

GestionaleSession = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=gestionale_engine
)

def get_gestionale_db():
    """Dependency per sessione ASITRON."""
    db = GestionaleSession()
    try:
        yield db
    finally:
        db.close()
```

---

## 📋 API Endpoints per Commesse ERP

### File: `app/api/commesse.py`

```python
"""
API endpoints per lettura commesse da ASITRON.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional

from app.database import get_gestionale_db
from app.schemas.commesse import CommessaERP


router = APIRouter()


@router.get("/", response_model=List[CommessaERP])
def get_commesse_aperte(
    limit: int = Query(100, le=500),
    offset: int = Query(0, ge=0),
    solo_aperte: bool = True,
    db: Session = Depends(get_gestionale_db)
):
    """
    Ottiene lista commesse da gestionale ASITRON.
    
    Args:
        limit: Max risultati (default 100, max 500)
        offset: Offset pagination
        solo_aperte: Se True, solo STATOCOMMESSA='O' (default)
    """
    
    # Query diretta SQL (no ORM per gestionale)
    query = """
    SELECT 
        ID,
        ESERCIZIO,
        NUMEROCOM,
        RIFCOMMCLI,
        CODART,
        DESART,
        QTA,
        DATACONSEGNA,
        STATOCOMMESSA,
        IDCLIENTE,
        NOMECLIENTE
    FROM COMMESSE
    """
    
    if solo_aperte:
        query += " WHERE STATOCOMMESSA = 'O'"
    
    query += """
    ORDER BY ESERCIZIO DESC, NUMEROCOM DESC
    OFFSET :offset ROWS
    FETCH NEXT :limit ROWS ONLY
    """
    
    result = db.execute(
        text(query),
        {"limit": limit, "offset": offset}
    )
    
    commesse = [
        CommessaERP(
            ID=row.ID,
            ESERCIZIO=row.ESERCIZIO,
            NUMEROCOM=row.NUMEROCOM,
            RIFCOMMCLI=row.RIFCOMMCLI or "",
            CODART=row.CODART or "",
            DESART=row.DESART or "",
            QTA=row.QTA or 0,
            DATACONSEGNA=row.DATACONSEGNA,
            STATOCOMMESSA=row.STATOCOMMESSA or "",
            IDCLIENTE=row.IDCLIENTE,
            NOMECLIENTE=row.NOMECLIENTE or ""
        )
        for row in result
    ]
    
    return commesse


@router.get("/{commessa_id}", response_model=CommessaERP)
def get_commessa_by_id(
    commessa_id: int,
    db: Session = Depends(get_gestionale_db)
):
    """
    Ottiene dettaglio singola commessa.
    """
    query = """
    SELECT 
        ID,
        ESERCIZIO,
        NUMEROCOM,
        RIFCOMMCLI,
        CODART,
        DESART,
        QTA,
        DATACONSEGNA,
        STATOCOMMESSA,
        IDCLIENTE,
        NOMECLIENTE
    FROM COMMESSE
    WHERE ID = :id
    """
    
    result = db.execute(text(query), {"id": commessa_id}).one()
    
    return CommessaERP(
        ID=result.ID,
        ESERCIZIO=result.ESERCIZIO,
        NUMEROCOM=result.NUMEROCOM,
        RIFCOMMCLI=result.RIFCOMMCLI or "",
        CODART=result.CODART or "",
        DESART=result.DESART or "",
        QTA=result.QTA or 0,
        DATACONSEGNA=result.DATACONSEGNA,
        STATOCOMMESSA=result.STATOCOMMESSA or "",
        IDCLIENTE=result.IDCLIENTE,
        NOMECLIENTE=result.NOMECLIENTE or ""
    )


@router.get("/search", response_model=List[CommessaERP])
def search_commesse(
    q: str = Query(..., min_length=2),
    db: Session = Depends(get_gestionale_db)
):
    """
    Cerca commesse per numero, rif cliente, articolo.
    """
    query = """
    SELECT TOP 50
        ID,
        ESERCIZIO,
        NUMEROCOM,
        RIFCOMMCLI,
        CODART,
        DESART,
        QTA,
        DATACONSEGNA,
        STATOCOMMESSA,
        IDCLIENTE,
        NOMECLIENTE
    FROM COMMESSE
    WHERE 
        STATOCOMMESSA = 'O'
        AND (
            CAST(NUMEROCOM AS VARCHAR) LIKE :search
            OR RIFCOMMCLI LIKE :search
            OR CODART LIKE :search
            OR DESART LIKE :search
        )
    ORDER BY ESERCIZIO DESC, NUMEROCOM DESC
    """
    
    search_pattern = f"%{q}%"
    result = db.execute(
        text(query),
        {"search": search_pattern}
    )
    
    commesse = [
        CommessaERP(
            ID=row.ID,
            ESERCIZIO=row.ESERCIZIO,
            NUMEROCOM=row.NUMEROCOM,
            RIFCOMMCLI=row.RIFCOMMCLI or "",
            CODART=row.CODART or "",
            DESART=row.DESART or "",
            QTA=row.QTA or 0,
            DATACONSEGNA=row.DATACONSEGNA,
            STATOCOMMESSA=row.STATOCOMMESSA or "",
            IDCLIENTE=row.IDCLIENTE,
            NOMECLIENTE=row.NOMECLIENTE or ""
        )
        for row in result
    ]
    
    return commesse
```

---

## 📝 Pydantic Schemas per ERP

### File: `app/schemas/commesse.py`

```python
"""
Schemas per entità gestionale ASITRON.
"""

from pydantic import BaseModel
from datetime import date
from typing import Optional


class CommessaERP(BaseModel):
    """Schema per Commessa da gestionale ASITRON."""
    
    ID: int
    ESERCIZIO: int
    NUMEROCOM: int
    RIFCOMMCLI: str
    CODART: str
    DESART: str
    QTA: int
    DATACONSEGNA: Optional[date]
    STATOCOMMESSA: str
    IDCLIENTE: Optional[int]
    NOMECLIENTE: str
    
    class Config:
        from_attributes = True


class ArticoloERP(BaseModel):
    """Schema per Articolo da gestionale."""
    CODICE: str
    DESCRIZIONE: str
    FAMIGLIA: Optional[str] = None
    CATEGORIA: Optional[str] = None
```

---

## 🔗 Link tra ASI_GEST e ASITRON

### Foreign Key "Logica"

In `ConfigCommessa`:

```sql
CREATE TABLE dbo.ConfigCommessa (
    ConfigID INT IDENTITY(1,1) PRIMARY KEY,
    CommessaERPId INT NOT NULL UNIQUE,  -- ← Link a ASITRON.dbo.COMMESSE.ID
    ...
)
```

**NON è FK fisica** (cross-database FK non standard in SQL Server).  
È **FK logica** - l'applicazione sa che `CommessaERPId` → `ASITRON.dbo.COMMESSE.ID`.

### Join Cross-Database

Quando serve unire dati:

```sql
-- Query da ASI_GEST backend
SELECT 
    cfg.ConfigID,
    cfg.CommessaERPId,
    cfg.DIBA,
    c.ESERCIZIO,
    c.NUMEROCOM,
    c.RIFCOMMCLI,
    c.DESART
FROM ASI_GEST.dbo.ConfigCommessa cfg
INNER JOIN ASITRON.dbo.COMMESSE c
    ON cfg.CommessaERPId = c.ID
WHERE c.STATOCOMMESSA = 'O'
```

**Nota:** Join cross-database funziona se entrambi DB sullo stesso SQL Server.

---

## 🔄 Sync Strategy

### v1.0: No Sync Needed

**Filosofia:** Niente sincronizzazione automatica.

**Approccio:**
- Frontend chiama `/api/commesse` → backend legge ASITRON **on-demand**
- Dati sempre fresh (no cache)
- Semplice, zero complessità

**Quando basta:**
- Poche commesse (< 500)
- Query veloci (< 500ms)
- Utenti interni (no internet lento)

### v2.0+: Cache Locale (opzionale)

Se letture ASITRON rallentano:

**Strategia:**
1. Job notturno copia `COMMESSE` aperte in `ASI_GEST.dbo.CommesseCache`
2. Frontend legge da cache
3. Refresh manuale per dato specifico

**Implementazione:**

```python
# Scheduled job (es. con APScheduler)
from sqlalchemy import text

def sync_commesse_cache():
    """Copia commesse aperte da ASITRON a cache locale."""
    
    gest_db = GestionaleSession()
    local_db = SessionLocal()
    
    try:
        # Truncate cache
        local_db.execute(text("TRUNCATE TABLE CommesseCache"))
        
        # Copy commesse aperte
        query = """
        INSERT INTO ASI_GEST.dbo.CommesseCache
        SELECT * FROM ASITRON.dbo.COMMESSE
        WHERE STATOCOMMESSA = 'O'
        """
        
        local_db.execute(text(query))
        local_db.commit()
        
        print("✅ Commesse cache aggiornata")
    except Exception as e:
        print(f"❌ Errore sync: {e}")
        local_db.rollback()
    finally:
        gest_db.close()
        local_db.close()
```

---

## 📊 View Avanzamento con Join

### File: Query in `app/api/avanzamento.py`

```python
"""
API endpoint per view avanzamento commesse.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import get_db


router = APIRouter()


@router.get("/")
def get_avanzamento_commesse(db: Session = Depends(get_db)):
    """
    Ottiene vista avanzamento commesse con join cross-database.
    """
    
    query = """
    SELECT 
        c.ID as CommessaERPId,
        c.ESERCIZIO,
        c.NUMEROCOM,
        c.RIFCOMMCLI,
        c.CODART,
        c.DESART,
        c.QTA as QtaOrdine,
        c.DATACONSEGNA,
        c.STATOCOMMESSA as StatoERP,
        
        cfg.DIBA,
        cfg.Revisione,
        cfg.BloccataDocumentazione,
        
        ISNULL((
            SELECT SUM(l.QtaOutput) 
            FROM ASI_GEST.dbo.Lotti l 
            JOIN ASI_GEST.dbo.Fasi f ON f.FaseID = l.FaseID 
            WHERE f.CommessaERPId = c.ID 
              AND f.FaseTipoID = (SELECT FaseTipoID FROM ASI_GEST.dbo.FaseTipo WHERE Codice = 'SMD')
        ), 0) as QtaSMD,
        
        ISNULL((
            SELECT SUM(l.QtaScarti) 
            FROM ASI_GEST.dbo.Lotti l 
            JOIN ASI_GEST.dbo.Fasi f ON f.FaseID = l.FaseID 
            WHERE f.CommessaERPId = c.ID 
              AND f.FaseTipoID = (SELECT FaseTipoID FROM ASI_GEST.dbo.FaseTipo WHERE Codice = 'SMD')
        ), 0) as ScartiSMD,
        
        CASE 
            WHEN cfg.BloccataDocumentazione = 1 THEN 'BLOCCATA_DOC'
            WHEN EXISTS(
                SELECT 1 FROM ASI_GEST.dbo.Fasi 
                WHERE CommessaERPId = c.ID AND Stato = 'IN_CORSO'
            ) THEN 'IN_PRODUZIONE'
            WHEN EXISTS(
                SELECT 1 FROM ASI_GEST.dbo.Fasi 
                WHERE CommessaERPId = c.ID AND Stato = 'CHIUSA'
            ) AND NOT EXISTS(
                SELECT 1 FROM ASI_GEST.dbo.Fasi 
                WHERE CommessaERPId = c.ID AND Stato IN ('APERTA','IN_CORSO')
            ) THEN 'COMPLETATA'
            ELSE 'DA_CONFIGURARE'
        END as StatoProduzione
        
    FROM ASITRON.dbo.COMMESSE c
    LEFT JOIN ASI_GEST.dbo.ConfigCommessa cfg ON cfg.CommessaERPId = c.ID
    WHERE c.STATOCOMMESSA = 'O'
    ORDER BY c.ESERCIZIO DESC, c.NUMEROCOM DESC
    """
    
    result = db.execute(text(query))
    
    return [dict(row._mapping) for row in result]
```

---

## ⚠️ Considerazioni Importanti

### 1. Performance Cross-Database Joins

**Pro:**
- ✅ Dati sempre aggiornati
- ✅ No duplicazione

**Contro:**
- ❌ Più lento di query su singolo DB
- ❌ Non scala se ASITRON ha milioni di righe

**Mitigation:**
- Limita risultati (TOP 100)
- Indici su `COMMESSE.ID`, `STATOCOMMESSA`
- Cache per v2 se necessario

### 2. Schema Changes in ASITRON

Se schema ASITRON cambia (es. colonna rinominata):
- ❌ API ASI-GEST si rompe
- ✅ Fix: query adattive, fallback a NULL

```python
# Safe column access
CODART = row.get('CODART') or row.get('COD_ART') or ""
```

### 3. Transazioni Cross-Database

**ATTENZIONE:** Non puoi fare transazioni atomiche cross-database standard.

Se serve (v2+), usa:
- Distributed Transaction Coordinator (DTC)
- Saga pattern (compensating transactions)

Per v1: non necessario (solo read da ASITRON).

---

## ✅ Integration Checklist

**Setup:**
- [ ] Verificato accesso read-only a ASITRON
- [ ] Testato query `SELECT * FROM ASITRON.dbo.COMMESSE`
- [ ] Configurato `GESTIONALE_URL` in `.env`
- [ ] Dependency `get_gestionale_db()` funzionante

**API:**
- [ ] Endpoint `/api/commesse` ritorna dati
- [ ] Search funziona
- [ ] Join cross-database in view avanzamento OK

**Frontend:**
- [ ] Dropdown commesse popolato da API
- [ ] Link commessa → config funziona

**Performance:**
- [ ] Query < 500ms per 100 commesse
- [ ] Indici su ASITRON.COMMESSE verificati

---

**DOCUMENTO SUCCESSIVO:** [08_DEPLOYMENT.md](08_DEPLOYMENT.md)
