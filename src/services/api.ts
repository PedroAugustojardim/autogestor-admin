import axios from 'axios';
import { getAccessToken, setAccessToken } from './authToken';

// O backend decide se este cliente pode receber o refresh token no corpo da
// resposta pelo User-Agent do navegador (ver isTrustedMobileClient em
// autogestor-api/src/utils/clientDetection.ts), não por um header nosso — um
// header como X-Auth-Transport é escolhido pelo próprio client, então um XSS
// rodando nesta mesma origem podia simplesmente omiti-lo pra ler o token direto
// do JSON, mesmo com o cookie httpOnly configurado. Não reintroduzir esse padrão.
const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // envia/recebe o cookie httpOnly do refresh token
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Compartilhado entre requisições concorrentes: se duas chamadas levarem 401 ao
// mesmo tempo, só a primeira dispara o /auth/refresh — as demais aguardam a mesma
// promise em vez de cada uma tentar rotacionar o refresh token por conta própria.
let refreshPromise: Promise<string> | null = null;

function performRefresh(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        '/api/v1/auth/refresh',
        {},
        { withCredentials: true, timeout: 15000 },
      )
      .then(({ data }) => {
        setAccessToken(data.accessToken);
        return data.accessToken as string;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // error.config pode vir undefined (ex.: requisição cancelada antes de ser
    // despachada) — sem originalRequest não tem request pra repetir mesmo.
    if (!originalRequest) return Promise.reject(error);

    const isAuthEndpoint = originalRequest.url === '/auth/refresh' || originalRequest.url === '/auth/login';

    if (error.response?.status === 401 && !isAuthEndpoint) {
      if (originalRequest._retry) {
        // Já tentamos renovar uma vez e o retry caiu em 401 de novo (ex.: conta
        // desativada durante a sessão) — não adianta tentar de novo, encerra a sessão.
        setAccessToken(null);
        window.location.href = '/login';
        return Promise.reject(error);
      }
      originalRequest._retry = true;
      try {
        const newAccessToken = await performRefresh();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError: any) {
        // Só encerra a sessão se o backend recusou o refresh de verdade (token
        // inválido/expirado/revogado, 401/403). Erro de rede ou 5xx (deploy,
        // cold start do Railway) não significa sessão inválida — não faz
        // sentido derrubar um admin com cookie de refresh ainda bom por causa
        // de uma falha transitória do backend.
        const refreshStatus = refreshError?.response?.status;
        if (refreshStatus === 401 || refreshStatus === 403) {
          setAccessToken(null);
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
