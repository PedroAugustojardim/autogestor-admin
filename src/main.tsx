import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme } from 'antd';
import ptBR from 'antd/locale/pt_BR';
import App from './App';
import { colors } from './theme';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      locale={ptBR}
      theme={{
        algorithm: antdTheme.darkAlgorithm,
        token: {
          colorPrimary: colors.accent,
          colorBgLayout: colors.bg,
          colorBgContainer: colors.surface,
          colorBgElevated: colors.surface,
          colorBorderSecondary: colors.border,
          colorText: colors.textPrimary,
          colorTextSecondary: colors.textSecondary,
          borderRadius: 10,
        },
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
);
