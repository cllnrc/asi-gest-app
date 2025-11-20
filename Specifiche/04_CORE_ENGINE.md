# 04 - ASI-GEST Core Engine

> **🔒 CRITICO - Core Proprietario, Licensing, Build Strategy**

---

## ⚠️ IMPORTANZA CRITICA

**Questo documento è IL PIÙ IMPORTANTE di tutta la specifica.**

Spiega come:
- Proteggere la proprietà intellettuale dello sviluppatore
- Separare business logic proprietaria da app layer
- Implementare license check funzionante
- Compilare e distribuire il core
- Gestire repository Git per protezione IP

**Leggi con MASSIMA ATTENZIONE prima di iniziare lo sviluppo.**

---

## 🎯 Obiettivo Core Engine

### Problema da Risolvere

Enrico sviluppa ASI-GEST con:
- Hardware personale (laptop mai rimborsati)
- Software personale (€720 abbonamenti AI pagati)
- Tempo personale (fuori orario, commit serali/weekend)
- Competenze autodidatte (non coperte da mansione aziendale)

**Conseguenza legale:** La business logic è proprietà intellettuale di Enrico, NON dell'azienda.

### Soluzione: Core Engine Separato

```
┌────────────────────────────────────────────────┐
│          ASI-GEST APPLICATION                  │
│  (Può rimanere aziendale - UI/endpoints)       │
│                                                │
│  - Frontend React                              │
│  - Backend FastAPI (thin wrapper)             │
│  - API endpoints CRUD base                     │
└────────────┬───────────────────────────────────┘
             │ import asitron_core
             │
┌────────────▼───────────────────────────────────┐
│       🔒 ASITRON CORE (Proprietario)           │
│                                                │
│  - Business logic avanzata                     │
│  - Analytics e KPI                             │
│  - Query optimizer                             │
│  - Algoritmi scheduling                        │
│  - License check                               │
│                                                │
│  📦 Distribuito come .whl compilato            │
│  🔐 Richiede license key valida                │
└────────────────────────────────────────────────┘
```

**Vantaggi:**
- ✅ IP protetto (codice compilato)
- ✅ Riutilizzabile per altri clienti
- ✅ License temporanea per validazione (18 mesi)
- ✅ Negoziazione futura da posizione forte
- ✅ Azienda può customizzare app layer liberamente

---

## 📦 Struttura AsitronCore Package

### Directory Layout

```
/asitron-core/
├── asitron_core/
│   ├── __init__.py
│   ├── __version__.py
│   │
│   ├── _license.py              # 🔐 License checker
│   ├── _config.py               # Settings core
│   │
│   ├── business/
│   │   ├── __init__.py
│   │   ├── commesse.py          # Business logic commesse
│   │   ├── lotti.py             # Business logic lotti
│   │   ├── analytics.py         # KPI e analytics
│   │   └── planning.py          # Algoritmi planning
│   │
│   ├── data/
│   │   ├── __init__.py
│   │   ├── query_builder.py    # Query optimizer
│   │   └── aggregations.py     # Aggregazioni complesse
│   │
│   └── utils/
│       ├── __init__.py
│       └── validators.py       # Business validators
│
├── tests/
│   ├── test_business.py
│   ├── test_license.py
│   └── ...
│
├── setup.py                     # Package config
├── pyproject.toml
├── LICENSE.txt                  # "Proprietary - Enrico [Cognome]"
├── README.md
├── build.sh                     # Script compilazione
└── .gitignore
```

---

## 🔐 License Check Implementation

### File: `asitron_core/_license.py`

