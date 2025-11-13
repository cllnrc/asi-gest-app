/**
 * ASI-GEST Utenti Page - CRUD
 * © 2025 Enrico Callegaro - Tutti i diritti riservati.
 */

import { useState, useEffect } from 'react';
import { utentiApi, type Utente } from '../services/api';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Utenti() {
  const [utenti, setUtenti] = useState<Utente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingUtente, setEditingUtente] = useState<Utente | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    Username: '',
    NomeCompleto: '',
    Email: '',
    Reparto: 'SMD',
    Ruolo: 'OPERATORE',
    Attivo: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadUtenti();
  }, []);

  const loadUtenti = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await utentiApi.getUtenti();
      setUtenti(data.items);
    } catch (err) {
      setError('Errore nel caricamento degli utenti');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingUtente(null);
    setFormData({
      Username: '',
      NomeCompleto: '',
      Email: '',
      Reparto: 'SMD',
      Ruolo: 'OPERATORE',
      Attivo: true,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (utente: Utente) => {
    setEditingUtente(utente);
    setFormData({
      Username: utente.Username,
      NomeCompleto: utente.NomeCompleto,
      Email: utente.Email || '',
      Reparto: utente.Reparto || 'SMD',
      Ruolo: utente.Ruolo || 'OPERATORE',
      Attivo: utente.Attivo,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.Username.trim()) {
      errors.Username = 'Username obbligatorio';
    }
    if (!formData.NomeCompleto.trim()) {
      errors.NomeCompleto = 'Nome completo obbligatorio';
    }
    if (formData.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
      errors.Email = 'Email non valida';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      if (editingUtente) {
        await utentiApi.updateUtente(editingUtente.UtenteID, formData);
      } else {
        await utentiApi.createUtente(formData);
      }

      setShowModal(false);
      loadUtenti();
    } catch (err) {
      console.error(err);
      alert('Errore nel salvataggio dell\'utente');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (utente: Utente) => {
    if (!confirm(`Confermi l'eliminazione dell'utente ${utente.NomeCompleto}?`)) return;

    try {
      await utentiApi.deleteUtente(utente.UtenteID);
      loadUtenti();
    } catch (err) {
      console.error(err);
      alert('Errore nell\'eliminazione dell\'utente');
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner message="Caricamento utenti..." />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-800">Utenti</h1>
          <button onClick={handleNew} className="btn-compact bg-blue-600 text-white rounded hover:bg-blue-700">
            + Nuovo Utente
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
                  <th className="text-left">Username</th>
                  <th className="text-left">Nome Completo</th>
                  <th className="text-left">Email</th>
                  <th className="text-left">Reparto</th>
                  <th className="text-left">Ruolo</th>
                  <th className="text-left">Stato</th>
                  <th className="text-left">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {utenti.map((utente) => (
                  <tr key={utente.UtenteID} className="hover:bg-gray-50">
                    <td className="font-medium">{utente.UtenteID}</td>
                    <td className="font-mono text-[10px]">{utente.Username}</td>
                    <td>{utente.NomeCompleto}</td>
                    <td className="text-[10px]">{utente.Email || '-'}</td>
                    <td>
                      <span
                        className={`inline-block px-2 py-0.5 text-[9px] font-medium rounded ${
                          utente.Reparto === 'SMD'
                            ? 'bg-blue-100 text-blue-700'
                            : utente.Reparto === 'PTH'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {utente.Reparto || '-'}
                      </span>
                    </td>
                    <td className="text-[10px]">{utente.Ruolo || '-'}</td>
                    <td>
                      <span
                        className={`inline-block px-2 py-0.5 text-[9px] font-medium rounded ${
                          utente.Attivo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {utente.Attivo ? 'ATTIVO' : 'INATTIVO'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(utente)}
                          className="btn-compact bg-yellow-500 text-white rounded hover:bg-yellow-600 text-[10px] px-2"
                        >
                          Modifica
                        </button>
                        <button
                          onClick={() => handleDelete(utente)}
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

          {utenti.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-500">Nessun utente presente</div>
          )}
        </div>

        {/* Form Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingUtente ? 'Modifica Utente' : 'Nuovo Utente'}
          size="md"
        >
          <div className="space-y-3">
            <FormField label="Username" required htmlFor="username" error={formErrors.Username}>
              <input
                id="username"
                type="text"
                value={formData.Username}
                onChange={(e) => setFormData({ ...formData, Username: e.target.value })}
                className="input-compact w-full border border-gray-300 rounded"
                disabled={!!editingUtente}
              />
            </FormField>

            <FormField label="Nome Completo" required htmlFor="nomeCompleto" error={formErrors.NomeCompleto}>
              <input
                id="nomeCompleto"
                type="text"
                value={formData.NomeCompleto}
                onChange={(e) => setFormData({ ...formData, NomeCompleto: e.target.value })}
                className="input-compact w-full border border-gray-300 rounded"
              />
            </FormField>

            <FormField label="Email" htmlFor="email" error={formErrors.Email}>
              <input
                id="email"
                type="email"
                value={formData.Email}
                onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
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

            <FormField label="Ruolo" htmlFor="ruolo">
              <input
                id="ruolo"
                type="text"
                value={formData.Ruolo}
                onChange={(e) => setFormData({ ...formData, Ruolo: e.target.value })}
                className="input-compact w-full border border-gray-300 rounded"
                placeholder="es. OPERATORE, CAPO REPARTO, TECNICO"
              />
            </FormField>

            <FormField label="Stato" htmlFor="attivo">
              <div className="flex items-center gap-2">
                <input
                  id="attivo"
                  type="checkbox"
                  checked={formData.Attivo}
                  onChange={(e) => setFormData({ ...formData, Attivo: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="attivo" className="text-[11px] text-gray-700">
                  Utente attivo
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
