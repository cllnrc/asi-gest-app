/**
 * ASI-GEST Lotti Page - Overview generale
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
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';

interface LottoDettaglio extends Lotto {
  fase?: Fase;
  faseTipo?: FaseTipo;
  utente?: Utente;
  macchina?: Macchina;
}

export default function Lotti() {
  const [lotti, setLotti] = useState<LottoDettaglio[]>([]);
  const [filteredLotti, setFilteredLotti] = useState<LottoDettaglio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterTipoProduzione, setFilterTipoProduzione] = useState<string>('TUTTI');
  const [filterStato, setFilterStato] = useState<string>('TUTTI');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Modal
  const [selectedLotto, setSelectedLotto] = useState<LottoDettaglio | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [lotti, filterTipoProduzione, filterStato, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [lottiData, fasiData, fasiTipoData, utentiData, macchineData] = await Promise.all([
        lottiApi.getLotti(),
        fasiApi.getFasi(),
        fasiTipoApi.getFasiTipo(),
        utentiApi.getUtenti(),
        macchineApi.getMacchine(),
      ]);

      // Match lotti with their fasi
      const lottiWithDetails: LottoDettaglio[] = lottiData.items.map((lotto) => {
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

      setLotti(lottiWithDetails);
    } catch (err) {
      setError('Errore nel caricamento dei lotti');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...lotti];

    // Filter by tipo produzione
    if (filterTipoProduzione !== 'TUTTI') {
      filtered = filtered.filter((l) => l.faseTipo?.TipoProduzione === filterTipoProduzione);
    }

    // Filter by stato
    if (filterStato !== 'TUTTI') {
      filtered = filtered.filter((l) => l.Stato === filterStato);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.ProgressivoGiornaliero.toString().includes(term) ||
          l.faseTipo?.Nome.toLowerCase().includes(term) ||
          l.utente?.NomeCompleto.toLowerCase().includes(term) ||
          l.NumeroCommessa?.toLowerCase().includes(term)
      );
    }

    setFilteredLotti(filtered);
    setCurrentPage(1);
  };

  const handleRowClick = (lotto: LottoDettaglio) => {
    setSelectedLotto(lotto);
    setShowDetailModal(true);
  };

  const calcResa = (qtaInput?: number, qtaOutput?: number) => {
    if (!qtaInput || qtaInput === 0 || !qtaOutput) return '-';
    return ((qtaOutput / qtaInput) * 100).toFixed(1) + '%';
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLotti = filteredLotti.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLotti.length / itemsPerPage);

  if (loading) {
    return (
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner message="Caricamento lotti..." />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Lotti - Overview Generale</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-4">{error}</div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-3 mb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div>
              <label className="block text-[10px] font-semibold text-gray-700 mb-1">Tipo Produzione</label>
              <select
                value={filterTipoProduzione}
                onChange={(e) => setFilterTipoProduzione(e.target.value)}
                className="input-compact border border-gray-300 rounded text-[11px]"
              >
                <option value="TUTTI">Tutti</option>
                <option value="SMD">SMD</option>
                <option value="PTH">PTH</option>
                <option value="CONTROLLI">Controlli</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-700 mb-1">Stato</label>
              <select
                value={filterStato}
                onChange={(e) => setFilterStato(e.target.value)}
                className="input-compact border border-gray-300 rounded text-[11px]"
              >
                <option value="TUTTI">Tutti</option>
                <option value="APERTO">Aperto</option>
                <option value="CHIUSO">Chiuso</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] font-semibold text-gray-700 mb-1">Cerca</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cerca per lotto, fase, operatore..."
                className="input-compact w-full border border-gray-300 rounded text-[11px]"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterTipoProduzione('TUTTI');
                  setFilterStato('TUTTI');
                  setSearchTerm('');
                }}
                className="btn-compact bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="mt-2 text-[10px] text-gray-500">
            Totale: {filteredLotti.length} lotti
            {filterTipoProduzione !== 'TUTTI' && ` | Tipo: ${filterTipoProduzione}`}
            {filterStato !== 'TUTTI' && ` | Stato: ${filterStato}`}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-compact w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="text-left">ID</th>
                  <th className="text-left">Progressivo</th>
                  <th className="text-left">Tipo</th>
                  <th className="text-left">Fase</th>
                  <th className="text-left">Operatore</th>
                  <th className="text-left">Macchina</th>
                  <th className="text-left">Data Inizio</th>
                  <th className="text-left">Data Fine</th>
                  <th className="text-left">Stato</th>
                  <th className="text-left">Qta In/Out</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentLotti.map((lotto) => (
                  <tr key={lotto.LottoID} onClick={() => handleRowClick(lotto)} className="hover:bg-gray-50 cursor-pointer">
                    <td className="font-medium">{lotto.LottoID}</td>
                    <td>{lotto.ProgressivoGiornaliero}</td>
                    <td>
                      <span
                        className={`inline-block px-2 py-0.5 text-[9px] font-medium rounded ${
                          lotto.faseTipo?.TipoProduzione === 'SMD'
                            ? 'bg-blue-100 text-blue-700'
                            : lotto.faseTipo?.TipoProduzione === 'PTH'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {lotto.faseTipo?.TipoProduzione || '-'}
                      </span>
                    </td>
                    <td className="max-w-[150px] truncate">{lotto.faseTipo?.Nome || '-'}</td>
                    <td className="max-w-[120px] truncate">{lotto.utente?.NomeCompleto || '-'}</td>
                    <td>{lotto.macchina?.Codice || '-'}</td>
                    <td>
                      {lotto.fase?.DataInizio
                        ? new Date(lotto.fase.DataInizio).toLocaleDateString('it-IT', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                          })
                        : '-'}
                    </td>
                    <td>
                      {lotto.fase?.DataFine
                        ? new Date(lotto.fase.DataFine).toLocaleDateString('it-IT', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                          })
                        : '-'}
                    </td>
                    <td>
                      <span
                        className={`inline-block px-2 py-0.5 text-[9px] font-medium rounded ${
                          lotto.Stato === 'APERTO' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {lotto.Stato}
                      </span>
                    </td>
                    <td className="font-mono text-[10px]">{lotto.fase?.Quantita || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {currentLotti.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-500">Nessun lotto trovato con i filtri selezionati</div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-[10px] text-gray-500">
              Pagina {currentPage} di {totalPages} ({indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredLotti.length)} di {filteredLotti.length})
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-compact bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Precedente
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn-compact bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Successivo
              </button>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={`Dettaglio Lotto #${selectedLotto?.ProgressivoGiornaliero || ''}`}
          size="lg"
        >
          {selectedLotto && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] text-gray-500 font-semibold mb-1">Lotto ID</div>
                  <div className="text-sm">{selectedLotto.LottoID}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-semibold mb-1">Progressivo Giornaliero</div>
                  <div className="text-sm">{selectedLotto.ProgressivoGiornaliero}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-semibold mb-1">Stato</div>
                  <div>
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded ${
                        selectedLotto.Stato === 'APERTO' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {selectedLotto.Stato}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-semibold mb-1">Data Creazione</div>
                  <div className="text-sm">
                    {new Date(selectedLotto.DataCreazione).toLocaleString('it-IT')}
                  </div>
                </div>
                {selectedLotto.DataChiusura && (
                  <div>
                    <div className="text-[10px] text-gray-500 font-semibold mb-1">Data Chiusura</div>
                    <div className="text-sm">
                      {new Date(selectedLotto.DataChiusura).toLocaleString('it-IT')}
                    </div>
                  </div>
                )}
              </div>

              <hr className="border-gray-200" />

              <div>
                <div className="text-sm font-semibold text-gray-700 mb-2">Fase</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] text-gray-500 font-semibold mb-1">Tipo Produzione</div>
                    <div className="text-sm">{selectedLotto.faseTipo?.TipoProduzione || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 font-semibold mb-1">Nome Fase</div>
                    <div className="text-sm">{selectedLotto.faseTipo?.Nome || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 font-semibold mb-1">Operatore</div>
                    <div className="text-sm">{selectedLotto.utente?.NomeCompleto || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 font-semibold mb-1">Macchina</div>
                    <div className="text-sm">
                      {selectedLotto.macchina ? `${selectedLotto.macchina.Codice} - ${selectedLotto.macchina.Descrizione}` : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 font-semibold mb-1">Quantità</div>
                    <div className="text-sm">{selectedLotto.fase?.Quantita || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 font-semibold mb-1">Completata</div>
                    <div className="text-sm">{selectedLotto.fase?.Completata ? 'Sì' : 'No'}</div>
                  </div>
                </div>
              </div>

              {selectedLotto.fase?.Note && (
                <>
                  <hr className="border-gray-200" />
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2">Note</div>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200 text-[11px] whitespace-pre-wrap">
                      {selectedLotto.fase.Note}
                    </div>
                  </div>
                </>
              )}

              {selectedLotto.NumeroCommessa && (
                <>
                  <hr className="border-gray-200" />
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2">Commessa</div>
                    <div className="text-sm">{selectedLotto.NumeroCommessa}</div>
                    {selectedLotto.CodiceArticolo && (
                      <div className="text-[11px] text-gray-500 mt-1">Articolo: {selectedLotto.CodiceArticolo}</div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
