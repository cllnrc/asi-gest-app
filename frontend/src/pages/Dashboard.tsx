/**
 * ASI-GEST Dashboard Page
 * © 2025 Enrico Callegaro - Tutti i diritti riservati.
 */

export default function Dashboard() {
  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Dashboard ASI-GEST</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Commesse Attive Card */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="text-[11px] text-gray-500 font-medium mb-1">COMMESSE ATTIVE</div>
            <div className="text-3xl font-bold text-gray-800">-</div>
            <div className="text-[10px] text-gray-400 mt-2">In lavorazione</div>
          </div>

          {/* Lotti Aperti Card */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="text-[11px] text-gray-500 font-medium mb-1">LOTTI APERTI</div>
            <div className="text-3xl font-bold text-gray-800">-</div>
            <div className="text-[10px] text-gray-400 mt-2">Oggi</div>
          </div>

          {/* Fasi Completate Card */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="text-[11px] text-gray-500 font-medium mb-1">FASI COMPLETATE</div>
            <div className="text-3xl font-bold text-gray-800">-</div>
            <div className="text-[10px] text-gray-400 mt-2">Ultime 24h</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Benvenuto in ASI-GEST</h2>
          <p className="text-sm text-gray-600 mb-4">
            Sistema di gestione produzione elettronica per Asitron.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-4 bg-gray-50 rounded border border-gray-200">
              <div className="text-[11px] font-semibold text-gray-700 mb-1">SMD</div>
              <div className="text-[10px] text-gray-500">Montaggio superficiale</div>
            </div>
            <div className="p-4 bg-gray-50 rounded border border-gray-200">
              <div className="text-[11px] font-semibold text-gray-700 mb-1">PTH</div>
              <div className="text-[10px] text-gray-500">Montaggio fori passanti</div>
            </div>
            <div className="p-4 bg-gray-50 rounded border border-gray-200">
              <div className="text-[11px] font-semibold text-gray-700 mb-1">Collaudo</div>
              <div className="text-[10px] text-gray-500">Test funzionale</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
