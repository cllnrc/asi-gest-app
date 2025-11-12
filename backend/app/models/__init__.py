"""
ASI-GEST Models
© 2025 Enrico Callegaro - Tutti i diritti riservati.

Importazione di tutti i modelli SQLAlchemy per registrazione con Base
"""

# Import di tutti i modelli per registrarli con Base.metadata
from app.models.fase_tipo import FaseTipo
from app.models.utente import Utente
from app.models.macchina import Macchina
from app.models.config_commessa import ConfigCommessa
from app.models.fase import Fase
from app.models.lotto import Lotto
from app.models.documento_tecnico import DocumentoTecnico
from app.models.log_evento import LogEvento

__all__ = [
    "FaseTipo",
    "Utente",
    "Macchina",
    "ConfigCommessa",
    "Fase",
    "Lotto",
    "DocumentoTecnico",
    "LogEvento",
]
