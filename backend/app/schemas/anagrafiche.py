"""
Pydantic schemas for Anagrafiche (Utenti, Macchine)
© 2025 Enrico Callegaro - Tutti i diritti riservati.

Schemas for CRUD operations on master data: operators and equipment.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# ========== UTENTI SCHEMAS ==========

class UtenteBase(BaseModel):
    """Base schema for Utente - shared fields"""
    Username: str = Field(..., min_length=3, max_length=50, description="Username unico")
    NomeCompleto: str = Field(..., min_length=1, max_length=100, description="Nome e cognome completo")
    Email: Optional[str] = Field(None, max_length=100, description="Email (opzionale)")
    Reparto: Optional[str] = Field(None, max_length=50, description="Reparto di appartenenza")
    Ruolo: Optional[str] = Field(None, max_length=50, description="Ruolo (OPERATORE, SUPERVISOR, ADMIN)")


class UtenteCreate(UtenteBase):
    """Schema for creating a new Utente"""
    Attivo: bool = Field(True, description="Utente attivo")


class UtenteUpdate(BaseModel):
    """Schema for updating an existing Utente - all fields optional"""
    Username: Optional[str] = Field(None, min_length=3, max_length=50)
    NomeCompleto: Optional[str] = Field(None, min_length=1, max_length=100)
    Email: Optional[str] = Field(None, max_length=100)
    Reparto: Optional[str] = Field(None, max_length=50)
    Ruolo: Optional[str] = Field(None, max_length=50)
    Attivo: Optional[bool] = None


class UtenteResponse(UtenteBase):
    """Schema for Utente response - includes all DB fields"""
    UtenteID: int
    Attivo: bool
    DataCreazione: datetime

    class Config:
        from_attributes = True


class UtenteList(BaseModel):
    """Schema for list of Utenti with pagination info"""
    items: list[UtenteResponse]
    total: int
    page: int
    page_size: int


# ========== MACCHINE SCHEMAS ==========

class MacchinaBase(BaseModel):
    """Base schema for Macchina - shared fields"""
    Codice: str = Field(..., min_length=1, max_length=50, description="Codice macchina univoco")
    Descrizione: Optional[str] = Field(None, max_length=100, description="Descrizione macchina")
    Reparto: str = Field(..., max_length=50, description="Reparto (SMD, PTH, CONTROLLI)")
    Tipo: Optional[str] = Field(None, max_length=50, description="Tipo macchina")
    Note: Optional[str] = Field(None, description="Note aggiuntive")


class MacchinaCreate(MacchinaBase):
    """Schema for creating a new Macchina"""
    Attiva: bool = Field(True, description="Macchina attiva")


class MacchinaUpdate(BaseModel):
    """Schema for updating an existing Macchina - all fields optional"""
    Codice: Optional[str] = Field(None, min_length=1, max_length=50)
    Descrizione: Optional[str] = Field(None, max_length=100)
    Reparto: Optional[str] = Field(None, max_length=50)
    Tipo: Optional[str] = Field(None, max_length=50)
    Attiva: Optional[bool] = None
    Note: Optional[str] = None


class MacchinaResponse(MacchinaBase):
    """Schema for Macchina response - includes all DB fields"""
    MacchinaID: int
    Attiva: bool

    class Config:
        from_attributes = True


class MacchinaList(BaseModel):
    """Schema for list of Macchine with pagination info"""
    items: list[MacchinaResponse]
    total: int
    page: int
    page_size: int
