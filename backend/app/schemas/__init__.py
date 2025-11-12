"""
ASI-GEST Pydantic Schemas
© 2025 Enrico Callegaro - Tutti i diritti riservati.
"""

from .lotto import (
    LottoBase,
    LottoCreate,
    LottoClose,
    LottoResponse,
    LottoWithDetails,
    LottoList,
)
from .fase import (
    FaseBase,
    FaseCreate,
    FaseUpdate,
    FaseResponse,
    FaseWithDetails,
    FaseList,
)
from .config_commessa import (
    ConfigCommessaBase,
    ConfigCommessaCreate,
    ConfigCommessaUpdate,
    ConfigCommessaResponse,
    ConfigCommessaWithFasi,
    ConfigCommessaList,
)
from .gestionale import (
    CommessaGestionale,
    ArticoloGestionale,
    ClienteGestionale,
    DepositoGestionale,
    CommessaList,
    ArticoloList,
    ClienteList,
)

__all__ = [
    # Lotto
    "LottoBase",
    "LottoCreate",
    "LottoClose",
    "LottoResponse",
    "LottoWithDetails",
    "LottoList",
    # Fase
    "FaseBase",
    "FaseCreate",
    "FaseUpdate",
    "FaseResponse",
    "FaseWithDetails",
    "FaseList",
    # ConfigCommessa
    "ConfigCommessaBase",
    "ConfigCommessaCreate",
    "ConfigCommessaUpdate",
    "ConfigCommessaResponse",
    "ConfigCommessaWithFasi",
    "ConfigCommessaList",
    # Gestionale
    "CommessaGestionale",
    "ArticoloGestionale",
    "ClienteGestionale",
    "DepositoGestionale",
    "CommessaList",
    "ArticoloList",
    "ClienteList",
]
