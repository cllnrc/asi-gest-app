"""
Script per creare il database ASI_GEST su SQL Server
© 2025 Enrico Callegaro - Tutti i diritti riservati.
"""

import pymssql
from app.core.config import settings

def create_database():
    """Crea il database ASI_GEST se non esiste"""
    print("=== Creazione Database ASI_GEST ===\n")

    # Connessione al server SQL (senza specificare database)
    try:
        conn = pymssql.connect(
            server=settings.DB_ASI_GEST_SERVER,
            port=settings.DB_ASI_GEST_PORT,
            user=settings.DB_ASI_GEST_USER,
            password=settings.DB_ASI_GEST_PASSWORD,
            database='master'  # Connessione al database master
        )
        cursor = conn.cursor()

        # Verifica se il database esiste già
        cursor.execute(f"""
            SELECT database_id
            FROM sys.databases
            WHERE name = '{settings.DB_ASI_GEST_DATABASE}'
        """)

        if cursor.fetchone():
            print(f"✓ Database '{settings.DB_ASI_GEST_DATABASE}' già esistente")
        else:
            # Crea il database
            print(f"Creazione database '{settings.DB_ASI_GEST_DATABASE}'...")
            cursor.execute(f"CREATE DATABASE {settings.DB_ASI_GEST_DATABASE}")
            conn.commit()
            print(f"✓ Database '{settings.DB_ASI_GEST_DATABASE}' creato con successo")

        cursor.close()
        conn.close()
        return True

    except Exception as e:
        print(f"✗ Errore durante la creazione del database: {e}")
        return False


