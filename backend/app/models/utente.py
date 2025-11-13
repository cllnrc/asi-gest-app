"""
ASI-GEST Models: Utente
© 2025 Enrico Callegaro - Tutti i diritti riservati.

Definizione operatori e utenti di sistema (username, ruolo, reparto)
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class Utente(Base):
    """
    Tabella utenti - operatori di produzione e supervisori.

    Esempi:
    - Operatore SMD (reparto produzione)
    - Supervisore (controllo qualità)
    - Amministratore di sistema
    """
    __tablename__ = "Utenti"

    UtenteID = Column(Integer, primary_key=True, autoincrement=True)
    Username = Column(String(50), unique=True, nullable=False, index=True)
    NomeCompleto = Column(String(100), nullable=False)
    Email = Column(String(100), nullable=True)
    Reparto = Column(String(50), nullable=True, index=True)
    Ruolo = Column(String(50), nullable=True)  # OPERATORE, SUPERVISOR, ADMIN
    Attivo = Column(Boolean, default=True, index=True)
    DataCreazione = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    lotti = relationship("Lotto", back_populates="operatore")

    def __repr__(self):
        return f"<Utente(id={self.UtenteID}, username='{self.Username}', reparto='{self.Reparto}')>"