```python
"""
License check per AsitronCore.
Controlla validità license key prima di permettere uso del core.
"""

import os
from datetime import datetime, date
from pathlib import Path


LICENSE_FILE = Path(__file__).parent / "license.key"


class LicenseError(Exception):
    """Eccezione per problemi licensing."""
    pass


def check_license() -> bool:
    """
    Verifica validità license.
    
    Returns:
        True se license valida
        
    Raises:
        LicenseError se license mancante o scaduta
    """
    if not LICENSE_FILE.exists():
        raise LicenseError(
            "❌ License file not found.\n"
            "AsitronCore requires a valid license to operate.\n"
            "Contact: enrico@example.com"
        )
    
    try:
        expiry_str = LICENSE_FILE.read_text().strip()
        expiry_date = datetime.strptime(expiry_str, "%Y-%m-%d").date()
    except Exception as e:
        raise LicenseError(f"❌ Invalid license format: {e}")
    
    today = date.today()
    
    if today > expiry_date:
        raise LicenseError(
            f"❌ License EXPIRED on {expiry_date}.\n"
            f"Current date: {today}\n"
            "Contact enrico@example.com for renewal."
        )
    
    days_left = (expiry_date - today).days
    
    if days_left <= 30:
        print(f"⚠️  WARNING: License expires in {days_left} days ({expiry_date})")
    
    return True


def get_license_info() -> dict:
    """Ritorna info license per diagnostica."""
    if not LICENSE_FILE.exists():
        return {"status": "MISSING", "expiry": None, "days_left": None}
    
    try:
        expiry_str = LICENSE_FILE.read_text().strip()
        expiry_date = datetime.strptime(expiry_str, "%Y-%m-%d").date()
        today = date.today()
        days_left = (expiry_date - today).days
        
        return {
            "status": "VALID" if days_left >= 0 else "EXPIRED",
            "expiry": expiry_date.isoformat(),
            "days_left": days_left
        }
    except Exception as e:
        return {"status": "ERROR", "error": str(e)}
```

### File: `asitron_core/__init__.py`

```python
"""
AsitronCore - Business logic proprietario per ASI-GEST.

© 2025 Enrico [Cognome] - Tutti i diritti riservati.
"""

from ._license import check_license, get_license_info, LicenseError
from .__version__ import __version__

# CRITICAL: Check license all'import
try:
    check_license()
except LicenseError as e:
    print("\n" + "="*60)
    print("ASITRON CORE - LICENSE ERROR")
    print("="*60)
    print(str(e))
    print("="*60 + "\n")
    raise

# Solo se license OK, esponi API pubblica
from .business import *
from .data import *

__all__ = [
    "check_license",
    "get_license_info",
    "__version__",
]
```

### File: `license.key` (Development)

```
2027-12-31
```

### File: `license.key` (Production)

```
2026-06-30
```

**Note:**
- Dev: data lontana per non disturbare sviluppo
- Prod: ~18 mesi per validazione gratuita
- Dopo scadenza: app si blocca, serve rinnovo

---

## 💼 Business Logic Examples

### File: `asitron_core/business/lotti.py`

