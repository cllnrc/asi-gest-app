# ASI-GEST - Logica Operativa

> **Documento di riferimento per le regole di business, flusso operativo e vincoli dell'applicazione**
> Versione: 1.0
> Ultimo aggiornamento: Novembre 2025

---

## 1. Prerequisiti Produzione

### 1.1 Documentazione Tecnica (DocUT) - OBBLIGATORIO

**Prima di avviare una commessa in produzione, devono essere completati i 4 campi obbligatori della sezione UT:**

| Campo | Descrizione | Valori | Tracciabilità |
|-------|-------------|--------|---------------|
| **DIBA** | Distinta Base prodotta da UT | Si/No | Data + Utente |
| **Programma MyData** | Programma per macchine SMD | Si/No | Data + Utente |
| **PDM** | Piano Di Montaggio | Si/No | Data + Utente |
| **File Lamina/Telaio** | File per serigrafia | CLIENTE / TOP / BOTTOM / TOP+BOTTOM | Data + Utente |

**Regola chiave:** Se anche uno solo di questi 4 campi non è completato (valore "No" o non selezionato), la commessa **NON PUO' ANDARE IN PRODUZIONE**.

**Note:**
- I campi data e utente sono visibili on hover e modificabili via modal
- Il campo "File Lamina/Telaio" indica:
  - `CLIENTE` = file fornito dal cliente, niente da fare
  - `TOP` / `BOTTOM` / `TOP+BOTTOM` = file prodotto internamente da Asitron

### 1.2 Sezione Cliente (DocUT)

Campi **informativi** (non bloccanti per la produzione):

| Campo | Descrizione |
|-------|-------------|
| DIBA Cliente | Il cliente ha fornito il file DIBA |
| PDM | Il cliente ha fornito il file PDM |
| File per P&P | Il cliente ha fornito file per Pick&Place |

### 1.3 Sezione Post Production (DocUT)

Campi da compilare **dopo la prima produzione o campionatura**:

- Foto PCB
- Foto Prodotto
- Tempi Lavorazione
- Fasi Lavorazione
- P&P UT
- Campionatura
- Doc. Produzione

---

## 2. Flusso Produttivo

### 2.1 Ciclo di Vita Commessa

```
GESTIONALE ASITRON              ASI-GEST
─────────────────              ──────────

[Ordine Cliente]
       │
       ▼
[Commessa ERP]  ──────────►  [Import Commessa]
                                    │
                                    ▼
                            [Configurazione Commessa]
                            (Quali fasi attivare?)
                                    │
                                    ▼
                            [Verifica DocUT Completo?]
                              /            \
                            NO              SI
                            │               │
                            ▼               ▼
                    [BLOCCATA_DOC]   [Apertura Fasi]
                                           │
                                           ▼
                                    [Produzione Lotti]
                                           │
                                           ▼
                                    [Chiusura Fasi]
                                           │
                                           ▼
                                    [COMPLETATA]
```

### 2.2 Sequenza Fasi Produttive

L'ordine standard delle fasi è:

1. **SMD** - Montaggio componenti SMD (Surface Mount Device)
2. **CONTROLLI** - Controllo visivo, AOI, test
3. **PTH** - Montaggio componenti PTH (Pin Through Hole)
4. **CONFORMAL** - Coating protettivo (se richiesto)
5. **TERZISTA** - Lavorazioni esterne (se richiesto)

**Nota:** Non tutte le commesse passano per tutte le fasi. La configurazione iniziale stabilisce quali fasi sono attive.

### 2.3 Flusso Lotto

```
[Apertura Lotto]
      │
      ├─ Assegnazione Operatore
      ├─ Assegnazione Macchina
      ├─ QtaInput (se applicabile)
      │
      ▼
[Lavorazione]
      │
      ├─ Programma/Feeder (per SMD)
      ├─ Tempo Setup
      │
      ▼
[Chiusura Lotto]
      │
      ├─ QtaOutput
      ├─ QtaScarti
      ├─ Tipo Scarto + Note
      │
      ▼
[Aggiornamento Fase]
      │
      └─ QtaProdotta += QtaOutput
```

