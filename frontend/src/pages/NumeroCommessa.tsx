/**
 * Numero Commessa Page
 * © 2025 Enrico Callegaro - Tutti i diritti riservati.
 *
 * Generatore di numeri commessa progressivi.
 * Elimina la dipendenza da Excel mantenendo read-only su ASITRON.
 */

import { useState, useEffect } from 'react';
import { rifcommcliApi, utentiApi, RIFCOMMCLIResponse, RIFCOMMCLIStatistiche, Utente } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './NumeroCommessa.css';

export default function NumeroCommessa() {
  const [utenti, setUtenti] = useState<Utente[]>([]);
  const [utenteSelezionato, setUtenteSelezionato] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [generato, setGenerato] = useState<{ numero: string; data: string } | null>(null);
  const [lista, setLista] = useState<RIFCOMMCLIResponse[]>([]);
  const [statistiche, setStatistiche] = useState<RIFCOMMCLIStatistiche | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingLista, setLoadingLista] = useState(true);
  const [loadingUtenti, setLoadingUtenti] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiatoMsg, setCopiatoMsg] = useState(false);

  useEffect(() => {
    loadUtenti();
    loadListaEStatistiche();
  }, []);

  const loadUtenti = async () => {
    try {
      setLoadingUtenti(true);
      const data = await utentiApi.getUtenti(true); // Solo utenti attivi
      setUtenti(data.items);
    } catch (err) {
      console.error('Errore caricamento utenti:', err);
    } finally {
      setLoadingUtenti(false);
    }
  };

  const loadListaEStatistiche = async () => {
    try {
      setLoadingLista(true);
      const [listaData, statsData] = await Promise.all([
        rifcommcliApi.getLista(),
        rifcommcliApi.getStatistiche(),
      ]);
      setLista(listaData.items);
      setStatistiche(statsData);
    } catch (err) {
      console.error('Errore caricamento lista:', err);
    } finally {
      setLoadingLista(false);
    }
  };

  const handleGenera = async () => {
    if (!utenteSelezionato) {
      setError('Seleziona un utente');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await rifcommcliApi.genera(utenteSelezionato, note.trim() || undefined);

      setGenerato({
        numero: result.RIFCOMMCLI,
        data: new Date(result.DataGenerazione).toLocaleString('it-IT'),
      });

      // Reset form
      setNote('');

      // Reload lista e statistiche
      loadListaEStatistiche();
    } catch (err: any) {
      setError(err.message || 'Errore durante la generazione');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopia = () => {
    if (generato) {
      navigator.clipboard.writeText(generato.numero);
      setCopiatoMsg(true);
      setTimeout(() => setCopiatoMsg(false), 2000);
    }
  };

  const handleAnnulla = async (numero: string) => {
    if (!confirm(`Confermi di voler annullare il numero commessa ${numero}?`)) {
      return;
    }

    try {
      await rifcommcliApi.annulla(numero, 'Annullato da interfaccia');
      loadListaEStatistiche();
    } catch (err: any) {
      alert('Errore durante l\'annullamento: ' + err.message);
      console.error(err);
    }
  };

  const handleRiconcilia = async () => {
    try {
      setLoading(true);
      const result = await rifcommcliApi.riconcilia();
      alert(`Riconciliazione completata!\n${result.riconciliati} numeri aggiornati.`);
      loadListaEStatistiche();
    } catch (err: any) {
      alert('Errore durante la riconciliazione: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="numero-commessa-container">
      <div className="numero-commessa-header">
        <h1>Numero Commessa</h1>
        <p className="subtitle">Generatore di numeri progressivi per commesse di produzione</p>
      </div>

      {/* Statistics Cards */}
      {statistiche && (
        <div className="stats-grid">
          <div className="stat-card stat-generated">
            <div className="stat-label">TOTALE GENERATI</div>
            <div className="stat-value">{statistiche.TotaleGenerati}</div>
          </div>
          <div className="stat-card stat-used">
            <div className="stat-label">UTILIZZATI</div>
            <div className="stat-value">{statistiche.TotaleUtilizzati}</div>
          </div>
          <div className="stat-card stat-pending">
            <div className="stat-label">IN ATTESA</div>
            <div className="stat-value">{statistiche.TotaleInAttesa}</div>
          </div>
          <div className="stat-card stat-cancelled">
            <div className="stat-label">ANNULLATI</div>
            <div className="stat-value">{statistiche.TotaleAnnullati}</div>
          </div>
        </div>
      )}

      {/* Generator Section */}
      <div className="generator-section">
        <h2>Genera Nuovo Numero</h2>

        {generato && (
          <div className="numero-generato-box">
            <div className="numero-generato-label">NUMERO COMMESSA GENERATO</div>
            <div className="numero-generato-value">{generato.numero}</div>
            <div className="numero-generato-info">
              Generato il {generato.data}
            </div>
            <button
              className="btn-copia"
              onClick={handleCopia}
            >
              {copiatoMsg ? '✓ Copiato!' : 'Copia negli appunti'}
            </button>
            <div className="warning-box">
              Inserisci ora questo numero nel gestionale ASITRON
            </div>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="utente">Utente *</label>
          {loadingUtenti ? (
            <div className="loading-select">Caricamento utenti...</div>
          ) : (
            <select
              id="utente"
              value={utenteSelezionato}
              onChange={(e) => setUtenteSelezionato(e.target.value)}
              disabled={loading}
              className="utente-select"
            >
              <option value="">-- Seleziona utente --</option>
              {utenti.map((utente) => (
                <option key={utente.UtenteID} value={utente.NomeCompleto}>
                  {utente.NomeCompleto} {utente.Reparto ? `(${utente.Reparto})` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="note">Note (opzionale)</label>
          <input
            id="note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note per questo numero"
            disabled={loading}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          className="btn-genera"
          onClick={handleGenera}
          disabled={loading || !utenteSelezionato}
        >
          {loading ? 'Generazione in corso...' : 'Genera Nuovo Numero Commessa'}
        </button>
      </div>

      {/* Lista Numeri Generati */}
      <div className="lista-section">
        <div className="lista-header">
          <h2>Numeri Generati</h2>
          <button
            className="btn-riconcilia"
            onClick={handleRiconcilia}
            disabled={loading}
            title="Sincronizza con ASITRON per marcare i numeri utilizzati"
          >
            Riconcilia
          </button>
        </div>

        {loadingLista ? (
          <LoadingSpinner message="Caricamento lista..." />
        ) : (
          <div className="lista-table-container">
            <table className="lista-table">
              <thead>
                <tr>
                  <th>Numero</th>
                  <th>Data Generazione</th>
                  <th>Utente</th>
                  <th>Stato</th>
                  <th>Data Utilizzo</th>
                  <th>Note</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {lista.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-message">
                      Nessun numero commessa generato
                    </td>
                  </tr>
                ) : (
                  lista.map((item) => (
                    <tr key={item.RIFCOMMCLI}>
                      <td className="numero-cell">{item.RIFCOMMCLI}</td>
                      <td>{new Date(item.DataGenerazione).toLocaleString('it-IT')}</td>
                      <td>{item.UtenteGenerazione}</td>
                      <td>
                        <span className={`stato-badge stato-${item.StatoUtilizzo.toLowerCase()}`}>
                          {item.StatoUtilizzo}
                        </span>
                      </td>
                      <td>
                        {item.DataUtilizzo
                          ? new Date(item.DataUtilizzo).toLocaleString('it-IT')
                          : '-'}
                      </td>
                      <td className="note-cell">{item.Note || '-'}</td>
                      <td>
                        {item.StatoUtilizzo === 'GENERATO' && (
                          <button
                            className="btn-annulla-small"
                            onClick={() => handleAnnulla(item.RIFCOMMCLI)}
                            title="Annulla questo numero"
                          >
                            X
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
