# APPENDIX - References & FAQ

> **Riferimenti Esterni, Considerazioni Legali, Glossario, FAQ**

---

## 📚 Documenti di Riferimento

### Documenti ChatGPT (Fase Analisi Preliminare)

**File forniti da Enrico durante analisi iniziale:**

1. **`schema_db_asitron_produzione_specifica_markdown.md`**
   - Schema database proposto da ChatGPT
   - Analisi tabelle e relazioni
   - Fonte: conversazione ChatGPT analisi Excel
   - **Uso:** Riferimento schema DB, alcune idee riusate

2. **`api_rest_web_app_asitron_produzione_specifica.md`**
   - Specifica API REST proposta
   - Endpoint e data models
   - **Uso:** Ispirazione architettura API

3. **`integrazione_gestionale_doc_tecnica_e_smd_analisi_markdown.md`**
   - Analisi integrazione con gestionale
   - Query SQL esempio
   - **Uso:** Pattern connessione ASITRON

**Note:** Questi documenti sono stati **analizzati e rielaborati** nella presente specifica. ASI-GEST usa approccio diverso (più pragmatico) ma alcune idee sono state mantenute.

---

### Documenti ASI-TRACE (Progetto Gemello)

**File di riferimento dal progetto parallelo:**

1. **`STATO_SVILUPPO.md`**
   - Stato sviluppo ASI-TRACE
   - Pattern UI già rodati (layout compatto)
   - Connessione gestionale funzionante
   - **Uso:** Riuso pattern, stack allineato

2. **`gestionale_db.py`** (se disponibile)
   - Pattern connessione SQL Server
   - Gestione sessioni
   - **Uso:** Copy pattern per integrazione ASITRON

**Rationale:** ASI-TRACE e ASI-GEST sono progetti complementari:
- ASI-TRACE: tracciabilità materiali
- ASI-GEST: gestione produzione

Condividono:
- Stack tecnologico (Python/React/SQL Server)
- Layout UI compatto
- Pattern integrazione gestionale

---

### File Excel Originali

**`REGISTRO_COMMESSE_ASITRON_SRL.xlsx`**
- File Excel attualmente in uso
- Struttura multi-foglio (Inserimento, SMD, PTH, Controlli, etc.)
- **Uso:** Comprensione logica esistente, test comparativo

**Note:** Disponibile solo parziale (anno 2025) per dimensioni ridotte.

---

## ⚖️ Considerazioni Legali IP

### Contesto Sviluppo

**Enrico ha sviluppato ASI-GEST utilizzando:**

#### Hardware Personale
- 2 laptop acquistati personalmente
- Mai rimborsati da azienda
- Necessari dopo rottura PC aziendale non sostituito

**Documentazione:**
- Fatture acquisto laptop (€X, €Y)
- Scontrini riparazione (HD, RAM)
- Email richiesta rimborso (negata/ignorata)

#### Software Personale
- Claude Pro: €20/mese
- ChatGPT Plus: ~€18/mese
- Totale investito: ~€720 (18 mesi)

**Documentazione:**
- Estratti conto carta credito
- Fatture Anthropic/OpenAI

#### Tempo Personale
- Sviluppo prevalentemente fuori orario
- Commit Git: serali, weekend
- Competenze acquisite autonomamente

**Documentazione:**
- Log Git con timestamp
- History bash (se rilevante)

### Base Giuridica

**Art. 2590 Codice Civile Italiano:**

> "Le invenzioni fatte dal prestatore di lavoro, che non rientrino nei casi previsti dal primo comma, appartengono al datore di lavoro quando l'attività inventiva sia prevista come oggetto del contratto o del rapporto di lavoro e a tale scopo il lavoratore riceva una retribuzione corrispondente."

**Nel caso ASI-GEST:**
- ✅ Hardware: personale
- ✅ Software: personale
- ✅ Tempo: prevalentemente personale
- ✅ Competenze: non coperte da mansione aziendale
- ✅ Attività inventiva: NON oggetto contratto

**Conclusione:** Core Engine è proprietà intellettuale di Enrico.

### Strategia Licensing

**Obiettivo:** Permettere validazione sistema senza conflitto.

**Approccio:**
1. **Core Engine** separato, compilato, proprietario
2. **License temporanea gratuita** (18 mesi)
3. **App Layer** può rimanere aziendale
4. **Negoziazione futura** da posizione trasparente

