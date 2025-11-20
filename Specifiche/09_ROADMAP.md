# 09 - ASI-GEST Development Roadmap

> **Piano Sviluppo Dettagliato, 4 Fasi, 14 Settimane, Task e Milestone**

---

## 🎯 Roadmap Overview

**Durata totale:** 14 settimane (~3.5 mesi)  
**Approccio:** Sviluppo incrementale, MVP prima, iterazioni successive  
**Philosophy:** "Done is better than perfect" - ship early, iterate

---

## 📅 Timeline Summary

```
┌─────────────────────────────────────────────────────┐
│                  14 SETTIMANE                       │
├─────────────┬──────────┬──────────┬─────────────────┤
│   FASE 1    │  FASE 2  │  FASE 3  │     FASE 4      │
│             │          │          │                 │
│ Setup + SMD │ PTH +    │ Cruscotto│ Doc + Rifinitu  │
│ + Config    │ Controlli│ Avanzam. │                 │
│             │          │          │                 │
│  6 sett     │  3 sett  │  2 sett  │    3 sett       │
└─────────────┴──────────┴──────────┴─────────────────┘

Milestone:     ↑          ↑          ↑          ↑
           MVP SMD    Full Cycle  Dashboard  Production
```

---

## 📋 FASE 1: Setup + SMD + Config (6 settimane)

### Obiettivo
**Sistema funzionante per reparto SMD** - Operatori possono registrare lotti SMD e direzione vede configurazioni commesse.

### Week 1-2: Infrastructure & Core

**Tasks:**

1. **Setup Repositories** (2 giorni)
   - [ ] Create repo `asitron-core` (private, Enrico)
   - [ ] Create repo `asi-gest-app` (aziendale o condiviso)
   - [ ] Setup .gitignore, LICENSE.txt
   - [ ] README.md base

2. **AsitronCore Package** (3 giorni)
   - [ ] Struttura folder `/asitron_core/`
   - [ ] Implement `_license.py` con check funzionante
   - [ ] Create `license.key` dev (2027-12-31)
   - [ ] Test: `import asitron_core` → OK
   - [ ] Build script `build.sh`
   - [ ] Test: build wheel, install, import → OK

3. **Database Schema** (3 giorni)
   - [ ] Create database `ASI_GEST`
   - [ ] Run CREATE TABLE per 8 tabelle (03_DATABASE.md)
   - [ ] Seed `FaseTipo`
   - [ ] Create view `vw_AvanzamentoCommesse`
   - [ ] Test: query cross-database ASITRON → OK

4. **Backend Setup** (2 giorni)
   - [ ] Init FastAPI project struttura
   - [ ] Config `database.py` (ASI_GEST + ASITRON)
   - [ ] Models SQLAlchemy base (FaseTipo, Utenti, Macchine)
   - [ ] Test: uvicorn starts, `/health` → OK

**Deliverable Week 1-2:**
- ✅ Infrastructure pronta
- ✅ Database schema applicato
- ✅ Core engine con license check funzionante
- ✅ Backend base runnable

---

### Week 3-4: ConfigCommessa + Integration

**Tasks:**

1. **Config Commessa CRUD** (4 giorni)
   - [ ] Model `ConfigCommessa` completo
   - [ ] Schema Pydantic `ConfigCreate`, `ConfigUpdate`
   - [ ] API endpoints `/api/config/` (CRUD completo)
   - [ ] Business logic in core: validazioni base
   - [ ] Test: create/read/update config → OK

2. **Integration Gestionale** (3 giorni)
   - [ ] API `/api/commesse/` (read-only ASITRON)
   - [ ] Endpoint GET lista commesse aperte
   - [ ] Endpoint GET singola commessa by ID
   - [ ] Endpoint search commesse
   - [ ] Test: commesse da ASITRON visibili → OK

3. **Frontend Setup** (3 giorni)
   - [ ] Init React + TypeScript + Vite
   - [ ] Setup Tailwind CSS
   - [ ] Component `Layout.tsx` (header compatto h-10)
   - [ ] Router setup (React Router)
   - [ ] API client Axios configurato
   - [ ] Test: frontend starts, layout visibile → OK

**Deliverable Week 3-4:**
- ✅ Config commesse gestibile via API
- ✅ Integrazione read-only ASITRON funzionante
- ✅ Frontend base con layout

---

### Week 5-6: Lotti SMD Complete

**Tasks:**

