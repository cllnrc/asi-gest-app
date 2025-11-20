# 10 - ASI-GEST Testing & QA

> **Testing Strategy, Unit/Integration/E2E Tests, Quality Assurance**

---

## 🎯 Testing Philosophy

### Principi Guida

1. **Pragmatic Testing** - Non 100% coverage, focus su critical paths
2. **Test What Matters** - Business logic > boilerplate
3. **Fast Feedback** - Test veloci (< 10 sec suite)
4. **Real-World Scenarios** - Test con dati realistici

**Target Coverage:**
- Core Engine: 80%+ (business logic critica)
- Backend API: 60%+ (endpoints principali)
- Frontend: Manual + smoke tests (no unit test React per v1)

---

## 🧪 Testing Pyramid

```
        ┌────────────┐
        │    E2E     │  ← 10% - Scenario completi
        │   Tests    │
        ├────────────┤
        │ Integration│  ← 30% - API + DB
        │   Tests    │
        ├────────────┤
        │    Unit    │  ← 60% - Business logic
        │   Tests    │
        └────────────┘
```

---

## 🔬 Unit Tests (Core Engine)

### Setup

```bash
cd asitron-core/

# Install test deps
pip install pytest pytest-cov

# Run tests
pytest tests/

# With coverage
pytest --cov=asitron_core tests/
```

### File: `tests/test_license.py`

```python
"""
Test license check funzionante.
"""

import pytest
from datetime import date, timedelta
from pathlib import Path
from asitron_core._license import check_license, get_license_info, LicenseError


def test_license_valid(tmp_path):
    """Test license valida (futura)."""
    license_file = tmp_path / "license.key"
    future_date = (date.today() + timedelta(days=365)).strftime("%Y-%m-%d")
    license_file.write_text(future_date)
    
    # Mock LICENSE_FILE
    import asitron_core._license as lic
    original_file = lic.LICENSE_FILE
    lic.LICENSE_FILE = license_file
    
    try:
        assert check_license() == True
    finally:
        lic.LICENSE_FILE = original_file


def test_license_expired(tmp_path):
    """Test license scaduta."""
    license_file = tmp_path / "license.key"
    past_date = (date.today() - timedelta(days=1)).strftime("%Y-%m-%d")
    license_file.write_text(past_date)
    
    import asitron_core._license as lic
    original_file = lic.LICENSE_FILE
    lic.LICENSE_FILE = license_file
    
    try:
        with pytest.raises(LicenseError, match="EXPIRED"):
            check_license()
    finally:
        lic.LICENSE_FILE = original_file


def test_license_missing(tmp_path):
    """Test license file mancante."""
    import asitron_core._license as lic
    original_file = lic.LICENSE_FILE
    lic.LICENSE_FILE = tmp_path / "nonexistent.key"
    
    try:
        with pytest.raises(LicenseError, match="not found"):
            check_license()
    finally:
        lic.LICENSE_FILE = original_file


def test_license_info_valid(tmp_path):
    """Test get_license_info."""
    license_file = tmp_path / "license.key"
    future_date = date.today() + timedelta(days=100)
    license_file.write_text(future_date.strftime("%Y-%m-%d"))
    
    import asitron_core._license as lic
    original_file = lic.LICENSE_FILE
    lic.LICENSE_FILE = license_file
    
    try:
        info = get_license_info()
        assert info["status"] == "VALID"
        assert info["expiry"] == future_date.isoformat()
        assert info["days_left"] == 100
    finally:
        lic.LICENSE_FILE = original_file
```

### File: `tests/test_business_lotti.py`

