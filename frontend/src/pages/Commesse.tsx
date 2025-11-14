/**
 * ASI-GEST Commesse Page
 * © 2025 Enrico Callegaro - Tutti i diritti riservati.
 */

import { useState, useEffect } from 'react';
import { gestionaleApi, configCommessaApi, type Commessa, type ConfigCommessa } from '../services/api';

// Modal Component
interface ConfigModalProps {
  commessa: Commessa;
  config: ConfigCommessa | null;
  onClose: () => void;
  onSave: () => void;
}

function ConfigModal({ commessa, config, onClose, onSave }: ConfigModalProps) {
  const [formData, setFormData] = useState({
    CodiceArticolo: config?.CodiceArticolo || '',
    Descrizione: config?.Descrizione || commessa.NomeCliente || '',
    FlagSMD: config?.FlagSMD ?? true,
    FlagPTH: config?.FlagPTH ?? false,
    FlagControlli: config?.FlagControlli ?? true,
    FlagTerzista: config?.FlagTerzista ?? false,
    DIBA: config?.DIBA || '',
    Revisione: config?.Revisione || '',
    Note: config?.Note || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (config) {
        // Update existing
        await configCommessaApi.updateConfig(config.ConfigCommessaID, formData);
      } else {
        // Create new
        await configCommessaApi.createConfig({
          CommessaERPId: commessa.PROGRESSIVO,
          ...formData,
        });
      }
      onSave();
    } catch (err: any) {
      console.error('Errore salvataggio configurazione:', err);
      setError(err.response?.data?.detail || 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  // Gestione chiusura con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {config ? 'Modifica Configurazione' : 'Nuova Configurazione'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Commessa {commessa.ESERCIZIO}/{commessa.NUMEROCOM} - {commessa.RIFCOMMCLI || 'N/A'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Codice Articolo */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Codice Articolo *
            </label>
            <input
              type="text"
              required
              maxLength={50}
              value={formData.CodiceArticolo}
              onChange={(e) => setFormData({ ...formData, CodiceArticolo: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="es. 45.001.234"
            />
          </div>

          {/* Descrizione */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Descrizione *
            </label>
            <input
              type="text"
              required
              maxLength={200}
              value={formData.Descrizione}
              onChange={(e) => setFormData({ ...formData, Descrizione: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descrizione articolo"
            />
          </div>

          {/* Flag Fasi */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Fasi Produttive</label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.FlagSMD}
                  onChange={(e) => setFormData({ ...formData, FlagSMD: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">SMD (montaggio superficiale)</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.FlagPTH}
                  onChange={(e) => setFormData({ ...formData, FlagPTH: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">PTH (foro passante)</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.FlagControlli}
                  onChange={(e) => setFormData({ ...formData, FlagControlli: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Controlli/Test</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.FlagTerzista}
                  onChange={(e) => setFormData({ ...formData, FlagTerzista: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Lavorazione terzista</span>
              </label>
            </div>
          </div>

          {/* DIBA e Revisione */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Codice DIBA
              </label>
              <input
                type="text"
                maxLength={100}
                value={formData.DIBA}
                onChange={(e) => setFormData({ ...formData, DIBA: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="es. DIBA-2025-001"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Revisione Scheda
              </label>
              <input
                type="text"
                maxLength={50}
                value={formData.Revisione}
                onChange={(e) => setFormData({ ...formData, Revisione: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="es. A, B, C"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Note</label>
            <textarea
              rows={3}
              value={formData.Note}
              onChange={(e) => setFormData({ ...formData, Note: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Note sulla configurazione..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Salvataggio...' : config ? 'Aggiorna' : 'Crea Configurazione'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main Component
export default function Commesse() {
  const [commesse, setCommesse] = useState<Commessa[]>([]);
  const [configs, setConfigs] = useState<Map<number, ConfigCommessa>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAperte, setShowAperte] = useState(true);
  const [selectedCommessa, setSelectedCommessa] = useState<Commessa | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadCommesse();
  }, [showAperte]);

  const loadCommesse = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await gestionaleApi.getCommesse(showAperte, 50);
      setCommesse(data.items);

      // Load configs for all commesse
      const configMap = new Map<number, ConfigCommessa>();
      await Promise.all(
        data.items.map(async (commessa) => {
          try {
            const config = await configCommessaApi.getConfigByERPId(commessa.PROGRESSIVO);
            if (config) {
              configMap.set(commessa.PROGRESSIVO, config);
            }
          } catch (err) {
            // Ignora errori (config non esiste)
          }
        })
      );
      setConfigs(configMap);
    } catch (err) {
      setError('Errore nel caricamento delle commesse');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (commessa: Commessa) => {
    setSelectedCommessa(commessa);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedCommessa(null);
  };

  const handleModalSave = () => {
    setShowModal(false);
    setSelectedCommessa(null);
    loadCommesse(); // Reload to update configs
  };

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-800">Commesse</h1>

          {/* Filter buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowAperte(true)}
              className={`btn-compact rounded ${
                showAperte
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Aperte
            </button>
            <button
              onClick={() => setShowAperte(false)}
              className={`btn-compact rounded ${
                !showAperte
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Chiuse
            </button>
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-sm text-gray-500">Caricamento...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-compact w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="text-left">Config</th>
                    <th className="text-left">Anno/Num</th>
                    <th className="text-left">Rif. Cliente</th>
                    <th className="text-left">Cliente</th>
                    <th className="text-left">Data Emissione</th>
                    <th className="text-left">Data Inizio</th>
                    <th className="text-left">Data Fine</th>
                    <th className="text-left">Stato</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {commesse.map((commessa) => {
                    const hasConfig = configs.has(commessa.PROGRESSIVO);
                    return (
                      <tr
                        key={commessa.PROGRESSIVO}
                        onClick={() => handleRowClick(commessa)}
                        className="hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <td>
                          {hasConfig ? (
                            <span className="text-green-600 text-sm" title="Configurata">
                              ✓
                            </span>
                          ) : (
                            <span className="text-orange-500 text-sm" title="Non configurata">
                              ⚠
                            </span>
                          )}
                        </td>
                        <td className="font-medium">
                          {commessa.ESERCIZIO}/{commessa.NUMEROCOM}
                        </td>
                        <td>{commessa.RIFCOMMCLI || '-'}</td>
                        <td className="max-w-xs truncate">{commessa.NomeCliente || '-'}</td>
                        <td>
                          {commessa.DATAEMISSIONE
                            ? new Date(commessa.DATAEMISSIONE).toLocaleDateString('it-IT')
                            : '-'}
                        </td>
                        <td>
                          {commessa.DATAINIZIOPIANO
                            ? new Date(commessa.DATAINIZIOPIANO).toLocaleDateString('it-IT')
                            : '-'}
                        </td>
                        <td>
                          {commessa.DATAFINEPIANO
                            ? new Date(commessa.DATAFINEPIANO).toLocaleDateString('it-IT')
                            : '-'}
                        </td>
                        <td>
                          <span
                            className={`inline-block px-2 py-0.5 text-[9px] font-medium rounded ${
                              commessa.STATOCHIUSO === 0
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {commessa.STATOCHIUSO === 0 ? 'APERTA' : 'CHIUSA'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {commesse.length === 0 && (
              <div className="p-8 text-center text-sm text-gray-500">
                Nessuna commessa trovata
              </div>
            )}
          </div>
        )}

        {/* Info footer */}
        {!loading && !error && commesse.length > 0 && (
          <div className="mt-3 text-xs text-gray-500 text-center">
            Clicca su una riga per configurare le fasi produttive
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedCommessa && (
        <ConfigModal
          commessa={selectedCommessa}
          config={configs.get(selectedCommessa.PROGRESSIVO) || null}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
}
