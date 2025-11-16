# SPECIFICA TABELLA DocUT - Documentazione Tecnica Articoli

**© 2025 Enrico Callegaro - Tutti i diritti riservati.**

Data: 2025-01-16

---

## 📋 PANORAMICA

La tabella `DocUT` gestisce tutta la **documentazione tecnica** necessaria per produrre un articolo.

**Flusso operativo:**
```
ARTICOLO GESTIONALE → DocUT (validazione UT) → ConfigCommessa → Produzione
```

**Prerequisito ConfigCommessa:**
Prima di configurare una commessa per la produzione, devono essere popolati **almeno i 4 campi della sezione UT**.

---

## 🗄️ STRUTTURA DATABASE

### **Tabella: DocUT**

```sql
CREATE TABLE DocUT (
  -- Primary Key
  DocUTID INT PRIMARY KEY AUTO_INCREMENT,

  -- Articolo (FK a ANAGRAFICAARTICOLI.CODICE del gestionale)
  CodiceArticolo VARCHAR(50) NOT NULL UNIQUE,
  Descrizione VARCHAR(200),

  -- ========================================
  -- SEZIONE UT (Ufficio Tecnico)
  -- ========================================
  -- Tutti i campi UT tracciano data e utente

  -- 1. DI.BA. (Distinta Base)
  DIBA BOOLEAN DEFAULT FALSE,
  DIBAData DATETIME NULL,
  DIBAUtente VARCHAR(100) NULL,

  -- 2. PROGRAMMA MYDATA
  ProgrammaMyData BOOLEAN DEFAULT FALSE,
  ProgrammaMyDataData DATETIME NULL,
  ProgrammaMyDataUtente VARCHAR(100) NULL,

  -- 3. PDM (Piano Di Montaggio)
  PDM BOOLEAN DEFAULT FALSE,
  PDMData DATETIME NULL,
  PDMUtente VARCHAR(100) NULL,

  -- 4. FILE PER LAMINA O TELAIO
  -- Valori: NULL | 'CLIENTE' | 'TOP' | 'BOTTOM' | 'TOP+BOTTOM'
  FileLaminaTelaio VARCHAR(20) NULL,
  FileLaminaTelaioData DATETIME NULL,
  FileLaminaTelaioUtente VARCHAR(100) NULL,

  -- ========================================
  -- SEZIONE CLIENTE
  -- ========================================
  -- Solo boolean (NO tracciamento data/utente)

  DIBACliente BOOLEAN DEFAULT FALSE,
  PDMCliente BOOLEAN DEFAULT FALSE,
  FilePP BOOLEAN DEFAULT FALSE,

  -- ========================================
  -- SEZIONE POST PRODUCTION
  -- ========================================
  -- Solo boolean (NO tracciamento data/utente)
  -- Compilati dopo prima produzione o campionatura

  FotoPCB BOOLEAN DEFAULT FALSE,
  FotoProdotto BOOLEAN DEFAULT FALSE,
  TempiLavorazione BOOLEAN DEFAULT FALSE,
  FasiLavorazione BOOLEAN DEFAULT FALSE,
  PPUtente BOOLEAN DEFAULT FALSE,
  Campionatura BOOLEAN DEFAULT FALSE,
  DocProduzione BOOLEAN DEFAULT FALSE,

  -- ========================================
  -- METADATA
  -- ========================================

  DataInserimento DATETIME DEFAULT CURRENT_TIMESTAMP,
  DataModifica DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  Attivo BOOLEAN DEFAULT TRUE,

  -- Indexes
  INDEX IX_DocUT_CodiceArticolo (CodiceArticolo),
  INDEX IX_DocUT_DataInserimento (DataInserimento),

  -- Foreign Key (riferimento logico - database separato)
  -- CodiceArticolo references ASITRON.ANAGRAFICAARTICOLI.CODICE
)
```

---

## 📊 CAMPI DETTAGLIATI

