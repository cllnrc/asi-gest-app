"""
Script to run SQL migrations on ASI_GEST database
© 2025 Enrico Callegaro - Tutti i diritti riservati.
"""

import pymssql
import os
from pathlib import Path

# Read connection details from .env
DB_SERVER = "192.168.1.15"
DB_PORT = 1433
DB_DATABASE = "ASI_GEST"
DB_USER = "sa"
DB_PASSWORD = "Nde962005"

def run_migration(sql_file: str):
    """Run a SQL migration file"""
    print(f"🔄 Running migration: {sql_file}")

    # Read SQL file
    sql_path = Path(__file__).parent / "migrations" / sql_file
    with open(sql_path, 'r', encoding='utf-8') as f:
        sql_content = f.read()

    # Connect to database
    try:
        conn = pymssql.connect(
            server=DB_SERVER,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_DATABASE
        )

        cursor = conn.cursor()

        # Execute SQL
        # Split by GO statements (SQL Server batch separator)
        batches = [batch.strip() for batch in sql_content.split('GO') if batch.strip()]

        for batch in batches:
            if batch:
                cursor.execute(batch)

        conn.commit()
        cursor.close()
        conn.close()

        print(f"✅ Migration completed successfully: {sql_file}")

    except Exception as e:
        print(f"❌ Error running migration: {e}")
        raise

if __name__ == "__main__":
    # Run the RIFCOMMCLI migration
    run_migration("004_create_rifcommcli_generati.sql")
