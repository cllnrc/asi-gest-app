/**
 * ASI-GEST Macchine Page - CRUD
 * © 2025 Enrico Callegaro - Tutti i diritti riservati.
 */

import { useState, useEffect } from 'react';
import { macchineApi, type Macchina } from '../services/api';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Macchine() {
  const [macchine, setMacchine] = useState<Macchina[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingMacchina, setEditingMacchina] = useState<Macchina | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    Codice: '',
    Descrizione: '',
    Reparto: 'SMD',
    Tipo: '',
    Note: '',
    Attiva: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadMacchine();
  }, []);

  const loadMacchine = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await macchineApi.getMacchine();
      setMacchine(data.items);
    } catch (err) {
      setError('Errore nel caricamento delle macchine');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingMacchina(null);
    setFormData({
      Codice: '',
      Descrizione: '',
      Reparto: 'SMD',
      Tipo: '',
      Note: '',
      Attiva: true,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (macchina: Macchina) => {
    setEditingMacchina(macchina);
    setFormData({
      Codice: macchina.Codice,
      Descrizione: macchina.Descrizione || '',
      Reparto: macchina.Reparto || 'SMD',
      Tipo: macchina.Tipo || '',
      Note: macchina.Note || '',
      Attiva: macchina.Attiva,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.Codice.trim()) {
      errors.Codice = 'Codice obbligatorio';
    }
    if (!formData.Descrizione.trim()) {
      errors.Descrizione = 'Descrizione obbligatoria';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      if (editingMacchina) {
        await macchineApi.updateMacchina(editingMacchina.MacchinaID, formData);
      } else {
        await macchineApi.createMacchina(formData);
      }

      setShowModal(false);
      loadMacchine();
    } catch (err) {
      console.error(err);
      alert('Errore nel salvataggio della macchina');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (macchina: Macchina) => {
    if (!confirm(`Confermi l'eliminazione della macchina ${macchina.Codice}?`)) return;

    try {
      await macchineApi.deleteMacchina(macchina.MacchinaID);
      loadMacchine();
    } catch (err) {
      console.error(err);
      alert('Errore nell\'eliminazione della macchina');
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner message="Caricamento macchine..." />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-800">Macchine</h1>
          <button onClick={handleNew} className="btn-compact bg-blue-600 text-white rounded hover:bg-blue-700">
            + Nuova Macchina
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-4">{error}</div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-compact w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="text-left">ID</th>
                  <th className="text-left">Codice</th>
                  <th className="text-left">Descrizione</th>
                  <th className="text-left">Reparto</th>
                  <th className="text-left">Tipo</th>
                  <th className="text-left">Stato</th>
                  <th className="text-left">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {macchine.map((macchina) => (
                  <tr key={macchina.MacchinaID} className="hover:bg-gray-50">
                    <td className="font-medium">{macchina.MacchinaID}</td>
                    <td className="font-mono text-[10px] font-semibold">{macchina.Codice}</td>
                    <td className="max-w-xs truncate">{macchina.Descrizione || '-'}</td>
                    <td>
                      <span
                        className={`inline-block px-2 py-0.5 text-[9px] font-medium rounded ${
                          macchina.Reparto === 'SMD'
                            ? 'bg-blue-100 text-blue-700'
                            : macchina.Reparto === 'PTH'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {macchina.Reparto || '-'}
                      </span>
                    </td>
                    <td className="text-[10px]">{macchina.Tipo || '-'}</td>
                    <td>
                      <span
                        className={`inline-block px-2 py-0.5 text-[9px] font-medium rounded ${
                          macchina.Attiva ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {macchina.Attiva ? 'ATTIVA' : 'INATTIVA'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(macchina)}
                          className="btn-compact bg-yellow-500 text-white rounded hover:bg-yellow-600 text-[10px] px-2"
                        >
                          Modifica
                        </button>
                        <button
                          onClick={() => handleDelete(macchina)}
                          className="btn-compact bg-red-500 text-white rounded hover:bg-red-600 text-[10px] px-2"
                        >
                          Elimina
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {macchine.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-500">Nessuna macchina presente</div>
          )}
        </div>

        {/* Form Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingMacchina ? 'Modifica Macchina' : 'Nuova Macchina'}
          size="md"
        >
          <div className="space-y-3">
            <FormField label="Codice" required htmlFor="codice" error={formErrors.Codice}>
              <input
                id="codice"
                type="text"
                value={formData.Codice}
                onChange={(e) => setFormData({ ...formData, Codice: e.target.value })}
                className="input-compact w-full border border-gray-300 rounded"
                disabled={!!editingMacchina}
              />
            </FormField>

            <FormField label="Descrizione" required htmlFor="descrizione" error={formErrors.Descrizione}>
              <input
                id="descrizione"
                type="text"
                value={formData.Descrizione}
                onChange={(e) => setFormData({ ...formData, Descrizione: e.target.value })}
                className="input-compact w-full border border-gray-300 rounded"
              />
            </FormField>

            <FormField label="Reparto" required htmlFor="reparto">
              <select
                id="reparto"
                value={formData.Reparto}
                onChange={(e) => setFormData({ ...formData, Reparto: e.target.value })}
                className="input-compact w-full border border-gray-300 rounded"
              >
                <option value="SMD">SMD</option>
                <option value="PTH">PTH</option>
                <option value="CONTROLLI">CONTROLLI</option>
              </select>
            </FormField>

            <FormField label="Tipo" htmlFor="tipo">
              <input
                id="tipo"
                type="text"
                value={formData.Tipo}
                onChange={(e) => setFormData({ ...formData, Tipo: e.target.value })}
                className="input-compact w-full border border-gray-300 rounded"
                placeholder="es. Pick & Place, Saldatrice, Collaudo"
              />
            </FormField>

            <FormField label="Note" htmlFor="note">
              <textarea
                id="note"
                value={formData.Note}
                onChange={(e) => setFormData({ ...formData, Note: e.target.value })}
                className="input-compact w-full border border-gray-300 rounded"
                rows={3}
              />
            </FormField>

            <FormField label="Stato" htmlFor="attiva">
              <div className="flex items-center gap-2">
                <input
                  id="attiva"
                  type="checkbox"
                  checked={formData.Attiva}
                  onChange={(e) => setFormData({ ...formData, Attiva: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="attiva" className="text-[11px] text-gray-700">
                  Macchina attiva
                </label>
              </div>
            </FormField>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="btn-compact bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                disabled={submitting}
              >
                Annulla
              </button>
              <button
                onClick={handleSubmit}
                className="btn-compact bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={submitting}
              >
                {submitting ? 'Salvataggio...' : 'Salva'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
