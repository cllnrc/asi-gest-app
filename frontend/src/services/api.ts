/**
 * ASI-GEST API Service
 * © 2025 Enrico Callegaro - Tutti i diritti riservati.
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

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
  ProgressivoGiornaliero: number;
  DataCreazione: string;
  ConfigCommessaID: number | null;
  DataChiusura: string | null;
  Stato: string;
  NumeroCommessa: string | null;
  CodiceArticolo: string | null;
}

export interface Fase {
  FaseID: number;
  LottoID: number;
  FaseTipoID: number;
  MacchinaID: number | null;
  UtenteID: number | null;
  DataInizio: string;
  DataFine: string | null;
  Quantita: number | null;
  Note: string | null;
  Completata: boolean;
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
  getFasi: async (lottoId?: number) => {
    const params = lottoId ? `?LottoID=${lottoId}` : '';
    const response = await api.get<{ items: Fase[]; total: number }>(`/api/fasi${params}`);
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