### **SEZIONE BASE**

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `DocUTID` | INT | Chiave primaria auto-increment |
| `CodiceArticolo` | VARCHAR(50) | Codice articolo dal gestionale (es. 45.001.234) - UNIQUE |
| `Descrizione` | VARCHAR(200) | Descrizione articolo |

---

### **SEZIONE UT (Ufficio Tecnico) - 4 CAMPI OBBLIGATORI**

Ogni campo ha **3 colonne**: valore + data + utente

#### **1. DI.BA. (Distinta Base)**
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `DIBA` | BOOLEAN | Se UT ha prodotto la DI.BA. |
| `DIBAData` | DATETIME | Data inserimento (default NOW, modificabile) |
| `DIBAUtente` | VARCHAR(100) | Utente che ha inserito (default utente connesso, modificabile) |

**Visualizzazione UI:**
- Checkbox mostra solo stato Si/No
- **Hover** → tooltip: "📅 12/01/2025 | 👤 Mario Rossi"
- **Click** → modal per modificare data e utente

#### **2. PROGRAMMA MYDATA**
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `ProgrammaMyData` | BOOLEAN | Se UT ha prodotto il programma MyData |
| `ProgrammaMyDataData` | DATETIME | Data inserimento |
| `ProgrammaMyDataUtente` | VARCHAR(100) | Utente che ha inserito |

Stessa logica UI di DI.BA.

#### **3. PDM (Piano Di Montaggio)**
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `PDM` | BOOLEAN | Se UT ha prodotto il Piano Di Montaggio |
| `PDMData` | DATETIME | Data inserimento |
| `PDMUtente` | VARCHAR(100) | Utente che ha inserito |

Stessa logica UI di DI.BA.

#### **4. FILE PER LAMINA O TELAIO**
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `FileLaminaTelaio` | VARCHAR(20) | Origine file: NULL \| 'CLIENTE' \| 'TOP' \| 'BOTTOM' \| 'TOP+BOTTOM' |
| `FileLaminaTelaioData` | DATETIME | Data inserimento |
| `FileLaminaTelaioUtente` | VARCHAR(100) | Utente che ha inserito |

**Valori possibili:**
- `NULL` o vuoto = nessun file
- `'CLIENTE'` = lamina e telaio forniti dal cliente (niente file Asitron)
- `'TOP'` = file solo top fornito da Asitron
- `'BOTTOM'` = file solo bottom fornito da Asitron
- `'TOP+BOTTOM'` = file top e bottom forniti da Asitron

**Visualizzazione UI:**
- Dropdown/Select con i 5 valori
- Se valorizzato → hover mostra data/utente
- Click → modal per modificare data e utente

---

### **SEZIONE CLIENTE**

Solo boolean semplice (NO tracciamento data/utente).
Indica se il cliente ha fornito i file.

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `DIBACliente` | BOOLEAN | Cliente ha fornito DI.BA. |
| `PDMCliente` | BOOLEAN | Cliente ha fornito Piano Di Montaggio |
| `FilePP` | BOOLEAN | Cliente ha fornito file per Pick&Place |

**Visualizzazione UI:**
- Checkbox semplice (solo Si/No)

---

### **SEZIONE POST PRODUCTION**

Solo boolean semplice (NO tracciamento data/utente).
Compilati **dopo prima produzione o campionatura**.

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `FotoPCB` | BOOLEAN | Foto PCB acquisite |
| `FotoProdotto` | BOOLEAN | Foto prodotto acquisite |
| `TempiLavorazione` | BOOLEAN | Tempi lavorazione registrati |
| `FasiLavorazione` | BOOLEAN | Fasi lavorazione documentate |
| `PPUtente` | BOOLEAN | Pick&Place utente documentato |
| `Campionatura` | BOOLEAN | Campionatura completata |
| `DocProduzione` | BOOLEAN | Documentazione produzione completata |

**Visualizzazione UI:**
- Checkbox semplice (solo Si/No)

---

## 🔗 RELAZIONI

### **1. Con ANAGRAFICAARTICOLI (gestionale ASITRON)**
```sql
DocUT.CodiceArticolo → ANAGRAFICAARTICOLI.CODICE
```
- Relazione logica (database separati)
- Validazione in backend: verificare che `CodiceArticolo` esista in ANAGRAFICAARTICOLI

