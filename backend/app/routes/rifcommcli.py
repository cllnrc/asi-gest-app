"""
API Routes for RIFCOMMCLI Generator
© 2025 Enrico Callegaro - Tutti i diritti riservati.

Endpoints for generating and managing RIFCOMMCLI progressive numbers.
Eliminates Excel dependency while maintaining read-only access to ASITRON.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from datetime import datetime

from app.core.database import get_db_asi_gest, get_db_asitron
from app.schemas.rifcommcli import (
    RIFCOMMCLIGeneraRequest,
    RIFCOMMCLIGeneraResponse,
    RIFCOMMCLIResponse,
    RIFCOMMCLIList,
    RIFCOMMCLIAnnullaRequest,
    RIFCOMMCLIStatistiche,
)

router = APIRouter()


@router.post("/genera", response_model=RIFCOMMCLIGeneraResponse)
def genera_rifcommcli(
    request: RIFCOMMCLIGeneraRequest,
    db_asi_gest: Session = Depends(get_db_asi_gest),
    db_asitron: Session = Depends(get_db_asitron),
):
    """
    Genera un nuovo numero RIFCOMMCLI progressivo.

    Logica:
    1. Trova l'ultimo RIFCOMMCLI generato in ASI_GEST
    2. Trova l'ultimo RIFCOMMCLI utilizzato in ASITRON (RIGHEDOCUMENTI)
    3. Prende il maggiore tra i due
    4. Genera il prossimo numero (+1)
    5. Salva in RIFCOMMCLIGenerati con stato 'GENERATO'

    Ritorna:
    - Il numero RIFCOMMCLI generato da copiare nel gestionale
    - Data e utente di generazione
    """
    try:
        # 1. Trova ultimo RIFCOMMCLI in ASI_GEST
        sql_asi_gest = text("""
            SELECT MAX(CAST(RIFCOMMCLI AS INT)) as UltimoASIGEST
            FROM RIFCOMMCLIGenerati
            WHERE ISNUMERIC(RIFCOMMCLI) = 1
        """)
        result_asi_gest = db_asi_gest.execute(sql_asi_gest).first()
        ultimo_asi_gest = result_asi_gest[0] if result_asi_gest and result_asi_gest[0] else 0

        # 2. Trova ultimo RIFCOMMCLI in ASITRON (RIGHEDOCUMENTI)
        # RIFCOMMCLI può essere alfanumerico, quindi filtriamo solo quelli numerici
        sql_asitron = text("""
            SELECT MAX(CAST(RIFCOMMCLI AS INT)) as UltimoASITRON
            FROM dbo.RIGHEDOCUMENTI
            WHERE RIFCOMMCLI IS NOT NULL
              AND RIFCOMMCLI != ''
              AND ISNUMERIC(RIFCOMMCLI) = 1
        """)
        result_asitron = db_asitron.execute(sql_asitron).first()
        ultimo_asitron = result_asitron[0] if result_asitron and result_asitron[0] else 0

        # 3. Prende il maggiore
        ultimo_numero = max(ultimo_asi_gest, ultimo_asitron)

        # 4. Genera il prossimo numero
        nuovo_numero = str(ultimo_numero + 1)

        # 5. Salva in RIFCOMMCLIGenerati
        data_generazione = datetime.now()
        sql_insert = text("""
            INSERT INTO RIFCOMMCLIGenerati
            (RIFCOMMCLI, DataGenerazione, UtenteGenerazione, StatoUtilizzo, Note)
            VALUES
            (:rifcommcli, :data_gen, :utente, 'GENERATO', :note)
        """)

        db_asi_gest.execute(sql_insert, {
            "rifcommcli": nuovo_numero,
            "data_gen": data_generazione,
            "utente": request.UtenteGenerazione,
            "note": request.Note
        })
        db_asi_gest.commit()

        return RIFCOMMCLIGeneraResponse(
            RIFCOMMCLI=nuovo_numero,
            DataGenerazione=data_generazione,
            UtenteGenerazione=request.UtenteGenerazione,
            Note=request.Note
        )

    except Exception as e:
        db_asi_gest.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error generating RIFCOMMCLI: {str(e)}"
        )


@router.get("/lista", response_model=RIFCOMMCLIList)
def list_rifcommcli(
    stato: Optional[str] = Query(None, description="Filtra per stato (GENERATO, UTILIZZATO, ANNULLATO)"),
    page: int = Query(1, ge=1, description="Numero pagina"),
    page_size: int = Query(50, ge=1, le=200, description="Elementi per pagina"),
    db: Session = Depends(get_db_asi_gest),
):
    """
    Lista dei numeri RIFCOMMCLI generati.

    Parametri:
    - stato: Filtra per stato (opzionale)
    - page: Numero pagina (default 1)
    - page_size: Elementi per pagina (default 50, max 200)

    Ritorna:
    - Lista paginata di RIFCOMMCLI con stato e metadati
    """
    try:
        # Build WHERE clause
        where_clause = ""
        params = {}
        if stato:
            where_clause = "WHERE StatoUtilizzo = :stato"
            params["stato"] = stato

        # Count total
        sql_count = text(f"""
            SELECT COUNT(*) as Total
            FROM RIFCOMMCLIGenerati
            {where_clause}
        """)
        total = db.execute(sql_count, params).scalar()

        # Get paginated results
        offset = (page - 1) * page_size
        sql_select = text(f"""
            SELECT
                RIFCOMMCLI,
                DataGenerazione,
                UtenteGenerazione,
                StatoUtilizzo,
                DataUtilizzo,
                Note
            FROM RIFCOMMCLIGenerati
            {where_clause}
            ORDER BY DataGenerazione DESC
            OFFSET {offset} ROWS FETCH NEXT {page_size} ROWS ONLY
        """)

        result = db.execute(sql_select, params)
        rows = result.fetchall()

        items = []
        for row in rows:
            item = RIFCOMMCLIResponse(
                RIFCOMMCLI=row[0],
                DataGenerazione=row[1],
                UtenteGenerazione=row[2],
                StatoUtilizzo=row[3],
                DataUtilizzo=row[4],
                Note=row[5]
            )
            items.append(item)

        return RIFCOMMCLIList(
            items=items,
            total=total,
            page=page,
            page_size=page_size
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error listing RIFCOMMCLI: {str(e)}"
        )


@router.post("/annulla/{rifcommcli}")
def annulla_rifcommcli(
    rifcommcli: str,
    request: RIFCOMMCLIAnnullaRequest,
    db: Session = Depends(get_db_asi_gest),
):
    """
    Annulla un numero RIFCOMMCLI generato ma non ancora utilizzato.

    Imposta lo stato a 'ANNULLATO' se il numero è ancora in stato 'GENERATO'.
    Non può annullare numeri già utilizzati.

    Parametri:
    - rifcommcli: Il numero RIFCOMMCLI da annullare
    - request.Note: Motivo dell'annullamento

    Ritorna:
    - Messaggio di conferma
    """
    try:
        # Verifica che esista e sia in stato GENERATO
        sql_check = text("""
            SELECT StatoUtilizzo
            FROM RIFCOMMCLIGenerati
            WHERE RIFCOMMCLI = :rifcommcli
        """)
        result = db.execute(sql_check, {"rifcommcli": rifcommcli}).first()

        if not result:
            raise HTTPException(
                status_code=404,
                detail=f"RIFCOMMCLI {rifcommcli} not found"
            )

        if result[0] != 'GENERATO':
            raise HTTPException(
                status_code=400,
                detail=f"Cannot cancel RIFCOMMCLI in state {result[0]}. Only GENERATO can be cancelled."
            )

        # Update to ANNULLATO
        sql_update = text("""
            UPDATE RIFCOMMCLIGenerati
            SET StatoUtilizzo = 'ANNULLATO',
                Note = CASE
                    WHEN :note IS NOT NULL THEN Note + ' | ANNULLATO: ' + :note
                    ELSE Note + ' | ANNULLATO'
                END
            WHERE RIFCOMMCLI = :rifcommcli
        """)

        db.execute(sql_update, {
            "rifcommcli": rifcommcli,
            "note": request.Note
        })
        db.commit()

        return {
            "success": True,
            "message": f"RIFCOMMCLI {rifcommcli} annullato con successo",
            "rifcommcli": rifcommcli
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error cancelling RIFCOMMCLI: {str(e)}"
        )


@router.get("/statistiche", response_model=RIFCOMMCLIStatistiche)
def get_statistiche(
    db: Session = Depends(get_db_asi_gest),
):
    """
    Statistiche sui numeri RIFCOMMCLI generati.

    Ritorna:
    - Totale generati, utilizzati, annullati, in attesa
    - Ultimo numero generato e data
    """
    try:
        sql = text("""
            SELECT
                COUNT(*) as TotaleGenerati,
                SUM(CASE WHEN StatoUtilizzo = 'UTILIZZATO' THEN 1 ELSE 0 END) as TotaleUtilizzati,
                SUM(CASE WHEN StatoUtilizzo = 'ANNULLATO' THEN 1 ELSE 0 END) as TotaleAnnullati,
                SUM(CASE WHEN StatoUtilizzo = 'GENERATO' THEN 1 ELSE 0 END) as TotaleInAttesa
            FROM RIFCOMMCLIGenerati
        """)
        result = db.execute(sql).first()

        # Get ultimo generato
        sql_ultimo = text("""
            SELECT TOP 1 RIFCOMMCLI, DataGenerazione
            FROM RIFCOMMCLIGenerati
            ORDER BY DataGenerazione DESC
        """)
        ultimo = db.execute(sql_ultimo).first()

        return RIFCOMMCLIStatistiche(
            TotaleGenerati=result[0] or 0,
            TotaleUtilizzati=result[1] or 0,
            TotaleAnnullati=result[2] or 0,
            TotaleInAttesa=result[3] or 0,
            UltimoGenerato=ultimo[0] if ultimo else None,
            UltimaDataGenerazione=ultimo[1] if ultimo else None
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting statistics: {str(e)}"
        )


@router.post("/riconcilia")
def riconcilia_rifcommcli(
    db_asi_gest: Session = Depends(get_db_asi_gest),
    db_asitron: Session = Depends(get_db_asitron),
):
    """
    Job di riconciliazione: marca come 'UTILIZZATO' i numeri RIFCOMMCLI
    che sono stati inseriti nel gestionale ASITRON.

    Cerca in RIGHEDOCUMENTI i numeri RIFCOMMCLI che sono in stato 'GENERATO'
    in ASI_GEST e li marca come 'UTILIZZATO'.

    Ritorna:
    - Numero di RIFCOMMCLI riconciliati
    - Lista dei numeri aggiornati
    """
    try:
        # 1. Prendi tutti i RIFCOMMCLI in stato GENERATO
        sql_generati = text("""
            SELECT RIFCOMMCLI
            FROM RIFCOMMCLIGenerati
            WHERE StatoUtilizzo = 'GENERATO'
        """)
        generati = db_asi_gest.execute(sql_generati).fetchall()

        if not generati:
            return {
                "success": True,
                "message": "No RIFCOMMCLI to reconcile",
                "riconciliati": 0,
                "numeri": []
            }

        # 2. Per ognuno, verifica se esiste in ASITRON
        riconciliati = []
        for row in generati:
            rifcommcli = row[0]

            sql_check_asitron = text("""
                SELECT TOP 1 1
                FROM dbo.RIGHEDOCUMENTI
                WHERE RIFCOMMCLI = :rifcommcli
            """)
            esiste = db_asitron.execute(sql_check_asitron, {"rifcommcli": rifcommcli}).first()

            if esiste:
                # 3. Marca come UTILIZZATO
                sql_update = text("""
                    UPDATE RIFCOMMCLIGenerati
                    SET StatoUtilizzo = 'UTILIZZATO',
                        DataUtilizzo = GETDATE()
                    WHERE RIFCOMMCLI = :rifcommcli
                """)
                db_asi_gest.execute(sql_update, {"rifcommcli": rifcommcli})
                riconciliati.append(rifcommcli)

        db_asi_gest.commit()

        return {
            "success": True,
            "message": f"Riconciliati {len(riconciliati)} numeri RIFCOMMCLI",
            "riconciliati": len(riconciliati),
            "numeri": riconciliati
        }

    except Exception as e:
        db_asi_gest.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error reconciling RIFCOMMCLI: {str(e)}"
        )
