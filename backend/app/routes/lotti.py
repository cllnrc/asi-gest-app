"""
API Routes for Lotti (Production Batches)
© 2025 Enrico Callegaro - Tutti i diritti riservati.
"""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.core.database import get_db_asi_gest
from app.models import Lotto, Fase, Utente, FaseTipo
from app.schemas import (
    LottoCreate,
    LottoClose,
    LottoResponse,
    LottoWithDetails,
    LottoList,
)

# Import AsitronCore business logic
try:
    from asitron_core.business.lotti import calcola_progressivo_lotto
except ImportError:
    # Fallback se AsitronCore non è installato
    def calcola_progressivo_lotto(fase_id: int, db_session):
        result = db_session.execute(
            select(func.coalesce(func.max(Lotto.Progressivo), 0))
            .where(Lotto.FaseID == fase_id)
        ).scalar()
        return result + 1


router = APIRouter()


@router.get("", response_model=LottoList)
def list_lotti(
    fase_id: Optional[int] = Query(None, description="Filtra per FaseID"),
    aperto: Optional[bool] = Query(None, description="Filtra per lotti aperti (DataFine NULL)"),
    page: int = Query(1, ge=1, description="Numero pagina"),
    page_size: int = Query(50, ge=1, le=100, description="Elementi per pagina"),
    db: Session = Depends(get_db_asi_gest),
):
    """
    Lista tutti i lotti con paginazione e filtri.
    """
    # Build query
    stmt = select(Lotto)

    if fase_id:
        stmt = stmt.where(Lotto.FaseID == fase_id)

    if aperto is not None:
        if aperto:
            stmt = stmt.where(Lotto.DataFine.is_(None))
        else:
            stmt = stmt.where(Lotto.DataFine.isnot(None))

    # Count total
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = db.execute(count_stmt).scalar()

    # Apply pagination
    stmt = stmt.order_by(Lotto.LottoID.desc())
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    # Execute query
    result = db.execute(stmt)
    lotti = result.scalars().all()

    return LottoList(
        items=[LottoResponse.model_validate(lotto) for lotto in lotti],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{lotto_id}", response_model=LottoWithDetails)
def get_lotto(
    lotto_id: int,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Recupera dettagli di un singolo lotto con informazioni correlate.
    """
    # Query con join per recuperare dettagli
    stmt = (
        select(
            Lotto,
            Fase.NumeroCommessa,
            FaseTipo.Codice.label("FaseTipoCodice"),
            FaseTipo.Descrizione.label("FaseTipoDescrizione"),
            Utente.NomeCompleto.label("OperatoreNomeCompleto"),
            Utente.Username.label("OperatoreUsername"),
        )
        .join(Fase, Lotto.FaseID == Fase.FaseID)
        .join(FaseTipo, Fase.FaseTipoID == FaseTipo.FaseTipoID)
        .outerjoin(Utente, Lotto.OperatoreID == Utente.UtenteID)
        .where(Lotto.LottoID == lotto_id)
    )

    result = db.execute(stmt).first()

    if not result:
        raise HTTPException(status_code=404, detail="Lotto not found")

    lotto, num_commessa, fase_tipo_cod, fase_tipo_desc, operatore_nome, operatore_username = result

    # Costruisci response con dettagli
    lotto_dict = LottoResponse.model_validate(lotto).model_dump()
    lotto_dict.update({
        "FaseNumeroCommessa": num_commessa,
        "FaseTipoCodice": fase_tipo_cod,
        "FaseTipoDescrizione": fase_tipo_desc,
        "OperatoreNomeCompleto": operatore_nome,
        "OperatoreUsername": operatore_username,
    })

    # Calcola resa e durata
    if lotto.QtaInput and lotto.QtaOutput:
        lotto_dict["Resa"] = round((lotto.QtaOutput / lotto.QtaInput) * 100, 2)

    if lotto.DataFine:
        durata_seconds = (lotto.DataFine - lotto.DataInizio).total_seconds()
        lotto_dict["Durata"] = int(durata_seconds / 60)  # in minuti

    return LottoWithDetails(**lotto_dict)


@router.post("", response_model=LottoResponse, status_code=201)
def create_lotto(
    lotto_data: LottoCreate,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Crea un nuovo lotto (apertura lotto).

    Il progressivo viene calcolato automaticamente usando AsitronCore.
    """
    # Verifica che la fase esista
    fase = db.get(Fase, lotto_data.FaseID)
    if not fase:
        raise HTTPException(status_code=404, detail="Fase not found")

    # Verifica che l'operatore esista (se specificato)
    if lotto_data.OperatoreID:
        operatore = db.get(Utente, lotto_data.OperatoreID)
        if not operatore:
            raise HTTPException(status_code=404, detail="Operatore not found")

    # Calcola progressivo usando AsitronCore
    progressivo = calcola_progressivo_lotto(lotto_data.FaseID, db)

    # Crea nuovo lotto
    new_lotto = Lotto(
        FaseID=lotto_data.FaseID,
        Progressivo=progressivo,
        OperatoreID=lotto_data.OperatoreID,
        MacchinaID=lotto_data.MacchinaID,
        QtaInput=lotto_data.QtaInput,
        QtaOutput=lotto_data.QtaOutput or 0,
        QtaScarti=lotto_data.QtaScarti or 0,
        ProgrammaFeeder=lotto_data.ProgrammaFeeder,
        TempoSetupMin=lotto_data.TempoSetupMin,
        TipoScarto=lotto_data.TipoScarto,
        NoteScarti=lotto_data.NoteScarti,
        Note=lotto_data.Note,
        DataInizio=datetime.utcnow(),
    )

    db.add(new_lotto)
    db.commit()
    db.refresh(new_lotto)

    return LottoResponse.model_validate(new_lotto)


@router.put("/{lotto_id}/close", response_model=LottoResponse)
def close_lotto(
    lotto_id: int,
    close_data: LottoClose,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Chiude un lotto impostando DataFine e quantità finali.
    """
    lotto = db.get(Lotto, lotto_id)

    if not lotto:
        raise HTTPException(status_code=404, detail="Lotto not found")

    if lotto.DataFine:
        raise HTTPException(status_code=400, detail="Lotto already closed")

    # Aggiorna lotto
    lotto.QtaOutput = close_data.QtaOutput
    lotto.QtaScarti = close_data.QtaScarti
    if close_data.Note:
        lotto.Note = close_data.Note
    lotto.DataFine = datetime.utcnow()

    db.commit()
    db.refresh(lotto)

    return LottoResponse.model_validate(lotto)


@router.delete("/{lotto_id}", status_code=204)
def delete_lotto(
    lotto_id: int,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Elimina un lotto.

    ⚠️ Usare con cautela! Solo per lotti aperti senza dati significativi.
    """
    lotto = db.get(Lotto, lotto_id)

    if not lotto:
        raise HTTPException(status_code=404, detail="Lotto not found")

    if lotto.DataFine:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete closed lotto. Use soft delete or mark as invalid instead."
        )

    db.delete(lotto)
    db.commit()

    return None