def create_tables():
    """Crea tutte le tabelle nel database ASI_GEST"""
    print("\n=== Creazione Tabelle ===\n")

    try:
        # Connessione al database ASI_GEST
        conn = pymssql.connect(
            server=settings.DB_ASI_GEST_SERVER,
            port=settings.DB_ASI_GEST_PORT,
            user=settings.DB_ASI_GEST_USER,
            password=settings.DB_ASI_GEST_PASSWORD,
            database=settings.DB_ASI_GEST_DATABASE
        )
        cursor = conn.cursor()

        # Tabella FaseTipo
        print("Creazione tabella FaseTipo...")
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FaseTipo')
            BEGIN
                CREATE TABLE FaseTipo (
                    FaseTipoID INT PRIMARY KEY IDENTITY(1,1),
                    Nome NVARCHAR(100) NOT NULL UNIQUE,
                    Descrizione NVARCHAR(500),
                    Ordine INT NOT NULL DEFAULT 0,
                    Attivo BIT NOT NULL DEFAULT 1,
                    DataCreazione DATETIME2 NOT NULL DEFAULT GETDATE(),
                    DataModifica DATETIME2 NOT NULL DEFAULT GETDATE()
                )
            END
        """)
        conn.commit()
        print("✓ Tabella FaseTipo creata")

        # Tabella Utente
        print("Creazione tabella Utente...")
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Utente')
            BEGIN
                CREATE TABLE Utente (
                    UtenteID INT PRIMARY KEY IDENTITY(1,1),
                    Nome NVARCHAR(100) NOT NULL,
                    Cognome NVARCHAR(100) NOT NULL,
                    Matricola NVARCHAR(50) UNIQUE,
                    Email NVARCHAR(255),
                    Ruolo NVARCHAR(50),
                    Attivo BIT NOT NULL DEFAULT 1,
                    DataCreazione DATETIME2 NOT NULL DEFAULT GETDATE(),
                    DataModifica DATETIME2 NOT NULL DEFAULT GETDATE()
                )
            END
        """)
        conn.commit()
        print("✓ Tabella Utente creata")

        # Tabella Macchina
        print("Creazione tabella Macchina...")
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Macchina')
            BEGIN
                CREATE TABLE Macchina (
                    MacchinaID INT PRIMARY KEY IDENTITY(1,1),
                    Nome NVARCHAR(100) NOT NULL UNIQUE,
                    Tipo NVARCHAR(50),
                    Descrizione NVARCHAR(500),
                    Attiva BIT NOT NULL DEFAULT 1,
                    DataCreazione DATETIME2 NOT NULL DEFAULT GETDATE(),
                    DataModifica DATETIME2 NOT NULL DEFAULT GETDATE()
                )
            END
        """)
        conn.commit()
        print("✓ Tabella Macchina creata")

        # Tabella ConfigCommessa
        print("Creazione tabella ConfigCommessa...")
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ConfigCommessa')
            BEGIN
                CREATE TABLE ConfigCommessa (
                    ConfigCommessaID INT PRIMARY KEY IDENTITY(1,1),
                    NumeroCommessa NVARCHAR(50) NOT NULL,
                    CodiceArticolo NVARCHAR(100),
                    Descrizione NVARCHAR(500),
                    Quantita INT,
                    Attivo BIT NOT NULL DEFAULT 1,
                    DataCreazione DATETIME2 NOT NULL DEFAULT GETDATE(),
                    DataModifica DATETIME2 NOT NULL DEFAULT GETDATE()
                )
            END
        """)
        conn.commit()
        print("✓ Tabella ConfigCommessa creata")

        # Tabella Lotto
        print("Creazione tabella Lotto...")
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Lotto')
            BEGIN
                CREATE TABLE Lotto (
                    LottoID INT PRIMARY KEY IDENTITY(1,1),
                    ProgressivoGiornaliero INT NOT NULL,
                    DataCreazione DATETIME2 NOT NULL DEFAULT GETDATE(),
                    ConfigCommessaID INT,
                    DataChiusura DATETIME2,
                    Stato NVARCHAR(20) NOT NULL DEFAULT 'APERTO',
                    CONSTRAINT FK_Lotto_ConfigCommessa FOREIGN KEY (ConfigCommessaID)
                        REFERENCES ConfigCommessa(ConfigCommessaID)
                )
            END
        """)
        conn.commit()
        print("✓ Tabella Lotto creata")

        # Tabella Fase
        print("Creazione tabella Fase...")
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Fase')
            BEGIN
                CREATE TABLE Fase (
                    FaseID INT PRIMARY KEY IDENTITY(1,1),
                    LottoID INT NOT NULL,
                    FaseTipoID INT NOT NULL,
                    MacchinaID INT,
                    UtenteID INT,
                    DataInizio DATETIME2 NOT NULL DEFAULT GETDATE(),
                    DataFine DATETIME2,
                    Quantita INT,
                    Note NVARCHAR(MAX),
                    ConfigCommessaID INT,
                    NumeroCommessa NVARCHAR(50),
                    CONSTRAINT FK_Fase_Lotto FOREIGN KEY (LottoID)
                        REFERENCES Lotto(LottoID),
                    CONSTRAINT FK_Fase_FaseTipo FOREIGN KEY (FaseTipoID)
                        REFERENCES FaseTipo(FaseTipoID),
                    CONSTRAINT FK_Fase_Macchina FOREIGN KEY (MacchinaID)
                        REFERENCES Macchina(MacchinaID),
                    CONSTRAINT FK_Fase_Utente FOREIGN KEY (UtenteID)
                        REFERENCES Utente(UtenteID),
                    CONSTRAINT FK_Fase_ConfigCommessa FOREIGN KEY (ConfigCommessaID)
                        REFERENCES ConfigCommessa(ConfigCommessaID)
                )
            END
        """)
        conn.commit()
        print("✓ Tabella Fase creata")

        # Tabella DocumentoTecnico
        print("Creazione tabella DocumentoTecnico...")
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DocumentoTecnico')
            BEGIN
                CREATE TABLE DocumentoTecnico (
                    DocumentoID INT PRIMARY KEY IDENTITY(1,1),
                    ConfigCommessaID INT NOT NULL,
                    TipoDocumento NVARCHAR(50) NOT NULL,
                    NomeFile NVARCHAR(255) NOT NULL,
                    PathFile NVARCHAR(500) NOT NULL,
                    Versione NVARCHAR(20),
                    DataCaricamento DATETIME2 NOT NULL DEFAULT GETDATE(),
                    CONSTRAINT FK_Documento_ConfigCommessa FOREIGN KEY (ConfigCommessaID)
                        REFERENCES ConfigCommessa(ConfigCommessaID)
                )
            END
        """)
        conn.commit()
        print("✓ Tabella DocumentoTecnico creata")

        # Tabella LogEvento
        print("Creazione tabella LogEvento...")
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LogEvento')
            BEGIN
                CREATE TABLE LogEvento (
                    LogID INT PRIMARY KEY IDENTITY(1,1),
                    Timestamp DATETIME2 NOT NULL DEFAULT GETDATE(),
                    TipoEvento NVARCHAR(50) NOT NULL,
                    Entita NVARCHAR(50),
                    EntitaID INT,
                    UtenteID INT,
                    Descrizione NVARCHAR(MAX),
                    CONSTRAINT FK_Log_Utente FOREIGN KEY (UtenteID)
                        REFERENCES Utente(UtenteID)
                )
            END
        """)
        conn.commit()
        print("✓ Tabella LogEvento creata")

        cursor.close()
        conn.close()
        print("\n✓ Tutte le tabelle sono state create con successo!")
        return True

    except Exception as e:
        print(f"\n✗ Errore durante la creazione delle tabelle: {e}")
        return False


