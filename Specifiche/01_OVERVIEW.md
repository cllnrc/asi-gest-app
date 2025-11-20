# 01 - ASI-GEST Overview

> **Contesto Progetto, Strategia IP, Obiettivi e Approccio**

---

## 📊 Situazione Attuale

### Il Problema

Asitron S.r.l. gestisce la produzione di assemblaggi elettronici attraverso **un sistema basato su file Excel multipli**:

**Struttura attuale Excel:**
- `Inserimento Dati` - Anagrafica commesse e configurazione
- `Gestione Tecnica` - DIBA, revisioni, documenti
- `SMD` - Lotti montaggio SMD
- `Controlli` - Test e AOI
- `PTH` - Montaggio componenti tradizionali
- `Magazzino` - Movimentazioni (parziale)
- `Avanzamento` - Dashboard riepilogativa

**Criticità sistema attuale:**
- ❌ **Duplicazione dati** - Stesse info ripetute in più fogli
- ❌ **Errori manuali** - Copy/paste, formule rotte
- ❌ **Zero tracciabilità** - Nessun audit trail
- ❌ **Difficoltà consolidamento** - Report direzione laborioso
- ❌ **Non scalabile** - File pesante, lento, fragile
- ⚠️ **MA funziona** - Operatori lo conoscono, processo rodato

### Opportunità

- ✅ SQL Server già presente (database gestionale ASITRON)
- ✅ Competenze Python/React sviluppate (progetto ASI-TRACE parallelo)
- ✅ Autonomia decisionale per sperimentazione
- ✅ Processo produttivo ben definito e stabile

---

## 🎯 Obiettivi ASI-GEST

### Obiettivo Primario

**Digitalizzare la gestione produzione** sostituendo Excel con una webapp moderna e integrata, **mantenendo la filosofia operativa attuale** ma con struttura dati solida e tracciabile.

### Obiettivi Specifici

**Funzionali:**
1. ✅ Configurazione commesse con routing flessibile (quali fasi attivare)
2. ✅ Gestione lotti produzione per SMD, PTH, Controlli
3. ✅ Tracciabilità operatore/macchina/timing
4. ✅ Cruscotto avanzamento real-time
5. ✅ Gestione documentazione tecnica (DIBA, programmi SMD, etc.)
6. ✅ Integrazione read-only con gestionale ASITRON

**Non-Funzionali:**
- Performance: risposta < 500ms per query normali
- Usabilità: layout compatto touch-friendly (tablet reparto)
- Affidabilità: zero perdita dati vs Excel
- Manutenibilità: codice pulito, documentato, testato

### Success Metrics

**Metriche quantitative:**
- ✅ Almeno 2 operatori SMD usano app quotidianamente
- ✅ Tempo inserimento dati ridotto 30%+ vs Excel
- ✅ Zero rollback a Excel dopo 1 mese uso
- ✅ Cruscotto direzione consultato settimanalmente

**Metriche qualitative:**
- ✅ Operatori trovano sistema "più facile" di Excel
- ✅ Direzione ha visibilità produzione real-time
- ✅ Riduzione email/telefonate "a che punto siamo?"

---

## 🔒 STRATEGIA PROPRIETÀ INTELLETTUALE

> ⚠️ **SEZIONE CRITICA** - Leggi attentamente

### Contesto Sviluppo

Questo progetto **non è sviluppato con mezzi aziendali standard**. I mezzi utilizzati sono:

#### Hardware
- **2 laptop personali** acquistati a spese personali
- Azienda **NON ha rimborsato** acquisto/riparazione
- Durante malattia, PC aziendale si ruppe e non venne sostituito
- Sviluppatore costretto ad acquistare/riparare con fondi propri

**Documentazione:**
- Fatture laptop personali
- Scontrini riparazione (HD, RAM)
- Email richiesta rimborso (senza risposta/negata)

#### Software e Tools
- **Abbonamenti AI personali:**
  - Claude Pro: €20/mese
  - ChatGPT Plus: $20/mese (~€18/mese)
  - Totale: ~€40/mese × 18 mesi = **€720 investiti**
