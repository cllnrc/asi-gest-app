/**
 * ASI-GEST SMD Workflow Page
 * © 2025 Enrico Callegaro - Tutti i diritti riservati.
 */

import { useState, useEffect } from 'react';
import {
  lottiApi,
  fasiApi,
  fasiTipoApi,
  utentiApi,
  macchineApi,
  type Lotto,
  type Fase,
  type FaseTipo,
  type Utente,
  type Macchina,
} from '../services/api';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';

interface LottoWithFase extends Lotto {
  fase?: Fase;
  faseTipo?: FaseTipo;
  utente?: Utente;
  macchina?: Macchina;
}

export default function SMD() {
  const [lottiAperti, setLottiAperti] = useState<LottoWithFase[]>([]);
  const [lottiStorico, setLottiStorico] = useState<LottoWithFase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showNewModal, setShowNewModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedLotto, setSelectedLotto] = useState<LottoWithFase | null>(null);

  // Form options
  const [fasiTipo, setFasiTipo] = useState<FaseTipo[]>([]);
  const [utenti, setUtenti] = useState<Utente[]>([]);
  const [macchine, setMacchine] = useState<Macchina[]>([]);

  // New lotto form
  const [newLottoForm, setNewLottoForm] = useState({
    ConfigCommessaID: 0,
    FaseTipoID: 0,
    UtenteID: 0,
    MacchinaID: 0,
    QtaInput: 0,
    ProgrammaFeeder: '',
    Note: '',
  });

  // Close lotto form
  const [closeLottoForm, setCloseLottoForm] = useState({
    QtaOutput: 0,
    QtaScarti: 0,
    NoteScarti: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load lotti and fasi
      const [lottiData, fasiData, fasiTipoData, utentiData, macchineData] = await Promise.all([
        lottiApi.getLotti(),
        fasiApi.getFasi(),
        fasiTipoApi.getFasiTipo('SMD'),
        utentiApi.getUtenti(true),
        macchineApi.getMacchine('SMD', true),
      ]);

      setFasiTipo(fasiTipoData.items);
      setUtenti(utentiData.items);
      setMacchine(macchineData.items);

      // Match lotti with their fasi
      const lottiWithFasi = lottiData.items.map((lotto) => {
        const fase = fasiData.items.find((f) => f.LottoID === lotto.LottoID);
        const faseTipo = fase ? fasiTipoData.items.find((ft) => ft.FaseTipoID === fase.FaseTipoID) : undefined;
        const utente = fase ? utentiData.items.find((u) => u.UtenteID === fase.UtenteID) : undefined;
        const macchina = fase ? macchineData.items.find((m) => m.MacchinaID === fase.MacchinaID) : undefined;

        return {
          ...lotto,
          fase,
          faseTipo,
          utente,
          macchina,
        };
      });

      // Filter SMD lotti only
      const smdLotti = lottiWithFasi.filter((l) => l.faseTipo?.TipoProduzione === 'SMD');

      // Separate open and closed
      setLottiAperti(smdLotti.filter((l) => l.Stato === 'APERTO'));
      setLottiStorico(smdLotti.filter((l) => l.Stato === 'CHIUSO').slice(0, 20));
    } catch (err) {
      setError('Errore nel caricamento dei dati SMD');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewModal = () => {
    setNewLottoForm({
      ConfigCommessaID: 0,
      FaseTipoID: fasiTipo[0]?.FaseTipoID || 0,
      UtenteID: utenti[0]?.UtenteID || 0,
      MacchinaID: macchine[0]?.MacchinaID || 0,
      QtaInput: 0,
      ProgrammaFeeder: '',
      Note: '',
    });
    setShowNewModal(true);
  };

  const handleCreateLotto = async () => {
    try {
      if (newLottoForm.QtaInput <= 0) {
        alert('Inserire una quantità valida');
        return;
      }

      // Create lotto
      const newLotto = await lottiApi.createLotto({
        ConfigCommessaID: newLottoForm.ConfigCommessaID || undefined,
      });

      // Create fase
      await fasiApi.createFase({
        LottoID: newLotto.LottoID,
        FaseTipoID: newLottoForm.FaseTipoID,
        MacchinaID: newLottoForm.MacchinaID,
        UtenteID: newLottoForm.UtenteID,
        DataInizio: new Date().toISOString(),
        Quantita: newLottoForm.QtaInput,
        Note: `Programma Feeder: ${newLottoForm.ProgrammaFeeder}\n${newLottoForm.Note}`,
        Completata: false,
      });

      setShowNewModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Errore nella creazione del lotto');
    }
  };

  const handleOpenCloseModal = (lotto: LottoWithFase) => {
    setSelectedLotto(lotto);
    setCloseLottoForm({
      QtaOutput: lotto.fase?.Quantita || 0,
      QtaScarti: 0,
      NoteScarti: '',
    });
    setShowCloseModal(true);
  };

  const handleCloseLotto = async () => {
    if (!selectedLotto || !selectedLotto.fase) return;

    try {
      if (closeLottoForm.QtaOutput <= 0) {
        alert('Inserire una quantità output valida');
        return;
      }

      // Update fase with output data
      await fasiApi.updateFase(selectedLotto.fase.FaseID, {
        DataFine: new Date().toISOString(),
        Completata: true,
        Note: `${selectedLotto.fase.Note || ''}\nOutput: ${closeLottoForm.QtaOutput}, Scarti: ${closeLottoForm.QtaScarti}\n${closeLottoForm.NoteScarti}`,
      });

      // Close lotto
      await lottiApi.closeLotto(selectedLotto.LottoID);

      setShowCloseModal(false);
      setSelectedLotto(null);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Errore nella chiusura del lotto');
    }
  };

  const calcResa = (qtaInput: number, qtaOutput: number) => {
    if (qtaInput === 0) return 0;
    return ((qtaOutput / qtaInput) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner message="Caricamento dati SMD..." />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-800">SMD - Montaggio Superficiale</h1>
          <button onClick={handleOpenNewModal} className="btn-compact bg-blue-600 text-white rounded hover:bg-blue-700">
            + Nuovo Lotto
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-4">{error}</div>
        )}

        {/* Lotti Aperti */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Lotti Aperti</h2>
          {lottiAperti.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-sm text-gray-500">
              Nessun lotto aperto
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table-compact w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="text-left">Lotto</th>
                      <th className="text-left">Fase</th>
                      <th className="text-left">Operatore</th>
                      <th className="text-left">Macchina</th>
                      <th className="text-left">Data Inizio</th>
                      <th className="text-left">Qta Input</th>
                      <th className="text-left">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {lottiAperti.map((lotto) => (
                      <tr key={lotto.LottoID} className="hover:bg-gray-50">
                        <td className="font-medium">{lotto.ProgressivoGiornaliero}</td>
                        <td>{lotto.faseTipo?.Nome || '-'}</td>
                        <td>{lotto.utente?.NomeCompleto || '-'}</td>
                        <td>{lotto.macchina?.Codice || '-'}</td>
                        <td>
                          {lotto.fase?.DataInizio
                            ? new Date(lotto.fase.DataInizio).toLocaleString('it-IT', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })
                            : '-'}
                        </td>
                        <td>{lotto.fase?.Quantita || 0}</td>
                        <td>
                          <button
                            onClick={() => handleOpenCloseModal(lotto)}
                            className="btn-compact bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Chiudi
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Storico Lotti */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Storico Lotti (ultimi 20)</h2>
          {lottiStorico.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-sm text-gray-500">
              Nessun lotto nello storico
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table-compact w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="text-left">Lotto</th>
                      <th className="text-left">Fase</th>
                      <th className="text-left">Operatore</th>
                      <th className="text-left">Data Chiusura</th>
                      <th className="text-left">Stato</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {lottiStorico.map((lotto) => (
                      <tr key={lotto.LottoID} className="hover:bg-gray-50">
                        <td className="font-medium">{lotto.ProgressivoGiornaliero}</td>
                        <td>{lotto.faseTipo?.Nome || '-'}</td>
                        <td>{lotto.utente?.NomeCompleto || '-'}</td>
                        <td>
                          {lotto.DataChiusura
                            ? new Date(lotto.DataChiusura).toLocaleString('it-IT', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })
                            : '-'}
                        </td>
                        <td>
                          <span className="inline-block px-2 py-0.5 text-[9px] font-medium rounded bg-gray-100 text-gray-700">
                            CHIUSO
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* New Lotto Modal */}
        <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title="Nuovo Lotto SMD" size="md">
          <div className="space-y-3">
            <FormField label="Fase" required htmlFor="fase">
              <select
                id="fase"
                value={newLottoForm.FaseTipoID}
                onChange={(e) => setNewLottoForm({ ...newLottoForm, FaseTipoID: Number(e.target.value) })}
                className="input-compact w-full border border-gray-300 rounded"
              >
                {fasiTipo.map((f) => (
                  <option key={f.FaseTipoID} value={f.FaseTipoID}>
                    {f.Nome}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Operatore" required htmlFor="operatore">
              <select
                id="operatore"
                value={newLottoForm.UtenteID}
                onChange={(e) => setNewLottoForm({ ...newLottoForm, UtenteID: Number(e.target.value) })}
                className="input-compact w-full border border-gray-300 rounded"
              >
                {utenti.map((u) => (
                  <option key={u.UtenteID} value={u.UtenteID}>
                    {u.NomeCompleto}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Macchina" required htmlFor="macchina">
              <select
                id="macchina"
                value={newLottoForm.MacchinaID}
                onChange={(e) => setNewLottoForm({ ...newLottoForm, MacchinaID: Number(e.target.value) })}
                className="input-compact w-full border border-gray-300 rounded"
              >
                {macchine.map((m) => (
                  <option key={m.MacchinaID} value={m.MacchinaID}>
                    {m.Codice} - {m.Descrizione}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Quantità Input" required htmlFor="qtaInput">
              <input
                id="qtaInput"
                type="number"
                value={newLottoForm.QtaInput}
                onChange={(e) => setNewLottoForm({ ...newLottoForm, QtaInput: Number(e.target.value) })}
                className="input-compact w-full border border-gray-300 rounded"
                min="1"
              />
            </FormField>

            <FormField label="Programma Feeder" htmlFor="programmaFeeder">
              <input
                id="programmaFeeder"
                type="text"
                value={newLottoForm.ProgrammaFeeder}
                onChange={(e) => setNewLottoForm({ ...newLottoForm, ProgrammaFeeder: e.target.value })}
                className="input-compact w-full border border-gray-300 rounded"
              />
            </FormField>

            <FormField label="Note" htmlFor="note">
              <textarea
                id="note"
                value={newLottoForm.Note}
                onChange={(e) => setNewLottoForm({ ...newLottoForm, Note: e.target.value })}
                className="input-compact w-full border border-gray-300 rounded"
                rows={3}
              />
            </FormField>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowNewModal(false)}
                className="btn-compact bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Annulla
              </button>
              <button onClick={handleCreateLotto} className="btn-compact bg-blue-600 text-white rounded hover:bg-blue-700">
                Apri Lotto
              </button>
            </div>
          </div>
        </Modal>

        {/* Close Lotto Modal */}
        <Modal isOpen={showCloseModal} onClose={() => setShowCloseModal(false)} title="Chiudi Lotto SMD" size="md">
          {selectedLotto && (
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded border border-gray-200 text-[11px]">
                <div className="font-semibold mb-1">Lotto #{selectedLotto.ProgressivoGiornaliero}</div>
                <div className="text-gray-600">
                  Fase: {selectedLotto.faseTipo?.Nome} | Operatore: {selectedLotto.utente?.NomeCompleto}
                </div>
                <div className="text-gray-600">Quantità Input: {selectedLotto.fase?.Quantita || 0}</div>
              </div>

              <FormField label="Quantità Output" required htmlFor="qtaOutput">
                <input
                  id="qtaOutput"
                  type="number"
                  value={closeLottoForm.QtaOutput}
                  onChange={(e) => setCloseLottoForm({ ...closeLottoForm, QtaOutput: Number(e.target.value) })}
                  className="input-compact w-full border border-gray-300 rounded"
                  min="0"
                />
              </FormField>

              <FormField label="Quantità Scarti" htmlFor="qtaScarti">
                <input
                  id="qtaScarti"
                  type="number"
                  value={closeLottoForm.QtaScarti}
                  onChange={(e) => setCloseLottoForm({ ...closeLottoForm, QtaScarti: Number(e.target.value) })}
                  className="input-compact w-full border border-gray-300 rounded"
                  min="0"
                />
              </FormField>

              <div className="bg-blue-50 p-2 rounded border border-blue-200">
                <div className="text-[11px] font-semibold text-blue-900">
                  Resa Prevista:{' '}
                  {calcResa(selectedLotto.fase?.Quantita || 0, closeLottoForm.QtaOutput)}%
                </div>
              </div>

              <FormField label="Note Scarti" htmlFor="noteScarti">
                <textarea
                  id="noteScarti"
                  value={closeLottoForm.NoteScarti}
                  onChange={(e) => setCloseLottoForm({ ...closeLottoForm, NoteScarti: e.target.value })}
                  className="input-compact w-full border border-gray-300 rounded"
                  rows={3}
                />
              </FormField>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setShowCloseModal(false)}
                  className="btn-compact bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Annulla
                </button>
                <button
                  onClick={handleCloseLotto}
                  className="btn-compact bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Chiudi Lotto
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