def insert_initial_data():
    """Inserisce dati iniziali nelle tabelle"""
    print("\n=== Inserimento Dati Iniziali ===\n")

    try:
        conn = pymssql.connect(
            server=settings.DB_ASI_GEST_SERVER,
            port=settings.DB_ASI_GEST_PORT,
            user=settings.DB_ASI_GEST_USER,
            password=settings.DB_ASI_GEST_PASSWORD,
            database=settings.DB_ASI_GEST_DATABASE
        )
        cursor = conn.cursor()

        # Inserisci tipi di fase standard
        print("Inserimento FaseTipo...")
        fasi_tipo = [
            ('SMD - Serigrafia', 'Applicazione pasta saldante tramite serigrafia', 1),
            ('SMD - Pick & Place', 'Posizionamento componenti SMD', 2),
            ('SMD - Reflow', 'Saldatura in forno reflow', 3),
            ('PTH - Inserimento', 'Inserimento manuale componenti PTH', 4),
            ('PTH - Saldatura', 'Saldatura a stagno manuale o onda', 5),
            ('Collaudo Funzionale', 'Test funzionale della scheda', 6),
            ('Collaudo Visivo', 'Ispezione visiva qualità', 7),
        ]

        for nome, desc, ordine in fasi_tipo:
            cursor.execute("""
                IF NOT EXISTS (SELECT 1 FROM FaseTipo WHERE Nome = %s)
                BEGIN
                    INSERT INTO FaseTipo (Nome, Descrizione, Ordine, Attivo)
                    VALUES (%s, %s, %d, 1)
                END
            """, (nome, nome, desc, ordine))
        conn.commit()
        print("✓ FaseTipo inseriti")

        # Inserisci macchine di esempio
        print("Inserimento Macchine...")
        macchine = [
            ('MYDATA MY100', 'Pick & Place', 'Macchina Pick & Place MYDATA MY100'),
            ('MYDATA MY200', 'Pick & Place', 'Macchina Pick & Place MYDATA MY200'),
            ('Forno Reflow 1', 'Reflow', 'Forno di rifusione principale'),
            ('Saldatrice Manuale 1', 'Saldatura', 'Postazione saldatura manuale'),
        ]

        for nome, tipo, desc in macchine:
            cursor.execute("""
                IF NOT EXISTS (SELECT 1 FROM Macchina WHERE Nome = %s)
                BEGIN
                    INSERT INTO Macchina (Nome, Tipo, Descrizione, Attiva)
                    VALUES (%s, %s, %s, 1)
                END
            """, (nome, nome, tipo, desc))
        conn.commit()
        print("✓ Macchine inserite")

        # Inserisci utente di esempio
        print("Inserimento Utente di test...")
        cursor.execute("""
            IF NOT EXISTS (SELECT 1 FROM Utente WHERE Matricola = 'ADMIN')
            BEGIN
                INSERT INTO Utente (Nome, Cognome, Matricola, Email, Ruolo, Attivo)
                VALUES ('Admin', 'Sistema', 'ADMIN', 'admin@asitron.it', 'Amministratore', 1)
            END
        """)
        conn.commit()
        print("✓ Utente Admin creato")

        cursor.close()
        conn.close()
        print("\n✓ Dati iniziali inseriti con successo!")
        return True

    except Exception as e:
        print(f"\n✗ Errore durante l'inserimento dei dati: {e}")
        return False


if __name__ == "__main__":
    print("""
╔════════════════════════════════════════════════╗
║   ASI-GEST Database Setup                      ║
║   © 2025 Enrico Callegaro                      ║
╚════════════════════════════════════════════════╝
""")

    # Step 1: Crea database
    if not create_database():
        print("\n✗ Setup fallito durante la creazione del database")
        exit(1)

    # Step 2: Crea tabelle
    if not create_tables():
        print("\n✗ Setup fallito durante la creazione delle tabelle")
        exit(1)

    # Step 3: Inserisci dati iniziali
    if not insert_initial_data():
        print("\n✗ Setup fallito durante l'inserimento dei dati")
        exit(1)

    print("""
╔════════════════════════════════════════════════╗
║   ✓ Setup Completato con Successo!            ║
║                                                ║
║   Database: ASI_GEST                           ║
║   Server: {}:{}
║                                                ║
║   Puoi ora avviare il server FastAPI          ║
╚════════════════════════════════════════════════╝
""".format(settings.DB_ASI_GEST_SERVER, settings.DB_ASI_GEST_PORT))
