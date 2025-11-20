# 05 - ASI-GEST Backend API

> **FastAPI Backend, Models SQLAlchemy, API Endpoints, Integration con Core**

---

## 🎯 Backend Overview

### Ruolo del Backend

Il backend FastAPI è un **thin wrapper** che:
- ✅ Espone REST API per frontend
- ✅ Gestisce modelli SQLAlchemy
- ✅ Valida input via Pydantic
- ✅ Chiama AsitronCore per business logic
- ✅ Gestisce connessioni database (ASI_GEST + ASITRON)

**Principio:** Backend = "glue code", Core = "business brain"

---

## 📁 Struttura Progetto Backend

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app
│   ├── config.py               # Settings
│   ├── database.py             # DB connections
│   │
│   ├── models/                 # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── fase_tipo.py
│   │   ├── utenti.py
│   │   ├── macchine.py
│   │   ├── config_commessa.py
│   │   ├── fasi.py
│   │   ├── lotti.py
│   │   ├── documenti.py
│   │   └── log_eventi.py
│   │
│   ├── schemas/                # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── commesse.py
│   │   ├── lotti.py
│   │   ├── config.py
│   │   └── ...
│   │
│   ├── api/                    # Endpoints
│   │   ├── __init__.py
│   │   ├── deps.py             # Dependencies
│   │   ├── commesse.py
│   │   ├── config.py
│   │   ├── lotti_smd.py
│   │   ├── lotti_pth.py
│   │   ├── lotti_controlli.py
│   │   ├── dashboard.py
│   │   └── ...
│   │
│   └── core/                   # Wrappers per AsitronCore
│       ├── __init__.py
│       └── business.py
│
├── tests/
│   ├── test_api.py
│   └── ...
│
├── alembic/                    # Database migrations
│   ├── versions/
│   └── env.py
│
├── requirements.txt
├── .env
└── README.md
```

---

## ⚙️ Configuration & Setup

### File: `app/config.py`

```python
"""
Configuration settings per backend.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings."""
    
    # App
    APP_NAME: str = "ASI-GEST Backend"
    DEBUG: bool = False
    
    # Database ASI_GEST (production data)
    DATABASE_URL: str = "mssql+pymssql://sa:PASSWORD@192.168.1.15:1433/ASI_GEST"
    
    # Database ASITRON (gestionale - read-only)
    GESTIONALE_URL: str = "mssql+pymssql://sa:PASSWORD@192.168.1.15:1433/ASITRON"
    
    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://192.168.1.100:5173"]
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 100
    MAX_PAGE_SIZE: int = 500
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
```

### File: `.env` (example)

```bash
# Database
DATABASE_URL=mssql+pymssql://sa:YourPassword@192.168.1.15:1433/ASI_GEST
GESTIONALE_URL=mssql+pymssql://sa:YourPassword@192.168.1.15:1433/ASITRON

# App
DEBUG=true

# CORS (dev)
CORS_ORIGINS=["http://localhost:5173"]
```

### File: `app/database.py`

```python
"""
Database connections setup.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.config import settings


# Engine per ASI_GEST (R/W)
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Engine per ASITRON (R/O)
gestionale_engine = create_engine(
    settings.GESTIONALE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10
)

GestionaleSession = sessionmaker(autocommit=False, autoflush=False, bind=gestionale_engine)


def get_db() -> Generator[Session, None, None]:
    """Dependency per ottenere sessione ASI_GEST."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_gestionale_db() -> Generator[Session, None, None]:
    """Dependency per ottenere sessione ASITRON (read-only)."""
    db = GestionaleSession()
    try:
        yield db
    finally:
        db.close()
```

---

## 🗄️ SQLAlchemy Models

### File: `app/models/base.py`

```python
"""
Base class per tutti i models.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base per tutti i models SQLAlchemy."""
    pass
