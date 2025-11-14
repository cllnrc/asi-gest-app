"""
API Routes for FasiTipo (Phase Types Master Data)
© 2025 Enrico Callegaro - Tutti i diritti riservati.

CRUD endpoints for managing production phase types (SMD, PTH, CONTROLLO, etc.)
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.core.database import get_db_asi_gest
from app.models.fase_tipo import FaseTipo
from app.schemas.fase_tipo import (
    FaseTipoCreate,
    FaseTipoUpdate,
    FaseTipoResponse,
    FaseTipoList,
)

router = APIRouter()


@router.get("", response_model=FaseTipoList)
def list_fasi_tipo(
    page: int = Query(1, ge=1, description="Numero pagina"),
    page_size: int = Query(50, ge=1, le=100, description="Elementi per pagina"),
    tipo: Optional[str] = Query(None, description="Filtra per tipo (SMD, PTH, CONTROLLO, ALTRO)"),
    attivo: Optional[bool] = Query(None, description="Filtra per stato attivo"),
    db: Session = Depends(get_db_asi_gest),
):
    """
    Lista tipi di fase con paginazione.

    Parametri:
    - page: Numero pagina (default 1)
    - page_size: Elementi per pagina (default 50, max 100)
    - tipo: Filtra per tipo fase (SMD, PTH, CONTROLLO, ALTRO) (opzionale)
    - attivo: Filtra per stato attivo (True/False, opzionale)

    Ritorna:
    - Lista paginata di tipi fase con conteggio totale
    """
    # Build query
    stmt = select(FaseTipo)

    # Apply filters
    if tipo is not None:
        stmt = stmt.where(FaseTipo.Tipo == tipo)
    if attivo is not None:
        stmt = stmt.where(FaseTipo.Attivo == attivo)

    # Count total
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = db.execute(count_stmt).scalar()

    # Apply pagination and ordering
    stmt = stmt.order_by(FaseTipo.OrdineVisualizzazione, FaseTipo.Codice)
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    # Execute query
    result = db.execute(stmt)
    fasi_tipo = result.scalars().all()

    return FaseTipoList(
        items=[FaseTipoResponse.model_validate(ft) for ft in fasi_tipo],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/fasi-tipo/{fase_tipo_id}", response_model=FaseTipoResponse)
def get_fase_tipo(
    fase_tipo_id: int,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Recupera dettagli di un singolo tipo fase.

    Parametri:
    - fase_tipo_id: ID del tipo fase

    Ritorna:
    - Dettagli completi del tipo fase

    Errori:
    - 404: Tipo fase non trovato
    """
    fase_tipo = db.get(FaseTipo, fase_tipo_id)

    if not fase_tipo:
        raise HTTPException(
            status_code=404,
            detail=f"FaseTipo {fase_tipo_id} non trovato"
        )

    return FaseTipoResponse.model_validate(fase_tipo)


@router.post("", response_model=FaseTipoResponse, status_code=201)
def create_fase_tipo(
    fase_tipo_data: FaseTipoCreate,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Crea un nuovo tipo fase.

    Body:
    - Codice: codice univoco (obbligatorio, max 20 caratteri)
    - Descrizione: descrizione (obbligatorio, max 100 caratteri)
    - Tipo: categoria (SMD, PTH, CONTROLLO, ALTRO) (obbligatorio)
    - RichiedeSeriale: flag seriale richiesto (default False)
    - RichiedeControllo: flag controllo richiesto (default False)
    - OrdineVisualizzazione: ordine (default 0)
    - Attivo: stato attivo (default True)

    Ritorna:
    - Tipo fase creato con ID assegnato

    Errori:
    - 400: Codice già esistente o dati non validi
    """
    # Check if codice already exists
    stmt = select(FaseTipo).where(FaseTipo.Codice == fase_tipo_data.Codice)
    existing = db.execute(stmt).scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Codice '{fase_tipo_data.Codice}' già esistente"
        )

    # Create new fase tipo
    fase_tipo = FaseTipo(**fase_tipo_data.model_dump())

    try:
        db.add(fase_tipo)
        db.commit()
        db.refresh(fase_tipo)
        return FaseTipoResponse.model_validate(fase_tipo)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Errore durante la creazione del tipo fase: {str(e)}"
        )


@router.put("/fasi-tipo/{fase_tipo_id}", response_model=FaseTipoResponse)
def update_fase_tipo(
    fase_tipo_id: int,
    fase_tipo_data: FaseTipoUpdate,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Aggiorna un tipo fase esistente.

    Parametri:
    - fase_tipo_id: ID del tipo fase da aggiornare

    Body:
    - Tutti i campi sono opzionali
    - Solo i campi forniti vengono aggiornati

    Ritorna:
    - Tipo fase aggiornato

    Errori:
    - 404: Tipo fase non trovato
    - 400: Codice già esistente (se cambiato)
    """
    # Get existing fase tipo
    fase_tipo = db.get(FaseTipo, fase_tipo_id)
    if not fase_tipo:
        raise HTTPException(
            status_code=404,
            detail=f"FaseTipo {fase_tipo_id} non trovato"
        )

    # Check if codice is being changed and already exists
    if fase_tipo_data.Codice and fase_tipo_data.Codice != fase_tipo.Codice:
        stmt = select(FaseTipo).where(FaseTipo.Codice == fase_tipo_data.Codice)
        existing = db.execute(stmt).scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"Codice '{fase_tipo_data.Codice}' già esistente"
            )

    # Update fields (only non-None values)
    update_data = fase_tipo_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(fase_tipo, field, value)

    try:
        db.commit()
        db.refresh(fase_tipo)
        return FaseTipoResponse.model_validate(fase_tipo)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Errore durante l'aggiornamento del tipo fase: {str(e)}"
        )


@router.delete("/fasi-tipo/{fase_tipo_id}", response_model=FaseTipoResponse)
def delete_fase_tipo(
    fase_tipo_id: int,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Disattiva un tipo fase (soft delete).

    Parametri:
    - fase_tipo_id: ID del tipo fase da disattivare

    Comportamento:
    - Imposta Attivo = False invece di eliminare il record
    - Preserva lo storico delle fasi che usano questo tipo

    Ritorna:
    - Tipo fase disattivato

    Errori:
    - 404: Tipo fase non trovato
    """
    fase_tipo = db.get(FaseTipo, fase_tipo_id)
    if not fase_tipo:
        raise HTTPException(
            status_code=404,
            detail=f"FaseTipo {fase_tipo_id} non trovato"
        )

    # Soft delete: set Attivo = False
    fase_tipo.Attivo = False

    try:
        db.commit()
        db.refresh(fase_tipo)
        return FaseTipoResponse.model_validate(fase_tipo)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Errore durante la disattivazione del tipo fase: {str(e)}"
        )
