/**
 * ASI-GEST Commesse Page
 * © 2025 Enrico Callegaro - Tutti i diritti riservati.
 */

import { useState, useEffect } from 'react';
import { gestionaleApi, type Commessa } from '../services/api';

export default function Commesse() {
  const [commesse, setCommesse] = useState<Commessa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAperte, setShowAperte] = useState(true);

  useEffect(() => {
    loadCommesse();
  }, [showAperte]);

  const loadCommesse = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await gestionaleApi.getCommesse(showAperte, 50);
      setCommesse(data.items);
    } catch (err) {
      setError('Errore nel caricamento delle commesse');
      console.error(err);
    } finally {
      setLoading(false);
    }
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
    </div>
  );
}