**Vantaggi:**
- Azienda valida senza rischio
- Enrico protegge investimento
- Core riutilizzabile per altri clienti
- Trasparenza da subito (no sorprese)

### Documentazione Raccomandata

**Pre-Sviluppo:**
- [ ] Dichiarazione scritta ownership IP
- [ ] Email a direzione esplicitando situazione
- [ ] Raccolta fatture/estratti conto

**Durante Sviluppo:**
- [ ] Commit Git con timestamp evidenti
- [ ] Develop su hardware personale
- [ ] Separazione core/app evidente nel codice

**Pre-Deploy:**
- [ ] License agreement formale (optional)
- [ ] Documentazione completa in APPENDIX

---

## 📖 Glossario Termini

### Termini Tecnici

**ASI-GEST**
- Nome progetto: ASITRON Gestione Produzione

**ASI-TRACE**
- Progetto gemello: tracciabilità materiali

**ASITRON**
- Nome database gestionale esistente
- Azienda: Asitron S.r.l.

**AsitronCore**
- Package Python proprietario
- Business logic separata
- Distribuito come wheel compilato

**SMD**
- Surface Mount Device
- Montaggio componenti superficie

**PTH**
- Pin Through Hole
- Montaggio componenti tradizionali

**AOI**
- Automated Optical Inspection
- Controllo ottico automatico

**DIBA**
- Disegno Base (termine aziendale)
- Riferimento tecnico articolo

**ERP**
- Enterprise Resource Planning
- Sistema gestionale aziendale

### Termini Business

**Commessa**
- Ordine cliente da gestionale
- Identificata da: Esercizio + NumeroCommessa

**Fase**
- Step produttivo (SMD, PTH, Controlli, etc.)
- Istanza specifica per una commessa

**Lotto**
- Batch produttivo all'interno di una fase
- Traccia operatore, macchina, qta, tempi

**Progressivo**
- Numero sequenziale lotto all'interno fase
- Auto-calcolato (1, 2, 3, ...)

**Scarto**
- Pezzi difettosi/non conformi
- Tracciati per KPI qualità

---

## ❓ FAQ (Frequently Asked Questions)

### Generale

**Q: Perché ASI-GEST invece di comprare software esistente?**

A: Software MES commerciali:
- Costosi (€50k+ setup, €10k/anno licenze)
- Over-engineered per PMI
- Customizzazione difficile
- Vendor lock-in

ASI-GEST:
- Sviluppato in-house, costo <€1k
- Tailor-made per processo Asitron
- Full ownership (app layer)
- Evolutivo secondo esigenze

---

**Q: Quanto tempo per essere operativo?**

A: 
- MVP SMD: 6 settimane
- Sistema completo: 14 settimane
- Training operatori: 1 settimana

Totale: ~4 mesi da inizio sviluppo a piena operatività.

---

**Q: Cosa succede se Enrico lascia azienda?**

A:
- App layer: azienda può mantenerla
- Core engine: dipende da license agreement
- Codice documentato, manutenibile
- Stack standard (Python/React), skill reperibili

Scenario negoziazione:
- Acquisto definitivo core
- O license long-term
- O partnership continuativa

---

### Tecnico

**Q: Perché SQL Server e non PostgreSQL/MySQL?**

A: SQL Server già presente per gestionale ASITRON. Riutilizzo infrastruttura esistente = zero costi aggiuntivi.

---

**Q: Perché Python e non C#/.NET?**

A:
- Python: rapido sviluppo, AI-friendly
- Stack già usato in ASI-TRACE (competenze)
- FastAPI: veloce, moderno, auto-doc
- SQLAlchemy: ORM maturo

.NET sarebbe alternativa valida ma richiederebbe più tempo.

---

**Q: Database scalability - cosa succede con 10k+ lotti?**

A:
- Indexes su colonne chiave → query veloci
- Pagination API (limit/offset)
- Archiving storico (v2) se necessario
- SQL Server gestisce facilmente 100k+ righe

Per PMI, non è collo bottiglia.

---

**Q: Backup strategy?**

A:
- Database: backup SQL Server giornaliero (già in atto per gestionale)
- Code: Git (repository privato + aziendale)
- AsitronCore wheel: backup separato

Restore time: < 30 minuti.

---

### Business

**Q: ROI del progetto?**

A: 
**Costi:**
- Sviluppo: €160 (abbonamenti AI, hardware già posseduto)
- Hosting: €0 (server interno)

