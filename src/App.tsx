import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import api from './services/api';
import { getAccessToken, setAccessToken } from './services/authToken';

// Páginas — serão implementadas na Etapa 9
const LoginPage = React.lazy(() => import('./pages/Login'));
const DashboardPage = React.lazy(() => import('./pages/Dashboard'));

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return getAccessToken() ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  // accessToken vive só em memória (authToken.ts) — some ao dar F5. Ao montar,
  // tenta um refresh silencioso usando o cookie httpOnly do refresh token.
  const [ready, setReady] = React.useState(false);
  // React.StrictMode invoca efeitos sem cleanup duas vezes seguidas em dev —
  // sem essa guarda, dois POST /auth/refresh concorrentes disputam o mesmo
  // cookie rotativo de refresh token e um deles pode invalidar uma sessão válida.
  const didRunRef = React.useRef(false);

  React.useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;
    api
      .post('/auth/refresh', {})
      .then(({ data }) => setAccessToken(data.accessToken))
      .catch(() => setAccessToken(null))
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return <Spin fullscreen />;
  }

  return (
    <React.Suspense fallback={<Spin fullscreen />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </React.Suspense>
  );
}
