"""
ASI-GEST Models: FaseTipo
© 2025 Enrico Callegaro - Tutti i diritti riservati.

Definizione tipi di fasi produttive (SMD, PTH, Controllo, ecc.)
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class FaseTipo(Base):
    """
    Tabella tipi di fasi produttive.

    Esempi:
    - SMD (montaggio superficiale)
    - PTH (montaggio foro passante)
    - CTRL_VISIVO (controllo visivo)
    - CTRL_ELETTRICO (controllo elettrico)
    - CONFORMAL (coating conformal)
    """
    __tablename__ = "FaseTipo"

    FaseTipoID = Column(Integer, primary_key=True, autoincrement=True)
    Codice = Column(String(20), unique=True, nullable=False, index=True)
    Descrizione = Column(String(100), nullable=False)

    # Tipo fase: "SMD", "PTH", "CONTROLLO", "ALTRO"
    Tipo = Column(String(20), nullable=False, index=True)

    # Flags comportamentali
    RichiedeSeriale = Column(Boolean, default=False)  # Es: True per SMD, PTH
    RichiedeControllo = Column(Boolean, default=False)  # Es: True per CTRL_*

    # Ordine visualizzazione
    OrdineVisualizzazione = Column(Integer, default=0)

    # Stato
    Attivo = Column(Boolean, default=True, index=True)

    # Timestamp
    DataCreazione = Column(DateTime, default=datetime.utcnow, nullable=False)
    DataModifica = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    fasi = relationship("Fase", back_populates="fase_tipo")

    def __repr__(self):
        return f"<FaseTipo(id={self.FaseTipoID}, codice='{self.Codice}', tipo='{self.Tipo}')>"
