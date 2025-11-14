"""
Pydantic schemas for ConfigCommessa (Work Order Configuration)
© 2025 Enrico Callegaro - Tutti i diritti riservati.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class ConfigCommessaBase(BaseModel):
    """Base schema for ConfigCommessa"""
    CodiceArticolo: str = Field(..., max_length=50, description="Codice articolo da produrre")
    Descrizione: str = Field(..., max_length=200, description="Descrizione articolo")

    # Flag fasi produttive
    FlagSMD: bool = Field(True, description="Fase SMD richiesta")
    FlagPTH: bool = Field(False, description="Fase PTH richiesta")
    FlagControlli: bool = Field(True, description="Controlli richiesti")
    FlagTerzista: bool = Field(False, description="Lavorazione terzista")

    # Documentazione tecnica
    DIBA: Optional[str] = Field(None, max_length=100, description="Codice DIBA")
    Revisione: Optional[str] = Field(None, max_length=50, description="Revisione scheda")

    # Note e blocchi
    BloccataDocumentazione: bool = Field(False, description="Bloccata per documentazione mancante")
    Note: Optional[str] = Field(None, description="Note sulla configurazione")


class ConfigCommessaCreate(ConfigCommessaBase):
    """Schema for creating a new ConfigCommessa"""
    CommessaERPId: int = Field(..., gt=0, description="ID commessa dal gestionale ERP")


class ConfigCommessaUpdate(BaseModel):
    """Schema for updating a ConfigCommessa"""
    Descrizione: Optional[str] = Field(None, max_length=200)
    FlagSMD: Optional[bool] = None
    FlagPTH: Optional[bool] = None
    FlagControlli: Optional[bool] = None
    FlagTerzista: Optional[bool] = None
    DIBA: Optional[str] = Field(None, max_length=100)
    Revisione: Optional[str] = Field(None, max_length=50)
    BloccataDocumentazione: Optional[bool] = None
    Note: Optional[str] = None
    Attivo: Optional[bool] = None


class ConfigCommessaResponse(ConfigCommessaBase):
    """Schema for ConfigCommessa response"""
    model_config = ConfigDict(from_attributes=True)

    ConfigCommessaID: int
    CommessaERPId: int
    Attivo: bool
    DataCreazione: datetime
    DataModifica: datetime


class ConfigCommessaWithFasi(ConfigCommessaResponse):
    """Schema for ConfigCommessa with associated phase types"""
    FasiTipo: list[dict] = Field(default_factory=list, description="Lista tipi fase associati")


class ConfigCommessaList(BaseModel):
    """Schema for list of ConfigCommessa"""
    items: list[ConfigCommessaResponse]
    total: int
    page: int = 1
    page_size: int = 50
