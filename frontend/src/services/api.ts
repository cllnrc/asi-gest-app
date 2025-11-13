/**
 * ASI-GEST API Service
 * © 2025 Enrico Callegaro - Tutti i diritti riservati.
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor (for adding auth tokens later)
api.interceptors.request.use(
  (config) => {
    // Could add auth token here
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (for global error handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error: No response from server');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Types
export interface Commessa {
  PROGRESSIVO: number;
  ESERCIZIO: number;
  NUMEROCOM: number;
  RIFCOMMCLI: string | null;
  CODCLIENTE: string | null;
  NomeCliente: string | null;
  DATAEMISSIONE: string | null;
  DATAINIZIOPIANO: string | null;
  DATAFINEPIANO: string | null;
  STATOCHIUSO: number;
  ANNOTAZIONI: string | null;
}

export interface Articolo {
  CODICE: string;
  DESCRIZIONE: string | null;
  TIPOLOGIA: string | null;
}

export interface Cliente {
  CODCONTO: string;
  DSCCONTO1: string;
  DSCCONTO2: string | null;
  PIVA: string | null;
  CODFISCALE: string | null;
  INDIRIZZO: string | null;
  CITTA: string | null;
  PROVINCIA: string | null;
  CAP: string | null;
}

export interface Lotto {
  LottoID: number;
  FaseID: number;
  Progressivo: number;
  OperatoreID: number | null;
  MacchinaID: number | null;
  DataInizio: string;
  DataFine: string | null; // null = aperto, valorizzato = chiuso
  QtaInput: number | null;
  QtaOutput: number;
  QtaScarti: number;
  ProgrammaFeeder: string | null;
  TempoSetupMin: number | null;
  TipoScarto: string | null;
  NoteScarti: string | null;
  Note: string | null;
}

export interface Fase {
  FaseID: number;
  ConfigCommessaID: number;
  FaseTipoID: number;
  NumeroCommessa: string;
  Quantita: number;
  Note: string | null;
  Completata: boolean;
  DataCreazione: string;
  DataModifica: string;
}

export interface FaseTipo {
  FaseTipoID: number;
  Nome: string;
  Descrizione: string | null;
  TipoProduzione: string; // 'SMD' | 'PTH' | 'CONTROLLI'
  OrdineSequenza: number;
}

export interface Utente {
  UtenteID: number;
  Username: string;
  NomeCompleto: string;
  Email: string | null;
  Reparto: string | null; // 'SMD' | 'PTH' | 'CONTROLLI'
  Ruolo: string | null;
  Attivo: boolean;
  DataCreazione: string;
}

export interface Macchina {
  MacchinaID: number;
  Codice: string;
  Descrizione: string | null;
  Reparto: string | null; // 'SMD' | 'PTH' | 'CONTROLLI'
  Tipo: string | null;
  Note: string | null;
  Attiva: boolean;
  DataCreazione: string;
}

export interface LottoDettaglio extends Lotto {
  fasi?: Fase[];
  faseTipo?: FaseTipo;
  utente?: Utente;
  macchina?: Macchina;
}

// API functions - Gestionale (Read-only ASITRON)
export const gestionaleApi = {
  getCommesse: async (aperte?: boolean, limit = 100) => {
    const params = new URLSearchParams();
    if (aperte !== undefined) params.append('aperte', aperte.toString());
    params.append('limit', limit.toString());
    const response = await api.get<{ items: Commessa[]; total: number }>(
      `/api/gestionale/commesse?${params}`
    );
    return response.data;
  },

  getCommessa: async (progressivo: number) => {
    const response = await api.get<Commessa>(`/api/gestionale/commesse/${progressivo}`);
    return response.data;
  },

  getArticoli: async (search?: string, limit = 100) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('limit', limit.toString());
    const response = await api.get<{ items: Articolo[]; total: number }>(
      `/api/gestionale/articoli?${params}`
    );
    return response.data;
  },

  getClienti: async (search?: string, limit = 100) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('limit', limit.toString());
    const response = await api.get<{ items: Cliente[]; total: number }>(
      `/api/gestionale/clienti?${params}`
    );
    return response.data;
  },
};

// API functions - Lotti (ASI_GEST database)
export const lottiApi = {
  getLotti: async () => {
    const response = await api.get<{ items: Lotto[]; total: number }>('/api/lotti');
    return response.data;
  },

  getLotto: async (id: number) => {
    const response = await api.get<Lotto>(`/api/lotti/${id}`);
    return response.data;
  },

  createLotto: async (data: { ConfigCommessaID?: number }) => {
    const response = await api.post<Lotto>('/api/lotti', data);
    return response.data;
  },

  closeLotto: async (id: number) => {
    const response = await api.post<Lotto>(`/api/lotti/${id}/close`, {});
    return response.data;
  },

  deleteLotto: async (id: number) => {
    await api.delete(`/api/lotti/${id}`);
  },
};

// API functions - Fasi (ASI_GEST database)
export const fasiApi = {
  getFasi: async (lottoId?: number, completata?: boolean) => {
    const params = new URLSearchParams();
    if (lottoId !== undefined) params.append('LottoID', lottoId.toString());
    // FIX: Backend usa 'completata' (senza 'e')
    if (completata !== undefined) params.append('completata', completata.toString());
    const response = await api.get<{ items: Fase[]; total: number }>(`/api/fasi?${params}`);
    return response.data;
  },

  getFase: async (id: number) => {
    const response = await api.get<Fase>(`/api/fasi/${id}`);
    return response.data;
  },

  createFase: async (data: Partial<Fase>) => {
    const response = await api.post<Fase>('/api/fasi', data);
    return response.data;
  },

  updateFase: async (id: number, data: Partial<Fase>) => {
    const response = await api.put<Fase>(`/api/fasi/${id}`, data);
    return response.data;
  },

  deleteFase: async (id: number) => {
    await api.delete(`/api/fasi/${id}`);
  },
};

// API functions - Fasi Tipo (ASI_GEST database)
export const fasiTipoApi = {
  getFasiTipo: async (tipo?: string) => {
    const params = tipo ? `?tipo=${tipo}` : '';
    const response = await api.get<{ items: FaseTipo[]; total: number }>(`/api/fasi-tipo${params}`);
    return response.data;
  },

  getFaseTipo: async (id: number) => {
    const response = await api.get<FaseTipo>(`/api/fasi-tipo/${id}`);
    return response.data;
  },
};

// API functions - Utenti (ASI_GEST database)
export const utentiApi = {
  getUtenti: async (attivi?: boolean) => {
    const params = attivi !== undefined ? `?attivi=${attivi}` : '';
    const response = await api.get<{ items: Utente[]; total: number }>(`/api/utenti${params}`);
    return response.data;
  },

  getUtente: async (id: number) => {
    const response = await api.get<Utente>(`/api/utenti/${id}`);
    return response.data;
  },

  createUtente: async (data: Partial<Utente>) => {
    const response = await api.post<Utente>('/api/utenti', data);
    return response.data;
  },

  updateUtente: async (id: number, data: Partial<Utente>) => {
    const response = await api.put<Utente>(`/api/utenti/${id}`, data);
    return response.data;
  },

  deleteUtente: async (id: number) => {
    await api.delete(`/api/utenti/${id}`);
  },
};

// API functions - Macchine (ASI_GEST database)
export const macchineApi = {
  getMacchine: async (reparto?: string, attive?: boolean) => {
    const params = new URLSearchParams();
    if (reparto) params.append('reparto', reparto);
    if (attive !== undefined) params.append('attive', attive.toString());
    const response = await api.get<{ items: Macchina[]; total: number }>(`/api/macchine?${params}`);
    return response.data;
  },

  getMacchina: async (id: number) => {
    const response = await api.get<Macchina>(`/api/macchine/${id}`);
    return response.data;
  },

  createMacchina: async (data: Partial<Macchina>) => {
    const response = await api.post<Macchina>('/api/macchine', data);
    return response.data;
  },

  updateMacchina: async (id: number, data: Partial<Macchina>) => {
    const response = await api.put<Macchina>(`/api/macchine/${id}`, data);
    return response.data;
  },

  deleteMacchina: async (id: number) => {
    await api.delete(`/api/macchine/${id}`);
  },
};
