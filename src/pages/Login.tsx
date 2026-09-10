import React from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { setAccessToken } from '../services/authToken';
import { colors } from '../theme';

const { Title, Text } = Typography;

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', values);
      setAccessToken(data.accessToken);
      navigate('/');
    } catch {
      message.error('Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.bg }}>
      <div
        className="login-brand-panel"
        style={{
          position: 'relative', width: 600, flexShrink: 0, overflow: 'hidden',
          background: `linear-gradient(160deg, ${colors.accent} 0%, #142242 100%)`,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 56,
        }}
      >
        <div style={{
          position: 'absolute', width: 420, height: 420, borderRadius: '50%', top: -120, right: -140,
          background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 16V8a2 2 0 0 1 2-2h9l5 5v5" />
              <circle cx="7.5" cy="17.5" r="2" />
              <circle cx="16.5" cy="17.5" r="2" />
              <path d="M9.5 17.5h5" />
            </svg>
          </div>
          <span style={{ fontSize: 17, color: '#fff', fontWeight: 700 }}>AutoGestor Admin</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 420 }}>
          <Title level={2} style={{ color: '#fff', margin: 0, fontWeight: 800, lineHeight: '40px' }}>
            Gerencie toda a plataforma em um só lugar.
          </Title>
          <Text style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.8)', lineHeight: '22px' }}>
            Usuários, assinaturas, códigos de convite e a saúde do produto — tudo no painel administrativo.
          </Text>
        </div>

        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>© {new Date().getFullYear()} AutoGestor</Text>
      </div>

      <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: 360 }}>
          <Title level={3} style={{ color: colors.textPrimary, marginBottom: 4 }}>Bem-vindo de volta</Title>
          <Text style={{ color: colors.textSecondary, display: 'block', marginBottom: 24 }}>
            Entre com sua conta de administrador
          </Text>

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
              <Input size="large" placeholder="admin@autogestor.com" />
            </Form.Item>
            <Form.Item name="password" label="Senha" rules={[{ required: true }]}>
              <Input.Password size="large" placeholder="Sua senha" />
            </Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              Entrar
            </Button>
          </Form>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .login-brand-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}