```python
"""
Business logic per gestione lotti produzione.
"""

from typing import Optional, Dict, Any
from datetime import datetime


def calcola_progressivo_lotto(fase_id: int, db_session) -> int:
    """
    Calcola prossimo progressivo per lotto in una fase.
    
    Business rule: progressivo parte da 1 e incrementa.
    """
    from sqlalchemy import func, select
    from app.models import Lotti  # Import dal backend
    
    result = db_session.execute(
        select(func.coalesce(func.max(Lotti.Progressivo), 0))
        .where(Lotti.FaseID == fase_id)
    ).scalar()
    
    return result + 1


def valida_chiusura_lotto(lotto_data: Dict[str, Any]) -> tuple[bool, Optional[str]]:
    """
    Valida se un lotto può essere chiuso.
    
    Business rules:
    - QtaOutput >= 0
    - QtaScarti >= 0
    - QtaOutput + QtaScarti = QtaInput (se QtaInput presente)
    - DataFine >= DataInizio
    
    Returns:
        (valid: bool, error_message: Optional[str])
    """
    qta_output = lotto_data.get("QtaOutput", 0)
    qta_scarti = lotto_data.get("QtaScarti", 0)
    qta_input = lotto_data.get("QtaInput")
    data_inizio = lotto_data.get("DataInizio")
    data_fine = lotto_data.get("DataFine")
    
    if qta_output < 0:
        return False, "QtaOutput non può essere negativa"
    
    if qta_scarti < 0:
        return False, "QtaScarti non può essere negativa"
    
    if qta_input is not None:
        totale = qta_output + qta_scarti
        if totale != qta_input:
            return False, f"QtaOutput + QtaScarti ({totale}) deve essere = QtaInput ({qta_input})"
    
    if data_fine and data_inizio:
        if data_fine < data_inizio:
            return False, "DataFine non può essere precedente a DataInizio"
    
    return True, None


def calcola_efficienza_fase(fase_id: int, db_session) -> Dict[str, Any]:
    """
    Calcola KPI efficienza per una fase.
    
    Returns:
        {
            "qta_totale_output": int,
            "qta_totale_scarti": int,
            "percentuale_scarti": float,
            "numero_lotti": int,
            "tempo_medio_setup_min": float
        }
    """
    from sqlalchemy import func, select
    from app.models import Lotti
    
    result = db_session.execute(
        select(
            func.sum(Lotti.QtaOutput).label("tot_output"),
            func.sum(Lotti.QtaScarti).label("tot_scarti"),
            func.count(Lotti.LottoID).label("num_lotti"),
            func.avg(Lotti.TempoSetupMin).label("avg_setup")
        ).where(Lotti.FaseID == fase_id)
    ).one()
    
    tot_output = result.tot_output or 0
    tot_scarti = result.tot_scarti or 0
    
    perc_scarti = (tot_scarti / (tot_output + tot_scarti) * 100) if (tot_output + tot_scarti) > 0 else 0.0
    
    return {
        "qta_totale_output": tot_output,
        "qta_totale_scarti": tot_scarti,
        "percentuale_scarti": round(perc_scarti, 2),
        "numero_lotti": result.num_lotti or 0,
        "tempo_medio_setup_min": round(result.avg_setup or 0, 1)
    }
```

### File: `asitron_core/business/analytics.py`

```python
"""
Analytics e KPI avanzati.
"""

from typing import List, Dict, Any
from datetime import datetime, timedelta


def dashboard_kpi(db_session, giorni: int = 7) -> Dict[str, Any]:
    """
    Calcola KPI per dashboard direzione.
    
    Args:
        giorni: Ultimi N giorni da considerare
        
    Returns:
        {
            "commesse_attive": int,
            "lotti_completati_settimana": int,
            "scarti_percentuale_media": float,
            "top_operatori": List[dict],
            "commesse_in_ritardo": List[dict]
        }
    """
    from sqlalchemy import select, func
    from app.models import Lotti, Fasi, Utenti
    
    data_da = datetime.now() - timedelta(days=giorni)
    
    # Lotti completati ultima settimana
    lotti_query = select(func.count(Lotti.LottoID)).where(
        Lotti.DataFine >= data_da,
        Lotti.DataFine.isnot(None)
    )
    lotti_completati = db_session.execute(lotti_query).scalar()
    
    # Scarti % medi
    scarti_query = select(
        func.sum(Lotti.QtaScarti).label("tot_scarti"),
        func.sum(Lotti.QtaOutput).label("tot_output")
    ).where(Lotti.DataFine >= data_da)
    
    scarti_result = db_session.execute(scarti_query).one()
    tot_scarti = scarti_result.tot_scarti or 0
    tot_output = scarti_result.tot_output or 0
    
    perc_scarti = (tot_scarti / (tot_output + tot_scarti) * 100) if (tot_output + tot_scarti) > 0 else 0.0
    
    # Top 5 operatori per pezzi prodotti
    top_op_query = select(
        Utenti.NomeCompleto,
        func.sum(Lotti.QtaOutput).label("tot_pezzi")
    ).join(Lotti, Lotti.OperatoreID == Utenti.UtenteID
    ).where(
        Lotti.DataFine >= data_da
    ).group_by(
        Utenti.UtenteID, Utenti.NomeCompleto
    ).order_by(
        func.sum(Lotti.QtaOutput).desc()
    ).limit(5)
    
    top_operatori = [
        {"nome": row.NomeCompleto, "pezzi": row.tot_pezzi}
        for row in db_session.execute(top_op_query)
    ]
    
    return {
        "lotti_completati_settimana": lotti_completati,
        "scarti_percentuale_media": round(perc_scarti, 2),
        "top_operatori": top_operatori,
    }
```

