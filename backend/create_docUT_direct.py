"""
Script diretto per creare tabella DocUT usando pymssql
"""
import pymssql

# Database configuration
DB_CONFIG = {
    'server': '192.168.1.15',
    'user': 'sa',
    'password': 'Nde962005',
    'database': 'ASI_GEST',
    'port': 1433
}

CREATE_TABLE_SQL = """
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DocUT')
BEGIN
    CREATE TABLE DocUT (
        DocUTID INT PRIMARY KEY IDENTITY(1,1),
        CodiceArticolo VARCHAR(50) NOT NULL UNIQUE,
        Descrizione VARCHAR(200) NULL,

        -- SEZIONE UT
        DIBA BIT NOT NULL DEFAULT 0,
        DIBAData DATETIME NULL,
        DIBAUtente VARCHAR(100) NULL,

        ProgrammaMyData BIT NOT NULL DEFAULT 0,
        ProgrammaMyDataData DATETIME NULL,
        ProgrammaMyDataUtente VARCHAR(100) NULL,

        PDM BIT NOT NULL DEFAULT 0,
        PDMData DATETIME NULL,
        PDMUtente VARCHAR(100) NULL,

        FileLaminaTelaio VARCHAR(20) NULL,
        FileLaminaTelaioData DATETIME NULL,
        FileLaminaTelaioUtente VARCHAR(100) NULL,

        -- SEZIONE CLIENTE
        DIBACliente BIT NOT NULL DEFAULT 0,
        PDMCliente BIT NOT NULL DEFAULT 0,
        FilePP BIT NOT NULL DEFAULT 0,

        -- SEZIONE POST PRODUCTION
        FotoPCB BIT NOT NULL DEFAULT 0,
        FotoProdotto BIT NOT NULL DEFAULT 0,
        TempiLavorazione BIT NOT NULL DEFAULT 0,
        FasiLavorazione BIT NOT NULL DEFAULT 0,
        PPUtente BIT NOT NULL DEFAULT 0,
        Campionatura BIT NOT NULL DEFAULT 0,
        DocProduzione BIT NOT NULL DEFAULT 0,

        -- METADATA
        DataInserimento DATETIME NOT NULL DEFAULT GETDATE(),
        DataModifica DATETIME NOT NULL DEFAULT GETDATE(),
        Attivo BIT NOT NULL DEFAULT 1
    )

    CREATE INDEX IX_DocUT_CodiceArticolo ON DocUT(CodiceArticolo)
    CREATE INDEX IX_DocUT_DataInserimento ON DocUT(DataInserimento)
    CREATE INDEX IX_DocUT_Attivo ON DocUT(Attivo)

    PRINT 'Tabella DocUT creata con successo'
END
ELSE
BEGIN
    PRINT 'Tabella DocUT già esistente'
END
"""

def create_table():
    print("=" * 60)
    print("CREAZIONE TABELLA DocUT")
    print("=" * 60)
    print(f"📊 Server: {DB_CONFIG['server']}")
    print(f"📊 Database: {DB_CONFIG['database']}")
    print()

    try:
        # Connect to database
        print("🔌 Connessione al database...")
        conn = pymssql.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # Create table
        print("📋 Creazione tabella DocUT...")
        cursor.execute(CREATE_TABLE_SQL)
        conn.commit()

        # Verify
        cursor.execute("""
            SELECT COUNT(*)
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'DocUT'
        """)
        col_count = cursor.fetchone()[0]

        if col_count > 0:
            print(f"✅ Tabella DocUT creata con successo!")
            print(f"📊 Numero colonne: {col_count}")

            # Show columns
            cursor.execute("""
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = 'DocUT'
                ORDER BY ORDINAL_POSITION
            """)
            print()
            print("📝 Struttura tabella:")
            for row in cursor.fetchall():
                col_name, data_type, nullable = row
                null_str = "NULL" if nullable == 'YES' else "NOT NULL"
                print(f"   {col_name:30} {data_type:20} {null_str}")
        else:
            print("❌ Errore: tabella non creata")
            return False

        cursor.close()
        conn.close()

        print()
        print("=" * 60)
        print("✅ COMPLETATO")
        print("=" * 60)
        return True

    except Exception as e:
        print(f"❌ ERRORE:")
        print(f"   {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    import sys
    success = create_table()
    sys.exit(0 if success else 1)
