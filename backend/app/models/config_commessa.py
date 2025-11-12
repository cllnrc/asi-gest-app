"""
ASI-GEST Models: ConfigCommessa
© 2025 Enrico Callegaro - Tutti i diritti riservati.

Definizione configurazione tecnica delle commesse
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class ConfigCommessa(Base):
    """
    Tabella configurazione commesse - mappatura fra ERP e impostazioni di produzione.

    Definisce:
    - Quali fasi sono previste (SMD, PTH, Controlli, ecc)
    - Documentazione tecnica associata
    - Flag di blocco e stato validazione
    """
    __tablename__ = "ConfigCommessa"

    ConfigID = Column(Integer, primary_key=True, autoincrement=True)
    CommessaERPId = Column(Integer, unique=True, nullable=False)

    FlagSMD = Column(Boolean, default=True)
    FlagPTH = Column(Boolean, default=False)
    FlagControlli = Column(Boolean, default=True)
    FlagTerzista = Column(Boolean, default=False)

    DIBA = Column(String(100), nullable=True)
    Revisione = Column(String(50), nullable=True)

    BloccataDocumentazione = Column(Boolean, default=False, index=True)

    Note = Column(Text, nullable=True)
    ConfigJSON = Column(Text, nullable=True)

    DataCreazione = Column(DateTime, default=datetime.utcnow, nullable=False)
    ModificatoDa = Column(String(100), nullable=True)
    DataUltimaModifica = Column(DateTime, nullable=True)

    # Relationships
    # Nota: Fasi si collega a ConfigCommessa tramite CommessaERPId (referenza esterna ERP)
    # Non c'è una FK diretta nel database

    def __repr__(self):
        return f"<ConfigCommessa(id={self.ConfigID}, erp_id={self.CommessaERPId})>"
