/**
 * DocUT Page - Documentazione Tecnica Articoli
 * © 2025 Enrico Callegaro - Tutti i diritti riservati.
 *
 * Gestione documentazione tecnica necessaria per produzione articoli.
 * Prerequisito per ConfigCommessa.
 */

import React, { useState, useEffect } from 'react';
import { docUTApi, DocUT as DocUTType } from '../services/api';
import './DocUT.css';

const DocUT: React.FC = () => {
  const [docUTList, setDocUTList] = useState<DocUTType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(30);

  // Filters
  const [search, setSearch] = useState('');

  // Modal
  const [selectedDocUT, setSelectedDocUT] = useState<DocUTType | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Load data - articoli da gestionale con documentazione UT
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await docUTApi.getArticoliConDocumentazione(page, pageSize, search || undefined);
      setDocUTList(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error('Error loading articoli:', err);
      setError('Errore nel caricamento degli articoli');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, search]);

  // Calculate UT completion (0-4)
  const getUTCompletion = (doc: DocUTType): number => {
    let count = 0;
    if (doc.DIBA) count++;
    if (doc.ProgrammaMyData) count++;
    if (doc.PDM) count++;
    if (doc.FileLaminaTelaio) count++;
    return count;
  };

  // Get completion indicator (✓✓✓✓)
  const getUTIndicator = (doc: DocUTType): string => {
    const completion = getUTCompletion(doc);
    const checked = '✓'.repeat(completion);
    const unchecked = '-'.repeat(4 - completion);
    return checked + unchecked;
  };

  // Get completion CSS class
  const getCompletionClass = (doc: DocUTType): string => {
    const completion = getUTCompletion(doc);
    if (completion === 4) return 'complete';
    if (completion >= 2) return 'partial';
    return 'incomplete';
  };

  const openModal = (doc: DocUTType) => {
    setSelectedDocUT(doc);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDocUT(null);
  };

  const handleSave = async (updatedDoc: Partial<DocUTType>) => {
    if (!selectedDocUT) return;

    try {
      if (selectedDocUT.DocUTID) {
        // Update existing DocUT
        await docUTApi.updateDocUT(selectedDocUT.DocUTID, updatedDoc);
      } else {
        // Create new DocUT
        await docUTApi.createDocUT({
          CodiceArticolo: selectedDocUT.CodiceArticolo,
          Descrizione: selectedDocUT.Descrizione,
          ...updatedDoc,
        });
      }
      closeModal();
      loadData(); // Reload list
    } catch (err) {
      console.error('Error saving DocUT:', err);
      alert('Errore durante il salvataggio');
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="docUT-container">
      <div className="docUT-header">
        <h1>Documentazione Tecnica (UT)</h1>
      </div>

      {/* Filters */}
      <div className="docUT-filters">
        <div className="filter-search">
          <input
            type="text"
            placeholder="Cerca per codice o descrizione..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset to first page on search
            }}
          />
        </div>
      </div>

      {/* Loading/Error states */}
      {loading && <div className="loading">Caricamento...</div>}
      {error && <div className="error">{error}</div>}

      {/* Table */}
      {!loading && !error && (
        <div className="docUT-table-container">
          <table className="docUT-table">
            <thead>
              <tr>
                <th>Articolo</th>
                <th>Descrizione</th>
                <th>UT</th>
                <th>Cliente</th>
                <th>Post Prod</th>
              </tr>
            </thead>
            <tbody>
              {docUTList.map((doc) => (
                <tr key={doc.DocUTID} onClick={() => openModal(doc)} className="clickable">
                  <td>{doc.CodiceArticolo}</td>
                  <td>{doc.Descrizione || '-'}</td>
                  <td className={`ut-indicator ${getCompletionClass(doc)}`}>
                    {getUTIndicator(doc)}
                  </td>
                  <td className="cliente-indicator">
                    {doc.DIBACliente ? '✓' : '-'}
                    {doc.PDMCliente ? '✓' : '-'}
                    {doc.FilePP ? '✓' : '-'}
                  </td>
                  <td className="post-prod-indicator">
                    {doc.FotoPCB || doc.FotoProdotto || doc.TempiLavorazione ? '✓' : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <span className="pagination-info">
              Pagina {page} di {totalPages} ({total} articoli totali)
            </span>
            <div className="pagination-buttons">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                &lt; Precedente
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Successiva &gt;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedDocUT && (
        <DocUTModal
          docUT={selectedDocUT}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

// Modal Component
interface DocUTModalProps {
  docUT: DocUT;
  onClose: () => void;
  onSave: (data: Partial<DocUT>) => void;
}

const DocUTModal: React.FC<DocUTModalProps> = ({ docUT, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<DocUT>>(docUT);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleCheckboxChange = (field: keyof DocUT) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Documentazione Tecnica - {docUT.CodiceArticolo}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="modal-description">{docUT.Descrizione || 'Nessuna descrizione'}</p>

            {/* Sezione UT */}
            <div className="modal-section">
              <h3>📋 UFFICIO TECNICO</h3>
              <div className="modal-field">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.DIBA || false}
                    onChange={() => handleCheckboxChange('DIBA')}
                  />
                  DI.BA.
                  {docUT.DIBAData && (
                    <span className="field-info" title={`${new Date(docUT.DIBAData).toLocaleString()} | ${docUT.DIBAUtente || '?'}`}>
                      📅
                    </span>
                  )}
                </label>
              </div>

              <div className="modal-field">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.ProgrammaMyData || false}
                    onChange={() => handleCheckboxChange('ProgrammaMyData')}
                  />
                  PROGRAMMA MYDATA
                  {docUT.ProgrammaMyDataData && (
                    <span className="field-info" title={`${new Date(docUT.ProgrammaMyDataData).toLocaleString()} | ${docUT.ProgrammaMyDataUtente || '?'}`}>
                      📅
                    </span>
                  )}
                </label>
              </div>

              <div className="modal-field">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.PDM || false}
                    onChange={() => handleCheckboxChange('PDM')}
                  />
                  PDM
                  {docUT.PDMData && (
                    <span className="field-info" title={`${new Date(docUT.PDMData).toLocaleString()} | ${docUT.PDMUtente || '?'}`}>
                      📅
                    </span>
                  )}
                </label>
              </div>

              <div className="modal-field">
                <label>FILE LAMINA/TELAIO</label>
                <select
                  value={formData.FileLaminaTelaio || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, FileLaminaTelaio: e.target.value || null }))}
                >
                  <option value="">Nessuno</option>
                  <option value="CLIENTE">Cliente</option>
                  <option value="TOP">TOP</option>
                  <option value="BOTTOM">BOTTOM</option>
                  <option value="TOP+BOTTOM">TOP+BOTTOM</option>
                </select>
                {docUT.FileLaminaTelaioData && (
                  <span className="field-info" title={`${new Date(docUT.FileLaminaTelaioData).toLocaleString()} | ${docUT.FileLaminaTelaioUtente || '?'}`}>
                    📅
                  </span>
                )}
              </div>
            </div>

            {/* Sezione Cliente */}
            <div className="modal-section">
              <h3>👤 CLIENTE</h3>
              <div className="modal-field">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.DIBACliente || false}
                    onChange={() => handleCheckboxChange('DIBACliente')}
                  />
                  DI.BA. CLIENTE
                </label>
              </div>
              <div className="modal-field">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.PDMCliente || false}
                    onChange={() => handleCheckboxChange('PDMCliente')}
                  />
                  PDM CLIENTE
                </label>
              </div>
              <div className="modal-field">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.FilePP || false}
                    onChange={() => handleCheckboxChange('FilePP')}
                  />
                  FILE P&P
                </label>
              </div>
            </div>

            {/* Sezione Post Production */}
            <div className="modal-section">
              <h3>📦 POST PRODUCTION</h3>
              <div className="modal-grid">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.FotoPCB || false}
                    onChange={() => handleCheckboxChange('FotoPCB')}
                  />
                  FOTO PCB
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.FotoProdotto || false}
                    onChange={() => handleCheckboxChange('FotoProdotto')}
                  />
                  FOTO PRODOTTO
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.TempiLavorazione || false}
                    onChange={() => handleCheckboxChange('TempiLavorazione')}
                  />
                  TEMPI LAVORAZIONE
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.FasiLavorazione || false}
                    onChange={() => handleCheckboxChange('FasiLavorazione')}
                  />
                  FASI LAVORAZIONE
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.PPUtente || false}
                    onChange={() => handleCheckboxChange('PPUtente')}
                  />
                  P&P UTENTE
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.Campionatura || false}
                    onChange={() => handleCheckboxChange('Campionatura')}
                  />
                  CAMPIONATURA
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.DocProduzione || false}
                    onChange={() => handleCheckboxChange('DocProduzione')}
                  />
                  DOC. PRODUZIONE
                </label>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Annulla
            </button>
            <button type="submit" className="btn-primary">
              Salva
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocUT;
