"""
ASI-GEST Database Configuration
© 2025 Enrico Callegaro - Tutti i diritti riservati.

Due database:
- ASI_GEST: Read-Write (per gestione produzione)
- ASITRON: Read-Only (per consultazione gestionale)
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from .config import settings

# ========================================
# ASI_GEST Database (Read-Write)
# ========================================
engine_asi_gest = create_engine(
    settings.asi_gest_connection_string,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

SessionLocalAsiGest = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine_asi_gest
)

Base = declarative_base()


def get_db_asi_gest() -> Generator[Session, None, None]:
    """
    Dependency per ottenere sessione database ASI_GEST.

    Uso:
        @app.get("/")
        def read_root(db: Session = Depends(get_db_asi_gest)):
            ...
    """
    db = SessionLocalAsiGest()
    try:
        yield db
    finally:
        db.close()


# ========================================
# ASITRON Gestionale (Read-Only)
# ========================================
engine_asitron = create_engine(
    settings.asitron_connection_string,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

SessionLocalAsitron = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine_asitron
)


def get_db_asitron() -> Generator[Session, None, None]:
    """
    Dependency per ottenere sessione database ASITRON gestionale (read-only).

    Uso:
        @app.get("/gestionale/articoli")
        def get_articoli(db: Session = Depends(get_db_asitron)):
            ...
    """
    db = SessionLocalAsitron()
    try:
        yield db
    finally:
        db.close()


def init_db_asi_gest():
    """
    Inizializza il database ASI_GEST creando tutte le tabelle.
    """
    # Import models per registrarli con Base
    from app.models import (
        fase_tipo, utente, macchina, config_commessa,
        fase, lotto, documento_tecnico, log_evento
    )

    Base.metadata.create_all(bind=engine_asi_gest)
    print("✅ Database ASI_GEST inizializzato")
