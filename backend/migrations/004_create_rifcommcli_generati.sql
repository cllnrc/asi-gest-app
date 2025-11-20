/**
 * Migration: Create RIFCOMMCLIGenerati table
 * © 2025 Enrico Callegaro - Tutti i diritti riservati.
 *
 * Tabella per gestire la generazione progressiva di numeri RIFCOMMCLI
 * Elimina la dipendenza da Excel mantenendo ASI-GEST read-only su ASITRON
 */

-- Create RIFCOMMCLIGenerati table
CREATE TABLE RIFCOMMCLIGenerati (
    RIFCOMMCLI VARCHAR(20) PRIMARY KEY,
    DataGenerazione DATETIME NOT NULL DEFAULT GETDATE(),
    UtenteGenerazione VARCHAR(50) NOT NULL,
    StatoUtilizzo VARCHAR(20) NOT NULL DEFAULT 'GENERATO',
    DataUtilizzo DATETIME NULL,
    Note VARCHAR(200) NULL,
    -- Constraint per validare StatoUtilizzo
    CONSTRAINT CHK_StatoUtilizzo CHECK (StatoUtilizzo IN ('GENERATO', 'UTILIZZATO', 'ANNULLATO'))
);

-- Create index for faster queries by status
CREATE INDEX IDX_RIFCOMMCLIGenerati_Stato ON RIFCOMMCLIGenerati(StatoUtilizzo);

-- Create index for faster queries by date
CREATE INDEX IDX_RIFCOMMCLIGenerati_DataGenerazione ON RIFCOMMCLIGenerati(DataGenerazione DESC);
