"""
Test script to check if routes can be imported
"""
import sys
import traceback

print("Testing route imports...")

try:
    print("\n1. Testing lotti...")
    from app.routes import lotti
    print("✅ lotti imported successfully")
    print(f"   Router: {lotti.router}")
except Exception as e:
    print(f"❌ lotti import failed!")
    traceback.print_exc()

try:
    print("\n2. Testing fasi...")
    from app.routes import fasi
    print("✅ fasi imported successfully")
    print(f"   Router: {fasi.router}")
except Exception as e:
    print(f"❌ fasi import failed!")
    traceback.print_exc()

try:
    print("\n3. Testing fasi_tipo...")
    from app.routes import fasi_tipo
    print("✅ fasi_tipo imported successfully")
    print(f"   Router: {fasi_tipo.router}")
except Exception as e:
    print(f"❌ fasi_tipo import failed!")
    traceback.print_exc()

try:
    print("\n4. Testing anagrafiche...")
    from app.routes import anagrafiche
    print("✅ anagrafiche imported successfully")
    print(f"   Router: {anagrafiche.router}")
except Exception as e:
    print(f"❌ anagrafiche import failed!")
    traceback.print_exc()

try:
    print("\n5. Testing gestionale...")
    from app.routes import gestionale
    print("✅ gestionale imported successfully")
    print(f"   Router: {gestionale.router}")
except Exception as e:
    print(f"❌ gestionale import failed!")
    traceback.print_exc()

print("\n" + "="*50)
print("Import test complete!")