```

### File: `app/models/lotti.py`

```python
"""
Model per tabella Lotti.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime

from app.models.base import Base


class Lotto(Base):
    __tablename__ = "Lotti"
    
    LottoID = Column(Integer, primary_key=True, autoincrement=True)
    FaseID = Column(Integer, ForeignKey("Fasi.FaseID"), nullable=False)
    
    Progressivo = Column(Integer, nullable=False)
    
    DataInizio = Column(DateTime, nullable=False, default=datetime.now)
    DataFine = Column(DateTime, nullable=True)
    
    QtaInput = Column(Integer, nullable=True)
    QtaOutput = Column(Integer, nullable=False)
    QtaScarti = Column(Integer, nullable=False, default=0)
    
    OperatoreID = Column(Integer, ForeignKey("Utenti.UtenteID"), nullable=True)
    MacchinaID = Column(Integer, ForeignKey("Macchine.MacchinaID"), nullable=True)
    
    ProgrammaFeeder = Column(String(100), nullable=True)
    TempoSetupMin = Column(Integer, nullable=True)
    
    TipoScarto = Column(String(50), nullable=True)
    NoteScarti = Column(String(500), nullable=True)
    
    Note = Column(String, nullable=True)  # NVARCHAR(MAX)
    
    # Relationships
    fase = relationship("Fase", back_populates="lotti")
    operatore = relationship("Utente", foreign_keys=[OperatoreID])
    macchina = relationship("Macchina", foreign_keys=[MacchinaID])
    
    # Constraints
    __table_args__ = (
        CheckConstraint("QtaOutput >= 0", name="CHK_Lotti_QtaOutput"),
        CheckConstraint("QtaScarti >= 0", name="CHK_Lotti_QtaScarti"),
        UniqueConstraint("FaseID", "Progressivo", name="UQ_Lotti_Fase_Progressivo"),
    )
```

### File: `app/models/fasi.py`

```python
"""
Model per tabella Fasi.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from datetime import datetime

from app.models.base import Base


class Fase(Base):
    __tablename__ = "Fasi"
    
    FaseID = Column(Integer, primary_key=True, autoincrement=True)
    CommessaERPId = Column(Integer, nullable=False)
    FaseTipoID = Column(Integer, ForeignKey("FaseTipo.FaseTipoID"), nullable=False)
    
    Stato = Column(String(20), nullable=False, default="APERTA")
    
    DataApertura = Column(DateTime, nullable=False, default=datetime.now)
    DataChiusura = Column(DateTime, nullable=True)
    
    QtaPrevista = Column(Integer, nullable=True)
    QtaProdotta = Column(Integer, nullable=True)
    QtaResidua = Column(Integer, nullable=True)
    
    Note = Column(String, nullable=True)
    
    # Relationships
    fase_tipo = relationship("FaseTipo")
    lotti = relationship("Lotto", back_populates="fase", cascade="all, delete-orphan")
    
    __table_args__ = (
        CheckConstraint("Stato IN ('APERTA', 'IN_CORSO', 'CHIUSA', 'BLOCCATA')", name="CHK_Fasi_Stato"),
    )
```

*(Altri models seguono pattern simile - vedi database schema in 03_DATABASE.md)*

---

## 📊 Pydantic Schemas

### File: `app/schemas/lotti.py`

```python
"""
Pydantic schemas per Lotti.
"""

from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional


class LottoBase(BaseModel):
    """Base schema per Lotto."""
    QtaInput: Optional[int] = None
    QtaOutput: int = Field(..., ge=0, description="Quantità prodotta (>= 0)")
    QtaScarti: int = Field(0, ge=0, description="Quantità scarti (>= 0)")
    
    OperatoreID: Optional[int] = None
    MacchinaID: Optional[int] = None
    
    ProgrammaFeeder: Optional[str] = Field(None, max_length=100)
    TempoSetupMin: Optional[int] = Field(None, ge=0)
    
    TipoScarto: Optional[str] = Field(None, max_length=50)
    NoteScarti: Optional[str] = Field(None, max_length=500)
    
    Note: Optional[str] = None


class LottoCreate(LottoBase):
    """Schema per creazione Lotto."""
    FaseID: int
    DataInizio: datetime = Field(default_factory=datetime.now)


