import { Layout, Menu, Typography } from 'antd';
import { UserOutlined, DashboardOutlined, LogoutOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import api from '../services/api';
import { setAccessToken } from '../services/authToken';
import DashboardHome from './DashboardHome';
import Users from './Users';
import UserDetail from './UserDetail';
import InviteCodes from './InviteCodes';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/users', icon: <UserOutlined />, label: 'Usuários' },
    { key: '/invite-codes', icon: <MailOutlined />, label: 'Convites' },
    { key: '/logout', icon: <LogoutOutlined />, label: 'Sair' },
  ];

  // A rota de detalhe (/users/:id) não tem item próprio no menu — mantém
  // "Usuários" destacado enquanto o admin está vendo o detalhe de alguém.
  const selectedKey = location.pathname.startsWith('/users') ? '/users' : location.pathname;

  const handleMenu = async ({ key }: { key: string }) => {
    if (key === '/logout') {
      try {
        await api.post('/auth/logout', {});
      } catch {}
      setAccessToken(null);
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
          selectedKeys={[selectedKey]}
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
            <Route path="/users" element={<Users />} />
            <Route path="/users/:id" element={<UserDetail />} />
            <Route path="/invite-codes" element={<InviteCodes />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}
