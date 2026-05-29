import React from 'react';
import { Layout, Menu, Typography, Card, Statistic, Row, Col } from 'antd';
import { UserOutlined, CrownOutlined, DollarOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate, Routes, Route } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

function DashboardHome() {
  return (
    <div>
      <Title level={4}>Dashboard</Title>
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic title="Total de Usuários" value={0} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Assinantes Premium" value={0} prefix={<CrownOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Receita Mensal" value={0} prefix="R$" precision={2} />
          </Card>
        </Col>
      </Row>
      <p style={{ marginTop: 24, color: '#9E9E9E' }}>
        Dashboard completo será implementado na Etapa 9.
      </p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const menuItems = [
    { key: '/', icon: <DollarOutlined />, label: 'Dashboard' },
    { key: '/users', icon: <UserOutlined />, label: 'Usuários' },
    { key: '/logout', icon: <LogoutOutlined />, label: 'Sair' },
  ];

  const handleMenu = ({ key }: { key: string }) => {
    if (key === '/logout') {
      localStorage.removeItem('@autogestor-admin:token');
      navigate('/login');
    } else {
      navigate(key);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark">
        <div style={{ padding: '16px', color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
          AutoGestor Admin
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['/']}
          items={menuItems}
          onClick={handleMenu}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px' }}>
          <Title level={5} style={{ margin: '16px 0', color: '#1B5E20' }}>
            Painel Administrativo
          </Title>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8 }}>
          <Routes>
            <Route path="/" element={<DashboardHome />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}