```python
"""
Test business logic lotti.
"""

import pytest
from asitron_core.business.lotti import (
    calcola_progressivo_lotto,
    valida_chiusura_lotto,
    calcola_efficienza_fase
)


def test_calcola_progressivo_primo_lotto(mock_db_session):
    """Test progressivo primo lotto = 1."""
    mock_db_session.add_mock_query_result(0)  # Max progressivo = 0
    
    progressivo = calcola_progressivo_lotto(fase_id=1, db_session=mock_db_session)
    
    assert progressivo == 1


def test_calcola_progressivo_secondo_lotto(mock_db_session):
    """Test progressivo incrementale."""
    mock_db_session.add_mock_query_result(3)  # Max progressivo = 3
    
    progressivo = calcola_progressivo_lotto(fase_id=1, db_session=mock_db_session)
    
    assert progressivo == 4


def test_valida_chiusura_ok():
    """Test validazione chiusura OK."""
    lotto_data = {
        "QtaOutput": 100,
        "QtaScarti": 10,
        "QtaInput": 110,
        "DataInizio": "2025-01-01T08:00:00",
        "DataFine": "2025-01-01T12:00:00"
    }
    
    valid, error = valida_chiusura_lotto(lotto_data)
    
    assert valid == True
    assert error is None


def test_valida_chiusura_qta_negativa():
    """Test validazione con qta negativa."""
    lotto_data = {
        "QtaOutput": -10,
        "QtaScarti": 0
    }
    
    valid, error = valida_chiusura_lotto(lotto_data)
    
    assert valid == False
    assert "non può essere negativa" in error


def test_valida_chiusura_qta_mismatch():
    """Test validazione con qta input != output + scarti."""
    lotto_data = {
        "QtaOutput": 90,
        "QtaScarti": 10,
        "QtaInput": 110  # 90 + 10 != 110
    }
    
    valid, error = valida_chiusura_lotto(lotto_data)
    
    assert valid == False
    assert "deve essere =" in error


def test_calcola_efficienza_fase(mock_db_session):
    """Test calcolo KPI efficienza."""
    # Mock result
    mock_db_session.add_mock_query_result({
        "tot_output": 900,
        "tot_scarti": 100,
        "num_lotti": 10,
        "avg_setup": 15.5
    })
    
    kpi = calcola_efficienza_fase(fase_id=1, db_session=mock_db_session)
    
    assert kpi["qta_totale_output"] == 900
    assert kpi["qta_totale_scarti"] == 100
    assert kpi["percentuale_scarti"] == 10.0  # 100/1000 * 100
    assert kpi["numero_lotti"] == 10
    assert kpi["tempo_medio_setup_min"] == 15.5
```

---

## 🔗 Integration Tests (Backend API)

### Setup

```bash
cd backend/

# Install test deps
pip install pytest pytest-asyncio httpx

# Run tests
pytest tests/
```

### File: `tests/conftest.py`

```python
"""
Pytest fixtures per testing.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import get_db, get_gestionale_db
from app.models.base import Base


# Test database (in-memory SQLite)
SQLALCHEMY_TEST_URL = "sqlite:///:memory:"

test_engine = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture
def db_session():
    """Fixture per DB session test."""
    Base.metadata.create_all(bind=test_engine)
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def client(db_session):
    """Fixture per TestClient FastAPI."""
    
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture
def seed_fase_tipo(db_session):
    """Seed FaseTipo per test."""
    from app.models import FaseTipo
    
    fasi = [
        FaseTipo(Codice="SMD", Descrizione="Montaggio SMD", Ordine=10),
        FaseTipo(Codice="PTH", Descrizione="Montaggio PTH", Ordine=20),
        FaseTipo(Codice="CONTROLLI", Descrizione="Controlli", Ordine=30),
    ]
    
    db_session.add_all(fasi)
    db_session.commit()
    
    return fasi
```

### File: `tests/test_api_lotti.py`

