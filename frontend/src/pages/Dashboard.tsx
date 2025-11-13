/**
 * ASI-GEST Dashboard Page
 * © 2025 Enrico Callegaro - Tutti i diritti riservati.
 */

import { useState, useEffect } from 'react';
import { gestionaleApi, lottiApi, fasiApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

interface KPIData {
  commesseAttive: number;
  lottiAperti: number;
  fasiCompletate24h: number;
}

export default function Dashboard() {
  const [kpi, setKpi] = useState<KPIData>({
    commesseAttive: 0,
    lottiAperti: 0,
    fasiCompletate24h: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadKPI();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadKPI();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadKPI = async () => {
    try {
      setError(null);

      const [commesseData, lottiData, fasiData] = await Promise.all([
        gestionaleApi.getCommesse(true, 500), // aperte = true
        lottiApi.getLotti(),
        fasiApi.getFasi(undefined, true), // completata = true (FIX: parametro corretto)
      ]);

      // Count commesse attive
      const commesseAttive = commesseData.total;

      // Count lotti aperti (DataFine === null significa aperto)
      const lottiAperti = lottiData.items.filter((l) => l.DataFine === null).length;

      // Count fasi completate nelle ultime 24h
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const fasiCompletate24h = fasiData.items.filter((f) => {
        if (!f.Completata) return false; // Usa flag Completata invece di DataFine
        const dataModifica = new Date(f.DataModifica);
        return dataModifica >= last24h && dataModifica <= now;
      }).length;

      setKpi({
        commesseAttive,
        lottiAperti,
        fasiCompletate24h,
      });

      setLastUpdate(new Date());
    } catch (err) {
      setError('Errore nel caricamento dei KPI');
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
          <div className="text-[10px] text-gray-500">
            Ultimo aggiornamento: {lastUpdate.toLocaleTimeString('it-IT')}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-6">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Commesse Attive Card */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <div className="text-[11px] text-gray-500 font-medium mb-1">COMMESSE ATTIVE</div>
            <div className="text-3xl font-bold text-gray-800">{kpi.commesseAttive}</div>
            <div className="text-[10px] text-gray-400 mt-2">In lavorazione</div>
          </div>

          {/* Lotti Aperti Card */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <div className="text-[11px] text-gray-500 font-medium mb-1">LOTTI APERTI</div>
            <div className="text-3xl font-bold text-gray-800">{kpi.lottiAperti}</div>
            <div className="text-[10px] text-gray-400 mt-2">Oggi</div>
          </div>

          {/* Fasi Completate Card */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
            <div className="text-[11px] text-gray-500 font-medium mb-1">FASI COMPLETATE</div>
            <div className="text-3xl font-bold text-gray-800">{kpi.fasiCompletate24h}</div>
            <div className="text-[10px] text-gray-400 mt-2">Ultime 24h</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Benvenuto in ASI-GEST</h2>
          <p className="text-sm text-gray-600 mb-4">
            Sistema di gestione produzione elettronica per Asitron.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-4 bg-gray-50 rounded border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="text-[11px] font-semibold text-gray-700 mb-1">SMD</div>
              <div className="text-[10px] text-gray-500">Montaggio superficiale</div>
            </div>
            <div className="p-4 bg-gray-50 rounded border border-gray-200 hover:border-yellow-300 transition-colors">
              <div className="text-[11px] font-semibold text-gray-700 mb-1">PTH</div>
              <div className="text-[10px] text-gray-500">Montaggio fori passanti</div>
            </div>
            <div className="p-4 bg-gray-50 rounded border border-gray-200 hover:border-purple-300 transition-colors">
              <div className="text-[11px] font-semibold text-gray-700 mb-1">Collaudo</div>
              <div className="text-[10px] text-gray-500">Test funzionale</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Azioni Rapide</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <a
              href="/commesse"
              className="p-3 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors text-center"
            >
              <div className="text-[11px] font-semibold text-blue-700">Commesse</div>
              <div className="text-[10px] text-blue-600 mt-1">Gestione ordini</div>
            </a>
            <a
              href="/smd"
              className="p-3 bg-green-50 border border-green-200 rounded hover:bg-green-100 transition-colors text-center"
            >
              <div className="text-[11px] font-semibold text-green-700">Nuovo Lotto SMD</div>
              <div className="text-[10px] text-green-600 mt-1">Avvia produzione</div>
            </a>
            <a
              href="/lotti"
              className="p-3 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100 transition-colors text-center"
            >
              <div className="text-[11px] font-semibold text-purple-700">Lotti</div>
              <div className="text-[10px] text-purple-600 mt-1">Visualizza tutti</div>
            </a>
            <button
              onClick={loadKPI}
              disabled={loading}
              className="p-3 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors text-center disabled:opacity-50"
            >
              <div className="text-[11px] font-semibold text-gray-700">
                {loading ? 'Aggiornamento...' : 'Aggiorna KPI'}
              </div>
              <div className="text-[10px] text-gray-600 mt-1">Dati real-time</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
