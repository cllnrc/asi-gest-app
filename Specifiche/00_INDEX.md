# ASI-GEST - Documentazione Completa

> **Sistema di Gestione Produzione per Asitron S.r.l.**  
> Versione: 1.0  
> Data: Gennaio 2025  
> Autore: Enrico (con supervisione Marco AI)  
> Target: Claude Code Development

---

## 📚 INDICE DOCUMENTAZIONE

Questa documentazione è organizzata in moduli separati per facilitare la consultazione e lo sviluppo incrementale con Claude Code.

### 📋 Documenti Principali

#### **[01_OVERVIEW.md](01_OVERVIEW.md)** - Quadro Generale
- Contesto progetto e situazione attuale
- Obiettivi e vincoli
- **IMPORTANTE:** Strategia proprietà intellettuale
- Approccio tecnico e filosofia di design
- Success metrics
- **Da leggere PRIMA di iniziare lo sviluppo**

#### **[02_ARCHITECTURE.md](02_ARCHITECTURE.md)** - Architettura Sistema
- Diagramma architettura completa
- Technology stack dettagliato
- Breakdown dei componenti (Frontend/Backend/Core/DB)
- Integration points
- Decisioni architetturali e rationale

#### **[03_DATABASE.md](03_DATABASE.md)** - Schema Database
- Setup database ASI_GEST
- 8 tabelle core con CREATE TABLE completo
- View avanzamento commesse
- Indexes e performance
- Estratto SQL pronto per esecuzione

#### **[04_CORE_ENGINE.md](04_CORE_ENGINE.md)** - Core Proprietario
- **CRITICO:** Struttura AsitronCore package
- License check mechanism
- Business logic separata
- Build e compilazione
- Dual-mode (dev vs prod)
- Git strategy per IP protection

#### **[05_BACKEND.md](05_BACKEND.md)** - Backend API
- Struttura progetto FastAPI
- Models SQLAlchemy
- API endpoints (CRUD + business)
- Integrazione con AsitronCore
- Esempi codice completi

#### **[06_FRONTEND.md](06_FRONTEND.md)** - Frontend React
- Struttura progetto React + TypeScript
- Layout compatto (stile ASI-TRACE)
- Pagine e componenti principali
- API client
- UI/UX guidelines

#### **[07_INTEGRATION.md](07_INTEGRATION.md)** - Integrazione Gestionale
- Connessione read-only a ASITRON
- Query strategy
- Entità da leggere (Commesse, Articoli)
- Sync approach (per v1 e future)

#### **[08_DEPLOYMENT.md](08_DEPLOYMENT.md)** - Deploy e Build
- Setup ambiente development
- Build produzione (core compilato)
- Deployment checklist
- Docker (optional)
- Troubleshooting

#### **[09_ROADMAP.md](09_ROADMAP.md)** - Piano Sviluppo
- **Fase 1:** Setup + SMD + Config (6 settimane)
- **Fase 2:** PTH + Controlli (3 settimane)
- **Fase 3:** Cruscotto Avanzamento (2 settimane)
- **Fase 4:** Documenti + Rifinitura (3 settimane)
- Task dettagliati per ogni fase
- Dipendenze e milestone

#### **[10_TESTING.md](10_TESTING.md)** - Testing e QA
- Strategy testing (unit, integration, e2e)
- Test checklist per fase
- Coverage target
- Tools e framework

#### **[APPENDIX_REFERENCES.md](APPENDIX_REFERENCES.md)** - Appendici
- Riferimenti a documenti ChatGPT
- Considerazioni legali IP
- Glossario termini
- FAQ

---

## 🚀 Quick Start per Claude Code

### Sequenza Lettura Raccomandata

**Per iniziare sviluppo:**

1. **Leggi `01_OVERVIEW.md`** → Capisci contesto e obiettivi
2. **Leggi `02_ARCHITECTURE.md`** → Comprendi architettura generale
3. **Leggi `04_CORE_ENGINE.md`** → **CRITICO** - Setup core proprietario
4. **Leggi `03_DATABASE.md`** → Schema DB da implementare
5. **Leggi `09_ROADMAP.md`** → Piano sviluppo fase 1

**Per sviluppo backend:**
- `05_BACKEND.md` + `07_INTEGRATION.md`

**Per sviluppo frontend:**
- `06_FRONTEND.md`

**Prima del deploy:**
- `08_DEPLOYMENT.md`

### Convenzioni Documenti

**Formato:**
- Markdown standard
- Code blocks con syntax highlighting
- Esempi completi e funzionanti
- Link cross-document quando necessario

**Notazione:**
- ✅ = Requisito/feature confermato
- ⚠️ = Attenzione/vincolo importante
- ❌ = Non-goal / fuori scope v1
- 🔒 = Aspetto legato a IP/proprietà
- 📝 = TODO/da implementare

**Simboli priorità:**
- 🔴 CRITICO - Bloccante
- 🟡 IMPORTANTE - Alta priorità
- 🟢 NICE-TO-HAVE - Bassa priorità

---

## 📦 Deliverables Finali

Al completamento sviluppo, avrai:

### Software
- ✅ AsitronCore package compilato (.whl)
- ✅ Backend FastAPI deployato
- ✅ Frontend React build produzione
- ✅ Database ASI_GEST popolato

### Documentazione
- ✅ API documentation (OpenAPI/Swagger auto-generata)
- ✅ User manual (da creare separatamente)
- ✅ Deployment guide (vedi 08_DEPLOYMENT.md)

### Legal
- ✅ License AsitronCore attiva (scadenza definita)
- ✅ Copyright notices nel codice
- ✅ Documentazione ownership (vedi APPENDIX_REFERENCES.md)

---

## 🎯 Obiettivo Finale

**Sistema funzionante che:**
1. Sostituisce Excel per gestione produzione
2. Si integra read-only con gestionale ASITRON
3. Traccia lotti SMD/PTH/Controlli
4. Fornisce cruscotto real-time avanzamento
5. Gestisce documentazione tecnica
6. **Mantiene separazione IP core proprietario**

**Timeline:** 14 settimane (~3.5 mesi)

**Success metric:** Almeno 2 operatori SMD usano sistema giornalmente senza tornare a Excel.

---

## 📞 Contatti e Support

**Developer:** Enrico [Cognome]  
**Supervisor AI:** Marco (Claude)  
**Target Deployment:** Asitron S.r.l. (on-premise)

---

## 🔄 Versioning

- **v1.0 (corrente)** - Specifica completa per sviluppo iniziale
- Future updates in questo folder

---

**PROSSIMO PASSO:** Leggi `01_OVERVIEW.md` per comprendere il contesto completo del progetto.
