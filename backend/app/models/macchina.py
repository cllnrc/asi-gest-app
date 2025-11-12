"""
ASI-GEST Models: Macchina
© 2025 Enrico Callegaro - Tutti i diritti riservati.

Definizione macchine e impianti di produzione
"""

from sqlalchemy import Column, Integer, String, Boolean, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Macchina(Base):
    """
    Tabella macchine - impianti di produzione (SMD, PTH, AOI, ecc).

    Esempi:
    - MyDATA Pick & Place (SMD)
    - Forno a infrarossi (SMD)
    - AOI Machine (CONTROLLI)
    - Macchina PTH manuale (PTH)
    """
    __tablename__ = "Macchine"

    MacchinaID = Column(Integer, primary_key=True, autoincrement=True)
    Codice = Column(String(50), unique=True, nullable=False)
    Descrizione = Column(String(100), nullable=True)
    Reparto = Column(String(50), nullable=False, index=True)
    Tipo = Column(String(50), nullable=True)
    Attiva = Column(Boolean, default=True, index=True)
    Note = Column(Text, nullable=True)

    # Relationships
    lotti = relationship("Lotto", back_populates="macchina")

    def __repr__(self):
        return f"<Macchina(id={self.MacchinaID}, codice='{self.Codice}', reparto='{self.Reparto}')>"