---

## 3. Regole di Business

### 3.1 Configurazione Commessa

**Alla creazione di una ConfigCommessa:**

| Flag | Descrizione | Default |
|------|-------------|---------|
| FlagSMD | Fase SMD attiva | Si |
| FlagPTH | Fase PTH attiva | No |
| FlagControlli | Fase Controlli attiva | Si |
| FlagTerzista | Lavorazione terzista | No |

**Vincolo:** `CommessaERPId` deve essere unico (una sola config per commessa).

### 3.2 Apertura Fasi

**Prerequisiti per aprire una fase:**
1. Esiste una ConfigCommessa per la commessa
2. Il flag corrispondente è attivo (es. FlagSMD = 1)
3. **DocUT completo** (tutti e 4 i campi UT spuntati)

**All'apertura:**
- `Stato` = "APERTA"
- `DataApertura` = NOW
- `QtaPrevista` = da ordine ERP (opzionale)

### 3.3 Gestione Lotti

**Creazione Lotto:**
- `Progressivo` = MAX(Progressivo per FaseID) + 1
- `DataInizio` = NOW
- Vincolo UNIQUE su (FaseID, Progressivo)

**Chiusura Lotto - Validazioni:**
1. `QtaOutput >= 0`
2. `QtaScarti >= 0`
3. Se `QtaInput` presente: `QtaOutput + QtaScarti = QtaInput`
4. `DataFine >= DataInizio`

**Tipi di Scarto comuni:**
- Difetto saldatura
- Componente mancante
- Danno meccanico
- Difetto estetico
- Altro

### 3.4 Chiusura Fasi

**Prerequisiti per chiudere una fase:**
1. Tutti i lotti della fase devono essere chiusi (DataFine != NULL)
2. Oppure: chiusura forzata con motivazione

**Alla chiusura:**
- `Stato` = "CHIUSA"
- `DataChiusura` = NOW
- `QtaProdotta` = SUM(QtaOutput di tutti i lotti)

### 3.5 Blocco Documentazione

**Se `BloccataDocumentazione = 1` in ConfigCommessa:**
- La commessa appare come "BLOCCATA_DOC" nel cruscotto
- Non è possibile aprire nuove fasi
- Lotti esistenti possono essere completati

---

## 4. Stati e Transizioni

### 4.1 Stati Fase

```
        ┌─────────┐
        │ APERTA  │  (Stato iniziale)
        └────┬────┘
             │ Primo lotto creato
             ▼
        ┌─────────┐
        │IN_CORSO │
        └────┬────┘
             │ Tutti i lotti chiusi
             ▼
        ┌─────────┐
        │ CHIUSA  │  (Stato finale)
        └─────────┘

        ┌─────────┐
        │BLOCCATA │  (Problemi/attesa materiali)
        └─────────┘
```

**Transizioni valide:**
- APERTA → IN_CORSO (automatico al primo lotto)
- IN_CORSO → CHIUSA (manuale, verifica lotti)
- IN_CORSO → BLOCCATA (manuale, con motivazione)
- BLOCCATA → IN_CORSO (manuale, problema risolto)
- APERTA → BLOCCATA (manuale)

### 4.2 Stati Produzione Commessa (nel cruscotto)

| Stato | Condizione |
|-------|------------|
| DA_CONFIGURARE | Nessuna ConfigCommessa esistente |
| BLOCCATA_DOC | BloccataDocumentazione = 1 |
| AVVIATA | Almeno una fase creata |
| IN_PRODUZIONE | Almeno una fase IN_CORSO |
| COMPLETATA | Tutte le fasi CHIUSE |

---

## 5. Vincoli e Validazioni

### 5.1 Vincoli Database

| Tabella | Vincolo | Descrizione |
|---------|---------|-------------|
| DocUT | CodiceArticolo UNIQUE | Un solo record DocUT per articolo |
| ConfigCommessa | CommessaERPId UNIQUE | Una sola config per commessa |
| Lotti | (FaseID, Progressivo) UNIQUE | Progressivo unico per fase |
| Fasi | Stato IN (...) | Solo stati validi |

