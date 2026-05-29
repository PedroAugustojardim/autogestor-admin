import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const { Title } = Typography;

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', values);
      localStorage.setItem('@autogestor-admin:token', data.accessToken);
      navigate('/');
    } catch {
      message.error('Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Card style={{ width: 400 }}>
        <Title level={3} style={{ textAlign: 'center', color: '#1B5E20', marginBottom: 24 }}>
          AutoGestor Admin
        </Title>
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
      </Card>
    </div>
  );
}