class LottoUpdate(BaseModel):
    """Schema per update Lotto (chiusura)."""
    DataFine: datetime
    QtaOutput: int = Field(..., ge=0)
    QtaScarti: int = Field(0, ge=0)
    
    OperatoreID: Optional[int] = None
    MacchinaID: Optional[int] = None
    
    TipoScarto: Optional[str] = None
    NoteScarti: Optional[str] = None
    Note: Optional[str] = None
    
    @field_validator("DataFine")
    @classmethod
    def validate_data_fine(cls, v, info):
        """DataFine non può essere nel futuro."""
        if v > datetime.now():
            raise ValueError("DataFine non può essere nel futuro")
        return v


class LottoResponse(LottoBase):
    """Schema per response Lotto."""
    LottoID: int
    FaseID: int
    Progressivo: int
    DataInizio: datetime
    DataFine: Optional[datetime] = None
    
    # Include info operatore/macchina se serve
    operatore_nome: Optional[str] = None
    macchina_codice: Optional[str] = None
    
    class Config:
        from_attributes = True
```

---

## 🔌 API Endpoints

### File: `app/main.py`

```python
"""
FastAPI application main.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api import commesse, config, lotti_smd, dashboard

# Check AsitronCore license
import asitron_core
print(f"✅ AsitronCore v{asitron_core.__version__} - License OK")


app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(commesse.router, prefix="/api/commesse", tags=["Commesse"])
app.include_router(config.router, prefix="/api/config", tags=["Config Commesse"])
app.include_router(lotti_smd.router, prefix="/api/lotti/smd", tags=["Lotti SMD"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])


@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
def health():
    """Health check endpoint."""
    license_info = asitron_core.get_license_info()
    return {
        "status": "healthy",
        "license": license_info
    }
```

### File: `app/api/lotti_smd.py`

```python
"""
API endpoints per gestione lotti SMD.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.lotti import LottoCreate, LottoUpdate, LottoResponse
from app.models import Lotto, Fase, FaseTipo
from asitron_core.business import calcola_progressivo_lotto, valida_chiusura_lotto


router = APIRouter()


@router.get("/fase/{fase_id}", response_model=List[LottoResponse])
def get_lotti_by_fase(fase_id: int, db: Session = Depends(get_db)):
    """
    Ottiene tutti i lotti di una fase SMD.
    """
    # Verifica che fase esista ed sia SMD
    fase = db.query(Fase).join(FaseTipo).filter(
        Fase.FaseID == fase_id,
        FaseTipo.Codice == "SMD"
    ).first()
    
    if not fase:
        raise HTTPException(status_code=404, detail="Fase SMD non trovata")
    
    lotti = db.query(Lotto).filter(Lotto.FaseID == fase_id).order_by(Lotto.Progressivo).all()
    
    return lotti


@router.post("/", response_model=LottoResponse, status_code=201)
def create_lotto_smd(lotto_data: LottoCreate, db: Session = Depends(get_db)):
    """
    Crea nuovo lotto SMD.
    Progressivo calcolato automaticamente.
    """
    # Calcola progressivo usando AsitronCore
    progressivo = calcola_progressivo_lotto(lotto_data.FaseID, db)
    
    # Crea lotto
    lotto = Lotto(
        FaseID=lotto_data.FaseID,
        Progressivo=progressivo,
        DataInizio=lotto_data.DataInizio,
        QtaInput=lotto_data.QtaInput,
        QtaOutput=lotto_data.QtaOutput,
        QtaScarti=lotto_data.QtaScarti,
        OperatoreID=lotto_data.OperatoreID,
        MacchinaID=lotto_data.MacchinaID,
        ProgrammaFeeder=lotto_data.ProgrammaFeeder,
        TempoSetupMin=lotto_data.TempoSetupMin,
        TipoScarto=lotto_data.TipoScarto,
        NoteScarti=lotto_data.NoteScarti,
        Note=lotto_data.Note
    )
    
    db.add(lotto)
    db.commit()
    db.refresh(lotto)
    
    return lotto


