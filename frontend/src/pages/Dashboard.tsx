/**
 * ASI-GEST Advanced Dashboard
 * © 2025 Enrico Callegaro - Tutti i diritti riservati.
 */

import { useState, useEffect } from 'react';
import { gestionaleApi, lottiApi, fasiApi, fasiTipoApi, utentiApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Lotto, Fase, FaseTipo, Utente } from '../services/api';

interface KPIData {
  commesseAttive: number;
  lottiAperti: number;
  fasiCompletate24h: number;
  resaMedia: number;
  tempoMedioLotto: number;
  totaleProduzioneOggi: number;
}

interface ProduzioneReparto {
  reparto: string;
  count: number;
  percentuale: number;
}

interface TopOperatore {
  nome: string;
  lottiCompletati: number;
  resaMedia: number;
}

interface Anomalia {
  type: 'scarto' | 'tempo' | 'fermo';
  message: string;
  severity: 'warning' | 'error';
  lottoId?: number;
}

export default function Dashboard() {
  const [kpi, setKpi] = useState<KPIData>({
    commesseAttive: 0,
    lottiAperti: 0,
    fasiCompletate24h: 0,
    resaMedia: 0,
    tempoMedioLotto: 0,
    totaleProduzioneOggi: 0,
  });

  const [produzioneReparti, setProduzioneReparti] = useState<ProduzioneReparto[]>([]);
  const [topOperatori, setTopOperatori] = useState<TopOperatore[]>([]);
  const [anomalie, setAnomalie] = useState<Anomalia[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboardData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setError(null);

      const [commesseData, lottiData, fasiData, fasiTipoData, utentiData] = await Promise.all([
        gestionaleApi.getCommesse(true, 500),
        lottiApi.getLotti(),
        fasiApi.getFasi(),
        fasiTipoApi.getFasiTipo(),
        utentiApi.getUtenti(true),
      ]);

      // Basic KPI
      const commesseAttive = commesseData.total;
      const lottiAperti = lottiData.items.filter((l: Lotto) => !l.DataFine).length;

      // Fasi completate 24h
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const fasiCompletate24h = fasiData.items.filter((f: Fase) => {
        if (!f.DataChiusura) return false;
        const dataFine = new Date(f.DataChiusura);
        return dataFine >= last24h && dataFine <= now;
      }).length;

      // Lotti chiusi oggi
      const oggi = new Date();
      oggi.setHours(0, 0, 0, 0);
      const lottiOggi = lottiData.items.filter((l: Lotto) => {
        if (!l.DataFine) return false;
        const dataFine = new Date(l.DataFine);
        return dataFine >= oggi;
      });

      // Calcola resa media
      const lottiConResa = lottiOggi.filter((l: Lotto) => l.QtaInput && l.QtaInput > 0);
      const resaMedia = lottiConResa.length > 0
        ? lottiConResa.reduce((sum: number, l: Lotto) => {
            const resa = (l.QtaOutput / (l.QtaInput || 1)) * 100;
            return sum + resa;
          }, 0) / lottiConResa.length
        : 0;

      // Calcola tempo medio lotto (in minuti)
      const lottiConTempo = lottiOggi.filter((l: Lotto) => l.DataInizio && l.DataFine);
      const tempoMedioLotto = lottiConTempo.length > 0
        ? lottiConTempo.reduce((sum: number, l: Lotto) => {
            const diff = new Date(l.DataFine!).getTime() - new Date(l.DataInizio).getTime();
            return sum + (diff / 60000); // minuti
          }, 0) / lottiConTempo.length
        : 0;

      // Totale produzione oggi
      const totaleProduzioneOggi = lottiOggi.reduce((sum: number, l: Lotto) => sum + (l.QtaOutput || 0), 0);

      setKpi({
        commesseAttive,
        lottiAperti,
        fasiCompletate24h,
        resaMedia: Math.round(resaMedia * 10) / 10,
        tempoMedioLotto: Math.round(tempoMedioLotto),
        totaleProduzioneOggi,
      });

      // Produzione per reparto
      const fasiPerReparto = fasiData.items.reduce((acc: Record<string, number>, fase: Fase) => {
        const faseTipo = fasiTipoData.items.find((ft: FaseTipo) => ft.FaseTipoID === fase.FaseTipoID);
        const tipo = faseTipo?.Tipo || 'ALTRO';
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
      }, {});

      const totalFasi = Object.values(fasiPerReparto).reduce((sum: number, count) => sum + (count as number), 0);
      const reparti: ProduzioneReparto[] = Object.entries(fasiPerReparto).map(([reparto, count]) => ({
        reparto,
        count: count as number,
        percentuale: totalFasi > 0 ? Math.round(((count as number) / totalFasi) * 100) : 0,
      }));
      setProduzioneReparti(reparti);

      // Top operatori (lotti completati oggi)
      const operatoriStats = utentiData.items.reduce((acc: Record<number, { nome: string; lotti: Lotto[] }>, utente: Utente) => {
        const lottiUtente = lottiOggi.filter((l: Lotto) => l.UtenteID === utente.UtenteID);
        if (lottiUtente.length > 0) {
          acc[utente.UtenteID] = {
            nome: `${utente.Nome} ${utente.Cognome}`,
            lotti: lottiUtente,
          };
        }
        return acc;
      }, {});

      const topOps: TopOperatore[] = Object.values(operatoriStats)
        .map((op) => {
          const lottiConResa = op.lotti.filter((l: Lotto) => l.QtaInput && l.QtaInput > 0);
          const resaMedia = lottiConResa.length > 0
            ? lottiConResa.reduce((sum: number, l: Lotto) => sum + ((l.QtaOutput / (l.QtaInput || 1)) * 100), 0) / lottiConResa.length
            : 0;

          return {
            nome: op.nome,
            lottiCompletati: op.lotti.length,
            resaMedia: Math.round(resaMedia * 10) / 10,
          };
        })
        .sort((a, b) => b.lottiCompletati - a.lottiCompletati)
        .slice(0, 5);

      setTopOperatori(topOps);

      // Rilevamento anomalie
      const anomalieRilevate: Anomalia[] = [];

      // Anomalia: scarti elevati (> 10%)
      lottiOggi.forEach((l: Lotto) => {
        if (l.QtaInput && l.QtaInput > 0) {
          const percentualeScarto = (l.QtaScarti / l.QtaInput) * 100;
          if (percentualeScarto > 10) {
            anomalieRilevate.push({
              type: 'scarto',
              message: `Lotto #${l.Progressivo}: Scarti elevati (${percentualeScarto.toFixed(1)}%)`,
              severity: percentualeScarto > 20 ? 'error' : 'warning',
              lottoId: l.LottoID,
            });
          }
        }
      });

      // Anomalia: lotti aperti da più di 4 ore
      const lottiApertiData = lottiData.items.filter((l: Lotto) => !l.DataFine);
      const quattrOreFA = new Date(now.getTime() - 4 * 60 * 60 * 1000);
      lottiApertiData.forEach((l: Lotto) => {
        const dataInizio = new Date(l.DataInizio);
        if (dataInizio < quattrOreFA) {
          const oreFa = Math.floor((now.getTime() - dataInizio.getTime()) / (60 * 60 * 1000));
          anomalieRilevate.push({
            type: 'tempo',
            message: `Lotto #${l.Progressivo}: Aperto da ${oreFa}h`,
            severity: oreFa > 8 ? 'error' : 'warning',
            lottoId: l.LottoID,
          });
        }
      });

      setAnomalie(anomalieRilevate.slice(0, 5)); // Max 5 anomalie

      setLastUpdate(new Date());
    } catch (err) {
      setError('Errore nel caricamento della dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && kpi.commesseAttive === 0) {
    return (
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner message="Caricamento dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard ASI-GEST</h1>
          <div className="flex items-center gap-4">
            <div className="text-[10px] text-gray-500">
              Ultimo aggiornamento: {lastUpdate.toLocaleTimeString('it-IT')}
            </div>
            <button
              onClick={loadDashboardData}
              className="btn-compact bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loading}
            >
              🔄 Aggiorna
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-6">{error}</div>
        )}

        {/* Primary KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="text-[10px] text-gray-500 font-medium mb-1">COMMESSE ATTIVE</div>
            <div className="text-2xl font-bold text-gray-800">{kpi.commesseAttive}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="text-[10px] text-gray-500 font-medium mb-1">LOTTI APERTI</div>
            <div className="text-2xl font-bold text-gray-800">{kpi.lottiAperti}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <div className="text-[10px] text-gray-500 font-medium mb-1">FASI CHIUSE 24H</div>
            <div className="text-2xl font-bold text-gray-800">{kpi.fasiCompletate24h}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <div className="text-[10px] text-gray-500 font-medium mb-1">RESA MEDIA OGGI</div>
            <div className="text-2xl font-bold text-gray-800">{kpi.resaMedia}%</div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
            <div className="text-[10px] text-gray-500 font-medium mb-1">TEMPO MEDIO</div>
            <div className="text-2xl font-bold text-gray-800">{kpi.tempoMedioLotto}m</div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
            <div className="text-[10px] text-gray-500 font-medium mb-1">PRODUZIONE OGGI</div>
            <div className="text-2xl font-bold text-gray-800">{kpi.totaleProduzioneOggi}</div>
          </div>
        </div>

        {/* Anomalie Widget */}
        {anomalie.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4 mb-6 border-l-4 border-red-500">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">⚠️ Anomalie Rilevate</h2>
            <div className="space-y-2">
              {anomalie.map((anomalia, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded text-[11px] ${
                    anomalia.severity === 'error'
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                  }`}
                >
                  <span className="font-medium">
                    {anomalia.type === 'scarto' && '🔴'}
                    {anomalia.type === 'tempo' && '⏰'}
                    {anomalia.type === 'fermo' && '⚠️'}
                  </span>{' '}
                  {anomalia.message}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Produzione per Reparto */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Produzione per Reparto</h2>
            <div className="space-y-3">
              {produzioneReparti.map((reparto) => (
                <div key={reparto.reparto}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-medium text-gray-700">{reparto.reparto}</span>
                    <span className="text-gray-600">{reparto.count} fasi ({reparto.percentuale}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        reparto.reparto === 'SMD'
                          ? 'bg-green-500'
                          : reparto.reparto === 'PTH'
                          ? 'bg-yellow-500'
                          : 'bg-purple-500'
                      }`}
                      style={{ width: `${reparto.percentuale}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Operatori */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Top Operatori Oggi</h2>
            <div className="space-y-2">
              {topOperatori.length === 0 ? (
                <div className="text-[11px] text-gray-500 text-center py-4">
                  Nessun lotto completato oggi
                </div>
              ) : (
                topOperatori.map((op, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                          idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : 'bg-orange-400'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <span className="text-[11px] font-medium text-gray-700">{op.nome}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-semibold text-gray-800">{op.lottiCompletati} lotti</div>
                      <div className="text-[10px] text-gray-500">Resa: {op.resaMedia}%</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Azioni Rapide</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <a
              href="/commesse"
              className="p-3 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors text-center"
            >
              <div className="text-[11px] font-semibold text-blue-700">📋 Commesse</div>
              <div className="text-[10px] text-blue-600 mt-1">Gestione ordini</div>
            </a>
            <a
              href="/smd"
              className="p-3 bg-green-50 border border-green-200 rounded hover:bg-green-100 transition-colors text-center"
            >
              <div className="text-[11px] font-semibold text-green-700">🟢 SMD</div>
              <div className="text-[10px] text-green-600 mt-1">Montaggio superficiale</div>
            </a>
            <a
              href="/pth"
              className="p-3 bg-yellow-50 border border-yellow-200 rounded hover:bg-yellow-100 transition-colors text-center"
            >
              <div className="text-[11px] font-semibold text-yellow-700">🟡 PTH</div>
              <div className="text-[10px] text-yellow-600 mt-1">Fori passanti</div>
            </a>
            <a
              href="/collaudo"
              className="p-3 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100 transition-colors text-center"
            >
              <div className="text-[11px] font-semibold text-purple-700">🟣 Collaudo</div>
              <div className="text-[10px] text-purple-600 mt-1">Controlli qualità</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
