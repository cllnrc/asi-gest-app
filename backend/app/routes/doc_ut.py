"""
API Routes for DocUT (Documentazione Tecnica Articoli)
© 2025 Enrico Callegaro - Tutti i diritti riservati.

CRUD endpoints per gestire la documentazione tecnica necessaria
per mettere un articolo in produzione.
"""

from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, func, or_, text

from app.core.database import get_db_asi_gest, get_db_asitron
from app.models.doc_ut import DocUT
from app.schemas.doc_ut import (
    DocUTCreate,
    DocUTUpdate,
    DocUTResponse,
    DocUTList,
)

router = APIRouter()


@router.get("/articoli-con-documentazione")
def list_articoli_con_documentazione(
    page: int = Query(1, ge=1),
    page_size: int = Query(30, ge=1, le=100),
    search: Optional[str] = Query(None),
    db_asitron: Session = Depends(get_db_asitron),
    db_asi_gest: Session = Depends(get_db_asi_gest),
):
    """
    Lista articoli da gestionale con documentazione UT associata.

    Combina:
    - Articoli da ANAGRAFICAARTICOLI (gestionale ASITRON)
    - Documentazione UT da DocUT (database ASI_GEST)

    Filtri fissi:
    - Solo articoli 45.xxx (prodotti finiti)
    - Solo ultimo anno (da DATAMODIFICA)
    - Ordinamento: DATAMODIFICA DESC (più recenti prima)

    Per ogni articolo:
    - Se esiste DocUT → ritorna documentazione completa
    - Se NON esiste DocUT → ritorna articolo con DocUT = null
    """
    # Build WHERE clause
    where_clauses = [
        "CODICE LIKE '45.%'",  # Solo prodotti finiti
        "DATAMODIFICA >= DATEADD(year, -1, GETDATE())"  # Ultimo anno
    ]
    params = {}

    if search:
        where_clauses.append("(CODICE LIKE :search OR DESCRIZIONE LIKE :search)")
        params["search"] = f"%{search}%"

    where_sql = " AND ".join(where_clauses)

    # Count total matching articles
    count_sql = text(f"""
        SELECT COUNT(*)
        FROM dbo.ANAGRAFICAARTICOLI
        WHERE {where_sql}
    """)
    total_result = db_asitron.execute(count_sql, params)
    total = total_result.scalar()

    # Get paginated articles
    offset = (page - 1) * page_size
    articles_sql = text(f"""
        SELECT
            CODICE,
            DESCRIZIONE,
            CAST(ARTTIPOLOGIA AS VARCHAR(10)) as ARTTIPOLOGIA
        FROM dbo.ANAGRAFICAARTICOLI
        WHERE {where_sql}
        ORDER BY DATAMODIFICA DESC, CODICE DESC
        OFFSET {offset} ROWS
        FETCH NEXT {page_size} ROWS ONLY
    """)

    articles_result = db_asitron.execute(articles_sql, params)
    articles = articles_result.fetchall()

    # Get all codici articoli for DocUT lookup
    codici = [row[0] for row in articles]

    # Bulk lookup DocUT for all articles
    doc_ut_dict = {}
    if codici:
        doc_ut_stmt = select(DocUT).where(DocUT.CodiceArticolo.in_(codici))
        doc_ut_results = db_asi_gest.execute(doc_ut_stmt).scalars().all()
        doc_ut_dict = {doc.CodiceArticolo: doc for doc in doc_ut_results}

    # Combine results
    items = []
    for codice, descrizione, tipologia in articles:
        doc_ut = doc_ut_dict.get(codice)

        if doc_ut:
            # DocUT exists - return full documentation
            items.append(DocUTResponse.model_validate(doc_ut))
        else:
            # DocUT doesn't exist - return article with empty DocUT
            items.append({
                "DocUTID": None,
                "CodiceArticolo": codice,
                "Descrizione": descrizione,
                # All UT fields as False/None
                "DIBA": False,
                "DIBAData": None,
                "DIBAUtente": None,
                "ProgrammaMyData": False,
                "ProgrammaMyDataData": None,
                "ProgrammaMyDataUtente": None,
                "PDM": False,
                "PDMData": None,
                "PDMUtente": None,
                "FileLaminaTelaio": None,
                "FileLaminaTelaioData": None,
                "FileLaminaTelaioUtente": None,
                # Cliente fields
                "DIBACliente": False,
                "PDMCliente": False,
                "FilePP": False,
                # Post Production fields
                "FotoPCB": False,
                "FotoProdotto": False,
                "TempiLavorazione": False,
                "FasiLavorazione": False,
                "PPUtente": False,
                "Campionatura": False,
                "DocProduzione": False,
                # Metadata
                "DataInserimento": None,
                "DataModifica": None,
                "Attivo": True,
            })

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("", response_model=DocUTList)
def list_doc_ut(
    page: int = Query(1, ge=1, description="Numero pagina"),
    page_size: int = Query(30, ge=1, le=100, description="Elementi per pagina"),
    search: Optional[str] = Query(None, description="Cerca per codice o descrizione"),
    filtro_45: bool = Query(False, description="Filtra solo articoli 45.xxx"),
    attivo: Optional[bool] = Query(None, description="Filtra per stato attivo"),
    db: Session = Depends(get_db_asi_gest),
):
    """
    Lista documentazione tecnica con paginazione e filtri.

    Parametri:
    - page: Numero pagina (default 1)
    - page_size: Elementi per pagina (default 30, max 100)
    - search: Cerca per codice o descrizione (opzionale)
    - filtro_45: Se True, mostra solo articoli 45.xxx (opzionale)
    - attivo: Filtra per stato attivo (True/False, opzionale)

    Ritorna:
    - Lista paginata di DocUT ordinata per DataInserimento DESC
    """
    # Build query
    stmt = select(DocUT)

    # Apply filters
    if search:
        search_pattern = f"%{search}%"
        stmt = stmt.where(
            or_(
                DocUT.CodiceArticolo.like(search_pattern),
                DocUT.Descrizione.like(search_pattern)
            )
        )

    if filtro_45:
        stmt = stmt.where(DocUT.CodiceArticolo.like("45.%"))

    if attivo is not None:
        stmt = stmt.where(DocUT.Attivo == attivo)

    # Count total
    count_stmt = select(func.count(DocUT.DocUTID))
    if search:
        search_pattern = f"%{search}%"
        count_stmt = count_stmt.where(
            or_(
                DocUT.CodiceArticolo.like(search_pattern),
                DocUT.Descrizione.like(search_pattern)
            )
        )
    if filtro_45:
        count_stmt = count_stmt.where(DocUT.CodiceArticolo.like("45.%"))
    if attivo is not None:
        count_stmt = count_stmt.where(DocUT.Attivo == attivo)

    total = db.execute(count_stmt).scalar()

    # Apply ordering and pagination
    stmt = stmt.order_by(DocUT.DataInserimento.desc())
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    # Execute query
    result = db.execute(stmt)
    doc_ut_list = result.scalars().all()

    return DocUTList(
        items=[DocUTResponse.model_validate(doc) for doc in doc_ut_list],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/by-articolo/{codice}", response_model=DocUTResponse)
def get_by_articolo(
    codice: str,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Recupera DocUT per CodiceArticolo.

    Parametri:
    - codice: Codice articolo (es. 45.001.234)

    Ritorna:
    - DocUT per l'articolo

    Errori:
    - 404: DocUT non trovato per l'articolo
    """
    stmt = select(DocUT).where(DocUT.CodiceArticolo == codice)
    doc_ut = db.execute(stmt).scalar_one_or_none()

    if not doc_ut:
        raise HTTPException(
            status_code=404,
            detail=f"DocUT non trovato per articolo {codice}"
        )

    return DocUTResponse.model_validate(doc_ut)


@router.get("/{doc_ut_id}", response_model=DocUTResponse)
def get_doc_ut(
    doc_ut_id: int,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Recupera dettagli di un singolo DocUT.

    Parametri:
    - doc_ut_id: ID del DocUT

    Ritorna:
    - Dettagli completi del DocUT

    Errori:
    - 404: DocUT non trovato
    """
    doc_ut = db.get(DocUT, doc_ut_id)

    if not doc_ut:
        raise HTTPException(
            status_code=404,
            detail=f"DocUT {doc_ut_id} non trovato"
        )

    return DocUTResponse.model_validate(doc_ut)


@router.post("", response_model=DocUTResponse, status_code=201)
def create_doc_ut(
    doc_ut_data: DocUTCreate,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Crea un nuovo DocUT.

    Body:
    - CodiceArticolo: codice articolo (obbligatorio, max 50 caratteri)
    - Descrizione: descrizione (opzionale, max 200 caratteri)
    - Campi UT, Cliente, Post Production (opzionali)

    Ritorna:
    - DocUT creato con ID assegnato

    Errori:
    - 400: CodiceArticolo già esistente
    """
    # Check if CodiceArticolo already exists
    stmt = select(DocUT).where(DocUT.CodiceArticolo == doc_ut_data.CodiceArticolo)
    existing = db.execute(stmt).scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"DocUT per articolo '{doc_ut_data.CodiceArticolo}' già esistente"
        )

    # Create new DocUT
    doc_ut = DocUT(**doc_ut_data.model_dump())

    try:
        db.add(doc_ut)
        db.commit()
        db.refresh(doc_ut)
        return DocUTResponse.model_validate(doc_ut)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Errore durante la creazione del DocUT: {str(e)}"
        )


@router.put("/{doc_ut_id}", response_model=DocUTResponse)
def update_doc_ut(
    doc_ut_id: int,
    doc_ut_data: DocUTUpdate,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Aggiorna un DocUT esistente.

    Parametri:
    - doc_ut_id: ID del DocUT da aggiornare

    Body:
    - Tutti i campi sono opzionali
    - Solo i campi forniti vengono aggiornati

    Logica automatica:
    - Quando si imposta un campo UT a TRUE:
      - Se Data è NULL → imposta datetime.utcnow()
      - Se Utente è NULL → dovrebbe essere impostato dal frontend

    Ritorna:
    - DocUT aggiornato

    Errori:
    - 404: DocUT non trovato
    """
    # Get existing DocUT
    doc_ut = db.get(DocUT, doc_ut_id)
    if not doc_ut:
        raise HTTPException(
            status_code=404,
            detail=f"DocUT {doc_ut_id} non trovato"
        )

    # Update fields (only non-None values)
    update_data = doc_ut_data.model_dump(exclude_unset=True)

    # Auto-set dates for UT fields when set to True
    if update_data.get('DIBA') and not update_data.get('DIBAData'):
        update_data['DIBAData'] = datetime.utcnow()

    if update_data.get('ProgrammaMyData') and not update_data.get('ProgrammaMyDataData'):
        update_data['ProgrammaMyDataData'] = datetime.utcnow()

    if update_data.get('PDM') and not update_data.get('PDMData'):
        update_data['PDMData'] = datetime.utcnow()

    if update_data.get('FileLaminaTelaio') and not update_data.get('FileLaminaTelaioData'):
        update_data['FileLaminaTelaioData'] = datetime.utcnow()

    for field, value in update_data.items():
        setattr(doc_ut, field, value)

    try:
        db.commit()
        db.refresh(doc_ut)
        return DocUTResponse.model_validate(doc_ut)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Errore durante l'aggiornamento del DocUT: {str(e)}"
        )


@router.delete("/{doc_ut_id}", response_model=DocUTResponse)
def delete_doc_ut(
    doc_ut_id: int,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Disattiva un DocUT (soft delete).

    Parametri:
    - doc_ut_id: ID del DocUT da disattivare

    Comportamento:
    - Imposta Attivo = False invece di eliminare il record
    - Preserva lo storico

    Ritorna:
    - DocUT disattivato

    Errori:
    - 404: DocUT non trovato
    """
    doc_ut = db.get(DocUT, doc_ut_id)
    if not doc_ut:
        raise HTTPException(
            status_code=404,
            detail=f"DocUT {doc_ut_id} non trovato"
        )

    # Soft delete: set Attivo = False
    doc_ut.Attivo = False

    try:
        db.commit()
        db.refresh(doc_ut)
        return DocUTResponse.model_validate(doc_ut)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Errore durante la disattivazione del DocUT: {str(e)}"
        )