1. **Lotti SMD Backend** (4 giorni)
   - [ ] Models `Fasi`, `Lotti` completi
   - [ ] API `/api/lotti/smd/` (CRUD)
   - [ ] Business logic core:
     - `calcola_progressivo_lotto()`
     - `valida_chiusura_lotto()`
   - [ ] Endpoint create lotto (aperto)
   - [ ] Endpoint close lotto (chiusura con validazioni)
   - [ ] Test: CRUD lotti → OK

2. **Lotti SMD Frontend** (4 giorni)
   - [ ] Page `ConfigPage.tsx` (lista commesse + config)
   - [ ] Page `LottiSMDPage.tsx`
   - [ ] Component `Table.tsx` riusabile
   - [ ] Component `Modal.tsx` per form
   - [ ] Form nuovo lotto
   - [ ] Form chiudi lotto
   - [ ] Test: operatore crea/chiude lotto → OK

3. **Anagrafiche Base** (2 giorni)
   - [ ] CRUD Utenti (API + frontend)
   - [ ] CRUD Macchine (API + frontend)
   - [ ] Dropdown operatori/macchine in form lotto
   - [ ] Test: anagrafiche usabili → OK

**Deliverable Week 5-6:**
- ✅ **MILESTONE 1: MVP SMD**
- ✅ Operatori possono registrare lotti SMD
- ✅ Config commesse completa
- ✅ Anagrafiche utenti/macchine

**Success Metric:**
- 2 operatori SMD usano app per 1 settimana in parallelo a Excel
- Zero bug bloccanti
- Velocità inserimento >= Excel

---

## 📋 FASE 2: PTH + Controlli (3 settimane)

### Obiettivo
**Copertura completa ciclo produttivo** - Tutti i reparti possono usare sistema.

### Week 7: Lotti PTH

**Tasks:**

1. **PTH Backend** (2 giorni)
   - [ ] API `/api/lotti/pth/` (simile a SMD)
   - [ ] Business logic specifica PTH (se diversa)
   - [ ] Test: CRUD lotti PTH → OK

2. **PTH Frontend** (2 giorni)
   - [ ] Page `LottiPTHPage.tsx`
   - [ ] Riuso componenti Table/Modal da SMD
   - [ ] Form lotto PTH (adattato)
   - [ ] Test: operatore PTH usa sistema → OK

3. **Bug Fixing Phase 1** (1 giorno)
   - [ ] Fix bug scoperti da operatori SMD
   - [ ] Miglioramenti UX suggeriti
   - [ ] Performance tuning query

**Deliverable Week 7:**
- ✅ Lotti PTH funzionanti
- ✅ Bug Phase 1 risolti

---

### Week 8-9: Controlli + QC

**Tasks:**

1. **Controlli Backend** (3 giorni)
   - [ ] API `/api/lotti/controlli/`
   - [ ] Business logic controlli:
     - Validazione vs lotti SMD precedenti
     - Calcolo % scarti per anomalia
   - [ ] Test: CRUD controlli → OK

2. **Controlli Frontend** (3 giorni)
   - [ ] Page `LottiControlliPage.tsx`
   - [ ] Form controlli con tipi scarto
   - [ ] Visualizzazione link a lotti SMD precedenti
   - [ ] Test: operatore QC usa sistema → OK

3. **Fasi Workflow** (2 giorni)
   - [ ] Logica apertura/chiusura fasi automatica
   - [ ] Stati fase (APERTA, IN_CORSO, CHIUSA, BLOCCATA)
   - [ ] API `/api/fasi/` per gestione manuale
   - [ ] Test: fasi cambiano stato correttamente → OK

4. **Testing Integration E2E** (2 giorni)
   - [ ] Test full workflow:
     1. Config commessa
     2. Lotti SMD
     3. Lotti Controlli
     4. Lotti PTH
   - [ ] Verify data consistency cross-fase
   - [ ] Fix eventuali bug di integrazione

**Deliverable Week 8-9:**
- ✅ **MILESTONE 2: Full Production Cycle**
- ✅ Tutti i reparti coperti (SMD, PTH, Controlli)
- ✅ Workflow fasi funzionante

**Success Metric:**
- Almeno 1 commessa completata end-to-end nel sistema
- Operatori preferiscono app a Excel

---

## 📋 FASE 3: Cruscotto Avanzamento (2 settimane)

### Obiettivo
**Dashboard real-time per direzione** - Visibilità completa avanzamento commesse.

### Week 10: Dashboard KPI

**Tasks:**

