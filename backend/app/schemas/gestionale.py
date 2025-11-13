"""
Pydantic schemas for Gestionale (Read-only integration with ASITRON DB)
© 2025 Enrico Callegaro - Tutti i diritti riservati.
"""

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field


class CommessaGestionale(BaseModel):
    """Schema for Commessa from ASITRON gestionale"""
    PROGRESSIVO: int
    ESERCIZIO: int
    NUMEROCOM: int
    RIFCOMMCLI: Optional[str] = None
    CODCLIENTE: Optional[str] = None
    NomeCliente: Optional[str] = None
    DATAEMISSIONE: Optional[date] = None
    DATAINIZIOPIANO: Optional[date] = None
    DATAFINEPIANO: Optional[date] = None
    STATOCHIUSO: int
    ANNOTAZIONI: Optional[str] = None

    # Campi dalle righe (se join)
    CODART: Optional[str] = None
    DESCRIZIONEART: Optional[str] = None
    QTAGESTIONE: Optional[float] = None


class ArticoloGestionale(BaseModel):
    """Schema for Articolo from ASITRON gestionale (ANAGRAFICAARTICOLI)"""
    CODICE: str
    DESCRIZIONE: Optional[str] = None
    TIPOLOGIA: Optional[str] = None  # Maps to ARTTIPOLOGIA


class ClienteGestionale(BaseModel):
    """Schema for Cliente from ASITRON gestionale"""
    CODCONTO: str
    DSCCONTO1: str
    DSCCONTO2: Optional[str] = None
    PIVA: Optional[str] = None
    CODFISCALE: Optional[str] = None
    INDIRIZZO: Optional[str] = None
    CITTA: Optional[str] = None
    PROVINCIA: Optional[str] = None
    CAP: Optional[str] = None


class DepositoGestionale(BaseModel):
    """Schema for Deposito from ASITRON gestionale"""
    CODICE: str
    DESCRIZIONE: str


class CommessaList(BaseModel):
    """Schema for list of Commesse"""
    items: list[CommessaGestionale]
    total: int


class ArticoloList(BaseModel):
    """Schema for list of Articoli"""
    items: list[ArticoloGestionale]
    total: int


class ClienteList(BaseModel):
    """Schema for list of Clienti"""
    items: list[ClienteGestionale]
    total: int