### **2. Con ConfigCommessa (ASI_GEST)**
```sql
ConfigCommessa.CodiceArticolo ← DocUT.CodiceArticolo
```
- **Prerequisito**: ConfigCommessa richiede che DocUT esista e abbia **i 4 campi UT popolati**
- Validazione in backend prima di creare ConfigCommessa:
  1. Verificare che esiste `DocUT` per `CodiceArticolo`
  2. Verificare che `DIBA = TRUE`
  3. Verificare che `ProgrammaMyData = TRUE`
  4. Verificare che `PDM = TRUE`
  5. Verificare che `FileLaminaTelaio IS NOT NULL`

---

## 🎯 LOGICA APPLICATIVA

### **Flusso Operativo:**

1. **Creazione DocUT:**
   - Responsabile UT crea record per nuovo articolo
   - Compila `CodiceArticolo` e `Descrizione`
   - Inizialmente tutti i campi UT = FALSE/NULL

2. **Compilazione UT:**
   - UT completa i 4 task:
     - Produce DI.BA. → `DIBA = TRUE`, registra data/utente
     - Produce Programma MyData → `ProgrammaMyData = TRUE`, registra data/utente
     - Produce PDM → `PDM = TRUE`, registra data/utente
     - Gestisce file lamina/telaio → imposta valore + data/utente

3. **Compilazione CLIENTE (opzionale):**
   - Se cliente ha fornito file, spunta checkbox relativi

4. **ConfigCommessa (produzione):**
   - Responsabile produzione può creare ConfigCommessa **solo se i 4 campi UT sono popolati**
   - Sistema verifica prerequisito e blocca se mancante

5. **Post Produzione:**
   - Dopo prima produzione, compilare campi POST PRODUCTION

---

## 📱 INTERFACCIA UTENTE