@router.patch("/{lotto_id}", response_model=LottoResponse)
def close_lotto_smd(lotto_id: int, update_data: LottoUpdate, db: Session = Depends(get_db)):
    """
    Chiude un lotto SMD.
    """
    lotto = db.query(Lotto).filter(Lotto.LottoID == lotto_id).first()
    
    if not lotto:
        raise HTTPException(status_code=404, detail="Lotto non trovato")
    
    if lotto.DataFine is not None:
        raise HTTPException(status_code=400, detail="Lotto già chiuso")
    
    # Valida chiusura con AsitronCore
    lotto_dict = {
        "QtaOutput": update_data.QtaOutput,
        "QtaScarti": update_data.QtaScarti,
        "QtaInput": lotto.QtaInput,
        "DataInizio": lotto.DataInizio,
        "DataFine": update_data.DataFine
    }
    
    valid, error = valida_chiusura_lotto(lotto_dict)
    if not valid:
        raise HTTPException(status_code=400, detail=error)
    
    # Aggiorna lotto
    lotto.DataFine = update_data.DataFine
    lotto.QtaOutput = update_data.QtaOutput
    lotto.QtaScarti = update_data.QtaScarti
    lotto.OperatoreID = update_data.OperatoreID
    lotto.MacchinaID = update_data.MacchinaID
    lotto.TipoScarto = update_data.TipoScarto
    lotto.NoteScarti = update_data.NoteScarti
    lotto.Note = update_data.Note
    
    db.commit()
    db.refresh(lotto)
    
    return lotto


@router.delete("/{lotto_id}", status_code=204)
def delete_lotto_smd(lotto_id: int, db: Session = Depends(get_db)):
    """
    Elimina un lotto SMD (solo se non chiuso).
    """
    lotto = db.query(Lotto).filter(Lotto.LottoID == lotto_id).first()
    
    if not lotto:
        raise HTTPException(status_code=404, detail="Lotto non trovato")
    
    if lotto.DataFine is not None:
        raise HTTPException(status_code=400, detail="Impossibile eliminare lotto chiuso")
    
    db.delete(lotto)
    db.commit()
```

### File: `app/api/dashboard.py`

```python
"""
API endpoints per dashboard.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from asitron_core.business import dashboard_kpi


router = APIRouter()


@router.get("/kpi")
def get_dashboard_kpi(giorni: int = 7, db: Session = Depends(get_db)):
    """
    KPI per dashboard direzione.
    
    Args:
        giorni: Ultimi N giorni (default 7)
    """
    kpi = dashboard_kpi(db, giorni=giorni)
    return kpi
```

---

## 🧪 Testing

### File: `tests/test_api.py`

```python
"""
Test per API endpoints.
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root():
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert "app" in response.json()


def test_health():
    """Test health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "license" in data


def test_get_lotti_by_fase_not_found():
    """Test get lotti per fase inesistente."""
    response = client.get("/api/lotti/smd/fase/99999")
    assert response.status_code == 404
```

---

## 📦 Requirements

### File: `requirements.txt`

```
# FastAPI
fastapi==0.104.1
uvicorn[standard]==0.24.0

# Database
sqlalchemy==2.0.23
pymssql==2.2.11
alembic==1.12.1

# Validation
pydantic==2.5.0
pydantic-settings==2.1.0

# AsitronCore (wheel locale o private PyPI)
# asitron-core @ file:///path/to/asitron_core-1.0.0-py3-none-any.whl

# Dev
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.2
```

---

## 🚀 Run Backend

### Development

```bash
cd backend/

# Create venv
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install deps
pip install -r requirements.txt

# Install AsitronCore (editable durante dev)
pip install -e ../asitron-core/

# Run server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production

```bash
# Install AsitronCore wheel
pip install /path/to/asitron_core-1.0.0-*.whl

# Run con Gunicorn + Uvicorn workers
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

---

**DOCUMENTO SUCCESSIVO:** [06_FRONTEND.md](06_FRONTEND.md)
