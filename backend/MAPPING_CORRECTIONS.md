# Database Mapping Corrections - ASI-GEST

© 2025 Enrico Callegaro - Tutti i diritti riservati.

## Overview

Questo documento descrive le correzioni apportate al mapping tra il database ASITRON (gestionale) e gli schemi Pydantic dell'applicazione ASI-GEST.

## Database ASITRON (Read-Only)

### Tabella: TESTEORDINIPROD

**Mappatura corretta:**
- `PROGRESSIVO` → Primary key (int)
- `ESERCIZIO` → Anno (int)
- `NUMEROCOM` → Numero commessa (int)
- `RIFCOMMCLI` → Riferimento commessa cliente (str)
- `CODCLIENTE` → Codice cliente (str)
- `STATOCHIUSO` → Stato (0=aperta, 1=chiusa)
- `DATAEMISSIONE` → Data emissione (date)
- `DATAINIZIOPIANO` → Data inizio pianificata (date)
- `DATAFINEPIANO` → Data fine pianificata (date)
- `ANNOTAZIONI` → Note (str)

**Join con ANAGRAFICACF:**
```sql
LEFT JOIN dbo.ANAGRAFICACF c ON t.CODCLIENTE = c.CODCONTO
```
Per ottenere `NomeCliente` da `DSCCONTO1`.

---

### Tabella: ANAGRAFICAARTICOLI

**Struttura reale:**
- **NON esiste** `PROGRESSIVO`
- `CODICE` → Primary key (varchar) - codice articolo
- `DESCRIZIONE` → Descrizione articolo (varchar)
- `ARTTIPOLOGIA` → Tipologia articolo (decimal) ⚠️

**Correzioni applicate:**
```sql
SELECT
    CODICE,
    DESCRIZIONE,
    CAST(ARTTIPOLOGIA AS VARCHAR(10)) as ARTTIPOLOGIA  -- Cast necessario!
FROM dbo.ANAGRAFICAARTICOLI
```

**Campi NON disponibili:**
- ❌ `PROGRESSIVO` - Non esiste
- ❌ `UNIMIS` - Non trovato
- ❌ `CODFORPREF` - Non trovato
- ❌ `DATAFINEVALIDITA` - Non trovato

**Schema Pydantic corretto:**
```python
class ArticoloGestionale(BaseModel):
    CODICE: str
    DESCRIZIONE: Optional[str] = None
    TIPOLOGIA: Optional[str] = None  # Maps to ARTTIPOLOGIA (casted)
```

---

### Tabella: ANAGRAFICACF

**Mapping colonne (correzioni):**
- `CODCONTO` → Codice cliente/fornitore
- `DSCCONTO1` → Ragione sociale principale
- `DSCCONTO2` → Ragione sociale secondaria
- ⚠️ `PARTITAIVA` (non `PIVA`) → Partita IVA
- `CODFISCALE` → Codice fiscale
- `INDIRIZZO` → Indirizzo
- ⚠️ `LOCALITA` (non `CITTA`) → Città
- `PROVINCIA` → Provincia
- `CAP` → CAP

**Query corretta:**
```sql
SELECT
    CODCONTO,
    DSCCONTO1,
    DSCCONTO2,
    PARTITAIVA,    -- NON PIVA!
    CODFISCALE,
    INDIRIZZO,
    LOCALITA,      -- NON CITTA!
    PROVINCIA,
    CAP
FROM dbo.ANAGRAFICACF
```

**Schema Pydantic (mantiene nomi API standard):**
```python
class ClienteGestionale(BaseModel):
    CODCONTO: str
    DSCCONTO1: str
    DSCCONTO2: Optional[str] = None
    PIVA: Optional[str] = None        # Maps to PARTITAIVA
    CODFISCALE: Optional[str] = None
    INDIRIZZO: Optional[str] = None
    CITTA: Optional[str] = None       # Maps to LOCALITA
    PROVINCIA: Optional[str] = None
    CAP: Optional[str] = None
```

---

## Problemi Risolti

### 1. SQLAlchemy text() Method Chaining

**Errore originale:**
```python
sql = text("SELECT ...")
sql = sql.where(text(...))    # ❌ text() non supporta .where()
sql = sql.order_by(text(...))  # ❌ text() non supporta .order_by()
sql = sql.limit(limit)          # ❌ text() non supporta .limit()
```

**Soluzione:**
```python
# Build WHERE clause as string
where_clause = ""
if aperte is not None:
    stato_value = 0 if aperte else 1
    where_clause = f"WHERE t.STATOCHIUSO = {stato_value}"

# Build complete SQL with TOP (SQL Server syntax)
sql = text(f"""
    SELECT TOP {limit}
        ...
    FROM dbo.TABELLA
    {where_clause}
    ORDER BY ...
""")
```

### 2. Colonne Mancanti/Errate

**ANAGRAFICAARTICOLI:**
- ❌ Cercava `PROGRESSIVO` → Non esiste
- ❌ Cercava `UNIMIS`, `CODFORPREF`, `DATAFINEVALIDITA` → Non disponibili
- ⚠️ `ARTTIPOLOGIA` è decimal → Necessario CAST

**ANAGRAFICACF:**
- ❌ Cercava `PIVA` → Nome corretto: `PARTITAIVA`
- ❌ Cercava `CITTA` → Nome corretto: `LOCALITA`

---

## Testing

Tutti gli endpoint testati e funzionanti:

```bash
# Commesse
curl "http://localhost:8001/api/gestionale/commesse?aperte=true&limit=3"
✅ Ritorna lista commesse aperte con cliente

# Articoli
curl "http://localhost:8001/api/gestionale/articoli?limit=5"
✅ Ritorna lista articoli (solo CODICE, DESCRIZIONE, TIPOLOGIA)

# Clienti
curl "http://localhost:8001/api/gestionale/clienti?limit=3"
✅ Ritorna lista clienti con partita IVA e località
```

---

## Note per Sviluppi Futuri

1. **ANAGRAFICAARTICOLI limitato**: Solo 3 campi disponibili. Per informazioni aggiuntive sugli articoli potrebbe essere necessario identificare altre tabelle nel gestionale.

2. **CAST obbligatorio**: `ARTTIPOLOGIA` deve essere sempre castato a VARCHAR nelle query.

3. **Nomi API vs DB**: Gli schemi Pydantic mantengono nomi API standard (es. `PIVA`, `CITTA`) anche se il database usa nomi diversi. Il mapping avviene nel routes layer.

4. **SQL Server TOP syntax**: Usare sempre `SELECT TOP n` invece di `LIMIT n` per compatibilità con SQL Server.

---

## File Modificati

- `app/routes/gestionale.py` - Fix SQL queries (lines 57-81, 194-211, 258-273)
- `app/schemas/gestionale.py` - Simplified ArticoloGestionale schema (lines 31-35)

---

**Data ultima modifica:** 2025-01-12
**Autore:** Claude Code + Enrico Callegaro
