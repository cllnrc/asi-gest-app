"""
Pydantic schemas for Fase (Production Phase)
© 2025 Enrico Callegaro - Tutti i diritti riservati.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class FaseBase(BaseModel):
    """Base schema for Fase"""
    QtaPrevista: Optional[int] = Field(None, ge=0, description="Quantità prevista da produrre")
    QtaProdotta: Optional[int] = Field(None, ge=0, description="Quantità prodotta")
    QtaResidua: Optional[int] = Field(None, ge=0, description="Quantità residua")
    Note: Optional[str] = Field(None, description="Note sulla fase")


class FaseCreate(FaseBase):
    """Schema for creating a new Fase"""
    CommessaERPId: int = Field(..., gt=0, description="ID commessa ERP")
    FaseTipoID: int = Field(..., gt=0, description="ID tipo fase")
    Stato: str = Field("APERTA", description="Stato fase (APERTA, IN_CORSO, CHIUSA, BLOCCATA)")


class FaseUpdate(BaseModel):
    """Schema for updating a Fase"""
    Stato: Optional[str] = Field(None, description="Stato fase")
    QtaPrevista: Optional[int] = Field(None, ge=0)
    QtaProdotta: Optional[int] = Field(None, ge=0)
    QtaResidua: Optional[int] = Field(None, ge=0)
    Note: Optional[str] = None


class FaseResponse(FaseBase):
    """Schema for Fase response"""
    model_config = ConfigDict(from_attributes=True)

    FaseID: int
    CommessaERPId: int
    FaseTipoID: int
    Stato: str
    DataApertura: datetime
    DataChiusura: Optional[datetime] = None
    Completata: bool  # Computed property from Stato


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
