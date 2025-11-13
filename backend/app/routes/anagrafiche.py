"""
API Routes for Anagrafiche (Master Data: Utenti, Macchine)
© 2025 Enrico Callegaro - Tutti i diritti riservati.

CRUD endpoints for managing operators (Utenti) and equipment (Macchine).
These are the master data tables for production operations.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db_asi_gest
from app.models.utente import Utente
from app.models.macchina import Macchina
from app.schemas.anagrafiche import (
    UtenteCreate,
    UtenteUpdate,
    UtenteResponse,
    UtenteList,
    MacchinaCreate,
    MacchinaUpdate,
    MacchinaResponse,
    MacchinaList,
)

router = APIRouter()


# ========== UTENTI ENDPOINTS ==========

@router.get("/utenti", response_model=UtenteList)
def list_utenti(
    page: int = Query(1, ge=1, description="Numero pagina"),
    page_size: int = Query(50, ge=1, le=100, description="Elementi per pagina"),
    reparto: Optional[str] = Query(None, description="Filtra per reparto"),
    attivo: Optional[bool] = Query(None, description="Filtra per stato attivo"),
    db: Session = Depends(get_db_asi_gest),
):
    """
    Lista utenti/operatori con paginazione.

    Parametri:
    - page: Numero pagina (default 1)
    - page_size: Elementi per pagina (default 50, max 100)
    - reparto: Filtra per reparto (opzionale)
    - attivo: Filtra per stato attivo (True/False, opzionale)

    Ritorna:
    - Lista paginata di utenti con conteggio totale
    """
    # Build query
    query = db.query(Utente)

    # Apply filters
    if reparto is not None:
        query = query.filter(Utente.Reparto == reparto)
    if attivo is not None:
        query = query.filter(Utente.Attivo == attivo)

    # Get total count
    total = query.count()

    # Apply pagination
    offset = (page - 1) * page_size
    utenti = query.order_by(Utente.Username).offset(offset).limit(page_size).all()

    return UtenteList(
        items=utenti,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/utenti/{utente_id}", response_model=UtenteResponse)
def get_utente(
    utente_id: int,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Recupera dettagli di un singolo utente.

    Parametri:
    - utente_id: ID dell'utente

    Ritorna:
    - Dettagli completi dell'utente

    Errori:
    - 404: Utente non trovato
    """
    utente = db.query(Utente).filter(Utente.UtenteID == utente_id).first()

    if not utente:
        raise HTTPException(status_code=404, detail=f"Utente {utente_id} non trovato")

    return utente


@router.post("/utenti", response_model=UtenteResponse, status_code=201)
def create_utente(
    utente_data: UtenteCreate,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Crea un nuovo utente/operatore.

    Body:
    - Username: username univoco (3-50 caratteri)
    - NomeCompleto: nome completo (obbligatorio)
    - Email: email (opzionale)
    - Reparto: reparto di appartenenza (opzionale)
    - Ruolo: OPERATORE, SUPERVISOR, ADMIN (opzionale)
    - Attivo: stato attivo (default True)

    Ritorna:
    - Utente creato con ID assegnato

    Errori:
    - 400: Username già esistente o dati non validi
    """
    # Check if username already exists
    existing = db.query(Utente).filter(Utente.Username == utente_data.Username).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Username '{utente_data.Username}' già esistente"
        )

    # Create new utente
    utente = Utente(**utente_data.model_dump())

    try:
        db.add(utente)
        db.commit()
        db.refresh(utente)
        return utente
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Errore durante la creazione dell'utente: {str(e)}"
        )


@router.put("/utenti/{utente_id}", response_model=UtenteResponse)
def update_utente(
    utente_id: int,
    utente_data: UtenteUpdate,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Aggiorna un utente esistente.

    Parametri:
    - utente_id: ID dell'utente da aggiornare

    Body:
    - Tutti i campi sono opzionali
    - Solo i campi forniti vengono aggiornati

    Ritorna:
    - Utente aggiornato

    Errori:
    - 404: Utente non trovato
    - 400: Username già esistente (se cambiato)
    """
    # Get existing utente
    utente = db.query(Utente).filter(Utente.UtenteID == utente_id).first()
    if not utente:
        raise HTTPException(status_code=404, detail=f"Utente {utente_id} non trovato")

    # Check if username is being changed and already exists
    if utente_data.Username and utente_data.Username != utente.Username:
        existing = db.query(Utente).filter(Utente.Username == utente_data.Username).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"Username '{utente_data.Username}' già esistente"
            )

    # Update fields (only non-None values)
    update_data = utente_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(utente, field, value)

    try:
        db.commit()
        db.refresh(utente)
        return utente
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Errore durante l'aggiornamento dell'utente: {str(e)}"
        )


