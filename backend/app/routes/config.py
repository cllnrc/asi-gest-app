"""
API Routes for ConfigCommessa (Work Order Configuration)
© 2025 Enrico Callegaro - Tutti i diritti riservati.
"""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.core.database import get_db_asi_gest
from app.models.config_commessa import ConfigCommessa
from app.models.fase import Fase
from app.schemas import (
    ConfigCommessaCreate,
    ConfigCommessaUpdate,
    ConfigCommessaResponse,
    ConfigCommessaWithFasi,
    ConfigCommessaList,
)

router = APIRouter()


@router.get("/config", response_model=ConfigCommessaList)
def list_config(
    attivo: Optional[bool] = Query(None, description="Filtra per stato (attivo/inattivo)"),
    page: int = Query(1, ge=1, description="Numero pagina"),
    page_size: int = Query(50, ge=1, le=100, description="Elementi per pagina"),
    db: Session = Depends(get_db_asi_gest),
):
    """
    Lista tutte le configurazioni commesse con paginazione e filtri.

    Parametri:
    - attivo: Filtra per configurazioni attive (True) o inattive (False)
    - page: Numero di pagina (default 1)
    - page_size: Elementi per pagina (default 50, max 100)
    """
    # Build query
    stmt = select(ConfigCommessa)

    if attivo is not None:
        stmt = stmt.where(ConfigCommessa.Attivo == attivo)

    # Count total
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = db.execute(count_stmt).scalar()

    # Apply pagination
    stmt = stmt.order_by(ConfigCommessa.ConfigCommessaID.desc())
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    # Execute query
    result = db.execute(stmt)
    configs = result.scalars().all()

    return ConfigCommessaList(
        items=[ConfigCommessaResponse.model_validate(config) for config in configs],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{config_id}", response_model=ConfigCommessaWithFasi)
def get_config(
    config_id: int,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Recupera dettagli di una configurazione con le fasi associate.

    Include:
    - Informazioni della configurazione (codice articolo, descrizione)
    - Lista dei tipi di fase previsti per questa commessa
    - Riferimenti al gestionale ASITRON (CommessaERPId)
    """
    config = db.get(ConfigCommessa, config_id)

    if not config:
        raise HTTPException(status_code=404, detail="ConfigCommessa not found")

    # Get associated fasi and their types
    fasi_stmt = (
        select(Fase, Fase.FaseTipoID)
        .where(Fase.CommessaERPId == config.CommessaERPId)
        .distinct()
    )
    fasi = db.execute(fasi_stmt).scalars().all()

    # Extract unique FaseTipi from fasi
    fasi_tipo_list = list(set([{"FaseTipoID": f.FaseTipoID} for f in fasi]))

    config_dict = ConfigCommessaResponse.model_validate(config).model_dump()
    config_dict["FasiTipo"] = fasi_tipo_list

    return ConfigCommessaWithFasi(**config_dict)


@router.post("/config", response_model=ConfigCommessaResponse, status_code=201)
def create_config(
    config_data: ConfigCommessaCreate,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Crea una nuova configurazione commessa.

    Parametri obbligatori:
    - CodiceArticolo: Codice articolo (es. "45.001.234")
    - Descrizione: Descrizione dell'articolo
    - Note: Note sulla configurazione (opzionale)

    Note: CommessaERPId deve essere assegnato separatamente tramite put.
    La configurazione viene creata con stato Attivo=True.
    """
    # Crea nuova configurazione
    new_config = ConfigCommessa(
        CommessaERPId=0,  # Placeholder - sarà aggiornato separatamente
        CodiceArticolo=config_data.CodiceArticolo,
        Descrizione=config_data.Descrizione,
        Note=config_data.Note,
        DataCreazione=datetime.utcnow(),
        Attivo=True,
    )

    db.add(new_config)
    db.commit()
    db.refresh(new_config)

    return ConfigCommessaResponse.model_validate(new_config)


@router.put("/{config_id}", response_model=ConfigCommessaResponse)
def update_config(
    config_id: int,
    config_data: ConfigCommessaUpdate,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Aggiorna una configurazione commessa.

    Campi aggiornabili:
    - Descrizione: Descrizione dell'articolo
    - Note: Note sulla configurazione
    - Attivo: Se False, disabilita la configurazione (soft delete)

    Non è possibile aggiornare CodiceArticolo direttamente.
    """
    config = db.get(ConfigCommessa, config_id)

    if not config:
        raise HTTPException(status_code=404, detail="ConfigCommessa not found")

    # Update campi
    if config_data.Descrizione is not None:
        config.Descrizione = config_data.Descrizione

    if config_data.Note is not None:
        config.Note = config_data.Note

    if config_data.Attivo is not None:
        config.Attivo = config_data.Attivo

    config.DataUltimaModifica = datetime.utcnow()

    db.commit()
    db.refresh(config)

    return ConfigCommessaResponse.model_validate(config)


@router.delete("/{config_id}", status_code=204)
def delete_config(
    config_id: int,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Soft delete di una configurazione commessa.

    Imposta Attivo=False invece di eliminarla fisicamente dal database.
    Questo preserva l'integrità referenziale con le fasi.

    Per eliminare fisicamente, usare un endpoint admin separato.
    """
    config = db.get(ConfigCommessa, config_id)

    if not config:
        raise HTTPException(status_code=404, detail="ConfigCommessa not found")

    config.Attivo = False
    config.DataUltimaModifica = datetime.utcnow()

    db.commit()

    return None
