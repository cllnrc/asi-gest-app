"""
Pydantic schemas for FaseTipo (Phase Types)
© 2025 Enrico Callegaro - Tutti i diritti riservati.
"""

from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class FaseTipoBase(BaseModel):
    """Base schema for FaseTipo"""
    Codice: str = Field(..., max_length=50, description="Codice univoco tipo fase")
    Descrizione: str = Field(..., max_length=100, description="Descrizione del tipo fase")
    Ordine: int = Field(0, description="Ordine di visualizzazione")
    Attivo: bool = Field(True, description="Tipo fase attivo")


class FaseTipoCreate(FaseTipoBase):
    """Schema for creating a new FaseTipo"""
    pass


class FaseTipoUpdate(BaseModel):
    """Schema for updating a FaseTipo"""
    Codice: Optional[str] = Field(None, max_length=50)
    Descrizione: Optional[str] = Field(None, max_length=100)
    Ordine: Optional[int] = None
    Attivo: Optional[bool] = None


class FaseTipoResponse(FaseTipoBase):
    """Schema for FaseTipo response"""
    model_config = ConfigDict(from_attributes=True)

    FaseTipoID: int


class FaseTipoList(BaseModel):
    """Schema for list of FaseTipo"""
    items: list[FaseTipoResponse]
    total: int
    page: int = 1
    page_size: int = 50
