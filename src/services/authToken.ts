// accessToken fica só em memória (nunca em localStorage) — some ao dar F5, recuperado
// via refresh silencioso (cookie httpOnly com o refresh token, ver App.tsx). Isso reduz
// a superfície de roubo por XSS: um script injetado não tem como ler uma variável de módulo.
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}
