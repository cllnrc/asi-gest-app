"""
ASI-GEST Models: Lotto
© 2025 Enrico Callegaro - Tutti i diritti riservati.

Definizione lotti produttivi - core del sistema di tracciamento
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Index, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class Lotto(Base):
    """
    Tabella lotti - elemento centrale di tracciamento della produzione.

    Ogni lotto traccia:
    - Quantità input/output e scarti
    - Operatore e macchina assegnati
    - Tempistiche (inizio/fine)
    - Documentazione (programma feeder, note)

    Unique: (FaseID, Progressivo)
    """
    __tablename__ = "Lotti"

    LottoID = Column(Integer, primary_key=True, autoincrement=True)
    FaseID = Column(Integer, ForeignKey("Fasi.FaseID"), nullable=False)

    Progressivo = Column(Integer, nullable=False)

    DataInizio = Column(DateTime, nullable=False)
    DataFine = Column(DateTime, nullable=True)
    DataCreazione = Column(DateTime, default=datetime.utcnow, nullable=False)
    DataModifica = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    QtaInput = Column(Integer, nullable=True)
    QtaOutput = Column(Integer, nullable=False)
    QtaScarti = Column(Integer, nullable=False, default=0)

    UtenteID = Column(Integer, ForeignKey("Utenti.UtenteID"), nullable=True)
    MacchinaID = Column(Integer, ForeignKey("Macchine.MacchinaID"), nullable=True)

    ProgrammaFeeder = Column(String(100), nullable=True)
    TempoSetupMin = Column(Integer, nullable=True)

    TipoScarto = Column(String(50), nullable=True)
    NoteScarti = Column(String(500), nullable=True)

    Note = Column(Text, nullable=True)

    __table_args__ = (
        UniqueConstraint("FaseID", "Progressivo", name="UQ_Lotti_Fase_Progressivo"),
        Index("IX_Lotti_Fase", "FaseID", "Progressivo"),
        Index("IX_Lotti_DataInizio", "DataInizio"),
        Index("IX_Lotti_Utente", "UtenteID"),
    )

    # Relationships
    fase = relationship("Fase", back_populates="lotti")
    utente = relationship("Utente", back_populates="lotti")
    macchina = relationship("Macchina", back_populates="lotti")

    def __repr__(self):
        return f"<Lotto(id={self.LottoID}, fase={self.FaseID}, prog={self.Progressivo})>"
