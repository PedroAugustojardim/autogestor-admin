import { Layout, Menu } from 'antd';
import { UserOutlined, DashboardOutlined, LogoutOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import api from '../services/api';
import { setAccessToken } from '../services/authToken';
import { colors } from '../theme';
import DashboardHome from './DashboardHome';
import Users from './Users';
import UserDetail from './UserDetail';
import InviteCodes from './InviteCodes';

const { Header, Sider, Content } = Layout;

function CarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 16V8a2 2 0 0 1 2-2h9l5 5v5" />
      <circle cx="7.5" cy="17.5" r="2" />
      <circle cx="16.5" cy="17.5" r="2" />
      <path d="M9.5 17.5h5" />
    </svg>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/users', icon: <UserOutlined />, label: 'Usuários' },
    { key: '/invite-codes', icon: <MailOutlined />, label: 'Convites' },
  ];

  // A rota de detalhe (/users/:id) não tem item próprio no menu — mantém
  // "Usuários" destacado enquanto o admin está vendo o detalhe de alguém.
  const selectedKey = location.pathname.startsWith('/users') ? '/users' : location.pathname;

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch {}
    setAccessToken(null);
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={264} style={{ background: colors.surface, height: '100vh', position: 'sticky', top: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '22px 18px 4px' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CarIcon />
          </div>
          <span style={{ fontSize: 17, color: colors.textPrimary, fontWeight: 700 }}>AutoGestor</span>
        </div>

        <div style={{ padding: '22px 22px 6px', fontSize: 11, color: colors.textTertiary, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
          Geral
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ background: 'transparent', border: 'none', flexGrow: 1 }}
        />

        <div
          style={{
            marginTop: 'auto', margin: 14, display: 'flex', alignItems: 'center', gap: 12,
            padding: 12, borderRadius: 14, background: colors.bg, border: `1px solid ${colors.border}`,
          }}
        >
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: colors.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 13, color: colors.textPrimary, fontWeight: 700 }}>AD</span>
          </div>
          <span style={{ fontSize: 13, color: colors.textPrimary, fontWeight: 600, flexGrow: 1 }}>Administrador</span>
          <LogoutOutlined onClick={handleLogout} style={{ color: colors.textSecondary, cursor: 'pointer', fontSize: 15 }} />
        </div>
      </Sider>
      <Layout>
        <Header style={{ background: colors.surface, padding: '0 24px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: colors.accent }}>Painel Administrativo</span>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: colors.surface, borderRadius: 12 }}>
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