1. **Analytics Backend** (3 giorni)
   - [ ] Business logic in core `analytics.py`:
     - `dashboard_kpi()`
     - `efficienza_fase()`
     - Top operatori, scarti %
   - [ ] API `/api/dashboard/kpi`
   - [ ] Test: KPI calcolati correttamente → OK

2. **Dashboard Frontend Base** (2 giorni)
   - [ ] Page `HomePage.tsx` con KPI cards
   - [ ] Visualizzazione:
     - Lotti completati settimana
     - Scarti % media
     - Top 5 operatori
   - [ ] Auto-refresh ogni 5 minuti
   - [ ] Test: dashboard si aggiorna → OK

**Deliverable Week 10:**
- ✅ Dashboard KPI base funzionante

---

### Week 11: Avanzamento Commesse

**Tasks:**

1. **Avanzamento Backend** (2 giorni)
   - [ ] API `/api/avanzamento/` con view completa
   - [ ] Join cross-database per dati completi
   - [ ] Calcolo stato produzione per commessa
   - [ ] Test: query performance < 500ms → OK

2. **Avanzamento Frontend** (3 giorni)
   - [ ] Page `AvanzamentoPage.tsx`
   - [ ] Table avanzamento con:
     - Commessa, cliente, articolo
     - Qta SMD / PTH / Controlli
     - Stato produzione
     - % completamento
   - [ ] Filtri: per stato, cliente, data
   - [ ] Sort columns
   - [ ] Test: direzione consulta cruscotto → OK

**Deliverable Week 11:**
- ✅ **MILESTONE 3: Dashboard Complete**
- ✅ Cruscotto avanzamento real-time
- ✅ KPI e analytics visibili

**Success Metric:**
- Direzione usa cruscotto settimanalmente
- Riduzione email "a che punto siamo?"

---

## 📋 FASE 4: Documenti + Rifinitura (3 settimane)

### Obiettivo
**Sistema production-ready** - Gestione documentazione, bug fixing, performance, training.

### Week 12: Gestione Documenti

**Tasks:**

1. **Documenti Backend** (3 giorni)
   - [ ] Model `DocumentiTecnici`
   - [ ] API `/api/documenti/` CRUD
   - [ ] Upload file handler
   - [ ] Storage filesystem `/uploads/documenti/`
   - [ ] Business logic:
     - Check doc mancanti per articolo
     - Warning in config se doc mancante
   - [ ] Test: upload/download doc → OK

2. **Documenti Frontend** (2 giorni)
   - [ ] Component upload file
   - [ ] Lista documenti per articolo
   - [ ] Download documento
   - [ ] Badge warning se doc mancanti
   - [ ] Test: upload/visualizzazione → OK

**Deliverable Week 12:**
- ✅ Gestione documenti tecnici completa

---

### Week 13: Performance & Polish

**Tasks:**

1. **Performance Optimization** (2 giorni)
   - [ ] Analyze slow queries (SQL profiler)
   - [ ] Add indexes dove necessario
   - [ ] Cache queries ripetitive (se serve)
   - [ ] Frontend: lazy loading, code splitting
   - [ ] Test: tutte le pagine < 500ms load → OK

2. **Bug Fixing** (2 giorni)
   - [ ] Fix tutti i bug noti
   - [ ] Test regressione completo
   - [ ] Resolve edge cases

3. **UI/UX Polish** (2 giorni)
   - [ ] Feedback operatori implementati
   - [ ] Loading states, error messages
   - [ ] Responsive tweaks
   - [ ] Keyboard shortcuts (optional)

4. **Logging & Monitoring** (1 giorno)
   - [ ] Structured logging backend
   - [ ] Log file rotation
   - [ ] Health check robusto
   - [ ] Alert se license expiring < 30 giorni

**Deliverable Week 13:**
- ✅ Sistema ottimizzato
- ✅ Bug risolti
- ✅ UX migliorata

---

### Week 14: Deploy & Training

**Tasks:**

1. **Production Build** (2 giorni)
   - [ ] Build AsitronCore wheel con license prod
   - [ ] Frontend production build
   - [ ] Docker images (optional)
   - [ ] Test build complete → OK

2. **Production Deploy** (2 giorni)
   - [ ] Deploy su server interno
   - [ ] Configure systemd/docker
   - [ ] Nginx reverse proxy
   - [ ] Test deploy:
     - Health check OK
     - Frontend raggiungibile
     - Backend API funzionante
     - Database connesso

