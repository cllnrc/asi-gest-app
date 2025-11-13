"""
Script di test per diagnosticare problemi backend su Windows
© 2025 Enrico Callegaro

Esegui questo script per verificare che il backend possa avviarsi correttamente.
"""

import sys
import traceback

def test_imports():
    """Test that all required modules can be imported"""
    print("=" * 70)
    print("TEST 1: Verifica dipendenze")
    print("=" * 70)

    imports_to_test = [
        ('fastapi', 'FastAPI'),
        ('sqlalchemy', 'create_engine'),
        ('pymssql', None),
        ('pydantic', 'BaseModel'),
        ('uvicorn', None),
    ]

    all_ok = True
    for module_name, class_name in imports_to_test:
        try:
            if class_name:
                exec(f'from {module_name} import {class_name}')
            else:
                exec(f'import {module_name}')
            print(f'✅ {module_name}')
        except ImportError as e:
            print(f'❌ {module_name}: MANCANTE - {e}')
            all_ok = False

    return all_ok

def test_app_import():
    """Test that the app can be imported"""
    print("\n" + "=" * 70)
    print("TEST 2: Import app.main")
    print("=" * 70)

    try:
        from app.main import app
        print(f'✅ app.main imported successfully')
        print(f'✅ Routes registered: {len(app.routes)}')
        return True
    except Exception as e:
        print(f'❌ ERRORE nell\'import di app.main:')
        print(f'   {e}')
        traceback.print_exc()
        return False

def test_database_connection():
    """Test database connection"""
    print("\n" + "=" * 70)
    print("TEST 3: Connessione database")
    print("=" * 70)

    try:
        import pymssql

        # ASI_GEST
        print("Tentativo connessione ASI_GEST...")
        conn = pymssql.connect(
            server='192.168.1.15',
            user='sa',
            password='Nde962005',
            database='ASI_GEST',
            port=1433,
            timeout=5
        )
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM Lotti")
        count = cursor.fetchone()[0]
        print(f'✅ ASI_GEST connesso: {count} lotti nel database')
        conn.close()

        # ASITRON
        print("Tentativo connessione ASITRON...")
        conn = pymssql.connect(
            server='192.168.1.15',
            user='sa',
            password='Nde962005',
            database='ASITRON',
            port=1433,
            timeout=5
        )
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM TESTEORDINIPROD")
        count = cursor.fetchone()[0]
        print(f'✅ ASITRON connesso: {count} commesse nel database')
        conn.close()

        return True

    except Exception as e:
        print(f'❌ ERRORE connessione database:')
        print(f'   {e}')
        traceback.print_exc()
        return False

def main():
    """Run all tests"""
    print("\n")
    print("=" * 70)
    print("DIAGNOSTICA BACKEND ASI-GEST")
    print("=" * 70)
    print()

    test1 = test_imports()
    test2 = test_app_import() if test1 else False
    test3 = test_database_connection() if test1 else False

    print("\n" + "=" * 70)
    print("RISULTATO")
    print("=" * 70)

    if test1 and test2 and test3:
        print("✅ TUTTI I TEST PASSATI - Il backend dovrebbe funzionare")
        print("\nSe il backend non si avvia comunque:")
        print("1. Controlla la finestra CMD del backend per errori")
        print("2. Verifica che la porta 8000 non sia già in uso")
        print("3. Prova ad avviare manualmente: venv_windows\\Scripts\\activate && python -m uvicorn app.main:app")
        return 0
    else:
        print("❌ ALCUNI TEST FALLITI - Vedi errori sopra")
        if not test1:
            print("\nSOLUZIONE: Reinstalla le dipendenze:")
            print("   venv_windows\\Scripts\\activate")
            print("   pip install -r requirements.txt")
        return 1

if __name__ == '__main__':
    sys.exit(main())
