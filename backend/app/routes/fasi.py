"""
API Routes for Fasi (Production Phases)
© 2025 Enrico Callegaro - Tutti i diritti riservati.
"""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.core.database import get_db_asi_gest
from app.models import Fase, FaseTipo, Lotto
from app.schemas import (
    FaseCreate,
    FaseUpdate,
    FaseResponse,
    FaseWithDetails,
    FaseList,
)

router = APIRouter()


@router.get("/", response_model=FaseList)
def list_fasi(
    commessa_erp_id: Optional[int] = Query(None, description="Filtra per CommessaERPId"),
    completata: Optional[bool] = Query(None, description="Filtra per fasi completate"),
    page: int = Query(1, ge=1, description="Numero pagina"),
    page_size: int = Query(50, ge=1, le=100, description="Elementi per pagina"),
    db: Session = Depends(get_db_asi_gest),
):
    """
    Lista tutte le fasi con paginazione e filtri.

    Parametri:
    - commessa_erp_id: Filtra per CommessaERPId (ID commessa ASITRON)
    - completata: Filtra per fasi completate (True) o non completate (False)
    - page: Numero di pagina (default 1)
    - page_size: Elementi per pagina (default 50, max 100)
    """
    # Build query
    stmt = select(Fase)

    if commessa_erp_id:
        stmt = stmt.where(Fase.CommessaERPId == commessa_erp_id)

    if completata is not None:
        stmt = stmt.where(Fase.Stato == ("CHIUSA" if completata else "APERTA"))

    # Count total
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = db.execute(count_stmt).scalar()

    # Apply pagination
    stmt = stmt.order_by(Fase.FaseID.desc())
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    # Execute query
    result = db.execute(stmt)
    fasi = result.scalars().all()

    return FaseList(
        items=[FaseResponse.model_validate(fase) for fase in fasi],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{fase_id}", response_model=FaseWithDetails)
def get_fase(
    fase_id: int,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Recupera dettagli di una singola fase con informazioni correlate.

    Include:
    - FaseTipo: tipo di fase (SMD, PTH, CONTROLLO, etc.)
    - Statistiche dai lotti (numero, quantità prodotta, scarti)
    """
    # Query con join per recuperare dettagli
    stmt = (
        select(
            Fase,
            FaseTipo.Codice.label("FaseTipoCodice"),
            FaseTipo.Descrizione.label("FaseTipoDescrizione"),
            FaseTipo.Tipo.label("FaseTipoTipo"),
        )
        .join(FaseTipo, Fase.FaseTipoID == FaseTipo.FaseTipoID)
        .where(Fase.FaseID == fase_id)
    )

    result = db.execute(stmt).first()

    if not result:
        raise HTTPException(status_code=404, detail="Fase not found")

    fase, fase_tipo_cod, fase_tipo_desc, fase_tipo_tipo = result

    # Get lotto statistics
    lotti_stmt = select(
        func.count(Lotto.LottoID).label("count"),
        func.coalesce(func.sum(Lotto.QtaOutput), 0).label("qty_prodotta"),
        func.coalesce(func.sum(Lotto.QtaScarti), 0).label("qty_scarti"),
    ).where(Lotto.FaseID == fase_id)

    lotti_stats = db.execute(lotti_stmt).first()

    # Costruisci response con dettagli
    fase_dict = FaseResponse.model_validate(fase).model_dump()
    fase_dict.update({
        "FaseTipoCodice": fase_tipo_cod,
        "FaseTipoDescrizione": fase_tipo_desc,
        "FaseTipoTipo": fase_tipo_tipo,
        "NumeroLotti": lotti_stats.count if lotti_stats else 0,
        "QuantitaProdotta": int(lotti_stats.qty_prodotta) if lotti_stats else 0,
        "QuantitaScarti": int(lotti_stats.qty_scarti) if lotti_stats else 0,
    })

    return FaseWithDetails(**fase_dict)


@router.post("/", response_model=FaseResponse, status_code=201)
def create_fase(
    fase_data: FaseCreate,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Crea una nuova fase.

    Parametri obbligatori:
    - CommessaERPId: ID commessa ASITRON
    - FaseTipoID: ID del tipo di fase (SMD, PTH, CONTROLLO, etc.)
    - QtaPrevista: Quantità prevista da produrre
    - Stato: Stato iniziale (default: APERTA)

    La fase viene creata con stato "APERTA" se non specificato.
    """
    # Verifica che il FaseTipo esista
    fase_tipo = db.get(FaseTipo, fase_data.FaseTipoID)
    if not fase_tipo:
        raise HTTPException(status_code=404, detail="FaseTipo not found")

    # Crea nuova fase
    new_fase = Fase(
        CommessaERPId=fase_data.CommessaERPId,
        FaseTipoID=fase_data.FaseTipoID,
        Stato=fase_data.Stato or "APERTA",
        DataApertura=datetime.utcnow(),
        QtaPrevista=fase_data.QtaPrevista,
        QtaProdotta=fase_data.QtaProdotta or 0,
        QtaResidua=fase_data.QtaResidua or fase_data.QtaPrevista,
        Note=fase_data.Note,
    )

    db.add(new_fase)
    db.commit()
    db.refresh(new_fase)

    return FaseResponse.model_validate(new_fase)


@router.put("/{fase_id}", response_model=FaseResponse)
def update_fase(
    fase_id: int,
    fase_data: FaseUpdate,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Aggiorna una fase.

    Campi aggiornabili:
    - Quantita: Quantità da produrre
    - Note: Note sulla fase
    - Completata: Se True, chiude la fase impostando Stato="CHIUSA" e DataChiusura
    """
    fase = db.get(Fase, fase_id)

    if not fase:
        raise HTTPException(status_code=404, detail="Fase not found")

    # Update campi
    if fase_data.Quantita is not None:
        fase.Quantita = fase_data.Quantita
        fase.QtaPrevista = fase_data.Quantita

    if fase_data.Note is not None:
        fase.Note = fase_data.Note

    if fase_data.Completata is not None:
        if fase_data.Completata:
            fase.Stato = "CHIUSA"
            fase.DataChiusura = datetime.utcnow()
        else:
            fase.Stato = "APERTA"
            fase.DataChiusura = None

    fase.DataModifica = datetime.utcnow()

    db.commit()
    db.refresh(fase)

    return FaseResponse.model_validate(fase)


@router.delete("/{fase_id}", status_code=204)
def delete_fase(
    fase_id: int,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Elimina una fase.

    ⚠️ Precondizioni:
    - La fase non deve avere lotti associati
    - La fase deve essere in stato "APERTA"

    Usa con cautela! Alternativamente, chiudi la fase invece di eliminarla.
    """
    fase = db.get(Fase, fase_id)

    if not fase:
        raise HTTPException(status_code=404, detail="Fase not found")

    if fase.Stato != "APERTA":
        raise HTTPException(
            status_code=400,
            detail="Cannot delete fase that is not APERTA. Close the fase instead.",
        )

    # Check if there are lotti
    lotti_count = db.execute(
        select(func.count(Lotto.LottoID)).where(Lotto.FaseID == fase_id)
    ).scalar()

    if lotti_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete fase with {lotti_count} associated lotti",
        )

    db.delete(fase)
    db.commit()

    return None
