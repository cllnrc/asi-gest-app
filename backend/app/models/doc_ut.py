"""
ASI-GEST Models: DocUT
© 2025 Enrico Callegaro - Tutti i diritti riservati.

Documentazione Tecnica articoli - gestione validazione UT e documentazione
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Index
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class DocUT(Base):
    """
    Tabella Documentazione Tecnica (UT) - validazione articoli per produzione.

    Prerequisito per ConfigCommessa: devono essere popolati almeno i 4 campi UT:
    - DIBA (Distinta Base)
    - ProgrammaMyData
    - PDM (Piano Di Montaggio)
    - FileLaminaTelaio

    Ogni campo UT traccia data e utente inserimento.
    """
    __tablename__ = "DocUT"

    # Primary Key
    DocUTID = Column(Integer, primary_key=True, autoincrement=True)

    # Articolo (riferimento a ANAGRAFICAARTICOLI.CODICE del gestionale)
    CodiceArticolo = Column(String(50), unique=True, nullable=False, index=True)
    Descrizione = Column(String(200), nullable=True)

    # ========================================
    # SEZIONE UT (Ufficio Tecnico)
    # ========================================
    # Ogni campo ha 3 colonne: valore + data + utente

    # 1. DI.BA. (Distinta Base)
    DIBA = Column(Boolean, default=False, nullable=False)
    DIBAData = Column(DateTime, nullable=True)
    DIBAUtente = Column(String(100), nullable=True)

    # 2. PROGRAMMA MYDATA
    ProgrammaMyData = Column(Boolean, default=False, nullable=False)
    ProgrammaMyDataData = Column(DateTime, nullable=True)
    ProgrammaMyDataUtente = Column(String(100), nullable=True)

    # 3. PDM (Piano Di Montaggio)
    PDM = Column(Boolean, default=False, nullable=False)
    PDMData = Column(DateTime, nullable=True)
    PDMUtente = Column(String(100), nullable=True)

    # 4. FILE PER LAMINA O TELAIO
    # Valori: NULL | 'CLIENTE' | 'TOP' | 'BOTTOM' | 'TOP+BOTTOM'
    FileLaminaTelaio = Column(String(20), nullable=True)
    FileLaminaTelaioData = Column(DateTime, nullable=True)
    FileLaminaTelaioUtente = Column(String(100), nullable=True)

    # ========================================
    # SEZIONE CLIENTE
    # ========================================
    # Solo boolean (NO tracciamento data/utente)

    DIBACliente = Column(Boolean, default=False, nullable=False)
    PDMCliente = Column(Boolean, default=False, nullable=False)
    FilePP = Column(Boolean, default=False, nullable=False)

    # ========================================
    # SEZIONE POST PRODUCTION
    # ========================================
    # Solo boolean (NO tracciamento data/utente)
    # Compilati dopo prima produzione o campionatura

    FotoPCB = Column(Boolean, default=False, nullable=False)
    FotoProdotto = Column(Boolean, default=False, nullable=False)
    TempiLavorazione = Column(Boolean, default=False, nullable=False)
    FasiLavorazione = Column(Boolean, default=False, nullable=False)
    PPUtente = Column(Boolean, default=False, nullable=False)
    Campionatura = Column(Boolean, default=False, nullable=False)
    DocProduzione = Column(Boolean, default=False, nullable=False)

    # ========================================
    # METADATA
    # ========================================

    DataInserimento = Column(DateTime, default=datetime.utcnow, nullable=False)
    DataModifica = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    Attivo = Column(Boolean, default=True, nullable=False, index=True)

    # Indexes
    __table_args__ = (
        Index("IX_DocUT_CodiceArticolo", "CodiceArticolo"),
        Index("IX_DocUT_DataInserimento", "DataInserimento"),
        Index("IX_DocUT_Attivo", "Attivo"),
    )

    @property
    def UTCompleto(self):
        """
        Computed property: True se tutti i 4 campi UT sono popolati.
        Prerequisito per creare ConfigCommessa.
        """
        return (
            self.DIBA
            and self.ProgrammaMyData
            and self.PDM
            and self.FileLaminaTelaio is not None
        )

    def __repr__(self):
        return f"<DocUT(id={self.DocUTID}, articolo='{self.CodiceArticolo}', ut_completo={self.UTCompleto})>"
