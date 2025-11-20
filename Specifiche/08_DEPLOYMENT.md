# 08 - ASI-GEST Deployment & Build

> **Setup Ambiente, Build Produzione, Deploy On-Premise, Troubleshooting**

---

## 🎯 Deployment Overview

### Target Environment

**Server produzione:**
- Windows Server o Linux server interno Asitron
- SQL Server già presente (192.168.1.15:1433)
- Rete interna (no internet pubblico)
- Deploy on-premise (no cloud)

### Components to Deploy

```
┌──────────────────────────────────┐
│   ASI-GEST Production Stack      │
├──────────────────────────────────┤
│ 1. AsitronCore .whl (compiled)   │
│ 2. Backend FastAPI               │
│ 3. Frontend build (dist/)        │
│ 4. Nginx (reverse proxy)         │
│ 5. Database ASI_GEST (SQL Server)│
└──────────────────────────────────┘
```

---

## 🛠️ Development Environment Setup

### Prerequisites

**Software necessario:**
- Python 3.9+ ([python.org](https://python.org))
- Node.js 18+ ([nodejs.org](https://nodejs.org))
- Git ([git-scm.com](https://git-scm.com))
- SQL Server Management Studio (SSMS)
- VS Code (raccomandato)

### Step 1: Clone Repositories

```bash
# Repository core (privato Enrico)
git clone git@github.com:enrico/asitron-core.git
cd asitron-core/

# Install dev
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -e .
echo "2027-12-31" > asitron_core/license.key

cd ..

# Repository app
git clone git@github.com:company/asi-gest-app.git
cd asi-gest-app/
```

### Step 2: Setup Backend

```bash
cd backend/

# Create venv
python -m venv venv
source venv/bin/activate

# Install deps
pip install -r requirements.txt

# Link to local core (dev)
pip install -e ../../asitron-core/

# Configure env
cp .env.example .env
nano .env  # Edit DATABASE_URL, GESTIONALE_URL
```

**File: `.env.example`**

```bash
# Database
DATABASE_URL=mssql+pymssql://sa:PASSWORD@192.168.1.15:1433/ASI_GEST
GESTIONALE_URL=mssql+pymssql://sa:PASSWORD@192.168.1.15:1433/ASITRON

# App
DEBUG=true

# CORS (dev - allow localhost)
CORS_ORIGINS=["http://localhost:5173"]
```

### Step 3: Setup Database

```sql
-- Run in SSMS connected to SQL Server

-- 1. Create database
CREATE DATABASE ASI_GEST
GO

USE ASI_GEST
GO

-- 2. Run all CREATE TABLE from 03_DATABASE.md
-- (copy-paste schema SQL)

-- 3. Seed FaseTipo
INSERT INTO dbo.FaseTipo (Codice, Descrizione, Ordine) VALUES
('SMD', 'Montaggio SMD', 10),
('CONTROLLI', 'Controlli e AOI', 20),
('PTH', 'Montaggio PTH Tradizionale', 30),
('MAG', 'Gestione Magazzino', 40),
('TERZISTA', 'Lavorazione Terzista', 50);
GO

-- 4. Verify connection from backend
```

### Step 4: Run Backend Dev

```bash
cd backend/

# Activate venv
source venv/bin/activate

# Run server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Test
curl http://localhost:8000/
curl http://localhost:8000/health
```

### Step 5: Setup Frontend

```bash
cd frontend/

# Install deps
npm install

# Run dev server
npm run dev

# Open http://localhost:5173
```

**Verify integration:**
- Frontend → Backend → Database
- Commesse da ASITRON visibili
- Creazione config/lotti funziona

---

## 📦 Production Build

### Step 1: Build AsitronCore (Compiled)

```bash
cd asitron-core/

# Ensure license prod
echo "2026-06-30" > asitron_core/license.key

# Clean old builds
rm -rf dist/ build/ *.egg-info

# Build wheel
python -m build --wheel

# Output: dist/asitron_core-1.0.0-py3-none-any.whl

# Test install
pip install dist/asitron_core-1.0.0-*.whl

# Test license
python -c "import asitron_core; print(asitron_core.get_license_info())"
```

### Step 2: Build Frontend

```bash
cd frontend/

# Build prod
npm run build

# Output: dist/
# Contents:
#   index.html
#   assets/
#     index-[hash].js
#     index-[hash].css
```

### Step 3: Package Backend

```bash
cd backend/

# Create requirements.txt for prod (no dev deps)
pip freeze > requirements-prod.txt

# Remove asitron-core from requirements-prod.txt (wheel separato)

# Prepare deploy folder
mkdir -p deploy/backend
cp -r app/ deploy/backend/
cp requirements-prod.txt deploy/backend/requirements.txt
cp .env.prod deploy/backend/.env
```

---

## 🚀 Deploy to Production Server

### Option A: Manual Deploy

#### On Dev Machine

```bash
# 1. Zip tutto
cd deploy/
zip -r asi-gest-v1.0.zip backend/ frontend-dist/ asitron_core-1.0.0-*.whl

# 2. Transfer to server
scp asi-gest-v1.0.zip user@prod-server:/opt/deploy/
```

#### On Production Server

```bash
# 3. Unzip
cd /opt/deploy/
unzip asi-gest-v1.0.zip
cd asi-gest-v1.0/

# 4. Setup Python venv
python3 -m venv venv
source venv/bin/activate

# 5. Install AsitronCore wheel
pip install asitron_core-1.0.0-*.whl

# 6. Install backend deps
cd backend/
pip install -r requirements.txt

# 7. Configure .env
nano .env
# Set correct DATABASE_URL, GESTIONALE_URL for prod

# 8. Test backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Option B: Docker Compose (Recommended)

#### File: `docker-compose.yml`

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: asi-gest-backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=mssql+pymssql://sa:PASSWORD@host.docker.internal:1433/ASI_GEST
      - GESTIONALE_URL=mssql+pymssql://sa:PASSWORD@host.docker.internal:1433/ASITRON
      - DEBUG=false
    volumes:
      - ./backend/app:/app/app
    restart: unless-stopped

  frontend:
    image: nginx:alpine
    container_name: asi-gest-frontend
    ports:
      - "80:80"
    volumes:
      - ./frontend/dist:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - backend
    restart: unless-stopped
```

#### File: `backend/Dockerfile`

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y \
    gcc \
    freetds-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy core wheel
COPY asitron_core-1.0.0-*.whl /tmp/

# Install core
RUN pip install --no-cache-dir /tmp/asitron_core-*.whl

# Copy requirements
COPY requirements.txt .

# Install app deps
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY app/ ./app/

# Expose port
EXPOSE 8000

# Run
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### File: `nginx.conf`

```nginx
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Deploy con Docker

```bash
# On production server

cd /opt/asi-gest/

# Start
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop
docker-compose down

# Restart
docker-compose restart
```

---

## 🔧 Production Configuration

### Backend `.env` (production)

```bash
# Database
DATABASE_URL=mssql+pymssql://sa:StrongPassword@192.168.1.15:1433/ASI_GEST
GESTIONALE_URL=mssql+pymssql://sa:StrongPassword@192.168.1.15:1433/ASITRON

# App
DEBUG=false
APP_NAME=ASI-GEST Backend

# CORS (prod - server interno)
CORS_ORIGINS=["http://192.168.1.100", "http://asi-gest.local"]

# Logging
LOG_LEVEL=INFO
```

### Systemd Service (Linux)

**File: `/etc/systemd/system/asi-gest-backend.service`**

```ini
[Unit]
Description=ASI-GEST Backend API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/asi-gest/backend
Environment="PATH=/opt/asi-gest/backend/venv/bin"
ExecStart=/opt/asi-gest/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

**Commands:**

```bash
# Enable service
sudo systemctl enable asi-gest-backend

# Start
sudo systemctl start asi-gest-backend

# Status
sudo systemctl status asi-gest-backend

# Logs
sudo journalctl -u asi-gest-backend -f

# Restart
sudo systemctl restart asi-gest-backend
```

---

## 📊 Database Migrations (Alembic)

### Setup Alembic

```bash
cd backend/

# Init alembic
alembic init alembic

# Edit alembic.ini
nano alembic.ini
# Set: sqlalchemy.url = (leave empty, use env)

# Edit alembic/env.py
```

**File: `alembic/env.py`**

```python
from app.config import settings
from app.models.base import Base
import app.models  # Import all models

# Set target_metadata
target_metadata = Base.metadata

# Set sqlalchemy.url
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
```

### Create Migration

```bash
# Auto-generate migration
alembic revision --autogenerate -m "Initial schema"

# Review migration file in alembic/versions/

# Apply migration
alembic upgrade head
```

---

## 🔍 Monitoring & Logs

### Backend Logs

**Development:**
```bash
# Console output via uvicorn --reload
```

**Production:**
```bash
# Systemd
sudo journalctl -u asi-gest-backend -f

# Docker
docker-compose logs -f backend

# File-based logging (add to app/main.py)
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/asi-gest/backend.log'),
        logging.StreamHandler()
    ]
)
```

### Health Check Endpoint

```bash
# Test health
curl http://localhost:8000/health

# Expected response:
{
  "status": "healthy",
  "license": {
    "status": "VALID",
    "expiry": "2026-06-30",
    "days_left": 547
  }
}
```

---

## 🛡️ Security Best Practices

### 1. Database Credentials

```bash
# NEVER commit .env to Git
echo ".env" >> .gitignore

# Use strong passwords
DATABASE_URL=mssql+pymssql://sa:C0mpl3xP@ssw0rd@...

# Restrict SQL Server user permissions
# ASI-GEST user: R/W su ASI_GEST, R/O su ASITRON
```

### 2. CORS Configuration

```python
# Prod: only internal IPs
CORS_ORIGINS = [
    "http://192.168.1.100",
    "http://asi-gest.local"
]

# Dev: localhost OK
CORS_ORIGINS = ["http://localhost:5173"]
```

### 3. HTTPS (Recommended)

```nginx
# nginx.conf
server {
    listen 443 ssl;
    ssl_certificate /etc/ssl/certs/asi-gest.crt;
    ssl_certificate_key /etc/ssl/private/asi-gest.key;
    
    location / {
        # ...
    }
}
```

---

## 🐛 Troubleshooting

### Issue 1: License Expired

**Symptom:**
```
❌ License EXPIRED on 2026-06-30.
```

**Fix:**
```bash
# Contact Enrico for license renewal
# Update license.key in core wheel
# Rebuild and redeploy
```

### Issue 2: Database Connection Failed

**Symptom:**
```
sqlalchemy.exc.OperationalError: (pymssql.OperationalError) 
(20002, b'DB-Lib error message 20002...')
```

**Fix:**
```bash
# 1. Check SQL Server reachable
ping 192.168.1.15

# 2. Check port open
telnet 192.168.1.15 1433

# 3. Verify credentials
sqlcmd -S 192.168.1.15 -U sa -P PASSWORD -Q "SELECT 1"

# 4. Check DATABASE_URL in .env
```

### Issue 3: CORS Error

**Symptom:**
```
Access to fetch at 'http://backend:8000/api/...' from origin 
'http://localhost:5173' has been blocked by CORS policy
```

**Fix:**
```python
# backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue 4: Frontend Shows Blank Page

**Symptom:**
- Browser shows white screen
- Console error: `Failed to load resource`

**Fix:**
```bash
# 1. Check build
cd frontend/
npm run build
ls dist/  # Should have index.html, assets/

# 2. Check nginx config
# Ensure root points to correct path

# 3. Hard refresh browser
Ctrl+Shift+R (Chrome/Firefox)
```

---

## ✅ Deployment Checklist

### Pre-Deployment

**Development:**
- [ ] Tutti i test passano
- [ ] Frontend build senza errori
- [ ] Backend uvicorn parte correttamente
- [ ] Database schema aggiornato

**Build:**
- [ ] AsitronCore wheel compilato con license prod
- [ ] Frontend build produzione (`npm run build`)
- [ ] Backend requirements.txt aggiornato

### Deployment

**Server Setup:**
- [ ] Python 3.9+ installato
- [ ] Database ASI_GEST creato
- [ ] Schema database applicato
- [ ] FaseTipo seed inseriti
- [ ] .env configurato correttamente

**Application:**
- [ ] AsitronCore wheel installato
- [ ] Backend dependencies installate
- [ ] Backend avviato e raggiungibile
- [ ] Frontend servito da Nginx
- [ ] Reverse proxy configurato

**Verification:**
- [ ] Health check endpoint risponde OK
- [ ] License info valida
- [ ] Frontend si carica
- [ ] Commesse da ASITRON visibili
- [ ] Creazione lotto funziona
- [ ] Nessun errore in logs

### Post-Deployment

**Monitoring:**
- [ ] Logs configurati
- [ ] Health check periodico attivo
- [ ] License expiry reminder (30 giorni prima)

**User Acceptance:**
- [ ] Training operatori completato
- [ ] 2+ operatori usano sistema
- [ ] Feedback raccolto
- [ ] Bug critici risolti

---

## 📞 Support & Maintenance

**Contatti:**
- Developer: Enrico [email/phone]
- License issues: enrico@example.com
- Emergency: [numero]

**Maintenance Schedule:**
- License check: Mensile
- Backup database: Giornaliero
- Update dependencies: Trimestrale
- Security patches: As needed

---

**DOCUMENTO SUCCESSIVO:** [09_ROADMAP.md](09_ROADMAP.md)
