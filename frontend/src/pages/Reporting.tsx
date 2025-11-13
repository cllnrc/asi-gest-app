/**
 * ASI-GEST Reporting & Analytics Page
 * © 2025 Enrico Callegaro - Tutti i diritti riservati.
 */

import { useState, useEffect } from 'react';
import { lottiApi, fasiApi, fasiTipoApi, utentiApi, macchineApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Lotto, Fase, FaseTipo, Utente, Macchina } from '../services/api';

interface ReportData {
  periodo: string;
  totLotti: number;
  totProduzione: number;
  resaMedia: number;
  tempoMedio: number;
  scartiTotali: number;
}

interface RepartStats {
  reparto: string;
  lotti: number;
  produzione: number;
  scarti: number;
  resa: number;
}

interface OperatoreStats {
  nome: string;
  lotti: number;
  produzione: number;
  resa: number;
  tempoMedio: number;
}

export default function Reporting() {
  const [periodoSelezionato, setPeriodoSelezionato] = useState<'oggi' | '7giorni' | '30giorni' | 'custom'>('oggi');
  const [dataInizio, setDataInizio] = useState('');
  const [dataFine, setDataFine] = useState('');

  const [reportGenerale, setReportGenerale] = useState<ReportData | null>(null);
  const [statsReparti, setStatsReparti] = useState<RepartStats[]>([]);
  const [statsOperatori, setStatsOperatori] = useState<OperatoreStats[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReportData();
  }, [periodoSelezionato, dataInizio, dataFine]);

  const getDateRange = (): [Date, Date] => {
    const oggi = new Date();
    oggi.setHours(23, 59, 59, 999);
    let inizio = new Date();

    switch (periodoSelezionato) {
      case 'oggi':
        inizio.setHours(0, 0, 0, 0);
        break;
      case '7giorni':
        inizio = new Date(oggi.getTime() - 7 * 24 * 60 * 60 * 1000);
        inizio.setHours(0, 0, 0, 0);
        break;
      case '30giorni':
        inizio = new Date(oggi.getTime() - 30 * 24 * 60 * 60 * 1000);
        inizio.setHours(0, 0, 0, 0);
        break;
      case 'custom':
        if (dataInizio && dataFine) {
          return [new Date(dataInizio), new Date(dataFine)];
        }
        inizio.setHours(0, 0, 0, 0);
        break;
    }

    return [inizio, oggi];
  };

  const loadReportData = async () => {
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

      const [inizio, fine] = getDateRange();

      // Filtra lotti nel periodo
      const lottiFiltrati = lottiData.items.filter((l: Lotto) => {
        if (!l.DataFine) return false;
        const dataFine = new Date(l.DataFine);
        return dataFine >= inizio && dataFine <= fine;
      });

      // Report Generale
      const totLotti = lottiFiltrati.length;
      const totProduzione = lottiFiltrati.reduce((sum: number, l: Lotto) => sum + (l.QtaOutput || 0), 0);
      const scartiTotali = lottiFiltrati.reduce((sum: number, l: Lotto) => sum + (l.QtaScarti || 0), 0);

      const lottiConResa = lottiFiltrati.filter((l: Lotto) => l.QtaInput && l.QtaInput > 0);
      const resaMedia = lottiConResa.length > 0
        ? lottiConResa.reduce((sum: number, l: Lotto) => sum + ((l.QtaOutput / (l.QtaInput || 1)) * 100), 0) / lottiConResa.length
        : 0;

      const lottiConTempo = lottiFiltrati.filter((l: Lotto) => l.DataInizio && l.DataFine);
      const tempoMedio = lottiConTempo.length > 0
        ? lottiConTempo.reduce((sum: number, l: Lotto) => {
            const diff = new Date(l.DataFine!).getTime() - new Date(l.DataInizio).getTime();
            return sum + (diff / 60000);
          }, 0) / lottiConTempo.length
        : 0;

      const labelPeriodo =
        periodoSelezionato === 'oggi'
          ? 'Oggi'
          : periodoSelezionato === '7giorni'
          ? 'Ultimi 7 giorni'
          : periodoSelezionato === '30giorni'
          ? 'Ultimi 30 giorni'
          : `${inizio.toLocaleDateString('it-IT')} - ${fine.toLocaleDateString('it-IT')}`;

      setReportGenerale({
        periodo: labelPeriodo,
        totLotti,
        totProduzione,
        resaMedia: Math.round(resaMedia * 10) / 10,
        tempoMedio: Math.round(tempoMedio),
        scartiTotali,
      });

      // Stats per Reparto
      const repartiMap: Record<string, { lotti: Lotto[]; fasi: Fase[] }> = {};

      lottiFiltrati.forEach((lotto: Lotto) => {
        const fase = fasiData.items.find((f: Fase) => f.FaseID === lotto.FaseID);
        if (fase) {
          const faseTipo = fasiTipoData.items.find((ft: FaseTipo) => ft.FaseTipoID === fase.FaseTipoID);
          const tipo = faseTipo?.Tipo || 'ALTRO';

          if (!repartiMap[tipo]) {
            repartiMap[tipo] = { lotti: [], fasi: [] };
          }
          repartiMap[tipo].lotti.push(lotto);
          if (!repartiMap[tipo].fasi.find((f) => f.FaseID === fase.FaseID)) {
            repartiMap[tipo].fasi.push(fase);
          }
        }
      });

      const reparti: RepartStats[] = Object.entries(repartiMap).map(([reparto, data]) => {
        const produzione = data.lotti.reduce((sum: number, l: Lotto) => sum + (l.QtaOutput || 0), 0);
        const scarti = data.lotti.reduce((sum: number, l: Lotto) => sum + (l.QtaScarti || 0), 0);

        const lottiConResa = data.lotti.filter((l: Lotto) => l.QtaInput && l.QtaInput > 0);
        const resa = lottiConResa.length > 0
          ? lottiConResa.reduce((sum: number, l: Lotto) => sum + ((l.QtaOutput / (l.QtaInput || 1)) * 100), 0) / lottiConResa.length
          : 0;

        return {
          reparto,
          lotti: data.lotti.length,
          produzione,
          scarti,
          resa: Math.round(resa * 10) / 10,
        };
      });

      setStatsReparti(reparti);

      // Stats per Operatore
      const operatoriMap: Record<number, { nome: string; lotti: Lotto[] }> = {};

      lottiFiltrati.forEach((lotto: Lotto) => {
        if (lotto.UtenteID) {
          if (!operatoriMap[lotto.UtenteID]) {
            const utente = utentiData.items.find((u: Utente) => u.UtenteID === lotto.UtenteID);
            if (utente) {
              operatoriMap[lotto.UtenteID] = {
                nome: `${utente.Nome} ${utente.Cognome}`,
                lotti: [],
              };
            }
          }
          if (operatoriMap[lotto.UtenteID]) {
            operatoriMap[lotto.UtenteID].lotti.push(lotto);
          }
        }
      });

      const operatori: OperatoreStats[] = Object.values(operatoriMap)
        .map((op) => {
          const produzione = op.lotti.reduce((sum: number, l: Lotto) => sum + (l.QtaOutput || 0), 0);

          const lottiConResa = op.lotti.filter((l: Lotto) => l.QtaInput && l.QtaInput > 0);
          const resa = lottiConResa.length > 0
            ? lottiConResa.reduce((sum: number, l: Lotto) => sum + ((l.QtaOutput / (l.QtaInput || 1)) * 100), 0) / lottiConResa.length
            : 0;

          const lottiConTempo = op.lotti.filter((l: Lotto) => l.DataInizio && l.DataFine);
          const tempoMedio = lottiConTempo.length > 0
            ? lottiConTempo.reduce((sum: number, l: Lotto) => {
                const diff = new Date(l.DataFine!).getTime() - new Date(l.DataInizio).getTime();
                return sum + (diff / 60000);
              }, 0) / lottiConTempo.length
            : 0;

          return {
            nome: op.nome,
            lotti: op.lotti.length,
            produzione,
            resa: Math.round(resa * 10) / 10,
            tempoMedio: Math.round(tempoMedio),
          };
        })
        .sort((a, b) => b.produzione - a.produzione);

      setStatsOperatori(operatori);
    } catch (err) {
      setError('Errore nel caricamento del report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportGenerale) return;

    let csv = 'ASI-GEST - Report Produzione\n';
    csv += `Periodo: ${reportGenerale.periodo}\n\n`;

    csv += 'RIEPILOGO GENERALE\n';
    csv += `Lotti Completati,${reportGenerale.totLotti}\n`;
    csv += `Produzione Totale,${reportGenerale.totProduzione}\n`;
    csv += `Scarti Totali,${reportGenerale.scartiTotali}\n`;
    csv += `Resa Media,%${reportGenerale.resaMedia}\n`;
    csv += `Tempo Medio Lotto,${reportGenerale.tempoMedio}min\n\n`;

    csv += 'STATISTICHE PER REPARTO\n';
    csv += 'Reparto,Lotti,Produzione,Scarti,Resa %\n';
    statsReparti.forEach((r) => {
      csv += `${r.reparto},${r.lotti},${r.produzione},${r.scarti},${r.resa}\n`;
    });

    csv += '\nSTATISTICHE PER OPERATORE\n';
    csv += 'Operatore,Lotti,Produzione,Resa %,Tempo Medio (min)\n';
    statsOperatori.forEach((o) => {
      csv += `${o.nome},${o.lotti},${o.produzione},${o.resa},${o.tempoMedio}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ASI-GEST_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner message="Generazione report..." />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">📊 Reporting & Analytics</h1>
          <button
            onClick={handleExportCSV}
            className="btn-compact bg-green-600 text-white rounded hover:bg-green-700"
            disabled={!reportGenerale}
          >
            📥 Esporta CSV
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-6">{error}</div>
        )}

        {/* Filtri Periodo */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Seleziona Periodo</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPeriodoSelezionato('oggi')}
              className={`btn-compact rounded ${
                periodoSelezionato === 'oggi'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Oggi
            </button>
            <button
              onClick={() => setPeriodoSelezionato('7giorni')}
              className={`btn-compact rounded ${
                periodoSelezionato === '7giorni'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Ultimi 7 giorni
            </button>
            <button
              onClick={() => setPeriodoSelezionato('30giorni')}
              className={`btn-compact rounded ${
                periodoSelezionato === '30giorni'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Ultimi 30 giorni
            </button>
            <button
              onClick={() => setPeriodoSelezionato('custom')}
              className={`btn-compact rounded ${
                periodoSelezionato === 'custom'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Personalizzato
            </button>

            {periodoSelezionato === 'custom' && (
              <div className="flex gap-2 ml-4">
                <input
                  type="date"
                  value={dataInizio}
                  onChange={(e) => setDataInizio(e.target.value)}
                  className="input-compact border border-gray-300 rounded text-[11px]"
                />
                <input
                  type="date"
                  value={dataFine}
                  onChange={(e) => setDataFine(e.target.value)}
                  className="input-compact border border-gray-300 rounded text-[11px]"
                />
              </div>
            )}
          </div>
        </div>

        {reportGenerale && (
          <>
            {/* Report Generale */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Riepilogo Generale - {reportGenerale.periodo}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 bg-blue-50 rounded border border-blue-200">
                  <div className="text-[10px] text-blue-600 font-medium mb-1">LOTTI COMPLETATI</div>
                  <div className="text-2xl font-bold text-blue-900">{reportGenerale.totLotti}</div>
                </div>

                <div className="p-4 bg-green-50 rounded border border-green-200">
                  <div className="text-[10px] text-green-600 font-medium mb-1">PRODUZIONE TOTALE</div>
                  <div className="text-2xl font-bold text-green-900">{reportGenerale.totProduzione}</div>
                </div>

                <div className="p-4 bg-red-50 rounded border border-red-200">
                  <div className="text-[10px] text-red-600 font-medium mb-1">SCARTI TOTALI</div>
                  <div className="text-2xl font-bold text-red-900">{reportGenerale.scartiTotali}</div>
                </div>

                <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
                  <div className="text-[10px] text-yellow-600 font-medium mb-1">RESA MEDIA</div>
                  <div className="text-2xl font-bold text-yellow-900">{reportGenerale.resaMedia}%</div>
                </div>

                <div className="p-4 bg-purple-50 rounded border border-purple-200">
                  <div className="text-[10px] text-purple-600 font-medium mb-1">TEMPO MEDIO</div>
                  <div className="text-2xl font-bold text-purple-900">{reportGenerale.tempoMedio}m</div>
                </div>
              </div>
            </div>

            {/* Stats Reparti */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Statistiche per Reparto</h2>
              <div className="overflow-x-auto">
                <table className="table-compact w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="text-left">Reparto</th>
                      <th className="text-left">Lotti</th>
                      <th className="text-left">Produzione</th>
                      <th className="text-left">Scarti</th>
                      <th className="text-left">Resa %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {statsReparti.map((reparto) => (
                      <tr key={reparto.reparto} className="hover:bg-gray-50">
                        <td className="font-medium">{reparto.reparto}</td>
                        <td>{reparto.lotti}</td>
                        <td className="font-medium text-green-700">{reparto.produzione}</td>
                        <td className="font-medium text-red-700">{reparto.scarti}</td>
                        <td className="font-medium">{reparto.resa}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stats Operatori */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Statistiche per Operatore</h2>
              <div className="overflow-x-auto">
                <table className="table-compact w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="text-left">Operatore</th>
                      <th className="text-left">Lotti</th>
                      <th className="text-left">Produzione</th>
                      <th className="text-left">Resa %</th>
                      <th className="text-left">Tempo Medio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {statsOperatori.map((op) => (
                      <tr key={op.nome} className="hover:bg-gray-50">
                        <td className="font-medium">{op.nome}</td>
                        <td>{op.lotti}</td>
                        <td className="font-medium text-green-700">{op.produzione}</td>
                        <td className="font-medium">{op.resa}%</td>
                        <td>{op.tempoMedio}m</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
