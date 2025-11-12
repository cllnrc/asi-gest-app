"""
ASI-GEST Models: LogEvento
© 2025 Enrico Callegaro - Tutti i diritti riservati.

Definizione log eventi - audit trail del sistema
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, Index
from datetime import datetime

from app.core.database import Base


class LogEvento(Base):
    """
    Tabella log eventi - audit trail per tracciare tutte le operazioni critiche.

    Traccia:
    - Creazione/chiusura lotti
    - Cambio stato fasi
    - Modifiche configurazione
    - Azioni utente

    Indexed su: DataEvento DESC, Tipo, Entita
    """
    __tablename__ = "LogEventi"

    LogID = Column(Integer, primary_key=True, autoincrement=True)

    DataEvento = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    Tipo = Column(String(50), nullable=False)
    # Esempi: LOTTO_CREATO, LOTTO_CHIUSO, FASE_AVVIATA, CONFIG_MODIFICATA

    Entita = Column(String(50), nullable=False)
    # Esempi: Lotto, Fase, ConfigCommessa, Utente

    EntitaID = Column(Integer, nullable=True)

    Utente = Column(String(100), nullable=False)

    Dettagli = Column(Text, nullable=True)

    Severity = Column(String(20), nullable=True)
    # Valori: INFO, WARNING, ERROR

    __table_args__ = (
        Index("IX_LogEventi_Data", "DataEvento"),
        Index("IX_LogEventi_Tipo", "Tipo", "DataEvento"),
        Index("IX_LogEventi_Entita", "Entita", "EntitaID"),
    )

    def __repr__(self):
        return f"<LogEvento(id={self.LogID}, tipo='{self.Tipo}', entita='{self.Entita}')>"