**Savings:**
- Tempo inserimento dati: -30% → ~15h/mese risparmiate
- Errori ridotti: ~€2-3k/anno evitati
- Visibilità direzione: ~10h/mese risparmiate

**ROI:** 2-3 mesi break-even.

---

**Q: Cosa include license AsitronCore?**

A: License temporanea (18 mesi) include:
- Uso illimitato sistema
- Bug fixes critici
- Support Enrico (best effort)

License NON include:
- Codice sorgente core
- Feature development nuove
- SLA garantito

---

**Q: Cosa succede alla scadenza license?**

A: Sistema si **blocca** (check license all'avvio).

Opzioni:
1. Rinnovo license annuale (€6-8k/anno)
2. Acquisto definitivo core (€20-30k one-time)
3. Partnership equity
4. Sistema non utilizzabile

Negoziazione inizia 2-3 mesi prima scadenza.

---

### Operativo

**Q: Training operatori - quanto tempo?**

A:
- Reparto SMD: 1h hands-on
- Reparto PTH: 1h hands-on
- Reparto QC: 1h hands-on
- Direzione: 30min dashboard overview

Totale: 1 giornata.

---

**Q: Sistema funziona offline?**

A: No (v1). Sistema richiede:
- Connessione SQL Server
- Browser con accesso backend

v2: potrebbe includere PWA offline-capable.

---

**Q: Mobile/Tablet support?**

A: 
- Layout ottimizzato per tablet 10"+
- Touch-friendly (bottoni grandi, text-10px leggibile)
- Responsive design
- NO app nativa (browser-based)

Tablet Windows/Android con browser moderno: OK.

---

## 📞 Contatti & Support

### Developer

**Nome:** Enrico [Cognome]  
**Email:** enrico@example.com  
**Phone:** [numero]

**Disponibilità:**
- Orario lavorativo: consulenza immediata
- Fuori orario: best effort (24-48h)
- Weekend: emergenze solo

### License Inquiries

**Email:** enrico@example.com  
**Oggetto:** ASI-GEST License Inquiry

### Technical Support

**GitHub Issues:** [repo-url]/issues (se applicabile)  
**Email:** enrico@example.com

---

## 🔗 Link Utili

### Documentazione Esterna

- **FastAPI:** https://fastapi.tiangolo.com
- **React:** https://react.dev
- **SQLAlchemy:** https://www.sqlalchemy.org
- **Tailwind CSS:** https://tailwindcss.com

### Tools

- **SQL Server Management Studio:** https://aka.ms/ssmsfullsetup
- **VS Code:** https://code.visualstudio.com
- **Git:** https://git-scm.com
- **Python:** https://python.org
- **Node.js:** https://nodejs.org

### Community

- **FastAPI Discord:** https://discord.gg/fastapi
- **Python Italia:** https://www.python.it
- **Stack Overflow:** https://stackoverflow.com

---

## 📄 Document Version History

**v1.0 - Gennaio 2025**
- Specifica iniziale completa
- 11 documenti (00-10 + APPENDIX)
- Pronto per sviluppo con Claude Code

**Future versions:**
- v1.1: Aggiornamenti post-MVP
- v2.0: Roadmap v2 features

---

## ✅ Completion Checklist

**Documentazione:**
- [x] 00_INDEX.md
- [x] 01_OVERVIEW.md
- [x] 02_ARCHITECTURE.md
- [x] 03_DATABASE.md
- [x] 04_CORE_ENGINE.md
- [x] 05_BACKEND.md
- [x] 06_FRONTEND.md
- [x] 07_INTEGRATION.md
- [x] 08_DEPLOYMENT.md
- [x] 09_ROADMAP.md
- [x] 10_TESTING.md
- [x] APPENDIX_REFERENCES.md

**Pronto per:**
- [x] Claude Code development
- [x] Database setup
- [x] Backend implementation
- [x] Frontend implementation
- [x] Integration testing
- [x] Production deployment

---

## 🎉 Final Notes

**Questa specifica rappresenta:**
- ~20 pagine documentazione tecnica
- 14 settimane roadmap dettagliata
- Schema DB completo (8 tabelle)
- API endpoints definiti
- Frontend components specificati
- Testing strategy
- Deployment procedures
- IP protection strategy

**Tutto ciò che serve per sviluppare ASI-GEST da zero a produzione.**

**Buon sviluppo!** 🚀

---

**© 2025 Enrico [Cognome] - ASI-GEST Specification v1.0**
