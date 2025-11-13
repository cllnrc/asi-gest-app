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
    ProgrammaFeeder: Optional[str] = Field(None, max_length=100, description="Programma feeder utilizzato")
    TempoSetupMin: Optional[int] = Field(None, ge=0, description="Tempo setup in minuti")
    TipoScarto: Optional[str] = Field(None, max_length=50, description="Tipo di scarto")
    NoteScarti: Optional[str] = Field(None, max_length=500, description="Note sugli scarti")
    Note: Optional[str] = Field(None, description="Note operative")


class LottoCreate(LottoBase):
    """Schema for creating a new Lotto"""
    FaseID: int = Field(..., gt=0, description="ID della fase")
    OperatoreID: Optional[int] = Field(None, gt=0, description="ID dell'operatore che apre il lotto")
    MacchinaID: Optional[int] = Field(None, gt=0, description="ID della macchina utilizzata")


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
    OperatoreID: Optional[int] = None
    MacchinaID: Optional[int] = None
    DataInizio: datetime
    DataFine: Optional[datetime] = None


class LottoWithDetails(LottoResponse):
    """Schema for Lotto with related details"""
    # Campi dalla fase
    FaseNumeroCommessa: Optional[str] = None
    FaseTipoCodice: Optional[str] = None
    FaseTipoDescrizione: Optional[str] = None

    # Campi dall'operatore
    OperatoreNomeCompleto: Optional[str] = None
    OperatoreUsername: Optional[str] = None

    # Campi dalla macchina
    MacchinaCodice: Optional[str] = None
    MacchinaDescrizione: Optional[str] = None

    # Campi calcolati
    Resa: Optional[float] = Field(None, description="Resa percentuale (output/input)")
    Durata: Optional[int] = Field(None, description="Durata in minuti")


class LottoList(BaseModel):
    """Schema for list of Lotti"""
    items: list[LottoResponse]
    total: int
    page: int = 1
    page_size: int = 50
