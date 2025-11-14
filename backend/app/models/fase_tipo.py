"""
ASI-GEST Models: FaseTipo
© 2025 Enrico Callegaro - Tutti i diritti riservati.

Definizione tipi di fasi produttive (SMD, PTH, Controllo, ecc.)
"""

from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship

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
    Codice = Column(String(50), nullable=False, index=True)
    Descrizione = Column(String(100), nullable=False)
    Ordine = Column(Integer, default=0)
    Attivo = Column(Boolean, default=True, index=True)

    # Relationships
    fasi = relationship("Fase", back_populates="fase_tipo")

    def __repr__(self):
        return f"<FaseTipo(id={self.FaseTipoID}, codice='{self.Codice}')>"
