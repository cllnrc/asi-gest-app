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


@router.get("", response_model=ConfigCommessaList)
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

    # Count total - build separate count query with same filters
    count_stmt = select(func.count(ConfigCommessa.ConfigCommessaID))
    if attivo is not None:
        count_stmt = count_stmt.where(ConfigCommessa.Attivo == attivo)
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


@router.get("/by-erp-id/{commessa_erp_id}", response_model=ConfigCommessaResponse)
def get_config_by_erp_id(
    commessa_erp_id: int,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Recupera configurazione per CommessaERPId.

    Utile per verificare se una commessa dal gestionale ERP è già configurata.
    Ritorna 404 se non esiste.
    """
    config = db.execute(
        select(ConfigCommessa).where(ConfigCommessa.CommessaERPId == commessa_erp_id)
    ).scalar_one_or_none()

    if not config:
        raise HTTPException(
            status_code=404,
            detail=f"ConfigCommessa not found for CommessaERPId={commessa_erp_id}"
        )

    return ConfigCommessaResponse.model_validate(config)


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


@router.post("", response_model=ConfigCommessaResponse, status_code=201)
def create_config(
    config_data: ConfigCommessaCreate,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Crea una nuova configurazione commessa.

    Parametri obbligatori:
    - CommessaERPId: ID commessa dal gestionale ERP
    - CodiceArticolo: Codice articolo (es. "45.001.234")
    - Descrizione: Descrizione dell'articolo

    Parametri opzionali:
    - FlagSMD, FlagPTH, FlagControlli, FlagTerzista: Flag fasi produttive
    - DIBA: Codice DIBA
    - Revisione: Revisione scheda
    - Note: Note sulla configurazione

    La configurazione viene creata con stato Attivo=True.
    """
    # Check if already exists
    existing = db.execute(
        select(ConfigCommessa).where(ConfigCommessa.CommessaERPId == config_data.CommessaERPId)
    ).scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Configurazione già esistente per CommessaERPId={config_data.CommessaERPId}"
        )

    # Crea nuova configurazione
    new_config = ConfigCommessa(
        CommessaERPId=config_data.CommessaERPId,
        CodiceArticolo=config_data.CodiceArticolo,
        Descrizione=config_data.Descrizione,
        FlagSMD=config_data.FlagSMD,
        FlagPTH=config_data.FlagPTH,
        FlagControlli=config_data.FlagControlli,
        FlagTerzista=config_data.FlagTerzista,
        DIBA=config_data.DIBA,
        Revisione=config_data.Revisione,
        BloccataDocumentazione=config_data.BloccataDocumentazione,
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
    - FlagSMD, FlagPTH, FlagControlli, FlagTerzista: Flag fasi produttive
    - DIBA: Codice DIBA
    - Revisione: Revisione scheda
    - BloccataDocumentazione: Flag blocco per documentazione
    - Note: Note sulla configurazione
    - Attivo: Se False, disabilita la configurazione (soft delete)

    Non è possibile aggiornare CodiceArticolo o CommessaERPId.
    """
    config = db.get(ConfigCommessa, config_id)

    if not config:
        raise HTTPException(status_code=404, detail="ConfigCommessa not found")

    # Update campi
    if config_data.Descrizione is not None:
        config.Descrizione = config_data.Descrizione

    if config_data.FlagSMD is not None:
        config.FlagSMD = config_data.FlagSMD

    if config_data.FlagPTH is not None:
        config.FlagPTH = config_data.FlagPTH

    if config_data.FlagControlli is not None:
        config.FlagControlli = config_data.FlagControlli

    if config_data.FlagTerzista is not None:
        config.FlagTerzista = config_data.FlagTerzista

    if config_data.DIBA is not None:
        config.DIBA = config_data.DIBA

    if config_data.Revisione is not None:
        config.Revisione = config_data.Revisione

    if config_data.BloccataDocumentazione is not None:
        config.BloccataDocumentazione = config_data.BloccataDocumentazione

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
