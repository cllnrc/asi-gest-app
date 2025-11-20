"""
ASI-GEST FastAPI Application
© 2025 Enrico Callegaro - Tutti i diritti riservati.

Production management system for electronics assembly.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import init_db_asi_gest

# Import routes with debug
print("🔍 DEBUG: Starting router imports...")
try:
    from app.routes import gestionale
    print("✅ gestionale router imported")
except Exception as e:
    print(f"❌ gestionale import failed: {e}")

try:
    from app.routes import anagrafiche
    print("✅ anagrafiche router imported")
except Exception as e:
    print(f"❌ anagrafiche import failed: {e}")

try:
    from app.routes import lotti
    print("✅ lotti router imported")
except Exception as e:
    print(f"❌ lotti import failed: {e}")
    import traceback
    traceback.print_exc()

try:
    from app.routes import fasi
    print("✅ fasi router imported")
except Exception as e:
    print(f"❌ fasi import failed: {e}")
    import traceback
    traceback.print_exc()

try:
    from app.routes import fasi_tipo
    print("✅ fasi_tipo router imported")
except Exception as e:
    print(f"❌ fasi_tipo import failed: {e}")
    import traceback
    traceback.print_exc()

try:
    from app.routes import config
    print("✅ config router imported")
except Exception as e:
    print(f"❌ config import failed: {e}")
    import traceback
    traceback.print_exc()

try:
    from app.routes import doc_ut
    print("✅ doc_ut router imported")
except Exception as e:
    print(f"❌ doc_ut import failed: {e}")
    import traceback
    traceback.print_exc()

try:
    from app.routes import rifcommcli
    print("✅ rifcommcli router imported")
except Exception as e:
    print(f"❌ rifcommcli import failed: {e}")
    import traceback
    traceback.print_exc()

print("🔍 DEBUG: Router imports complete")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan events: startup and shutdown.
    """
    # Startup
    print(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"📊 ASI_GEST DB: {settings.DB_ASI_GEST_SERVER}/{settings.DB_ASI_GEST_DATABASE}")
    print(f"📊 ASITRON DB: {settings.DB_ASITRON_SERVER}/{settings.DB_ASITRON_DATABASE}")

    yield

    # Shutdown
    print(f"🛑 Shutting down {settings.APP_NAME}")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Production management system for electronics assembly (SMD, PTH, testing)",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root endpoint
@app.get("/")
def read_root():
    """Root endpoint - API info"""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }


# Health check endpoint
@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


# Debug endpoint to list all registered routes
@app.get("/debug/routes")
def list_routes():
    """List all registered routes"""
    routes = []
    for route in app.routes:
        if hasattr(route, 'path'):
            routes.append({
                "path": route.path,
                "name": route.name if hasattr(route, 'name') else None,
                "methods": list(route.methods) if hasattr(route, 'methods') else []
            })
    return {"total_routes": len(routes), "routes": routes}


# Database initialization endpoint
@app.post("/init-db")
def initialize_database():
    """
    Inizializza il database ASI_GEST creando tutte le tabelle.

    ⚠️ ATTENZIONE: Usa solo in sviluppo!
    In produzione usa Alembic migrations.
    """
    try:
        init_db_asi_gest()
        return {
            "status": "success",
            "message": "Database ASI_GEST initialized successfully",
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to initialize database: {str(e)}",
        }


# Register API routers - each with specific prefix
print("🔍 DEBUG: Registering routers...")
try:
    app.include_router(lotti.router, prefix="/api/lotti", tags=["Lotti"])
    print("✅ lotti router registered at /api/lotti")
except Exception as e:
    print(f"❌ lotti router registration failed: {e}")

try:
    app.include_router(fasi.router, prefix="/api/fasi", tags=["Fasi"])
    print("✅ fasi router registered at /api/fasi")
except Exception as e:
    print(f"❌ fasi router registration failed: {e}")

try:
    app.include_router(fasi_tipo.router, prefix="/api/fasi-tipo", tags=["FasiTipo"])
    print("✅ fasi_tipo router registered at /api/fasi-tipo")
except Exception as e:
    print(f"❌ fasi_tipo router registration failed: {e}")

try:
    app.include_router(config.router, prefix="/api/config", tags=["ConfigCommessa"])
    print("✅ config router registered at /api/config")
except Exception as e:
    print(f"❌ config router registration failed: {e}")

try:
    app.include_router(doc_ut.router, prefix="/api/doc-ut", tags=["DocUT"])
    print("✅ doc_ut router registered at /api/doc-ut")
except Exception as e:
    print(f"❌ doc_ut router registration failed: {e}")

try:
    app.include_router(gestionale.router, prefix="/api/gestionale", tags=["Gestionale"])
    print("✅ gestionale router registered at /api/gestionale")
except Exception as e:
    print(f"❌ gestionale router registration failed: {e}")

try:
    app.include_router(anagrafiche.router, prefix="/api", tags=["Anagrafiche"])
    print("✅ anagrafiche router registered at /api")
except Exception as e:
    print(f"❌ anagrafiche router registration failed: {e}")

try:
    app.include_router(rifcommcli.router, prefix="/api/rifcommcli", tags=["RIFCOMMCLI"])
    print("✅ rifcommcli router registered at /api/rifcommcli")
except Exception as e:
    print(f"❌ rifcommcli router registration failed: {e}")

print("🔍 DEBUG: Router registration complete")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
