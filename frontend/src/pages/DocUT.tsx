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

// Type for UT field metadata editor
type UTField = 'DIBA' | 'ProgrammaMyData' | 'PDM' | 'FileLaminaTelaio';

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
  docUT: DocUTType;
  onClose: () => void;
  onSave: (data: Partial<DocUTType>) => void;
}

const DocUTModal: React.FC<DocUTModalProps> = ({ docUT, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<DocUTType>>(docUT);

  // Sub-modal for editing UT field metadata (data/utente)
  const [editingField, setEditingField] = useState<UTField | null>(null);

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

  const openFieldEditor = (field: UTField, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingField(field);
  };

  const closeFieldEditor = () => {
    setEditingField(null);
  };

  const saveFieldMetadata = (field: UTField, data: string, utente: string) => {
    setFormData(prev => ({
      ...prev,
      [`${field}Data`]: data,
      [`${field}Utente`]: utente,
    }));
    closeFieldEditor();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-info">
            <div className="modal-header-codice">{docUT.CodiceArticolo}</div>
            <div className="modal-header-descrizione">{docUT.Descrizione || 'Nessuna descrizione'}</div>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body-three-column">
            {/* Colonna 1: UT */}
            <div className="modal-column modal-column-ut">
              <h3 className="column-title">UT</h3>

              <div className="modal-field">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.DIBA || false}
                    onChange={() => handleCheckboxChange('DIBA')}
                  />
                  DI.BA.
                  {formData.DIBA && (
                    <span
                      className="field-info clickable"
                      title={formData.DIBAData ? `${new Date(formData.DIBAData).toLocaleString('it-IT')} | ${formData.DIBAUtente || '?'}` : 'Click per impostare data/utente'}
                      onClick={(e) => openFieldEditor('DIBA', e)}
                    >
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
                  MYDATA
                  {formData.ProgrammaMyData && (
                    <span
                      className="field-info clickable"
                      title={formData.ProgrammaMyDataData ? `${new Date(formData.ProgrammaMyDataData).toLocaleString('it-IT')} | ${formData.ProgrammaMyDataUtente || '?'}` : 'Click per impostare data/utente'}
                      onClick={(e) => openFieldEditor('ProgrammaMyData', e)}
                    >
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
                  {formData.PDM && (
                    <span
                      className="field-info clickable"
                      title={formData.PDMData ? `${new Date(formData.PDMData).toLocaleString('it-IT')} | ${formData.PDMUtente || '?'}` : 'Click per impostare data/utente'}
                      onClick={(e) => openFieldEditor('PDM', e)}
                    >
                      📅
                    </span>
                  )}
                </label>
              </div>

              <div className="modal-field modal-field-select">
                <label className="select-label">FILE T/L</label>
                <div className="select-with-icon">
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
                  {formData.FileLaminaTelaio && (
                    <span
                      className="field-info clickable"
                      title={formData.FileLaminaTelaioData ? `${new Date(formData.FileLaminaTelaioData).toLocaleString('it-IT')} | ${formData.FileLaminaTelaioUtente || '?'}` : 'Click per impostare data/utente'}
                      onClick={(e) => openFieldEditor('FileLaminaTelaio', e)}
                    >
                      📅
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Colonna 2: CLIENTE */}
            <div className="modal-column modal-column-cliente">
              <h3 className="column-title">CLIENTE</h3>

              <div className="modal-field">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.DIBACliente || false}
                    onChange={() => handleCheckboxChange('DIBACliente')}
                  />
                  DI.BA.
                </label>
              </div>

              <div className="modal-field">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.PDMCliente || false}
                    onChange={() => handleCheckboxChange('PDMCliente')}
                  />
                  PDM
                </label>
              </div>

              <div className="modal-field">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.FilePP || false}
                    onChange={() => handleCheckboxChange('FilePP')}
                  />
                  P&P
                </label>
              </div>
            </div>

            {/* Colonna 3: PRE&POST-PRODUCTION */}
            <div className="modal-column modal-column-postprod">
              <h3 className="column-title">PRE&POST-PRODUCTION</h3>

              <div className="modal-field">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.PPUtente || false}
                    onChange={() => handleCheckboxChange('PPUtente')}
                  />
                  UT P&P
                </label>
              </div>

              <div className="modal-field">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.FasiLavorazione || false}
                    onChange={() => handleCheckboxChange('FasiLavorazione')}
                  />
                  FASI LAVORAZIONE
                </label>
              </div>

              <div className="modal-field">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.FotoPCB || false}
                    onChange={() => handleCheckboxChange('FotoPCB')}
                  />
                  FOTO PCB
                </label>
              </div>

              <div className="modal-field">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.FotoProdotto || false}
                    onChange={() => handleCheckboxChange('FotoProdotto')}
                  />
                  FOTO PRODOTTO
                </label>
              </div>

              <div className="modal-field">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.TempiLavorazione || false}
                    onChange={() => handleCheckboxChange('TempiLavorazione')}
                  />
                  TEMPI LAVORAZIONE
                </label>
              </div>

              <div className="modal-field">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.Campionatura || false}
                    onChange={() => handleCheckboxChange('Campionatura')}
                  />
                  CAMPIONATURA
                </label>
              </div>

              <div className="modal-field">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.DocProduzione || false}
                    onChange={() => handleCheckboxChange('DocProduzione')}
                  />
                  DOCUMENTAZIONE PRODUZIONE
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

        {/* Sub-modal for editing UT field metadata */}
        {editingField && (
          <UTFieldEditor
            field={editingField}
            data={formData[`${editingField}Data` as keyof DocUTType] as string | null}
            utente={formData[`${editingField}Utente` as keyof DocUTType] as string | null}
            onClose={closeFieldEditor}
            onSave={(data, utente) => saveFieldMetadata(editingField, data, utente)}
          />
        )}
      </div>
    </div>
  );
};

// Sub-Modal for editing UT field metadata (data/utente)
interface UTFieldEditorProps {
  field: UTField;
  data: string | null;
  utente: string | null;
  onClose: () => void;
  onSave: (data: string, utente: string) => void;
}

const UTFieldEditor: React.FC<UTFieldEditorProps> = ({ field, data, utente, onClose, onSave }) => {
  const [editData, setEditData] = useState(data || new Date().toISOString().slice(0, 16));
  const [editUtente, setEditUtente] = useState(utente || '');

  const fieldNames: Record<UTField, string> = {
    'DIBA': 'DI.BA.',
    'ProgrammaMyData': 'PROGRAMMA MYDATA',
    'PDM': 'PDM',
    'FileLaminaTelaio': 'FILE LAMINA/TELAIO',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editData, editUtente);
  };

  return (
    <div className="sub-modal-overlay" onClick={(e) => e.stopPropagation()}>
      <div className="sub-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="sub-modal-header">
          <h3>Modifica {fieldNames[field]}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="sub-modal-body">
            <div className="form-group">
              <label>Data:</label>
              <input
                type="datetime-local"
                value={editData}
                onChange={(e) => setEditData(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Utente:</label>
              <input
                type="text"
                value={editUtente}
                onChange={(e) => setEditUtente(e.target.value)}
                placeholder="Nome utente"
                required
              />
            </div>
          </div>

          <div className="sub-modal-footer">
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