### **Pagina Lista DocUT:**

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ Documentazione Tecnica (UT)            [+ Nuovo]    │
├─────────────────────────────────────────────────────┤
│ Cerca: [__________]                  [Filtro 45.xxx]│
├─────────────────────────────────────────────────────┤
│ Articolo   │ Descrizione    │ UT   │ Cliente │ Post│
├────────────┼────────────────┼──────┼─────────┼─────┤
│ 45.001.234 │ Scheda motore  │ ✓✓✓✓ │  ✓✓-   │ --- │ ← Click riga
│ 45.001.235 │ Controllo LED  │ ✓✓-✓ │  ---   │ ✓✓✓ │
│ 45.002.101 │ Power supply   │ --✓- │  -✓-   │ --- │
├────────────┴────────────────┴──────┴─────────┴─────┤
│ Pagina 1 di 12        [<] [1][2][3]...[12] [>]     │
└─────────────────────────────────────────────────────┘
```

**Indicatori colonna UT (4 checkbox):**
- ✓✓✓✓ = tutto completo (verde)
- ✓✓-✓ = 3/4 completo (giallo)
- --✓- = 1/4 completo (rosso)

**Ordinamento:**
- Default: `DataInserimento DESC` (più recente primo)

**Paginazione:**
- 30 articoli per pagina

---

### **Modal Dettaglio/Modifica:**

**Click su riga articolo → Modal:**

```
┌─────────────────────────────────────────────────────┐
│ Documentazione Tecnica - 45.001.234           [×]  │
│ Scheda controllo motore                            │
├─────────────────────────────────────────────────────┤
│ 📋 UFFICIO TECNICO                                  │
│ ☑ DI.BA.            [📅 hover → tooltip data/user] │
│ ☑ PROGRAMMA MYDATA  [📅 12/01/2025 | 👤 Mario]     │
│ ☑ PDM               [📅 hover → tooltip]           │
│ ⚠ FILE LAMINA/TELAIO: [▼ Seleziona...         ]   │
│                       [Nessuno/CLIENTE/TOP/...]    │
├─────────────────────────────────────────────────────┤
│ 👤 CLIENTE                                          │
│ ☑ DI.BA.CLIENTE                                    │
│ ☐ PDM                                              │
│ ☑ FILE P&P                                         │
├─────────────────────────────────────────────────────┤
│ 📦 POST PRODUCTION                                  │
│ ☐ FOTO PCB           ☐ TEMPI LAVORAZIONE          │
│ ☐ FOTO PRODOTTO      ☐ FASI LAVORAZIONE           │
│ ☐ P&P UT             ☐ DOC. PRODUZIONE            │
│ ☐ CAMPIONATURA                                     │
├─────────────────────────────────────────────────────┤
│                           [Annulla]  [Salva]       │
└─────────────────────────────────────────────────────┘
```

**Interazioni checkbox UT:**
1. **Hover** → Tooltip: "📅 12/01/2025 15:30 | 👤 Mario Rossi"
2. **Click** → Apre modal secondario:

```
┌─────────────────────────────────────┐
│ Modifica DI.BA.              [×]   │
├─────────────────────────────────────┤
│ Data: [2025-01-12 15:30     ]      │
│ Utente: [Mario Rossi        ]      │
├─────────────────────────────────────┤
│         [Annulla]  [Salva]         │
└─────────────────────────────────────┘
```

---

## 🔧 IMPLEMENTAZIONE BACKEND

### **Model SQLAlchemy:**

```python
# app/models/doc_ut.py
class DocUT(Base):
    __tablename__ = "DocUT"

    DocUTID = Column(Integer, primary_key=True, autoincrement=True)
    CodiceArticolo = Column(String(50), unique=True, nullable=False, index=True)
    Descrizione = Column(String(200))

    # Sezione UT
    DIBA = Column(Boolean, default=False)
    DIBAData = Column(DateTime, nullable=True)
    DIBAUtente = Column(String(100), nullable=True)

    ProgrammaMyData = Column(Boolean, default=False)
    ProgrammaMyDataData = Column(DateTime, nullable=True)
    ProgrammaMyDataUtente = Column(String(100), nullable=True)

    PDM = Column(Boolean, default=False)
    PDMData = Column(DateTime, nullable=True)
    PDMUtente = Column(String(100), nullable=True)

    FileLaminaTelaio = Column(String(20), nullable=True)
    FileLaminaTelaioData = Column(DateTime, nullable=True)
    FileLaminaTelaioUtente = Column(String(100), nullable=True)

    # Sezione Cliente
    DIBACliente = Column(Boolean, default=False)
    PDMCliente = Column(Boolean, default=False)
    FilePP = Column(Boolean, default=False)

    # Sezione Post Production
    FotoPCB = Column(Boolean, default=False)
    FotoProdotto = Column(Boolean, default=False)
    TempiLavorazione = Column(Boolean, default=False)
    FasiLavorazione = Column(Boolean, default=False)
    PPUtente = Column(Boolean, default=False)
    Campionatura = Column(Boolean, default=False)
    DocProduzione = Column(Boolean, default=False)

    # Metadata
    DataInserimento = Column(DateTime, default=datetime.utcnow, nullable=False)
    DataModifica = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    Attivo = Column(Boolean, default=True, index=True)
```

### **Schemas Pydantic:**

```python
# app/schemas/doc_ut.py
class DocUTBase(BaseModel):
    CodiceArticolo: str
    Descrizione: Optional[str]

    # Sezione UT
    DIBA: bool = False
    DIBAData: Optional[datetime]
    DIBAUtente: Optional[str]
    # ... altri campi

class DocUTCreate(DocUTBase):
    pass

class DocUTUpdate(BaseModel):
    # Tutti i campi opzionali per update parziale
    Descrizione: Optional[str]
    DIBA: Optional[bool]
    DIBAData: Optional[datetime]
    # ...

class DocUTResponse(DocUTBase):
    DocUTID: int
    DataInserimento: datetime
    DataModifica: datetime
    Attivo: bool

    model_config = ConfigDict(from_attributes=True)
