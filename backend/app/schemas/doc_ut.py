"""
Pydantic schemas for DocUT (Documentazione Tecnica Articoli)
© 2025 Enrico Callegaro - Tutti i diritti riservati.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class DocUTBase(BaseModel):
    """Base schema for DocUT"""
    CodiceArticolo: str = Field(..., max_length=50, description="Codice articolo dal gestionale")
    Descrizione: Optional[str] = Field(None, max_length=200, description="Descrizione articolo")

    # Sezione UT
    DIBA: bool = Field(False, description="DI.BA. prodotta da UT")
    DIBAData: Optional[datetime] = None
    DIBAUtente: Optional[str] = Field(None, max_length=100)

    ProgrammaMyData: bool = Field(False, description="Programma MyData prodotto da UT")
    ProgrammaMyDataData: Optional[datetime] = None
    ProgrammaMyDataUtente: Optional[str] = Field(None, max_length=100)

    PDM: bool = Field(False, description="Piano Di Montaggio prodotto da UT")
    PDMData: Optional[datetime] = None
    PDMUtente: Optional[str] = Field(None, max_length=100)

    FileLaminaTelaio: Optional[str] = Field(None, max_length=20, description="CLIENTE | TOP | BOTTOM | TOP+BOTTOM")
    FileLaminaTelaioData: Optional[datetime] = None
    FileLaminaTelaioUtente: Optional[str] = Field(None, max_length=100)

    # Sezione Cliente
    DIBACliente: bool = Field(False, description="Cliente ha fornito DI.BA.")
    PDMCliente: bool = Field(False, description="Cliente ha fornito PDM")
    FilePP: bool = Field(False, description="Cliente ha fornito file Pick&Place")

    # Sezione Post Production
    FotoPCB: bool = Field(False, description="Foto PCB acquisite")
    FotoProdotto: bool = Field(False, description="Foto prodotto acquisite")
    TempiLavorazione: bool = Field(False, description="Tempi lavorazione registrati")
    FasiLavorazione: bool = Field(False, description="Fasi lavorazione documentate")
    PPUtente: bool = Field(False, description="Pick&Place utente documentato")
    Campionatura: bool = Field(False, description="Campionatura completata")
    DocProduzione: bool = Field(False, description="Documentazione produzione completata")


class DocUTCreate(DocUTBase):
    """Schema for creating a new DocUT"""
    pass


class DocUTUpdate(BaseModel):
    """Schema for updating a DocUT (tutti i campi opzionali)"""
    Descrizione: Optional[str] = Field(None, max_length=200)

    # Sezione UT
    DIBA: Optional[bool] = None
    DIBAData: Optional[datetime] = None
    DIBAUtente: Optional[str] = Field(None, max_length=100)

    ProgrammaMyData: Optional[bool] = None
    ProgrammaMyDataData: Optional[datetime] = None
    ProgrammaMyDataUtente: Optional[str] = Field(None, max_length=100)

    PDM: Optional[bool] = None
    PDMData: Optional[datetime] = None
    PDMUtente: Optional[str] = Field(None, max_length=100)

    FileLaminaTelaio: Optional[str] = Field(None, max_length=20)
    FileLaminaTelaioData: Optional[datetime] = None
    FileLaminaTelaioUtente: Optional[str] = Field(None, max_length=100)

    # Sezione Cliente
    DIBACliente: Optional[bool] = None
    PDMCliente: Optional[bool] = None
    FilePP: Optional[bool] = None

    # Sezione Post Production
    FotoPCB: Optional[bool] = None
    FotoProdotto: Optional[bool] = None
    TempiLavorazione: Optional[bool] = None
    FasiLavorazione: Optional[bool] = None
    PPUtente: Optional[bool] = None
    Campionatura: Optional[bool] = None
    DocProduzione: Optional[bool] = None


class DocUTResponse(DocUTBase):
    """Schema for DocUT response"""
    model_config = ConfigDict(from_attributes=True)

    DocUTID: int
    DataInserimento: datetime
    DataModifica: datetime
    Attivo: bool


class DocUTList(BaseModel):
    """Schema for list of DocUT"""
    items: list[DocUTResponse]
    total: int
    page: int = 1
    page_size: int = 30
