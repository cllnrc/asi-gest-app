"""
Pydantic schemas for RIFCOMMCLI Generator
© 2025 Enrico Callegaro - Tutti i diritti riservati.

Schemas for generating and managing RIFCOMMCLI progressive numbers.
Eliminates Excel dependency while maintaining read-only access to ASITRON.
"""

from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field


# ========== RIFCOMMCLI SCHEMAS ==========

class RIFCOMMCLIGeneraRequest(BaseModel):
    """Request to generate a new RIFCOMMCLI number"""
    UtenteGenerazione: str = Field(..., min_length=1, max_length=50, description="Utente che richiede il numero")
    Note: Optional[str] = Field(None, max_length=200, description="Note opzionali")


class RIFCOMMCLIGeneraResponse(BaseModel):
    """Response with generated RIFCOMMCLI number"""
    RIFCOMMCLI: str = Field(..., description="Numero RIFCOMMCLI generato")
    DataGenerazione: datetime = Field(..., description="Data e ora di generazione")
    UtenteGenerazione: str = Field(..., description="Utente che ha generato il numero")
    Note: Optional[str] = Field(None, description="Note associate")

    class Config:
        from_attributes = True


class RIFCOMMCLIResponse(BaseModel):
    """Complete RIFCOMMCLI record with status"""
    RIFCOMMCLI: str
    DataGenerazione: datetime
    UtenteGenerazione: str
    StatoUtilizzo: Literal['GENERATO', 'UTILIZZATO', 'ANNULLATO']
    DataUtilizzo: Optional[datetime] = None
    Note: Optional[str] = None

    class Config:
        from_attributes = True


class RIFCOMMCLIList(BaseModel):
    """List of RIFCOMMCLI records with pagination"""
    items: list[RIFCOMMCLIResponse]
    total: int
    page: int = 1
    page_size: int = 50


class RIFCOMMCLIAnnullaRequest(BaseModel):
    """Request to cancel a generated RIFCOMMCLI"""
    Note: Optional[str] = Field(None, max_length=200, description="Motivo annullamento")


class RIFCOMMCLIStatistiche(BaseModel):
    """Statistics about generated RIFCOMMCLI numbers"""
    TotaleGenerati: int = Field(..., description="Totale numeri generati")
    TotaleUtilizzati: int = Field(..., description="Numeri utilizzati nel gestionale")
    TotaleAnnullati: int = Field(..., description="Numeri annullati")
    TotaleInAttesa: int = Field(..., description="Numeri in attesa di utilizzo")
    UltimoGenerato: Optional[str] = Field(None, description="Ultimo RIFCOMMCLI generato")
    UltimaDataGenerazione: Optional[datetime] = Field(None, description="Data ultimo generato")
