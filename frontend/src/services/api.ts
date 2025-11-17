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

export interface ConfigCommessa {
  ConfigCommessaID: number;
  CommessaERPId: number;
  CodiceArticolo: string;
  Descrizione: string;
  FlagSMD: boolean;
  FlagPTH: boolean;
  FlagControlli: boolean;
  FlagTerzista: boolean;
  DIBA: string | null;
  Revisione: string | null;
  BloccataDocumentazione: boolean;
  Note: string | null;
  Attivo: boolean;
  DataCreazione: string;
  DataModifica: string;
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
  CommessaERPId: number;
  FaseTipoID: number;
  Stato: string; // 'APERTA' | 'IN_CORSO' | 'CHIUSA' | 'BLOCCATA'
  DataApertura: string;
  DataChiusura: string | null;
  QtaPrevista: number | null;
  QtaProdotta: number | null;
  QtaResidua: number | null;
  Note: string | null;
  Completata: boolean; // Computed from Stato
}

export interface FaseTipo {
  FaseTipoID: number;
  Codice: string;
  Descrizione: string;
  Ordine: number;
  Attivo: boolean;
}

export interface DocUT {
  DocUTID: number;
  CodiceArticolo: string;
  Descrizione: string | null;

  // Sezione UT
  DIBA: boolean;
  DIBAData: string | null;
  DIBAUtente: string | null;

  ProgrammaMyData: boolean;
  ProgrammaMyDataData: string | null;
  ProgrammaMyDataUtente: string | null;

  PDM: boolean;
  PDMData: string | null;
  PDMUtente: string | null;

  FileLaminaTelaio: string | null; // 'CLIENTE' | 'TOP' | 'BOTTOM' | 'TOP+BOTTOM'
  FileLaminaTelaioData: string | null;
  FileLaminaTelaioUtente: string | null;

  // Sezione Cliente
  DIBACliente: boolean;
  PDMCliente: boolean;
  FilePP: boolean;

  // Sezione Post Production
  FotoPCB: boolean;
  FotoProdotto: boolean;
  TempiLavorazione: boolean;
  FasiLavorazione: boolean;
  PPUtente: boolean;
  Campionatura: boolean;
  DocProduzione: boolean;

  // Metadata
  DataInserimento: string;
  DataModifica: string;
  Attivo: boolean;
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

export interface DocUT {
  DocUTID: number;
  CodiceArticolo: string;
  Descrizione: string | null;

  // Sezione UT
  DIBA: boolean;
  DIBAData: string | null;
  DIBAUtente: string | null;

  ProgrammaMyData: boolean;
  ProgrammaMyDataData: string | null;
  ProgrammaMyDataUtente: string | null;

  PDM: boolean;
  PDMData: string | null;
  PDMUtente: string | null;

  FileLaminaTelaio: string | null; // 'CLIENTE' | 'TOP' | 'BOTTOM' | 'TOP+BOTTOM'
  FileLaminaTelaioData: string | null;
  FileLaminaTelaioUtente: string | null;

  // Sezione Cliente
  DIBACliente: boolean;
  PDMCliente: boolean;
  FilePP: boolean;

  // Sezione Post Production
  FotoPCB: boolean;
  FotoProdotto: boolean;
  TempiLavorazione: boolean;
  FasiLavorazione: boolean;
  PPUtente: boolean;
  Campionatura: boolean;
  DocProduzione: boolean;

  // Metadata
  DataInserimento: string;
  DataModifica: string;
  Attivo: boolean;
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

// API functions - ConfigCommessa (ASI_GEST database)
export const configCommessaApi = {
  getConfigs: async (attivo?: boolean, page = 1, pageSize = 50) => {
    const params = new URLSearchParams();
    if (attivo !== undefined) params.append('attivo', attivo.toString());
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    const response = await api.get<{ items: ConfigCommessa[]; total: number }>(`/api/config?${params}`);
    return response.data;
  },

  getConfigByERPId: async (commessaERPId: number) => {
    try {
      const response = await api.get<ConfigCommessa>(`/api/config/by-erp-id/${commessaERPId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // Non esiste ancora
      }
      throw error;
    }
  },

  getConfig: async (id: number) => {
    const response = await api.get<ConfigCommessa>(`/api/config/${id}`);
    return response.data;
  },

  createConfig: async (data: {
    CommessaERPId: number;
    CodiceArticolo: string;
    Descrizione: string;
    FlagSMD?: boolean;
    FlagPTH?: boolean;
    FlagControlli?: boolean;
    FlagTerzista?: boolean;
    DIBA?: string;
    Revisione?: string;
    BloccataDocumentazione?: boolean;
    Note?: string;
  }) => {
    const response = await api.post<ConfigCommessa>('/api/config', data);
    return response.data;
  },

  updateConfig: async (id: number, data: Partial<ConfigCommessa>) => {
    const response = await api.put<ConfigCommessa>(`/api/config/${id}`, data);
    return response.data;
  },

  deleteConfig: async (id: number) => {
    await api.delete(`/api/config/${id}`);
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
  getFasiTipo: async () => {
    const response = await api.get<{ items: FaseTipo[]; total: number }>('/api/fasi-tipo');
    return response.data;
  },

  getFaseTipo: async (id: number) => {
    const response = await api.get<FaseTipo>(`/api/fasi-tipo/${id}`);
    return response.data;
  },
};

// API functions - DocUT (ASI_GEST database)
export const docUTApi = {
  // Get articles from gestionale with DocUT documentation
  getArticoliConDocumentazione: async (page: number = 1, pageSize: number = 30, search?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    if (search) params.append('search', search);

    const response = await api.get<{ items: DocUT[]; total: number; page: number; page_size: number }>(`/api/doc-ut/articoli-con-documentazione?${params}`);
    return response.data;
  },

  getDocUT: async (page: number = 1, pageSize: number = 30, search?: string, filtro45?: boolean, attivo?: boolean) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    if (search) params.append('search', search);
    if (filtro45) params.append('filtro_45', 'true');
    if (attivo !== undefined) params.append('attivo', attivo.toString());

    const response = await api.get<{ items: DocUT[]; total: number; page: number; page_size: number }>(`/api/doc-ut?${params}`);
    return response.data;
  },

  getDocUTById: async (id: number) => {
    const response = await api.get<DocUT>(`/api/doc-ut/${id}`);
    return response.data;
  },

  getDocUTByArticolo: async (codiceArticolo: string) => {
    const response = await api.get<DocUT>(`/api/doc-ut/by-articolo/${codiceArticolo}`);
    return response.data;
  },

  createDocUT: async (data: Partial<DocUT>) => {
    const response = await api.post<DocUT>('/api/doc-ut', data);
    return response.data;
  },

  updateDocUT: async (id: number, data: Partial<DocUT>) => {
    const response = await api.put<DocUT>(`/api/doc-ut/${id}`, data);
    return response.data;
  },

  deleteDocUT: async (id: number) => {
    const response = await api.delete<DocUT>(`/api/doc-ut/${id}`);
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
    const response = await api.post<Utente>('/api/utenti/', data);
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
    const paramsStr = params.toString();
    const response = await api.get<{ items: Macchina[]; total: number }>(`/api/macchine${paramsStr ? '?' + paramsStr : ''}`);
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