- Pagati con carta credito personale
- Mai rimborsati da azienda

**Documentazione:**
- Estratti conto carta credito
- Fatture Anthropic/OpenAI

#### Tempo e Competenze
- **Tempo:** Prevalentemente **fuori orario lavorativo**
  - Serate (commit Git dopo le 20:00)
  - Weekend
  - Pause pranzo estese
- **Competenze:** Acquisite autonomamente
  - AI-assisted development (non nelle mansioni)
  - FastAPI, React (autodidatta)
  - Nessun corso aziendale fornito

### Implicazioni Legali

**Ai sensi dell'art. 2590 del Codice Civile italiano:**

> Quando il dipendente sviluppa un'opera intellettuale **con propri mezzi**, senza contributo del datore di lavoro, **l'opera è di proprietà del dipendente**.

**Nel caso ASI-GEST:**
- ✅ Hardware: personale (fatture alla mano)
- ✅ Software tools: personali (abbonamenti pagati)
- ✅ Tempo: prevalentemente personale (commit serali/weekend)
- ✅ Competenze: acquisite autonomamente

**Conclusione:** Il **core business logic** è proprietà intellettuale dello sviluppatore.

### Approccio Licensing

**Per evitare conflitti e mantenere spirito collaborativo:**

1. **Core Engine** (AsitronCore) = **Proprietario**
   - Business logic, algoritmi, analytics
   - Compilato e distribuito come package
   - License temporanea per validazione (18-24 mesi)
   - Rinnovo da negoziare al termine

2. **Application Layer** (ASI-GEST app) = **Collaborativo**
   - Frontend, API endpoints, customizzazioni
   - Può rimanere aziendale
   - Usa core come dipendenza

