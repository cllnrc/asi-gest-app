"""
Pydantic schemas for Lotto (Production Batch)
© 2025 Enrico Callegaro - Tutti i diritti riservati.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class LottoBase(BaseModel):
    """Base schema for Lotto"""
    QtaInput: Optional[int] = Field(None, ge=0, description="Quantità in input")
    QtaOutput: Optional[int] = Field(None, ge=0, description="Quantità in output")
    QtaScarti: Optional[int] = Field(None, ge=0, description="Quantità scarti")
    SerialeMacchina: Optional[str] = Field(None, max_length=100, description="Seriale macchina utilizzata")
    Note: Optional[str] = Field(None, description="Note operative")


class LottoCreate(LottoBase):
    """Schema for creating a new Lotto"""
    FaseID: int = Field(..., gt=0, description="ID della fase")
    UtenteID: int = Field(..., gt=0, description="ID dell'utente che apre il lotto")


class LottoClose(BaseModel):
    """Schema for closing a Lotto"""
    QtaOutput: int = Field(..., ge=0, description="Quantità prodotta")
    QtaScarti: int = Field(0, ge=0, description="Quantità scarti")
    Note: Optional[str] = Field(None, description="Note finali")


class LottoResponse(LottoBase):
    """Schema for Lotto response"""
    model_config = ConfigDict(from_attributes=True)

    LottoID: int
    FaseID: int
    Progressivo: int
    UtenteID: int
    DataInizio: datetime
    DataFine: Optional[datetime] = None
    DataCreazione: datetime
    DataModifica: datetime


class LottoWithDetails(LottoResponse):
    """Schema for Lotto with related details"""
    # Campi dalla fase
    FaseNumeroCommessa: Optional[str] = None
    FaseTipoCodice: Optional[str] = None
    FaseTipoDescrizione: Optional[str] = None

    # Campi dall'utente
    UtenteNome: Optional[str] = None
    UtenteCognome: Optional[str] = None

    # Campi calcolati
    Resa: Optional[float] = Field(None, description="Resa percentuale (output/input)")
    Durata: Optional[int] = Field(None, description="Durata in minuti")


class LottoList(BaseModel):
    """Schema for list of Lotti"""
    items: list[LottoResponse]
    total: int
    page: int = 1
    page_size: int = 50