```python
"""
Integration test per API lotti.
"""

import pytest


def test_create_lotto_smd(client, db_session, seed_fase_tipo):
    """Test creazione lotto SMD."""
    from app.models import Fase
    
    # Crea fase SMD
    fase_smd = Fase(
        CommessaERPId=123,
        FaseTipoID=seed_fase_tipo[0].FaseTipoID,
        Stato="APERTA"
    )
    db_session.add(fase_smd)
    db_session.commit()
    
    # Create lotto
    lotto_data = {
        "FaseID": fase_smd.FaseID,
        "DataInizio": "2025-01-15T08:00:00",
        "QtaOutput": 100,
        "QtaScarti": 5,
        "OperatoreID": None,
        "MacchinaID": None
    }
    
    response = client.post("/api/lotti/smd/", json=lotto_data)
    
    assert response.status_code == 201
    data = response.json()
    assert data["Progressivo"] == 1
    assert data["QtaOutput"] == 100
    assert data["QtaScarti"] == 5


def test_close_lotto_smd(client, db_session, seed_fase_tipo):
    """Test chiusura lotto SMD."""
    from app.models import Fase, Lotto
    from datetime import datetime
    
    # Setup
    fase = Fase(CommessaERPId=123, FaseTipoID=seed_fase_tipo[0].FaseTipoID, Stato="IN_CORSO")
    db_session.add(fase)
    db_session.commit()
    
    lotto = Lotto(
        FaseID=fase.FaseID,
        Progressivo=1,
        DataInizio=datetime(2025, 1, 15, 8, 0),
        QtaInput=110,
        QtaOutput=0,
        QtaScarti=0
    )
    db_session.add(lotto)
    db_session.commit()
    
    # Close lotto
    update_data = {
        "DataFine": "2025-01-15T12:00:00",
        "QtaOutput": 100,
        "QtaScarti": 10
    }
    
    response = client.patch(f"/api/lotti/smd/{lotto.LottoID}", json=update_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["DataFine"] is not None
    assert data["QtaOutput"] == 100
    assert data["QtaScarti"] == 10


def test_close_lotto_invalid_qta(client, db_session, seed_fase_tipo):
    """Test chiusura lotto con qta invalida."""
    from app.models import Fase, Lotto
    from datetime import datetime
    
    fase = Fase(CommessaERPId=123, FaseTipoID=seed_fase_tipo[0].FaseTipoID)
    db_session.add(fase)
    db_session.commit()
    
    lotto = Lotto(
        FaseID=fase.FaseID,
        Progressivo=1,
        DataInizio=datetime(2025, 1, 15, 8, 0),
        QtaInput=110,
        QtaOutput=0,
        QtaScarti=0
    )
    db_session.add(lotto)
    db_session.commit()
    
    # Qta mismatch
    update_data = {
        "DataFine": "2025-01-15T12:00:00",
        "QtaOutput": 50,  # 50 + 10 != 110
        "QtaScarti": 10
    }
    
    response = client.patch(f"/api/lotti/smd/{lotto.LottoID}", json=update_data)
    
    assert response.status_code == 400
    assert "deve essere =" in response.json()["detail"]


def test_get_lotti_by_fase(client, db_session, seed_fase_tipo):
    """Test GET lotti per fase."""
    from app.models import Fase, Lotto
    from datetime import datetime
    
    fase = Fase(CommessaERPId=123, FaseTipoID=seed_fase_tipo[0].FaseTipoID)
    db_session.add(fase)
    db_session.commit()
    
    # Add 3 lotti
    for i in range(1, 4):
        lotto = Lotto(
            FaseID=fase.FaseID,
            Progressivo=i,
            DataInizio=datetime(2025, 1, 15, 8+i, 0),
            QtaOutput=100*i,
            QtaScarti=5*i
        )
        db_session.add(lotto)
    
    db_session.commit()
    
    # GET
    response = client.get(f"/api/lotti/smd/fase/{fase.FaseID}")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    assert data[0]["Progressivo"] == 1
    assert data[2]["Progressivo"] == 3
```

---

## 🌐 E2E Tests (End-to-End)

### Manual E2E Test Scenarios

**Scenario 1: Complete Workflow SMD**

1. **Setup:**
   - Login sistema (quando auth implementata)
   - Navigate to Commesse page

2. **Config Commessa:**
   - [ ] Select commessa from list
   - [ ] Click "Configura"
   - [ ] Set FlagSMD = true
   - [ ] Input DIBA
   - [ ] Save config → Success message

3. **Create Lotto SMD:**
   - [ ] Navigate to Lotti SMD
   - [ ] Select fase
   - [ ] Click "Nuovo Lotto"
   - [ ] Fill form (operatore, macchina, qta input)
   - [ ] Save → Lotto creato con Progressivo=1

4. **Close Lotto:**
   - [ ] Click "Chiudi" su lotto
   - [ ] Fill qta output, scarti
   - [ ] Save → Lotto chiuso, DataFine popolata

5. **Verify Dashboard:**
   - [ ] Navigate to Dashboard
   - [ ] Verify KPI aggiornati
   - [ ] Verify lotto visibile in "ultimi lotti"

**Expected:** Tutto funziona senza errori, dati consistenti

---

**Scenario 2: Avanzamento Commessa**

1. Config commessa con FlagSMD + FlagControlli
2. Create 3 lotti SMD (tutti chiusi)
3. Create 1 lotto Controlli (chiuso)
4. Navigate to Avanzamento page
5. Verify commessa shows:
   - [ ] QtaSMD = sum lotti SMD
   - [ ] QtaControlli = lotto controlli
   - [ ] StatoProduzione = "IN_PRODUZIONE"

---

## 🔍 Manual Testing Checklist

### Phase 1 (Week 6)

**Config Commesse:**
- [ ] Lista commesse da ASITRON visibile
- [ ] Search commesse funziona
- [ ] Create config commessa
- [ ] Update config commessa
- [ ] Flag routing salvati correttamente