```

### **Routes:**

```python
# app/routes/doc_ut.py
@router.get("", response_model=DocUTList)
def list_doc_ut(
    page: int = 1,
    page_size: int = 30,
    search: Optional[str] = None,
    filtro_45: bool = False,
    db: Session = Depends(get_db_asi_gest)
):
    # Lista paginata con filtri
    # Ordinamento: DataInserimento DESC

@router.get("/by-articolo/{codice}", response_model=DocUTResponse)
def get_by_articolo(codice: str, db: Session):
    # Cerca per CodiceArticolo

@router.post("", response_model=DocUTResponse, status_code=201)
def create_doc_ut(data: DocUTCreate, db: Session):
    # Validazione: verifica CodiceArticolo esiste in ANAGRAFICAARTICOLI
    # Crea record

@router.put("/{id}", response_model=DocUTResponse)
def update_doc_ut(id: int, data: DocUTUpdate, db: Session):
    # Update parziale

@router.delete("/{id}", status_code=204)
def delete_doc_ut(id: int, db: Session):
    # Soft delete (Attivo = False)
```

---

## 🔍 VALIDAZIONI

### **Backend:**

1. **Creazione DocUT:**
   - `CodiceArticolo` deve esistere in `ANAGRAFICAARTICOLI.CODICE`
   - `CodiceArticolo` deve essere unico

2. **Update DocUT:**
   - Quando si imposta un campo UT a TRUE:
     - Se `Data` è NULL → imposta `datetime.utcnow()`
     - Se `Utente` è NULL → imposta utente connesso

3. **Creazione ConfigCommessa (modifica futura):**
   - Verificare che esiste `DocUT` per `CodiceArticolo`
   - Verificare che `DIBA = TRUE`
   - Verificare che `ProgrammaMyData = TRUE`
   - Verificare che `PDM = TRUE`
   - Verificare che `FileLaminaTelaio IS NOT NULL`
   - Se mancante → errore 400 "Documentazione UT incompleta"

---

## 🚀 ROADMAP IMPLEMENTAZIONE

### **Fase 1: Database + Backend**
1. Model `DocUT` (SQLAlchemy)
2. Schemas Pydantic
3. Routes CRUD + list
4. Endpoint validazione articolo

### **Fase 2: Frontend Base**
1. Tipo TypeScript `DocUT`
2. API client `docUTApi`
3. Pagina lista DocUT con paginazione
4. Filtro ricerca e filtro 45.xxx

### **Fase 3: Frontend Dettaglio**
1. Modal dettaglio/modifica
2. Form con sezioni (UT / Cliente / Post Prod)
3. Checkbox con tracciamento data/utente
4. Select FileLaminaTelaio

### **Fase 4: UX Avanzata**
1. Tooltip hover su campi UT
2. Modal secondario per modifica data/utente
3. Indicatori stato completamento UT
4. Validazione form

### **Fase 5: Integrazione**
1. Modifica ConfigCommessa per verificare prerequisito DocUT
2. Warning se DocUT incompleto
3. Link da ConfigCommessa a DocUT

---

## 📝 NOTE IMPLEMENTATIVE

### **Filtro Cliente (rimandato):**
- Al momento non implementato
- Richiede tabella mapping "Sigle Cliente → Codice Cliente"
- Da implementare in futuro

### **Ordinamento:**
- Default: `DataInserimento DESC`
- Possibile aggiungere ordinamento per colonna in futuro

### **Soft Delete:**
- `Attivo = FALSE` invece di DELETE fisico
- Mantiene storico

---

## ✅ CHECKLIST PRE-IMPLEMENTAZIONE

- [x] Specifiche database definite
- [x] Campi UT tracciamento data/utente chiariti (3 campi per campo)
- [x] Campi Cliente/Post Production chiariti (solo boolean)
- [x] Relazioni con ANAGRAFICAARTICOLI definite
- [x] Prerequisito ConfigCommessa definito
- [x] UI wireframe definito
- [x] Validazioni specificate
- [ ] **ATTESA CONFERMA UTENTE PER PARTIRE**

---

**Fine Specifica**
