/**
 * ASI-GEST PTH Workflow Page
 * © 2025 Enrico Callegaro - Tutti i diritti riservati.
 */

import { useState, useEffect } from 'react';
import {
  lottiApi,
  fasiApi,
  fasiTipoApi,
  utentiApi,
  macchineApi,
  gestionaleApi,
  type Lotto,
  type Fase,
  type FaseTipo,
  type Utente,
  type Macchina,
  type ConfigCommessa,
} from '../services/api';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';

interface FaseWithDetails {
  fase: Fase;
  faseTipo?: FaseTipo;
  configCommessa?: ConfigCommessa;
}

interface LottoWithDetails {
  lotto: Lotto;
  fase?: Fase;
  faseTipo?: FaseTipo;
  utente?: Utente;
  macchina?: Macchina;
}

export default function PTH() {
  const [fasiAperte, setFasiAperte] = useState<FaseWithDetails[]>([]);
  const [lottiAperti, setLottiAperti] = useState<LottoWithDetails[]>([]);
  const [lottiStorico, setLottiStorico] = useState<LottoWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showNewLottoModal, setShowNewLottoModal] = useState(false);
  const [showCloseLottoModal, setShowCloseLottoModal] = useState(false);
  const [selectedFase, setSelectedFase] = useState<FaseWithDetails | null>(null);
  const [selectedLotto, setSelectedLotto] = useState<LottoWithDetails | null>(null);

  // Form options
  const [utenti, setUtenti] = useState<Utente[]>([]);
  const [macchine, setMacchine] = useState<Macchina[]>([]);

  // New lotto form
  const [newLottoForm, setNewLottoForm] = useState({
    UtenteID: 0,
    MacchinaID: 0,
    QtaInput: 0,
    Note: '',
  });

  // Close lotto form
  const [closeLottoForm, setCloseLottoForm] = useState({
    QtaOutput: 0,
    QtaScarti: 0,
    NoteScarti: '',
    TipoScarto: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all required data
      const [fasiData, lottiData, fasiTipoData, utentiData, macchineData, commesseData] = await Promise.all([
        fasiApi.getFasi(),
        lottiApi.getLotti(),
        fasiTipoApi.getFasiTipo(),
        utentiApi.getUtenti(true),
        macchineApi.getMacchine('PTH', true),
        gestionaleApi.getCommesse(),
      ]);

      setUtenti(utentiData.items);
      setMacchine(macchineData.items);

      // Filter PTH fasi only
      const pthFasiTipo = fasiTipoData.items.filter((ft) => ft.Tipo === 'PTH');
      const pthFasiTipoIds = pthFasiTipo.map((ft) => ft.FaseTipoID);

      const pthFasi = fasiData.items.filter((f) => pthFasiTipoIds.includes(f.FaseTipoID));

      // Build FaseWithDetails
      const fasiWithDetails: FaseWithDetails[] = pthFasi.map((fase) => {
        const faseTipo = fasiTipoData.items.find((ft) => ft.FaseTipoID === fase.FaseTipoID);
        const configCommessa = commesseData.items.find((c) => c.CommessaERPId === fase.CommessaERPId);

        return {
          fase,
          faseTipo,
          configCommessa,
        };
      });

      // Filter only open fasi
      setFasiAperte(fasiWithDetails.filter((fd) => fd.fase.Stato === 'APERTA'));

      // Build LottoWithDetails for PTH lotti
      const pthFaseIds = pthFasi.map((f) => f.FaseID);
      const pthLotti = lottiData.items.filter((l) => pthFaseIds.includes(l.FaseID));

      const lottiWithDetails: LottoWithDetails[] = pthLotti.map((lotto) => {
        const fase = fasiData.items.find((f) => f.FaseID === lotto.FaseID);
        const faseTipo = fase ? fasiTipoData.items.find((ft) => ft.FaseTipoID === fase.FaseTipoID) : undefined;
        const utente = utentiData.items.find((u) => u.UtenteID === lotto.UtenteID);
        const macchina = macchineData.items.find((m) => m.MacchinaID === lotto.MacchinaID);

        return {
          lotto,
          fase,
          faseTipo,
          utente,
          macchina,
        };
      });

      // Separate open and closed lotti
      setLottiAperti(lottiWithDetails.filter((ld) => !ld.lotto.DataFine));
      setLottiStorico(lottiWithDetails.filter((ld) => ld.lotto.DataFine).slice(0, 20));
    } catch (err) {
      setError('Errore nel caricamento dei dati PTH');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewLottoModal = (fase: FaseWithDetails) => {
    setSelectedFase(fase);
    setNewLottoForm({
      UtenteID: utenti[0]?.UtenteID || 0,
      MacchinaID: macchine[0]?.MacchinaID || 0,
      QtaInput: fase.fase.QtaResidua || fase.fase.QtaPrevista || 0,
      Note: '',
    });
    setShowNewLottoModal(true);
  };

  const handleCreateLotto = async () => {
    if (!selectedFase) return;

    try {
      if (newLottoForm.QtaInput <= 0) {
        alert('Inserire una quantità valida');
        return;
      }

      if (newLottoForm.UtenteID === 0) {
        alert('Selezionare un operatore');
        return;
      }

      // Create new lotto
      await lottiApi.createLotto({
        FaseID: selectedFase.fase.FaseID,
        UtenteID: newLottoForm.UtenteID,
        MacchinaID: newLottoForm.MacchinaID || undefined,
        QtaInput: newLottoForm.QtaInput,
        QtaOutput: 0,
        QtaScarti: 0,
        Note: newLottoForm.Note,
      });

      setShowNewLottoModal(false);
      setSelectedFase(null);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Errore nella creazione del lotto');
    }
  };

  const handleOpenCloseLottoModal = (lotto: LottoWithDetails) => {
    setSelectedLotto(lotto);
    setCloseLottoForm({
      QtaOutput: lotto.lotto.QtaInput || 0,
      QtaScarti: 0,
      NoteScarti: '',
      TipoScarto: '',
    });
    setShowCloseLottoModal(true);
  };

  const handleCloseLotto = async () => {
    if (!selectedLotto) return;

    try {
      if (closeLottoForm.QtaOutput < 0) {
        alert('Inserire una quantità output valida');
        return;
      }

      // Close lotto with output data
      await lottiApi.closeLotto(selectedLotto.lotto.LottoID, {
        QtaOutput: closeLottoForm.QtaOutput,
        QtaScarti: closeLottoForm.QtaScarti,
        Note: closeLottoForm.NoteScarti,
      });

      setShowCloseLottoModal(false);
      setSelectedLotto(null);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Errore nella chiusura del lotto');
    }
  };

  const calcResa = (qtaInput: number, qtaOutput: number) => {
    if (qtaInput === 0) return '0';
    return ((qtaOutput / qtaInput) * 100).toFixed(1);
  };

  const calcDurata = (dataInizio: string, dataFine?: string) => {
    if (!dataFine) return '-';
    const diff = new Date(dataFine).getTime() - new Date(dataInizio).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner message="Caricamento dati PTH..." />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-800">PTH - Fori Passanti</h1>
          <button onClick={loadData} className="btn-compact bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
            🔄 Aggiorna
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-4">{error}</div>
        )}

        {/* Fasi Aperte */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Fasi PTH Aperte</h2>
          {fasiAperte.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-sm text-gray-500">
              Nessuna fase PTH aperta. Le fasi vengono create dalla gestione commesse.
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table-compact w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="text-left">Commessa</th>
                      <th className="text-left">Articolo</th>
                      <th className="text-left">Fase Tipo</th>
                      <th className="text-left">Qta Prevista</th>
                      <th className="text-left">Qta Prodotta</th>
                      <th className="text-left">Qta Residua</th>
                      <th className="text-left">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {fasiAperte.map((fd) => (
                      <tr key={fd.fase.FaseID} className="hover:bg-gray-50">
                        <td className="font-medium">{fd.fase.NumeroCommessa || '-'}</td>
                        <td>{fd.configCommessa?.CodiceArticolo || '-'}</td>
                        <td>{fd.faseTipo?.Descrizione || '-'}</td>
                        <td>{fd.fase.QtaPrevista || 0}</td>
                        <td className="font-medium text-green-700">{fd.fase.QtaProdotta || 0}</td>
                        <td className="font-medium text-blue-700">{fd.fase.QtaResidua || fd.fase.QtaPrevista || 0}</td>
                        <td>
                          <button
                            onClick={() => handleOpenNewLottoModal(fd)}
                            className="btn-compact bg-blue-600 text-white rounded hover:bg-blue-700"
                            disabled={!utenti.length || !macchine.length}
                          >
                            + Nuovo Lotto
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

        {/* Lotti Aperti */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Lotti PTH Aperti</h2>
          {lottiAperti.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-sm text-gray-500">
              Nessun lotto PTH aperto
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table-compact w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="text-left">Lotto</th>
                      <th className="text-left">Commessa</th>
                      <th className="text-left">Operatore</th>
                      <th className="text-left">Macchina</th>
                      <th className="text-left">Data Inizio</th>
                      <th className="text-left">Qta Input</th>
                      <th className="text-left">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {lottiAperti.map((ld) => (
                      <tr key={ld.lotto.LottoID} className="hover:bg-gray-50">
                        <td className="font-medium">#{ld.lotto.Progressivo}</td>
                        <td>{ld.fase?.NumeroCommessa || '-'}</td>
                        <td>{ld.utente?.Nome && ld.utente?.Cognome ? `${ld.utente.Nome} ${ld.utente.Cognome}` : '-'}</td>
                        <td>{ld.macchina?.Codice || '-'}</td>
                        <td>
                          {ld.lotto.DataInizio
                            ? new Date(ld.lotto.DataInizio).toLocaleString('it-IT', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })
                            : '-'}
                        </td>
                        <td>{ld.lotto.QtaInput || 0}</td>
                        <td>
                          <button
                            onClick={() => handleOpenCloseLottoModal(ld)}
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
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Storico Lotti PTH (ultimi 20)</h2>
          {lottiStorico.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-sm text-gray-500">
              Nessun lotto PTH nello storico
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table-compact w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="text-left">Lotto</th>
                      <th className="text-left">Commessa</th>
                      <th className="text-left">Operatore</th>
                      <th className="text-left">Data Chiusura</th>
                      <th className="text-left">Qta Input</th>
                      <th className="text-left">Qta Output</th>
                      <th className="text-left">Scarti</th>
                      <th className="text-left">Resa %</th>
                      <th className="text-left">Durata</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {lottiStorico.map((ld) => (
                      <tr key={ld.lotto.LottoID} className="hover:bg-gray-50">
                        <td className="font-medium">#{ld.lotto.Progressivo}</td>
                        <td>{ld.fase?.NumeroCommessa || '-'}</td>
                        <td>{ld.utente?.Nome && ld.utente?.Cognome ? `${ld.utente.Nome} ${ld.utente.Cognome}` : '-'}</td>
                        <td>
                          {ld.lotto.DataFine
                            ? new Date(ld.lotto.DataFine).toLocaleString('it-IT', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })
                            : '-'}
                        </td>
                        <td>{ld.lotto.QtaInput || 0}</td>
                        <td className="font-medium text-green-700">{ld.lotto.QtaOutput}</td>
                        <td className="font-medium text-red-700">{ld.lotto.QtaScarti}</td>
                        <td className="font-medium">
                          {calcResa(ld.lotto.QtaInput || 0, ld.lotto.QtaOutput)}%
                        </td>
                        <td className="text-gray-600 text-[10px]">
                          {calcDurata(ld.lotto.DataInizio, ld.lotto.DataFine)}
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
        <Modal isOpen={showNewLottoModal} onClose={() => setShowNewLottoModal(false)} title="Nuovo Lotto PTH" size="md">
          {selectedFase && (
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded border border-gray-200 text-[11px]">
                <div className="font-semibold mb-1">
                  Commessa: {selectedFase.fase.NumeroCommessa || 'N/D'}
                </div>
                <div className="text-gray-600">
                  Articolo: {selectedFase.configCommessa?.CodiceArticolo || 'N/D'} - {selectedFase.configCommessa?.Descrizione || ''}
                </div>
                <div className="text-gray-600">
                  Fase: {selectedFase.faseTipo?.Descrizione || 'N/D'}
                </div>
                <div className="text-gray-600">
                  Quantità residua: {selectedFase.fase.QtaResidua || selectedFase.fase.QtaPrevista || 0}
                </div>
              </div>

              <FormField label="Operatore" required htmlFor="operatore">
                <select
                  id="operatore"
                  value={newLottoForm.UtenteID}
                  onChange={(e) => setNewLottoForm({ ...newLottoForm, UtenteID: Number(e.target.value) })}
                  className="input-compact w-full border border-gray-300 rounded"
                >
                  <option value={0}>Seleziona operatore...</option>
                  {utenti.map((u) => (
                    <option key={u.UtenteID} value={u.UtenteID}>
                      {u.Nome} {u.Cognome}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Macchina" htmlFor="macchina">
                <select
                  id="macchina"
                  value={newLottoForm.MacchinaID}
                  onChange={(e) => setNewLottoForm({ ...newLottoForm, MacchinaID: Number(e.target.value) })}
                  className="input-compact w-full border border-gray-300 rounded"
                >
                  <option value={0}>Nessuna macchina</option>
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
                  onClick={() => setShowNewLottoModal(false)}
                  className="btn-compact bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Annulla
                </button>
                <button onClick={handleCreateLotto} className="btn-compact bg-blue-600 text-white rounded hover:bg-blue-700">
                  Apri Lotto
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Close Lotto Modal */}
        <Modal isOpen={showCloseLottoModal} onClose={() => setShowCloseLottoModal(false)} title="Chiudi Lotto PTH" size="md">
          {selectedLotto && (
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded border border-gray-200 text-[11px]">
                <div className="font-semibold mb-1">Lotto #{selectedLotto.lotto.Progressivo}</div>
                <div className="text-gray-600">
                  Commessa: {selectedLotto.fase?.NumeroCommessa || 'N/D'}
                </div>
                <div className="text-gray-600">
                  Operatore: {selectedLotto.utente?.Nome} {selectedLotto.utente?.Cognome}
                </div>
                <div className="text-gray-600">Quantità Input: {selectedLotto.lotto.QtaInput || 0}</div>
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
                  Resa Prevista: {calcResa(selectedLotto.lotto.QtaInput || 0, closeLottoForm.QtaOutput)}%
                </div>
              </div>

              <FormField label="Tipo Scarto" htmlFor="tipoScarto">
                <input
                  id="tipoScarto"
                  type="text"
                  value={closeLottoForm.TipoScarto}
                  onChange={(e) => setCloseLottoForm({ ...closeLottoForm, TipoScarto: e.target.value })}
                  className="input-compact w-full border border-gray-300 rounded"
                  placeholder="Es: Componenti danneggiati, saldature difettose..."
                />
              </FormField>

              <FormField label="Note Scarti" htmlFor="noteScarti">
                <textarea
                  id="noteScarti"
                  value={closeLottoForm.NoteScarti}
                  onChange={(e) => setCloseLottoForm({ ...closeLottoForm, NoteScarti: e.target.value })}
                  className="input-compact w-full border border-gray-300 rounded"
                  rows={3}
                  placeholder="Dettagli sui problemi riscontrati..."
                />
              </FormField>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setShowCloseLottoModal(false)}
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
