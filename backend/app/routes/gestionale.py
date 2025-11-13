"""
API Routes for Gestionale (Read-only integration with ASITRON database)
© 2025 Enrico Callegaro - Tutti i diritti riservati.

Routes for querying ASITRON production management data.
All endpoints are read-only and do not modify the source database.

Mapping (per MAPPING_GESTIONALE_REALE_ASI_GEST.md):
- COMMESSE → TESTEORDINIPROD table
- ARTICOLI → ANAGRAFICAARTICOLI table
- CLIENTI → ANAGRAFICACF table
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, func, text

from app.core.database import get_db_asitron
from app.schemas.gestionale import (
    CommessaGestionale,
    ArticoloGestionale,
    ClienteGestionale,
    CommessaList,
    ArticoloList,
    ClienteList,
)

router = APIRouter()


@router.get("/commesse", response_model=CommessaList)
def list_commesse(
    aperte: Optional[bool] = Query(True, description="Filtra per commesse aperte (True) o chiuse (False)"),
    limit: int = Query(100, ge=1, le=500, description="Numero massimo di risultati"),
    db: Session = Depends(get_db_asitron),
):
    """
    Lista commesse da ASITRON gestionale (TESTEORDINIPROD).

    Parametri:
    - aperte: Se True, ritorna solo commesse aperte (STATOCHIUSO=0).
              Se False, ritorna solo commesse chiuse (STATOCHIUSO=1).
              Default: True (solo aperte)
    - limit: Numero massimo di risultati (default 100, max 500)

    Ritorna:
    - Lista di commesse con informazioni cliente
    - Ordinamento: ESERCIZIO DESC, NUMEROCOM DESC
    """
    # Build query using raw SQL for compatibility with ASITRON database
    # TESTEORDINIPROD columns: PROGRESSIVO, ESERCIZIO, NUMEROCOM, RIFCOMMCLI,
    #                          CODCLIENTE, STATOCHIUSO, DATAEMISSIONE, DATAINIZIOPIANO,
    #                          DATAFINEPIANO, ANNOTAZIONI
    # ANAGRAFICACF columns: CODCONTO, DSCCONTO1

    # Build WHERE clause
    where_clause = ""
    if aperte is not None:
        stato_value = 0 if aperte else 1
        where_clause = f"WHERE t.STATOCHIUSO = {stato_value}"

    # Build complete SQL query
    sql = text(f"""
        SELECT TOP {limit}
            t.PROGRESSIVO,
            t.ESERCIZIO,
            t.NUMEROCOM,
            t.RIFCOMMCLI,
            t.CODCLIENTE,
            COALESCE(c.DSCCONTO1, '') as NomeCliente,
            t.DATAEMISSIONE,
            t.DATAINIZIOPIANO,
            t.DATAFINEPIANO,
            t.STATOCHIUSO,
            t.ANNOTAZIONI
        FROM dbo.TESTEORDINIPROD t
        LEFT JOIN dbo.ANAGRAFICACF c ON t.CODCLIENTE = c.CODCONTO
        {where_clause}
        ORDER BY t.ESERCIZIO DESC, t.NUMEROCOM DESC
    """)

    try:
        result = db.execute(sql)
        rows = result.fetchall()

        commesse = []
        for row in rows:
            commessa = CommessaGestionale(
                PROGRESSIVO=row[0],
                ESERCIZIO=row[1],
                NUMEROCOM=row[2],
                RIFCOMMCLI=row[3],
                CODCLIENTE=row[4],
                NomeCliente=row[5],
                DATAEMISSIONE=row[6],
                DATAINIZIOPIANO=row[7],
                DATAFINEPIANO=row[8],
                STATOCHIUSO=row[9],
                ANNOTAZIONI=row[10],
            )
            commesse.append(commessa)

        return CommessaList(items=commesse, total=len(commesse))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error querying ASITRON database: {str(e)}"
        )


@router.get("/commesse/{progressivo}", response_model=CommessaGestionale)
def get_commessa(
    progressivo: int,
    db: Session = Depends(get_db_asitron),
):
    """
    Recupera dettagli di una singola commessa con righe (articoli).

    Include:
    - Informazioni commessa da TESTEORDINIPROD
    - Articoli associati da RIGHEORDPROD

    Parametri:
    - progressivo: PROGRESSIVO della commessa (ID univoco in ASITRON)

    Nota: Se richiesti dettag articoli, usare /gestionale/commesse/{id}/articoli
    """
    sql = text("""
        SELECT
            t.PROGRESSIVO,
            t.ESERCIZIO,
            t.NUMEROCOM,
            t.RIFCOMMCLI,
            t.CODCLIENTE,
            COALESCE(c.DSCCONTO1, '') as NomeCliente,
            t.DATAEMISSIONE,
            t.DATAINIZIOPIANO,
            t.DATAFINEPIANO,
            t.STATOCHIUSO,
            t.ANNOTAZIONI
        FROM dbo.TESTEORDINIPROD t
        LEFT JOIN dbo.ANAGRAFICACF c ON t.CODCLIENTE = c.CODCONTO
        WHERE t.PROGRESSIVO = :progressivo
    """)

    try:
        result = db.execute(sql, {"progressivo": progressivo})
        row = result.first()

        if not row:
            raise HTTPException(status_code=404, detail="Commessa not found")

        commessa = CommessaGestionale(
            PROGRESSIVO=row[0],
            ESERCIZIO=row[1],
            NUMEROCOM=row[2],
            RIFCOMMCLI=row[3],
            CODCLIENTE=row[4],
            NomeCliente=row[5],
            DATAEMISSIONE=row[6],
            DATAINIZIOPIANO=row[7],
            DATAFINEPIANO=row[8],
            STATOCHIUSO=row[9],
            ANNOTAZIONI=row[10],
        )

        return commessa
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error querying ASITRON database: {str(e)}"
        )


@router.get("/articoli", response_model=ArticoloList)
def list_articoli(
    search: Optional[str] = Query(None, max_length=50, description="Ricerca per CODICE"),
    limit: int = Query(100, ge=1, le=500, description="Numero massimo di risultati"),
    db: Session = Depends(get_db_asitron),
):
    """
    Lista articoli da ASITRON gestionale (ANAGRAFICAARTICOLI).

    Parametri:
    - search: Ricerca per CODICE articolo (case-insensitive LIKE)
    - limit: Numero massimo di risultati (default 100, max 500)

    Ritorna:
    - Lista articoli con codice, descrizione, unità di misura, tipologia
    """
    # Build WHERE clause for search
    where_clause = ""
    params = {}
    if search:
        where_clause = "AND CODICE LIKE :search"
        params["search"] = f"%{search}%"

    # Build complete SQL query
    sql = text(f"""
        SELECT TOP {limit}
            CODICE,
            DESCRIZIONE,
            CAST(ARTTIPOLOGIA AS VARCHAR(10)) as ARTTIPOLOGIA
        FROM dbo.ANAGRAFICAARTICOLI
        WHERE 1=1
        {where_clause}
        ORDER BY CODICE ASC
    """)

    try:
        result = db.execute(sql, params)
        rows = result.fetchall()

        articoli = []
        for row in rows:
            articolo = ArticoloGestionale(
                CODICE=row[0],
                DESCRIZIONE=row[1],
                TIPOLOGIA=row[2],
            )
            articoli.append(articolo)

        return ArticoloList(items=articoli, total=len(articoli))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error querying ASITRON database: {str(e)}"
        )


@router.get("/clienti", response_model=ClienteList)
def list_clienti(
    search: Optional[str] = Query(None, max_length=50, description="Ricerca per DSCCONTO1 (nome cliente)"),
    limit: int = Query(100, ge=1, le=500, description="Numero massimo di risultati"),
    db: Session = Depends(get_db_asitron),
):
    """
    Lista clienti/fornitori da ASITRON gestionale (ANAGRAFICACF).

    Parametri:
    - search: Ricerca per DSCCONTO1 (nome/ragione sociale) - case-insensitive LIKE
    - limit: Numero massimo di risultati (default 100, max 500)

    Ritorna:
    - Lista clienti con codice, denominazione, indirizzo, contatti
    """
    # Build WHERE clause for search
    where_clause = ""
    params = {}
    if search:
        where_clause = "AND DSCCONTO1 LIKE :search"
        params["search"] = f"%{search}%"

    # Build complete SQL query
    sql = text(f"""
        SELECT TOP {limit}
            CODCONTO,
            DSCCONTO1,
            DSCCONTO2,
            PARTITAIVA,
            CODFISCALE,
            INDIRIZZO,
            LOCALITA,
            PROVINCIA,
            CAP
        FROM dbo.ANAGRAFICACF
        WHERE 1=1
        {where_clause}
        ORDER BY DSCCONTO1 ASC
    """)

    try:
        result = db.execute(sql, params)
        rows = result.fetchall()

        clienti = []
        for row in rows:
            cliente = ClienteGestionale(
                CODCONTO=row[0],
                DSCCONTO1=row[1],
                DSCCONTO2=row[2],
                PIVA=row[3],  # PARTITAIVA from DB
                CODFISCALE=row[4],
                INDIRIZZO=row[5],
                CITTA=row[6],  # LOCALITA from DB
                PROVINCIA=row[7],
                CAP=row[8],
            )
            clienti.append(cliente)

        return ClienteList(items=clienti, total=len(clienti))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error querying ASITRON database: {str(e)}"
        )
