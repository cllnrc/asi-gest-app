"""
Pydantic schemas for Fase (Production Phase)
© 2025 Enrico Callegaro - Tutti i diritti riservati.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class FaseBase(BaseModel):
    """Base schema for Fase"""
    NumeroCommessa: str = Field(..., max_length=50, description="Numero commessa cliente")
    Quantita: int = Field(..., gt=0, description="Quantità da produrre")
    Note: Optional[str] = Field(None, description="Note sulla fase")


class FaseCreate(FaseBase):
    """Schema for creating a new Fase"""
    ConfigCommessaID: int = Field(..., gt=0, description="ID configurazione commessa")
    FaseTipoID: int = Field(..., gt=0, description="ID tipo fase")


class FaseUpdate(BaseModel):
    """Schema for updating a Fase"""
    Quantita: Optional[int] = Field(None, gt=0)
    Note: Optional[str] = None
    Completata: Optional[bool] = None


class FaseResponse(FaseBase):
    """Schema for Fase response"""
    model_config = ConfigDict(from_attributes=True)

    FaseID: int
    ConfigCommessaID: int
    FaseTipoID: int
    Completata: bool
    DataCreazione: datetime
    DataModifica: datetime


class FaseWithDetails(FaseResponse):
    """Schema for Fase with related details"""
    # Campi dal FaseTipo
    FaseTipoCodice: Optional[str] = None
    FaseTipoDescrizione: Optional[str] = None
    FaseTipoTipo: Optional[str] = None

    # Campi dalla ConfigCommessa
    ConfigCommessaArticolo: Optional[str] = None
    ConfigCommessaDescrizione: Optional[str] = None

    # Statistiche dai lotti
    NumeroLotti: int = 0
    QuantitaProdotta: int = 0
    QuantitaScarti: int = 0


class FaseList(BaseModel):
    """Schema for list of Fasi"""
    items: list[FaseResponse]
    total: int
    page: int = 1
    page_size: int = 50
