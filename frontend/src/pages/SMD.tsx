/**
 * ASI-GEST SMD Workflow Page
 * © 2025 Enrico Callegaro - Tutti i diritti riservati.
 */

export default function SMD() {
  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl font-bold text-gray-800 mb-4">SMD - Montaggio Superficiale</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-4">
            Gestione workflow SMD (Surface Mount Device) - In fase di sviluppo
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded border">
              <div className="text-sm font-semibold mb-2">Caricamento Componenti</div>
              <div className="text-[10px] text-gray-500">
                Registrazione feeder e bobine
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded border">
              <div className="text-sm font-semibold mb-2">Pick & Place</div>
              <div className="text-[10px] text-gray-500">
                Tracciamento assemblaggio macchina
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