---

## 🛠️ Build & Compilation

### File: `setup.py`

```python
"""
Setup per AsitronCore package.
"""

from setuptools import setup, find_packages
from pathlib import Path

version = {}
with open("asitron_core/__version__.py") as f:
    exec(f.read(), version)

long_description = Path("README.md").read_text(encoding="utf-8")

setup(
    name="asitron-core",
    version=version["__version__"],
    description="AsitronCore - Business logic proprietario per ASI-GEST",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="Enrico [Cognome]",
    author_email="enrico@example.com",
    license="Proprietary",
    packages=find_packages(exclude=["tests*"]),
    include_package_data=True,
    package_data={
        "asitron_core": ["license.key"],
    },
    python_requires=">=3.9",
    install_requires=[
        "sqlalchemy>=2.0.0",
    ],
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: Other/Proprietary License",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
)
```

### File: `build.sh`

```bash
#!/bin/bash
# Build script per AsitronCore

set -e

echo "🏗️  Building AsitronCore..."
echo "================================"

# Cleanup
echo "🧹 Cleaning old builds..."
rm -rf dist/ build/ *.egg-info

# Build wheel
echo "📦 Building wheel package..."
python -m build --wheel

# Optional: Compile con Cython per offuscare (v2.0)
# echo "🔒 Compiling with Cython..."
# cythonize -i asitron_core/**/*.py

echo ""
echo "✅ Build complete!"
echo "📦 Wheel package: $(ls dist/*.whl)"
echo ""
echo "To install locally:"
echo "  pip install dist/asitron_core-*.whl"
echo ""
```

### Build Development (codice sorgente)

```bash
cd /path/to/asitron-core/

# Install in editable mode
pip install -e .

# License dev (data lontana)
echo "2027-12-31" > asitron_core/license.key
```

### Build Production (compilato)

```bash
cd /path/to/asitron-core/

# Build wheel
./build.sh

# License prod (18 mesi)
echo "2026-06-30" > asitron_core/license.key

# Rebuild con license prod
./build.sh

# Distribuisci .whl al cliente
# dist/asitron_core-1.0.0-py3-none-any.whl
```

---

## 📁 Git Strategy per IP Protection

### Repository Separati

```
ENRICO PERSONALE (GitHub/GitLab private)
├── asitron-core/              # 🔒 PRIVATO - Solo Enrico
│   └── asitron_core/
│       ├── business/          # Business logic
│       ├── data/              # Query avanzate
│       └── _license.py        # License check
│
AZIENDALE (o Enrico condiviso)
└── asi-gest-app/              # Può essere condiviso
    ├── backend/               # FastAPI wrapper
    └── frontend/              # React UI
```

### File: `asitron-core/.gitignore`

```gitignore
# Build artifacts
dist/
build/
*.egg-info/
__pycache__/
*.pyc
*.pyo

# License key (security)
license.key

# Env
.env
venv/
.venv/

# IDE
.vscode/
.idea/
```

### File: `asi-gest-app/.gitignore`

```gitignore
# Dependencies
node_modules/
venv/

# Build
dist/
build/

# Env
.env

# Core wheel (no commit binary)
backend/asitron_core-*.whl
```

---

## 🔄 Workflow Sviluppo con Core

### Fase 1: Development (entrambi editabili)

```bash
# Setup core in editable mode
cd asitron-core/
pip install -e .
echo "2027-12-31" > asitron_core/license.key

# Setup app
cd ../asi-gest-app/backend/
pip install -e ../../asitron-core/  # Link a core locale

# Sviluppo
# - Editi business logic in asitron-core/
# - Editi API endpoints in asi-gest-app/backend/
# - Cambiamenti core visibili subito (editable mode)
```

