/**
 * ASI-GEST Commesse Page with Production Start
 * © 2025 Enrico Callegaro - Tutti i diritti riservati.
 */

import { useState, useEffect } from 'react';
import { gestionaleApi, configApi, fasiApi, fasiTipoApi, type Commessa, type FaseTipo } from '../services/api';
import Modal from '../components/Modal';
import FormField from '../components/FormField';

export default function Commesse() {
  const [commesse, setCommesse] = useState<Commessa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAperte, setShowAperte] = useState(true);

  // Modal avvio produzione
  const [showProdModal, setShowProdModal] = useState(false);
  const [selectedCommessa, setSelectedCommessa] = useState<Commessa | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [fasiTipo, setFasiTipo] = useState<FaseTipo[]>([]);
  const [fasiSelezionate, setFasiSelezionate] = useState<Record<number, boolean>>({});
  const [quantitaProduzione, setQuantitaProduzione] = useState<number>(0);
  const [codiceArticolo, setCodiceArticolo] = useState<string>('');
  const [descrizioneArticolo, setDescrizioneArticolo] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [showAperte]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [commesseData, fasiTipoData] = await Promise.all([
        gestionaleApi.getCommesse(showAperte, 50),
        fasiTipoApi.getFasiTipo(),
      ]);
      setCommesse(commesseData.items);
      setFasiTipo(fasiTipoData.items.filter((ft: FaseTipo) => ft.Attivo));
    } catch (err) {
      setError('Errore nel caricamento delle commesse');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvviaProduzione = (commessa: Commessa) => {
    setSelectedCommessa(commessa);
    setCodiceArticolo('');
    setDescrizioneArticolo(`Commessa ${commessa.ESERCIZIO}/${commessa.NUMEROCOM}`);
    setQuantitaProduzione(100); // Default

    // Preseleziona SMD, PTH e almeno un controllo
    const defaultFasi: Record<number, boolean> = {};
    fasiTipo.forEach((ft: FaseTipo) => {
      if (ft.Tipo === 'SMD' || ft.Tipo === 'PTH' || ft.Tipo === 'CONTROLLO') {
        defaultFasi[ft.FaseTipoID] = ft.Tipo !== 'CONTROLLO'; // SMD e PTH true, CONTROLLO false di default
      }
    });
    setFasiSelezionate(defaultFasi);
    setShowProdModal(true);
  };

  const handleCreaProduzione = async () => {
    if (!selectedCommessa) return;

    try {
      setSubmitting(true);

      const fasiDaCreare = Object.entries(fasiSelezionate)
        .filter(([_, selected]) => selected)
        .map(([id, _]) => Number(id));

      if (fasiDaCreare.length === 0) {
        alert('Seleziona almeno una fase');
        return;
      }

      if (quantitaProduzione <= 0) {
        alert('Inserisci una quantità valida');
        return;
      }

      // 1. Crea ConfigCommessa
      const configData = {
        CommessaERPId: selectedCommessa.PROGRESSIVO,
        CodiceArticolo: codiceArticolo || `ART-${selectedCommessa.NUMEROCOM}`,
        Descrizione: descrizioneArticolo,
        FlagSMD: fasiDaCreare.some((id) => fasiTipo.find((ft: FaseTipo) => ft.FaseTipoID === id)?.Tipo === 'SMD'),
        FlagPTH: fasiDaCreare.some((id) => fasiTipo.find((ft: FaseTipo) => ft.FaseTipoID === id)?.Tipo === 'PTH'),
        FlagControllo: fasiDaCreare.some((id) => fasiTipo.find((ft: FaseTipo) => ft.FaseTipoID === id)?.Tipo === 'CONTROLLO'),
      };

      const config = await configApi.createConfig(configData);

      // 2. Crea Fasi
      const fasiPromises = fasiDaCreare.map((faseTipoId) =>
        fasiApi.createFase({
          ConfigCommessaID: config.ConfigCommessaID,
          FaseTipoID: faseTipoId,
          NumeroCommessa: `${selectedCommessa.ESERCIZIO}/${selectedCommessa.NUMEROCOM}`,
          Quantita: quantitaProduzione,
        })
      );

      await Promise.all(fasiPromises);

      alert(`Produzione avviata! Create ${fasiDaCreare.length} fasi per la commessa ${selectedCommessa.ESERCIZIO}/${selectedCommessa.NUMEROCOM}`);

      setShowProdModal(false);
      setSelectedCommessa(null);
    } catch (err) {
      console.error(err);
      alert('Errore nella creazione della produzione');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-800">📋 Commesse</h1>

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
                    <th className="text-left">Anno/Num</th>
                    <th className="text-left">Rif. Cliente</th>
                    <th className="text-left">Cliente</th>
                    <th className="text-left">Data Emissione</th>
                    <th className="text-left">Data Inizio</th>
                    <th className="text-left">Data Fine</th>
                    <th className="text-left">Stato</th>
                    <th className="text-left">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {commesse.map((commessa) => (
                    <tr key={commessa.PROGRESSIVO} className="hover:bg-gray-50">
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
                      <td>
                        {commessa.STATOCHIUSO === 0 && (
                          <button
                            onClick={() => handleAvviaProduzione(commessa)}
                            className="btn-compact bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            🚀 Avvia Produzione
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
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
      </div>

      {/* Modal Avvio Produzione */}
      <Modal
        isOpen={showProdModal}
        onClose={() => setShowProdModal(false)}
        title="🚀 Avvia Produzione"
        size="lg"
      >
        {selectedCommessa && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded border border-blue-200 text-[11px]">
              <div className="font-semibold text-blue-900 mb-1">
                Commessa: {selectedCommessa.ESERCIZIO}/{selectedCommessa.NUMEROCOM}
              </div>
              <div className="text-blue-700">
                Cliente: {selectedCommessa.NomeCliente || 'N/D'}
              </div>
              <div className="text-blue-700">
                Rif. Cliente: {selectedCommessa.RIFCOMMCLI || 'N/D'}
              </div>
            </div>

            <FormField label="Codice Articolo" htmlFor="codiceArticolo">
              <input
                id="codiceArticolo"
                type="text"
                value={codiceArticolo}
                onChange={(e) => setCodiceArticolo(e.target.value)}
                className="input-compact w-full border border-gray-300 rounded"
                placeholder="Es: PCB-001"
              />
            </FormField>

            <FormField label="Descrizione" required htmlFor="descrizione">
              <input
                id="descrizione"
                type="text"
                value={descrizioneArticolo}
                onChange={(e) => setDescrizioneArticolo(e.target.value)}
                className="input-compact w-full border border-gray-300 rounded"
              />
            </FormField>

            <FormField label="Quantità da Produrre" required htmlFor="quantita">
              <input
                id="quantita"
                type="number"
                value={quantitaProduzione}
                onChange={(e) => setQuantitaProduzione(Number(e.target.value))}
                className="input-compact w-full border border-gray-300 rounded"
                min="1"
              />
            </FormField>

            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-2">
                Fasi da Creare *
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded p-3">
                {fasiTipo.map((ft: FaseTipo) => (
                  <label key={ft.FaseTipoID} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={fasiSelezionate[ft.FaseTipoID] || false}
                      onChange={(e) =>
                        setFasiSelezionate({
                          ...fasiSelezionate,
                          [ft.FaseTipoID]: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <div>
                      <div className="text-[11px] font-medium text-gray-800">{ft.Descrizione}</div>
                      <div className="text-[10px] text-gray-500">
                        Tipo: {ft.Tipo} | Codice: {ft.Codice}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowProdModal(false)}
                className="btn-compact bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                disabled={submitting}
              >
                Annulla
              </button>
              <button
                onClick={handleCreaProduzione}
                className="btn-compact bg-green-600 text-white rounded hover:bg-green-700"
                disabled={submitting}
              >
                {submitting ? 'Creazione...' : '🚀 Avvia Produzione'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
