"""
Pydantic schemas for FaseTipo (Phase Types)
© 2025 Enrico Callegaro - Tutti i diritti riservati.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class FaseTipoBase(BaseModel):
    """Base schema for FaseTipo"""
    Codice: str = Field(..., max_length=20, description="Codice univoco tipo fase")
    Descrizione: str = Field(..., max_length=100, description="Descrizione del tipo fase")
    Tipo: str = Field(..., max_length=20, description="Categoria: SMD, PTH, CONTROLLO, ALTRO")
    RichiedeSeriale: bool = Field(False, description="Richiede numero seriale")
    RichiedeControllo: bool = Field(False, description="Richiede controllo qualità")
    OrdineVisualizzazione: int = Field(0, description="Ordine di visualizzazione")
    Attivo: bool = Field(True, description="Tipo fase attivo")


class FaseTipoCreate(FaseTipoBase):
    """Schema for creating a new FaseTipo"""
    pass


class FaseTipoUpdate(BaseModel):
    """Schema for updating a FaseTipo"""
    Codice: Optional[str] = Field(None, max_length=20)
    Descrizione: Optional[str] = Field(None, max_length=100)
    Tipo: Optional[str] = Field(None, max_length=20)
    RichiedeSeriale: Optional[bool] = None
    RichiedeControllo: Optional[bool] = None
    OrdineVisualizzazione: Optional[int] = None
    Attivo: Optional[bool] = None


class FaseTipoResponse(FaseTipoBase):
    """Schema for FaseTipo response"""
    model_config = ConfigDict(from_attributes=True)

    FaseTipoID: int
    DataCreazione: datetime
    DataModifica: Optional[datetime] = None


class FaseTipoList(BaseModel):
    """Schema for list of FaseTipo"""
    items: list[FaseTipoResponse]
    total: int
    page: int = 1
    page_size: int = 50