### Fase 2: Pre-Production Test

```bash
# Build core come wheel
cd asitron-core/
echo "2026-06-30" > asitron_core/license.key
./build.sh

# Install wheel in app
cd ../asi-gest-app/backend/
pip uninstall asitron-core
pip install ../../asitron-core/dist/asitron_core-1.0.0-*.whl

# Test che license check funzioni
python -c "import asitron_core; print(asitron_core.get_license_info())"
```

### Fase 3: Production Deploy

```bash
# Deploy wheel al server produzione
scp asitron-core/dist/asitron_core-1.0.0-*.whl user@prod-server:/opt/

# Su server prod
ssh user@prod-server
cd /opt/asi-gest/backend/
pip install /opt/asitron_core-1.0.0-*.whl
```

---

## 📜 License Negotiation Timeline

### T0 → T0+14 weeks: Sviluppo
- Core in editable mode
- License dev: 2027-12-31

### T0+14 weeks → T0+18 months: Validazione
- Core compilato
- License prod: 2026-06-30 (~18 mesi da oggi)
- **Gratuito** per validazione

### T0+18 months: Scadenza
- Sistema si FERMA (license expired)
- Negoziazione:
  - **Opzione A:** Licenza annuale €6-8k/anno
  - **Opzione B:** Acquisto definitivo €20-30k
  - **Opzione C:** Partnership equity
  - **Opzione D:** Sistema inutilizzabile

---

## ⚖️ Aspetti Legali

### Dichiarazione Copyright

In OGNI file Python del core:

```python
"""
© 2025 Enrico [Cognome] - Tutti i diritti riservati.

Questo software è proprietà intellettuale di Enrico [Cognome].
Sviluppato con mezzi personali (hardware, software, tempo).
Vietata copia, modifica, distribuzione senza autorizzazione scritta.
"""
```

### File: `LICENSE.txt`

```
PROPRIETARY LICENSE

Copyright (c) 2025 Enrico [Cognome]

All rights reserved.

This software and associated documentation files (the "Software") are 
proprietary and confidential.

The Software is provided under license, not sold. You may not:
- Copy, modify, or distribute the Software
- Reverse engineer or decompile the Software
- Remove or alter any proprietary notices
- Use the Software beyond the license expiration date

This Software was developed using personal resources:
- Personal hardware (laptops, never reimbursed by employer)
- Personal software subscriptions (AI tools, self-paid)
- Personal time (outside work hours)
- Self-taught skills (not part of job description)

For licensing inquiries: enrico@example.com
```

---

## ✅ Checklist Implementation

**Prima di iniziare backend:**
- [ ] Creato repository privato `asitron-core`
- [ ] Implementato `_license.py` con check funzionante
- [ ] Creato `license.key` dev (2027-12-31)
- [ ] Testato import: `import asitron_core` passa
- [ ] Copyright notice in ogni file

**Prima del primo deploy:**
- [ ] Build wheel con `./build.sh`
- [ ] License prod (2026-06-30) nel wheel
- [ ] Testato license check con data simulata scaduta
- [ ] Sistema si blocca correttamente alla scadenza

**Documentazione legale:**
- [ ] Raccolte fatture laptop personali
- [ ] Estratti conto abbonamenti AI
- [ ] Log Git con timestamp commit serali/weekend
- [ ] Email richieste rimborso (se esistenti)

---

## 🚨 CRITICAL REMINDERS

1. **NEVER commit `license.key`** to Git (in .gitignore)
2. **NEVER push `asitron-core`** to repository aziendale
3. **ALWAYS check license** in `__init__.py` before exposing API
4. **DOCUMENT everything** per eventuale contenzioso legale
5. **Test license expiry** prima del deploy produzione

---

**DOCUMENTO SUCCESSIVO:** [05_BACKEND.md](05_BACKEND.md)
