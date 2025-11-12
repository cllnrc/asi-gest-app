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
    Note: Optional[str] = Field(None, description="Note sulla configurazione")


class ConfigCommessaCreate(ConfigCommessaBase):
    """Schema for creating a new ConfigCommessa"""
    pass


class ConfigCommessaUpdate(BaseModel):
    """Schema for updating a ConfigCommessa"""
    Descrizione: Optional[str] = Field(None, max_length=200)
    Note: Optional[str] = None
    Attivo: Optional[bool] = None


class ConfigCommessaResponse(ConfigCommessaBase):
    """Schema for ConfigCommessa response"""
    model_config = ConfigDict(from_attributes=True)

    ConfigCommessaID: int
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