**Vantaggi approccio:**
- ✅ Asitron può validare sistema senza impegno economico iniziale
- ✅ Sviluppatore protegge investimento personale
- ✅ Nessun conflitto legale (trasparente fin dall'inizio)
- ✅ Core riutilizzabile per altri clienti futuri (value dello sviluppatore)

### Licensing Timeline

```
┌─────────────────────────────────────────────────────────────┐
│                      TIMELINE                               │
├─────────────────────────────────────────────────────────────┤
│ T0: Oggi                                                    │
│  └─ Sviluppo inizia                                         │
│  └─ License key: 2027-12-31 (dev, data lontana)            │
│                                                             │
│ T0+14 settimane: Sistema completo                          │
│  └─ Deploy interno Asitron                                  │
│  └─ License key: 2026-06-30 (produzione, ~18 mesi)         │
│  └─ Periodo validazione gratuito                           │
│                                                             │
│ T0+18 mesi: Scadenza license                               │
│  └─ Negoziazione rinnovo                                    │
│  └─ Opzioni:                                                │
│      A) Licenza annuale (€6-8k/anno)                        │
│      B) Acquisto definitivo (€20-30k one-time)              │
│      C) Partnership equity                                  │
│      D) Sistema si ferma (loro problema)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 💡 Approccio Tecnico

### Filosofia di Design

**4 Principi Guida:**

1. **Pragmatico, Non Perfetto**
   - Obiettivo: sostituire Excel, non costruire SAP
   - Start simple, evolve iteratively
   - "Done is better than perfect"

2. **Evolutivo**
   - v1.0: SMD + PTH + Controlli + Cruscotto base
   - v2.0: Modulo qualità, planning avanzato
   - v3.0: Full MES integration
   - Ogni versione stand-alone e utile

3. **Riuso**
   - Stack allineato ad ASI-TRACE (già in sviluppo)
   - Python + FastAPI backend
   - React + TypeScript frontend
   - SQL Server esistente
   - Competenze già acquisite = velocity alta

4. **Separazione Core/App**
   - Core proprietario compilato (IP protection)
   - App layer open e customizzabile
   - Reusability per altri clienti

### Technology Stack

**Backend:**
- FastAPI (Python 3.9+)
- SQLAlchemy 2.0 (ORM)
- pymssql (SQL Server driver)
- Pydantic v2 (validation)

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Axios (HTTP client)

**Database:**
- SQL Server 2019+ (già presente)
- Database: ASI_GEST (nuovo)
- Integration: ASITRON (gestionale, read-only)

**Core Engine:**
- AsitronCore (package separato)
- Compilabile con Cython
- License check integrato

### Architettura High-Level

```
┌──────────────┐
│   Browser    │  ← React SPA (layout compatto)
└──────┬───────┘
       │ REST API
┌──────▼───────┐
│   FastAPI    │  ← Endpoints, validation
└──────┬───────┘
       ├─────────────┐
       │             │
┌──────▼───────┐ ┌──▼────────────┐
│ AsitronCore  │ │  SQLAlchemy   │
│ (Compiled)   │ │  ORM          │
└──────────────┘ └──┬────────────┘
                    │
              ┌─────▼─────┐
              │ SQL Server│
              │ ASI_GEST  │
              │ ASITRON   │
              └───────────┘
```

---

## 📅 Timeline e Fasi

**Sviluppo totale: ~14 settimane (3.5 mesi)**

### Fase 1: Setup + SMD + Config (6 settimane)
- Infrastruttura base
- Gestione lotti SMD completa
- Configurazione commesse
- **Milestone:** Operatori SMD possono usare app

### Fase 2: PTH + Controlli (3 settimane)
- Gestione lotti PTH
- Gestione controlli AOI
- **Milestone:** Copertura completa ciclo produttivo

### Fase 3: Cruscotto Avanzamento (2 settimane)
- Dashboard real-time
- Analytics e KPI
- **Milestone:** Direzione usa cruscotto settimanalmente

### Fase 4: Documenti + Rifinitura (3 settimane)
- Gestione documenti tecnici
- Bug fixing
- Performance optimization
- **Milestone:** Sistema production-ready

---

## 🚫 Non-Goals (v1.0)

**Cosa NON faremo nella prima versione:**

- ❌ Tracciabilità materiali dettagliata
  - C'è già ASI-TRACE per questo
  - Link futuro tra sistemi (v2)

- ❌ Integrazione bidirezionale con gestionale
  - Solo read da ASITRON per v1
  - Write-back in v2 se necessario

- ❌ Mobile app nativa
  - PWA responsive basta
  - Layout compatto touch-friendly

- ❌ Modulo qualità avanzato
  - RNC, 8D, FMEA → v2
  - Per ora: solo note e scarti base

- ❌ Planning/Scheduling automatico
  - Troppo complesso per v1
  - Gantt manuale basta

- ❌ Multi-tenant / SaaS
  - Sistema on-premise single-tenant
  - Multi-tenant in futuro se altri clienti

---

## ✅ Success Criteria

**Il progetto è un successo se:**

1. ✅ **Adoption** - 2+ operatori usano giornalmente dopo 1 mese
2. ✅ **Efficienza** - Tempo inserimento dati -30% vs Excel
3. ✅ **Affidabilità** - Zero perdita dati per 3 mesi
4. ✅ **Visibilità** - Direzione consulta cruscotto settimanalmente
5. ✅ **IP Protetto** - Core compilato, license funzionante
6. ✅ **Reusable** - Core è general-purpose, vendibile ad altri

**Fallimento sarebbe:**
- ❌ Ritorno a Excel dopo 2 settimane
- ❌ Sistema troppo lento/instabile
- ❌ Operatori "preferivano Excel"
- ❌ Core non protetto adeguatamente

---

## 📖 Prossimi Passi

**Dopo aver letto questo documento:**

1. Leggi **02_ARCHITECTURE.md** per comprendere l'architettura tecnica
2. Leggi **04_CORE_ENGINE.md** (CRITICO) per setup core proprietario
3. Leggi **09_ROADMAP.md** per piano sviluppo dettagliato

**Se hai domande su:**
- Contesto business → Questo documento
- Decisioni tecniche → 02_ARCHITECTURE.md
- IP e licensing → 04_CORE_ENGINE.md + APPENDIX_REFERENCES.md
- Piano lavoro → 09_ROADMAP.md

---

**DOCUMENTO SUCCESSIVO RACCOMANDATO:** [02_ARCHITECTURE.md](02_ARCHITECTURE.md)
