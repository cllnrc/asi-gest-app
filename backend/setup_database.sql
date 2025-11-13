-- =============================================
-- ASI-GEST Database Setup Script
-- © 2025 Enrico Callegaro - Tutti i diritti riservati.
-- =============================================

-- Step 1: Create Database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'ASI_GEST')
BEGIN
    CREATE DATABASE ASI_GEST
    PRINT '✓ Database ASI_GEST created'
END
GO

USE ASI_GEST
GO

-- Step 2: Set Database Options
ALTER DATABASE ASI_GEST SET RECOVERY SIMPLE
GO

-- Step 3: Create Tables
-- =============================================

-- 3.1 FaseTipo - Catalogo Tipi Fase
CREATE TABLE dbo.FaseTipo (
    FaseTipoID INT IDENTITY(1,1) PRIMARY KEY,
    Codice VARCHAR(20) NOT NULL UNIQUE,
    Descrizione VARCHAR(100) NOT NULL,
    Ordine INT NOT NULL DEFAULT 0,
    Attivo BIT NOT NULL DEFAULT 1,
    CONSTRAINT CHK_FaseTipo_Codice CHECK (Codice = UPPER(Codice))
);

-- 3.2 Utenti - Operatori
CREATE TABLE dbo.Utenti (
    UtenteID INT IDENTITY(1,1) PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    NomeCompleto VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NULL,
    Reparto VARCHAR(50) NULL,
    Ruolo VARCHAR(50) NULL,
    Attivo BIT NOT NULL DEFAULT 1,
    DataCreazione DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT CHK_Utenti_Email CHECK (Email LIKE '%@%' OR Email IS NULL)
);

CREATE INDEX IX_Utenti_Username ON dbo.Utenti(Username) WHERE Attivo = 1;
CREATE INDEX IX_Utenti_Reparto ON dbo.Utenti(Reparto) WHERE Attivo = 1;

-- 3.3 Macchine - Equipment
CREATE TABLE dbo.Macchine (
    MacchinaID INT IDENTITY(1,1) PRIMARY KEY,
    Codice VARCHAR(50) NOT NULL UNIQUE,
    Descrizione VARCHAR(100) NULL,
    Reparto VARCHAR(50) NOT NULL,
    Tipo VARCHAR(50) NULL,
    Attiva BIT NOT NULL DEFAULT 1,
    Note NVARCHAR(MAX) NULL,
    CONSTRAINT CHK_Macchine_Reparto CHECK (Reparto IN ('SMD', 'PTH', 'CONTROLLI', 'MAG'))
);

CREATE INDEX IX_Macchine_Reparto ON dbo.Macchine(Reparto) WHERE Attiva = 1;

-- 3.4 ConfigCommessa - Configurazione Tecnica
CREATE TABLE dbo.ConfigCommessa (
    ConfigID INT IDENTITY(1,1) PRIMARY KEY,
    CommessaERPId INT NOT NULL UNIQUE,

    FlagSMD BIT NOT NULL DEFAULT 1,
    FlagPTH BIT NOT NULL DEFAULT 0,
    FlagControlli BIT NOT NULL DEFAULT 1,
    FlagTerzista BIT NOT NULL DEFAULT 0,

    DIBA VARCHAR(100) NULL,
    Revisione VARCHAR(50) NULL,

    BloccataDocumentazione BIT NOT NULL DEFAULT 0,

    Note NVARCHAR(MAX) NULL,
    ConfigJSON NVARCHAR(MAX) NULL,

    DataCreazione DATETIME2 NOT NULL DEFAULT GETDATE(),
    ModificatoDa VARCHAR(100) NULL,
    DataUltimaModifica DATETIME2 NULL
);

CREATE INDEX IX_ConfigCommessa_Bloccata
    ON dbo.ConfigCommessa(BloccataDocumentazione)
    WHERE BloccataDocumentazione = 1;

-- 3.5 Fasi - Istanze Fasi per Commessa
CREATE TABLE dbo.Fasi (
    FaseID INT IDENTITY(1,1) PRIMARY KEY,
    CommessaERPId INT NOT NULL,
    FaseTipoID INT NOT NULL,

    Stato VARCHAR(20) NOT NULL DEFAULT 'APERTA',

    DataApertura DATETIME2 NOT NULL DEFAULT GETDATE(),
    DataChiusura DATETIME2 NULL,

    QtaPrevista INT NULL,
    QtaProdotta INT NULL,
    QtaResidua INT NULL,

    Note NVARCHAR(MAX) NULL,

    CONSTRAINT FK_Fasi_FaseTipo FOREIGN KEY (FaseTipoID)
        REFERENCES dbo.FaseTipo(FaseTipoID),
    CONSTRAINT CHK_Fasi_Stato CHECK (Stato IN ('APERTA', 'IN_CORSO', 'CHIUSA', 'BLOCCATA'))
);

CREATE INDEX IX_Fasi_Commessa ON dbo.Fasi(CommessaERPId, FaseTipoID);
CREATE INDEX IX_Fasi_Stato ON dbo.Fasi(Stato) WHERE Stato IN ('APERTA', 'IN_CORSO');