3. **Training & Handoff** (2 giorni)
   - [ ] Session training reparto SMD (1h)
   - [ ] Session training reparto PTH (1h)
   - [ ] Session training reparto QC (1h)
   - [ ] Session direzione cruscotto (30min)
   - [ ] Video tutorial brevi (optional)

4. **Go-Live** (1 giorno)
   - [ ] 1 settimana parallelo Excel + App
   - [ ] Monitor errori, raccogliere feedback
   - [ ] Fix hotfix se necessari

5. **Excel Deprecation** (1 giorno)
   - [ ] Announce: Excel non più usato
   - [ ] Backup finale Excel storico
   - [ ] Celebration! 🎉

**Deliverable Week 14:**
- ✅ **MILESTONE 4: Production Ready**
- ✅ Sistema deployed
- ✅ Operatori trainati
- ✅ Excel deprecato

**Success Metric:**
- 100% operatori su app, 0% su Excel
- Zero rollback richiesti
- Feedback positivo > 80%

---

## 🎯 Post-Launch (Settimane 15+)

### Immediate (Week 15-16)

- [ ] Monitor daily usage
- [ ] Hotfix bugs critici
- [ ] Raccolta feedback strutturata
- [ ] Iterate miglioramenti UX

### Short-Term (Mesi 2-3)

- [ ] Export Excel/PDF report
- [ ] Mobile PWA per tablet
- [ ] Notifiche push eventi
- [ ] Grafici avanzati dashboard

### Medium-Term (Mesi 4-6)

- [ ] Modulo qualità avanzato (RNC, 8D)
- [ ] Link con ASI-TRACE (tracciabilità materiali)
- [ ] Planning/Scheduling automatico
- [ ] Write-back a ASITRON (optional)

### Long-Term (Anno 2+)

- [ ] Multi-tenant SaaS
- [ ] Vendita ad altri clienti
- [ ] AI-powered analytics
- [ ] Integrazione ERP maggiori (SAP, etc.)

---

## 📊 Resource Allocation

### Developer Time

**Total:** ~560 ore (14 settimane × 40 ore)

**Breakdown:**
- Fase 1 (6w): 240h (43%)
- Fase 2 (3w): 120h (21%)
- Fase 3 (2w): 80h (14%)
- Fase 4 (3w): 120h (22%)

### External Dependencies

**Nessuna** - Tutto sviluppato internamente:
- AsitronCore: Enrico
- Backend: Enrico (con Claude Code)
- Frontend: Enrico (con Claude Code)
- Deploy: Enrico

### Costs

**Development:**
- Hardware: €0 (già posseduto)
- Software: €40/mese AI × 4 mesi = €160
- Hosting: €0 (server interno aziendale)

**Total:** ~€160

---

## ⚠️ Risks & Mitigation

### Risk 1: Performance Issues

**Risk:** Query cross-database troppo lente  
**Probability:** Medium  
**Impact:** High  
**Mitigation:**
- Early performance testing (Week 3)
- Indexes su ASITRON.COMMESSE
- Cache locale se necessario (v2)

### Risk 2: User Adoption Failure

**Risk:** Operatori preferiscono Excel  
**Probability:** Low  
**Impact:** Critical  
**Mitigation:**
- Coinvolgimento early (testing Week 6)
- Training hands-on
- UI/UX super-semplice

### Risk 3: License Legal Issues

**Risk:** Azienda contesta ownership IP  
**Probability:** Low  
**Impact:** Critical  
**Mitigation:**
- Documentazione legale completa
- Email/Git log timestamp
- Dichiarazione scritta pre-sviluppo

### Risk 4: Scope Creep

**Risk:** Richieste feature continue  
**Probability:** High  
**Impact:** Medium  
**Mitigation:**
- Roadmap chiara v1 vs v2
- "No" a feature non-critiche
- Done > Perfect

---

## ✅ Success Criteria Recap

**Il progetto è SUCCESS se:**

1. ✅ **Adoption** - 2+ operatori usano giornalmente dopo 1 mese
2. ✅ **Efficienza** - Tempo inserimento -30% vs Excel
3. ✅ **Affidabilità** - Zero perdita dati per 3 mesi
4. ✅ **Visibilità** - Direzione consulta cruscotto settimanalmente
5. ✅ **IP** - Core compilato, license funzionante
6. ✅ **Reusable** - Core vendibile ad altri clienti

---

**DOCUMENTO SUCCESSIVO:** [10_TESTING.md](10_TESTING.md)
