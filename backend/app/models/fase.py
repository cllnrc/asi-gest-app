"""
ASI-GEST Models: Fase
© 2025 Enrico Callegaro - Tutti i diritti riservati.

Definizione fasi istanziate per una commessa
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class Fase(Base):
    """
    Tabella fasi - istanze di fasi produttive per una specifica commessa.

    Collega:
    - CommessaERPId (riferimento esterno ASITRON)
    - FaseTipoID (tipo di fase: SMD, PTH, CONTROLLO, ecc)
    - UtenteID (operatore assegnato)
    - MacchinaID (macchina assegnata)
    """
    __tablename__ = "Fasi"

    FaseID = Column(Integer, primary_key=True, autoincrement=True)
    CommessaERPId = Column(Integer, nullable=False, index=True)
    ConfigCommessaID = Column(Integer, ForeignKey("ConfigCommessa.ConfigCommessaID"), nullable=True)
    FaseTipoID = Column(Integer, ForeignKey("FaseTipo.FaseTipoID"), nullable=False)

    __table_args__ = (
        Index("IX_Fasi_Commessa", "CommessaERPId", "FaseTipoID"),
    )

    NumeroCommessa = Column(String(50), nullable=True)
    Stato = Column(String(20), nullable=False, default="APERTA", index=True)
    # Valori: APERTA, IN_CORSO, CHIUSA, BLOCCATA

    DataCreazione = Column(DateTime, default=datetime.utcnow, nullable=False)
    DataModifica = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    DataApertura = Column(DateTime, default=datetime.utcnow, nullable=False)
    DataChiusura = Column(DateTime, nullable=True)

    Quantita = Column(Integer, nullable=True)
    QtaPrevista = Column(Integer, nullable=True)
    QtaProdotta = Column(Integer, nullable=True)
    QtaResidua = Column(Integer, nullable=True)

    Note = Column(Text, nullable=True)

    # Relationships
    fase_tipo = relationship("FaseTipo", back_populates="fasi")
    lotti = relationship("Lotto", back_populates="fase", cascade="all, delete-orphan")
    config_commessa = relationship("ConfigCommessa")

    @property
    def Completata(self):
        """Computed property: True if Stato is CHIUSA"""
        return self.Stato == "CHIUSA"

    def __repr__(self):
        return f"<Fase(id={self.FaseID}, commessa_erp={self.CommessaERPId}, stato='{self.Stato}')>"