### 5.2 Validazioni Applicative

**Creazione Lotto:**
- La fase deve essere APERTA o IN_CORSO
- OperatoreID deve essere di un utente attivo
- MacchinaID deve essere di una macchina attiva e del reparto corretto

**Modifica Lotto:**
- Non modificabile se DataFine != NULL (lotto chiuso)
- Eccezione: admin può riaprire un lotto

**Chiusura Fase:**
- Almeno un lotto deve esistere
- Tutti i lotti devono essere chiusi

### 5.3 Calcoli Automatici

**Efficienza Fase:**
```
PercScarti = (TotScarti / (TotOutput + TotScarti)) * 100
```

**Avanzamento Commessa:**
```
PercAvanzamento = (QtaProdotta / QtaOrdine) * 100
```

---

## 6. Integrazioni

### 6.1 Lettura da ASITRON (Gestionale)

**Dati letti (read-only):**
- Commesse aperte (TESTEORDINIPROD)
- Dettaglio righe ordine (RIGHEORDPROD)
- Anagrafica articoli (ANAGRAFICAARTICOLI)
- Anagrafica clienti (ANAGRAFICACF)

**Link logico:** `ConfigCommessa.CommessaERPId` → `TESTEORDINIPROD.PROGRESSIVO`

### 6.2 RIFCOMMCLI

**Generazione riferimento commessa cliente:**
- Formato: da definire (es. ANNO-CLIENTE-PROGRESSIVO)
- Deve essere unico nel sistema
- Riconciliabile con ERP

---

## 7. Regole Operative Specifiche

### 7.1 Prima Produzione di un Articolo

1. Verificare che esista DocUT per l'articolo
2. Completare i 4 campi obbligatori UT
3. Dopo la prima produzione, compilare la sezione "Post Production"

### 7.2 Gestione Scarti

- Ogni scarto deve avere un TipoScarto
- Note obbligatorie se scarto > 5% della produzione
- Scarti eccessivi (>10%) generano alert

### 7.3 Cambio Operatore/Macchina

- Un lotto può cambiare operatore durante la lavorazione
- Tracciare nel campo Note chi ha fatto cosa
- Per tracciabilità completa: creare nuovo lotto

### 7.4 Gestione Urgenze

- Flag "Urgente" sulla ConfigCommessa (da implementare)
- Fasi urgenti hanno priorità nel cruscotto
- Notifica operatori (da implementare)

---

## 8. Dashboard e KPI

### 8.1 KPI Principali

| KPI | Calcolo | Target |
|-----|---------|--------|
| Lotti completati/settimana | COUNT lotti con DataFine ultima settimana | >50 |
| % Scarti media | AVG(QtaScarti/QtaOutput) | <3% |
| Tempo medio setup | AVG(TempoSetupMin) per tipo fase | <30 min |
| Commesse in ritardo | COUNT commesse con DataConsegna < TODAY e non COMPLETATE | 0 |

### 8.2 Viste Cruscotto

1. **Overview** - Stato generale produzione
2. **Per Reparto** - SMD, PTH, Controlli
3. **Per Operatore** - Performance individuali
4. **Per Cliente** - Commesse raggruppate

---

## 9. TODO / Punti Aperti

> Sezione per annotare decisioni da prendere o chiarimenti necessari

- [ ] Definire formato esatto RIFCOMMCLI
- [ ] Definire workflow notifiche per urgenze
- [ ] Chiarire se serve tracciabilità materiali (link con ASI-TRACE)
- [ ] Definire policy retention log eventi
- [ ] Aggiungere altri tipi di scarto specifici

---

## 10. Storico Modifiche

| Data | Versione | Modifica | Autore |
|------|----------|----------|--------|
| Nov 2025 | 1.0 | Creazione documento | Claude (Sviluppatore) |

---

**Nota:** Questo documento è vivo e va aggiornato man mano che emergono nuove regole o chiarimenti. Entrambi (sviluppatore e supervisore) possono modificarlo.