-- 3.6 Lotti - Produzione Dettagliata
CREATE TABLE dbo.Lotti (
    LottoID INT IDENTITY(1,1) PRIMARY KEY,
    FaseID INT NOT NULL,

    Progressivo INT NOT NULL,

    DataInizio DATETIME2 NOT NULL,
    DataFine DATETIME2 NULL,

    QtaInput INT NULL,
    QtaOutput INT NOT NULL,
    QtaScarti INT NOT NULL DEFAULT 0,

    OperatoreID INT NULL,
    MacchinaID INT NULL,

    ProgrammaFeeder VARCHAR(100) NULL,
    TempoSetupMin INT NULL,

    TipoScarto VARCHAR(50) NULL,
    NoteScarti NVARCHAR(500) NULL,

    Note NVARCHAR(MAX) NULL,

    CONSTRAINT FK_Lotti_Fase FOREIGN KEY (FaseID)
        REFERENCES dbo.Fasi(FaseID),
    CONSTRAINT FK_Lotti_Operatore FOREIGN KEY (OperatoreID)
        REFERENCES dbo.Utenti(UtenteID),
    CONSTRAINT FK_Lotti_Macchina FOREIGN KEY (MacchinaID)
        REFERENCES dbo.Macchine(MacchinaID),
    CONSTRAINT CHK_Lotti_QtaOutput CHECK (QtaOutput >= 0),
    CONSTRAINT CHK_Lotti_QtaScarti CHECK (QtaScarti >= 0),
    CONSTRAINT UQ_Lotti_Fase_Progressivo UNIQUE (FaseID, Progressivo)
);

CREATE INDEX IX_Lotti_Fase ON dbo.Lotti(FaseID, Progressivo);
CREATE INDEX IX_Lotti_DataInizio ON dbo.Lotti(DataInizio DESC);
CREATE INDEX IX_Lotti_Operatore ON dbo.Lotti(OperatoreID) WHERE OperatoreID IS NOT NULL;

-- 3.7 DocumentiTecnici - Gestione Documentazione
CREATE TABLE dbo.DocumentiTecnici (
    DocID INT IDENTITY(1,1) PRIMARY KEY,
    ArticoloERPId INT NOT NULL,

    TipoDoc VARCHAR(50) NOT NULL,

    Revisione VARCHAR(20) NOT NULL,

    FilePath VARCHAR(500) NULL,
    FileHash VARCHAR(64) NULL,
    FileSize BIGINT NULL,

    Stato VARCHAR(20) NOT NULL DEFAULT 'ATTIVO',

    DataScadenza DATE NULL,

    DataCaricamento DATETIME2 NOT NULL DEFAULT GETDATE(),
    CaricatoDa VARCHAR(100) NULL,

    Note NVARCHAR(MAX) NULL,

    CONSTRAINT UQ_DocTecnici_Articolo_Tipo_Rev
        UNIQUE(ArticoloERPId, TipoDoc, Revisione),
    CONSTRAINT CHK_DocTecnici_Stato CHECK (Stato IN ('ATTIVO', 'SUPERATO'))
);

CREATE INDEX IX_DocTecnici_Articolo_Attivi
    ON dbo.DocumentiTecnici(ArticoloERPId, TipoDoc, Stato)
    WHERE Stato = 'ATTIVO';

CREATE INDEX IX_DocTecnici_Scadenza
    ON dbo.DocumentiTecnici(DataScadenza)
    WHERE DataScadenza IS NOT NULL AND Stato = 'ATTIVO';

-- 3.8 LogEventi - Audit Trail
CREATE TABLE dbo.LogEventi (
    LogID INT IDENTITY(1,1) PRIMARY KEY,

    DataEvento DATETIME2 NOT NULL DEFAULT GETDATE(),

    Tipo VARCHAR(50) NOT NULL,

    Entita VARCHAR(50) NOT NULL,
    EntitaID INT NULL,

    Utente VARCHAR(100) NOT NULL,

    Dettagli NVARCHAR(MAX) NULL,

    Severity VARCHAR(20) NULL
);

CREATE INDEX IX_LogEventi_Data ON dbo.LogEventi(DataEvento DESC);
CREATE INDEX IX_LogEventi_Tipo ON dbo.LogEventi(Tipo, DataEvento DESC);
CREATE INDEX IX_LogEventi_Entita ON dbo.LogEventi(Entita, EntitaID);

PRINT '✓ All tables created'
GO

-- Step 4: Seed Initial Data
-- =============================================

-- FaseTipo seed
INSERT INTO dbo.FaseTipo (Codice, Descrizione, Ordine) VALUES
('SMD', 'Montaggio SMD', 10),
('CONTROLLI', 'Controlli e AOI', 20),
('PTH', 'Montaggio PTH Tradizionale', 30),
('MAG', 'Gestione Magazzino', 40),
('TERZISTA', 'Lavorazione Terzista', 50);

PRINT '✓ FaseTipo seed data inserted'

