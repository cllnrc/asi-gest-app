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
    if (doc.FasiLavorazione) count++;
    if (doc.TempiLavorazione) count++;
    if (doc.Campionatura) count++;
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
  docUT: DocUTType;
  onClose: () => void;
  onSave: (data: Partial<DocUTType>) => void;
}

const DocUTModal: React.FC<DocUTModalProps> = ({ docUT, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<DocUTType>>(docUT);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleCheckboxChange = (field: keyof DocUTType) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header compatto con COD.ARTICOLO e DESCRIZIONE */}
        <div className="modal-header-compact">
          <div className="modal-header-info">
            <span className="codice-articolo">{docUT.CodiceArticolo}</span>
            <span className="descrizione-articolo">{docUT.Descrizione || 'Nessuna descrizione'}</span>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body-columns">
            {/* Colonna 1: UT */}
            <div className="modal-column modal-column-ut">
              <h3>UT</h3>
              <div className="column-fields">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.DIBA || false}
                    onChange={() => handleCheckboxChange('DIBA')}
                  />
                  <span>DI.BA. - TOOLKIT</span>
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={formData.FasiLavorazione || false}
                    onChange={() => handleCheckboxChange('FasiLavorazione')}
                  />
                  <span>FASI LAVORAZIONE</span>
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={formData.TempiLavorazione || false}
                    onChange={() => handleCheckboxChange('TempiLavorazione')}
                  />
                  <span>TEMPI LAVORAZIONE</span>
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={formData.Campionatura || false}
                    onChange={() => handleCheckboxChange('Campionatura')}
                  />
                  <span>CAMPIONATURA</span>
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={formData.DocProduzione || false}
                    onChange={() => handleCheckboxChange('DocProduzione')}
                  />
                  <span>DOCUMENTAZIONE PRODUZIONE</span>
                </label>
              </div>
            </div>

            {/* Colonna 2: CLIENTE */}
            <div className="modal-column modal-column-cliente">
              <h3>CLIENTE</h3>
              <div className="column-fields">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.DIBACliente || false}
                    onChange={() => handleCheckboxChange('DIBACliente')}
                  />
                  <span>DI.BA.</span>
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={formData.ProgrammaMyData || false}
                    onChange={() => handleCheckboxChange('ProgrammaMyData')}
                  />
                  <span>MYDATA - TOOLKIT</span>
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={formData.PDMCliente || false}
                    onChange={() => handleCheckboxChange('PDMCliente')}
                  />
                  <span>PDM - TOOLKIT</span>
                </label>

                <div className="field-with-select">
                  <label className="select-label">FILE T/L - TOOLKIT</label>
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
                </div>
              </div>
            </div>

            {/* Colonna 3: PRE&POST-PRODUCTION */}
            <div className="modal-column modal-column-prepost">
              <h3>PRE&POST-PRODUCTION</h3>
              <div className="column-fields">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.PPUtente || false}
                    onChange={() => handleCheckboxChange('PPUtente')}
                  />
                  <span>UT P&P</span>
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={formData.PDM || false}
                    onChange={() => handleCheckboxChange('PDM')}
                  />
                  <span>PDM</span>
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={formData.FilePP || false}
                    onChange={() => handleCheckboxChange('FilePP')}
                  />
                  <span>P&P</span>
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={formData.FotoPCB || false}
                    onChange={() => handleCheckboxChange('FotoPCB')}
                  />
                  <span>FOTO PCB</span>
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={formData.FotoProdotto || false}
                    onChange={() => handleCheckboxChange('FotoProdotto')}
                  />
                  <span>FOTO PRODOTTO</span>
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={formData.TempiLavorazione || false}
                    onChange={() => handleCheckboxChange('TempiLavorazione')}
                  />
                  <span>TEMPI LAVORAZIONE</span>
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