@router.delete("/utenti/{utente_id}", response_model=UtenteResponse)
def delete_utente(
    utente_id: int,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Disattiva un utente (soft delete).

    Parametri:
    - utente_id: ID dell'utente da disattivare

    Comportamento:
    - Imposta Attivo = False invece di eliminare il record
    - Preserva lo storico dei lotti associati

    Ritorna:
    - Utente disattivato

    Errori:
    - 404: Utente non trovato
    """
    utente = db.query(Utente).filter(Utente.UtenteID == utente_id).first()
    if not utente:
        raise HTTPException(status_code=404, detail=f"Utente {utente_id} non trovato")

    # Soft delete: set Attivo = False
    utente.Attivo = False

    try:
        db.commit()
        db.refresh(utente)
        return utente
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Errore durante la disattivazione dell'utente: {str(e)}"
        )


# ========== MACCHINE ENDPOINTS ==========

@router.get("/macchine", response_model=MacchinaList)
def list_macchine(
    page: int = Query(1, ge=1, description="Numero pagina"),
    page_size: int = Query(50, ge=1, le=100, description="Elementi per pagina"),
    reparto: Optional[str] = Query(None, description="Filtra per reparto (SMD, PTH, CONTROLLI)"),
    attiva: Optional[bool] = Query(None, description="Filtra per stato attiva"),
    db: Session = Depends(get_db_asi_gest),
):
    """
    Lista macchine/impianti con paginazione.

    Parametri:
    - page: Numero pagina (default 1)
    - page_size: Elementi per pagina (default 50, max 100)
    - reparto: Filtra per reparto (SMD, PTH, CONTROLLI) (opzionale)
    - attiva: Filtra per stato attiva (True/False, opzionale)

    Ritorna:
    - Lista paginata di macchine con conteggio totale
    """
    # Build query
    query = db.query(Macchina)

    # Apply filters
    if reparto is not None:
        query = query.filter(Macchina.Reparto == reparto)
    if attiva is not None:
        query = query.filter(Macchina.Attiva == attiva)

    # Get total count
    total = query.count()

    # Apply pagination
    offset = (page - 1) * page_size
    macchine = query.order_by(Macchina.Codice).offset(offset).limit(page_size).all()

    return MacchinaList(
        items=macchine,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/macchine/{macchina_id}", response_model=MacchinaResponse)
def get_macchina(
    macchina_id: int,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Recupera dettagli di una singola macchina.

    Parametri:
    - macchina_id: ID della macchina

    Ritorna:
    - Dettagli completi della macchina

    Errori:
    - 404: Macchina non trovata
    """
    macchina = db.query(Macchina).filter(Macchina.MacchinaID == macchina_id).first()

    if not macchina:
        raise HTTPException(status_code=404, detail=f"Macchina {macchina_id} non trovata")

    return macchina


@router.post("/macchine", response_model=MacchinaResponse, status_code=201)
def create_macchina(
    macchina_data: MacchinaCreate,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Crea una nuova macchina/impianto.

    Body:
    - Codice: codice macchina univoco (obbligatorio)
    - Descrizione: descrizione (opzionale)
    - Reparto: SMD, PTH, CONTROLLI (obbligatorio)
    - Tipo: tipo macchina (opzionale)
    - Note: note aggiuntive (opzionale)
    - Attiva: stato attiva (default True)

    Ritorna:
    - Macchina creata con ID assegnato

    Errori:
    - 400: Codice già esistente o dati non validi
    """
    # Check if codice already exists
    existing = db.query(Macchina).filter(Macchina.Codice == macchina_data.Codice).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Codice macchina '{macchina_data.Codice}' già esistente"
        )

    # Create new macchina
    macchina = Macchina(**macchina_data.model_dump())

    try:
        db.add(macchina)
        db.commit()
        db.refresh(macchina)
        return macchina
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Errore durante la creazione della macchina: {str(e)}"
        )


@router.put("/macchine/{macchina_id}", response_model=MacchinaResponse)
def update_macchina(
    macchina_id: int,
    macchina_data: MacchinaUpdate,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Aggiorna una macchina esistente.

    Parametri:
    - macchina_id: ID della macchina da aggiornare

    Body:
    - Tutti i campi sono opzionali
    - Solo i campi forniti vengono aggiornati

    Ritorna:
    - Macchina aggiornata

    Errori:
    - 404: Macchina non trovata
    - 400: Codice già esistente (se cambiato)
    """
    # Get existing macchina
    macchina = db.query(Macchina).filter(Macchina.MacchinaID == macchina_id).first()
    if not macchina:
        raise HTTPException(status_code=404, detail=f"Macchina {macchina_id} non trovata")

    # Check if codice is being changed and already exists
    if macchina_data.Codice and macchina_data.Codice != macchina.Codice:
        existing = db.query(Macchina).filter(Macchina.Codice == macchina_data.Codice).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"Codice macchina '{macchina_data.Codice}' già esistente"
            )

    # Update fields (only non-None values)
    update_data = macchina_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(macchina, field, value)

    try:
        db.commit()
        db.refresh(macchina)
        return macchina
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Errore durante l'aggiornamento della macchina: {str(e)}"
        )


@router.delete("/macchine/{macchina_id}", response_model=MacchinaResponse)
def delete_macchina(
    macchina_id: int,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Disattiva una macchina (soft delete).

    Parametri:
    - macchina_id: ID della macchina da disattivare

    Comportamento:
    - Imposta Attiva = False invece di eliminare il record
    - Preserva lo storico dei lotti associati

    Ritorna:
    - Macchina disattivata

    Errori:
    - 404: Macchina non trovata
    """
    macchina = db.query(Macchina).filter(Macchina.MacchinaID == macchina_id).first()
    if not macchina:
        raise HTTPException(status_code=404, detail=f"Macchina {macchina_id} non trovata")

    # Soft delete: set Attiva = False
    macchina.Attiva = False

    try:
        db.commit()
        db.refresh(macchina)
        return macchina
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Errore durante la disattivazione della macchina: {str(e)}"
        )
