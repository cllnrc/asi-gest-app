"""
Script per creare la tabella DocUT nel database ASI_GEST
© 2025 Enrico Callegaro
"""

import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.core.database import engine_asi_gest, Base
from app.models.doc_ut import DocUT

def create_docUT_table():
    """Crea solo la tabella DocUT"""
    print("=" * 60)
    print("CREAZIONE TABELLA DocUT")
    print("=" * 60)
    print()

    print(f"📊 Database: ASI_GEST")
    print(f"📋 Tabella: {DocUT.__tablename__}")
    print()

    try:
        # Create only DocUT table
        DocUT.__table__.create(bind=engine_asi_gest, checkfirst=True)
        print("✅ Tabella DocUT creata con successo!")
        print()

        # Show columns
        print("📝 Struttura tabella:")
        for column in DocUT.__table__.columns:
            nullable = "NULL" if column.nullable else "NOT NULL"
            print(f"   - {column.name:30} {str(column.type):20} {nullable}")

        print()
        print("=" * 60)
        print("✅ COMPLETATO")
        print("=" * 60)

        return True

    except Exception as e:
        print(f"❌ ERRORE durante la creazione della tabella:")
        print(f"   {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = create_docUT_table()
    sys.exit(0 if success else 1)
