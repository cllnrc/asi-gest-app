"""
ASI-GEST Models: DocumentoTecnico
© 2025 Enrico Callegaro - Tutti i diritti riservati.

Definizione documenti tecnici (disegni, procedure, checklist)
"""

from sqlalchemy import Column, Integer, String, DateTime, Date, ForeignKey, Text, BigInteger, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class DocumentoTecnico(Base):
    """
    Tabella documenti tecnici - tracciamento disegni, procedure, checklist per articoli.

    Uniche su (ArticoloERPId, TipoDoc, Revisione)
    """
    __tablename__ = "DocumentiTecnici"

    DocID = Column(Integer, primary_key=True, autoincrement=True)
    ArticoloERPId = Column(Integer, nullable=False)

    TipoDoc = Column(String(50), nullable=False)
    # Esempi: DISEGNO, PROCEDURA, CHECKLIST, SPECIFICHE

    Revisione = Column(String(20), nullable=False)

    FilePath = Column(String(500), nullable=True)
    FileHash = Column(String(64), nullable=True)
    FileSize = Column(BigInteger, nullable=True)

    Stato = Column(String(20), nullable=False, default="ATTIVO")
    # Valori: ATTIVO, SUPERATO

    DataScadenza = Column(Date, nullable=True)

    DataCaricamento = Column(DateTime, default=datetime.utcnow, nullable=False)
    CaricatoDa = Column(String(100), nullable=True)

    Note = Column(Text, nullable=True)

    __table_args__ = (
        UniqueConstraint("ArticoloERPId", "TipoDoc", "Revisione", name="UQ_DocTecnici_Articolo_Tipo_Rev"),
        Index("IX_DocTecnici_Articolo_Attivi", "ArticoloERPId", "TipoDoc", "Stato"),
        Index("IX_DocTecnici_Scadenza", "DataScadenza"),
    )

    # Relationships (Note: DocumentoTecnico non ha FK a Fase in SQL schema, ma può essere aggiunto se necessario)
    # fase = relationship("Fase", back_populates="documenti_tecnici")

    def __repr__(self):
        return f"<DocumentoTecnico(id={self.DocID}, articolo={self.ArticoloERPId}, tipo='{self.TipoDoc}')>"