**Lotti SMD:**
- [ ] Create nuovo lotto (progressivo auto)
- [ ] List lotti per fase
- [ ] Close lotto con validazioni
- [ ] Delete lotto aperto
- [ ] Error se chiudi lotto già chiuso

**Anagrafiche:**
- [ ] CRUD Utenti
- [ ] CRUD Macchine
- [ ] Dropdown popolati in form lotto

### Phase 2 (Week 9)

**Lotti PTH + Controlli:**
- [ ] All SMD scenarios repeated for PTH
- [ ] All SMD scenarios repeated for Controlli
- [ ] Link controlli → lotti SMD precedenti

**Workflow Fasi:**
- [ ] Fase aperta → IN_CORSO quando primo lotto
- [ ] Fase → CHIUSA quando tutti lotti chiusi

### Phase 3 (Week 11)

**Dashboard:**
- [ ] KPI cards aggiornate
- [ ] Top operatori visibile
- [ ] Auto-refresh ogni 5min

**Avanzamento:**
- [ ] Tabella popolata
- [ ] Filtri funzionano
- [ ] Sort columns
- [ ] Stato produzione corretto per ogni commessa

### Phase 4 (Week 14)

**Documenti:**
- [ ] Upload documento
- [ ] Download documento
- [ ] Warning doc mancanti

**Production:**
- [ ] Deploy su server interno OK
- [ ] Health check endpoint risponde
- [ ] License info valida
- [ ] Performance < 500ms

---

## 📊 Test Coverage Reports

### Core Engine

```bash
cd asitron-core/

# Generate coverage report
pytest --cov=asitron_core --cov-report=html tests/

# Open report
open htmlcov/index.html
```

**Target:**
- Overall: 80%+
- business/: 90%+
- _license.py: 100%

### Backend

```bash
cd backend/

pytest --cov=app --cov-report=html tests/

# Target:
# - api/: 70%+
# - models/: 80%+
```

---

## 🐛 Bug Tracking

### During Development

**Use GitHub Issues:**

```markdown
## Bug Report Template

**Title:** [Component] Brief description

**Environment:**
- OS: Windows/Linux
- Python: 3.9
- Browser: Chrome 120

**Steps to Reproduce:**
1. Go to '...'
2. Click on '....'
3. See error

**Expected:**
...

**Actual:**
...

**Screenshots:**
...

**Priority:** High/Medium/Low
```

### Bug Priority

**P0 - Critical:**
- System crash
- Data loss
- License check broken
- Security vulnerability

**P1 - High:**
- Feature non funziona
- Error bloccante per utente
- Performance inaccettabile

**P2 - Medium:**
- Bug minore
- UI glitch
- Edge case

**P3 - Low:**
- Nice-to-have
- Cosmetic issue

---

## ✅ QA Checklist Pre-Release

### Code Quality

- [ ] No hardcoded passwords/secrets
- [ ] .env in .gitignore
- [ ] Copyright notices in core files
- [ ] Docstrings per funzioni critiche
- [ ] Type hints dove possibile

### Testing

- [ ] Core unit tests pass (80%+ coverage)
- [ ] Backend integration tests pass
- [ ] Manual E2E scenarios pass
- [ ] Performance tests < 500ms

### Security

- [ ] SQL injection prevention (SQLAlchemy)
- [ ] XSS prevention (React default)
- [ ] CORS configurato correttamente
- [ ] Database credentials secure

### Documentation

- [ ] README.md aggiornato
- [ ] API docs (Swagger) funzionanti
- [ ] Deployment guide completa
- [ ] User manual (basic)

### Deployment

- [ ] Build produzione funzionante
- [ ] Docker compose tested
- [ ] Health check endpoint OK
- [ ] License prod valida

---

## 🚀 Continuous Integration (Optional v2)

### GitHub Actions

**File: `.github/workflows/test.yml`**

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test-core:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      
      - name: Install deps
        run: |
          cd asitron-core
          pip install -e .
          pip install pytest pytest-cov
      
      - name: Run tests
        run: |
          cd asitron-core
          pytest --cov=asitron_core tests/
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      
      - name: Install deps
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest pytest-asyncio httpx
      
      - name: Run tests
        run: |
          cd backend
          pytest tests/
```

---

**DOCUMENTO SUCCESSIVO:** [APPENDIX_REFERENCES.md](APPENDIX_REFERENCES.md)