-- Utenti test
INSERT INTO dbo.Utenti (Username, NomeCompleto, Email, Reparto, Ruolo) VALUES
('admin', 'Amministratore Sistema', 'admin@asitron.it', 'ADMIN', 'ADMIN'),
('operatore.smd1', 'Mario Rossi', 'mario.rossi@asitron.it', 'SMD', 'OPERATORE'),
('operatore.smd2', 'Luigi Verdi', 'luigi.verdi@asitron.it', 'SMD', 'OPERATORE'),
('operatore.pth1', 'Anna Bianchi', 'anna.bianchi@asitron.it', 'PTH', 'OPERATORE'),
('operatore.qc1', 'Paolo Neri', 'paolo.neri@asitron.it', 'CONTROLLI', 'OPERATORE');

PRINT '✓ Test users inserted'

-- Macchine test
INSERT INTO dbo.Macchine (Codice, Descrizione, Reparto, Tipo) VALUES
('SMD-001', 'Pick & Place Principale', 'SMD', 'PICK_PLACE'),
('SMD-002', 'Pick & Place Secondario', 'SMD', 'PICK_PLACE'),
('AOI-001', 'AOI Controllo Ottico', 'CONTROLLI', 'AOI'),
('PTH-001', 'Saldatrice Wave Soldering', 'PTH', 'WAVE');

PRINT '✓ Test machines inserted'
GO

-- Step 5: Create View Avanzamento
-- =============================================

CREATE VIEW dbo.vw_AvanzamentoCommesse AS
SELECT
    c.ID as CommessaERPId,
    c.ESERCIZIO,
    c.NUMEROCOM,
    c.RIFCOMMCLI,
    c.CODART,
    c.DESART,
    c.QTA as QtaOrdine,
    c.DATACONSEGNA,
    c.STATOCOMMESSA as StatoERP,

    cfg.DIBA,
    cfg.Revisione,
    cfg.BloccataDocumentazione,

    ISNULL((SELECT SUM(l.QtaOutput)
            FROM dbo.Lotti l
            JOIN dbo.Fasi f ON f.FaseID = l.FaseID
            WHERE f.CommessaERPId = c.ID
              AND f.FaseTipoID = (SELECT FaseTipoID FROM dbo.FaseTipo WHERE Codice = 'SMD')
    ), 0) as QtaSMD,

    ISNULL((SELECT SUM(l.QtaScarti)
            FROM dbo.Lotti l
            JOIN dbo.Fasi f ON f.FaseID = l.FaseID
            WHERE f.CommessaERPId = c.ID
              AND f.FaseTipoID = (SELECT FaseTipoID FROM dbo.FaseTipo WHERE Codice = 'SMD')
    ), 0) as ScartiSMD,

    ISNULL((SELECT SUM(l.QtaOutput)
            FROM dbo.Lotti l
            JOIN dbo.Fasi f ON f.FaseID = l.FaseID
            WHERE f.CommessaERPId = c.ID
              AND f.FaseTipoID = (SELECT FaseTipoID FROM dbo.FaseTipo WHERE Codice = 'CONTROLLI')
    ), 0) as QtaControlli,

    ISNULL((SELECT SUM(l.QtaOutput)
            FROM dbo.Lotti l
            JOIN dbo.Fasi f ON f.FaseID = l.FaseID
            WHERE f.CommessaERPId = c.ID
              AND f.FaseTipoID = (SELECT FaseTipoID FROM dbo.FaseTipo WHERE Codice = 'PTH')
    ), 0) as QtaPTH,

    CASE
        WHEN cfg.BloccataDocumentazione = 1 THEN 'BLOCCATA_DOC'
        WHEN EXISTS(SELECT 1 FROM dbo.Fasi WHERE CommessaERPId = c.ID AND Stato = 'IN_CORSO')
            THEN 'IN_PRODUZIONE'
        WHEN EXISTS(SELECT 1 FROM dbo.Fasi WHERE CommessaERPId = c.ID AND Stato = 'CHIUSA')
            AND NOT EXISTS(SELECT 1 FROM dbo.Fasi WHERE CommessaERPId = c.ID AND Stato IN ('APERTA','IN_CORSO'))
            THEN 'COMPLETATA'
        WHEN EXISTS(SELECT 1 FROM dbo.Fasi WHERE CommessaERPId = c.ID)
            THEN 'AVVIATA'
        ELSE 'DA_CONFIGURARE'
    END as StatoProduzione,

    (SELECT MAX(l.DataFine)
     FROM dbo.Lotti l
     JOIN dbo.Fasi f ON f.FaseID = l.FaseID
     WHERE f.CommessaERPId = c.ID) as UltimoAggiornamento

FROM [ASITRON].dbo.COMMESSE c
LEFT JOIN dbo.ConfigCommessa cfg ON cfg.CommessaERPId = c.ID
WHERE c.STATOCOMMESSA NOT IN ('A', 'C');

PRINT '✓ View vw_AvanzamentoCommesse created'
GO

PRINT '================================================'
PRINT '✅ ASI-GEST Database Setup Completed Successfully!'
PRINT '================================================'
PRINT 'Database: ASI_GEST'
PRINT 'Tables: 8'
PRINT 'Views: 1'
PRINT 'Seed data: FaseTipo (5), Utenti (5), Macchine (4)'
PRINT '================================================'
