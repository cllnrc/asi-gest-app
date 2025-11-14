"""
Test router imports with detailed error reporting
Run from backend directory: python test_router_imports.py
"""
import sys
import traceback

print("="*60)
print("Testing router imports...")
print("="*60)

routers_to_test = [
    ("gestionale", "✅ WORKS"),
    ("anagrafiche", "✅ WORKS"),
    ("lotti", "❌ FAILS"),
    ("fasi", "❌ FAILS"),
    ("fasi_tipo", "❌ FAILS"),
    ("config", "❌ FAILS"),
]

for router_name, expected in routers_to_test:
    print(f"\n{expected} Testing: {router_name}")
    print("-" * 60)
    try:
        module = __import__(f"app.routes.{router_name}", fromlist=['router'])
        router = getattr(module, 'router', None)
        if router:
            print(f"✅ SUCCESS: {router_name}.router imported")
            print(f"   Router type: {type(router)}")
        else:
            print(f"⚠️  WARNING: {router_name} imported but no 'router' attribute found")
    except Exception as e:
        print(f"❌ FAILED: {router_name}")
        print(f"   Error type: {type(e).__name__}")
        print(f"   Error message: {str(e)}")
        print("\n   Full traceback:")
        traceback.print_exc()

print("\n" + "="*60)
print("Test complete!")
print("="*60)
