import { useEffect, useState, useCallback, useRef } from 'react';
import { Typography, Table, Input, Tag, Button, Popconfirm, Space, message, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { PLANO_LABEL, Plano } from '../utils/plano';

const { Title } = Typography;
const { Search } = Input;

interface UserRow {
  id: number;
  name: string;
  email: string;
  plano: Plano;
  blocked: boolean;
  isAdmin: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

const PAGE_SIZE = 20;

export default function Users() {
  const navigate = useNavigate();
  const [items, setItems] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  // Evita que uma resposta antiga (ex.: página 2 lenta) sobrescreva o resultado
  // de uma requisição mais nova (ex.: página 3 ou nova busca) que já chegou.
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users', { params: { page, limit: PAGE_SIZE, search: search || undefined } });
      if (requestId !== requestIdRef.current) return;
      setItems(data.items);
      setTotal(data.total);
    } catch (err: any) {
      if (requestId !== requestIdRef.current) return;
      message.error(err?.response?.data?.error ?? 'Erro ao carregar usuários');
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const toggleBlock = async (user: UserRow) => {
    try {
      await api.patch(`/admin/users/${user.id}/block`, { blocked: !user.blocked });
      message.success(user.blocked ? 'Usuário desbloqueado' : 'Usuário bloqueado');
      load();
    } catch (err: any) {
      message.error(err?.response?.data?.error ?? 'Não foi possível atualizar o usuário');
    }
  };

  const removeUser = async (user: UserRow) => {
    try {
      await api.delete(`/admin/users/${user.id}`);
      message.success('Usuário excluído');
      load();
    } catch (err: any) {
      message.error(err?.response?.data?.error ?? 'Não foi possível excluir o usuário');
    }
  };

  const changePlan = async (user: UserRow, plano: Plano) => {
    try {
      await api.patch(`/admin/users/${user.id}/plan`, { plano });
      message.success('Plano atualizado');
      load();
    } catch (err: any) {
      message.error(err?.response?.data?.error ?? 'Não foi possível atualizar o plano');
    }
  };

  return (
    <div>
      <Title level={4}>Usuários</Title>

      <Search
        placeholder="Buscar por nome ou email"
        allowClear
        style={{ maxWidth: 360, marginBottom: 16 }}
        onSearch={(v) => { setPage(1); setSearch(v); }}
      />

      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        pagination={{ current: page, pageSize: PAGE_SIZE, total, onChange: setPage, showSizeChanger: false }}
        columns={[
          {
            title: 'Nome', dataIndex: 'name', key: 'name',
            render: (name: string, row: UserRow) => (
              <a onClick={() => navigate(`/users/${row.id}`)}>{name}</a>
            ),
          },
          { title: 'Email', dataIndex: 'email', key: 'email' },
          {
            title: 'Plano', dataIndex: 'plano', key: 'plano',
            render: (plano: Plano, row: UserRow) => (
              row.isAdmin ? (
                // Mesma fronteira de proteção da coluna Ações: um admin não deve
                // conseguir alterar o plano de outro admin com um clique aqui.
                <Tag>{PLANO_LABEL[plano]}</Tag>
              ) : (
                <Select
                  size="small"
                  value={plano}
                  style={{ width: 150 }}
                  onChange={(v) => changePlan(row, v)}
                  options={(Object.keys(PLANO_LABEL) as Plano[]).map((p) => ({ value: p, label: PLANO_LABEL[p] }))}
                />
              )
            ),
          },
          {
            title: 'Status', key: 'status',
            render: (_: unknown, row: UserRow) => (
              row.isAdmin
                ? <Tag color="purple">Admin</Tag>
                : row.blocked
                  ? <Tag color="red">Bloqueado</Tag>
                  : <Tag color="green">Ativo</Tag>
            ),
          },
          {
            title: 'Último acesso', dataIndex: 'lastLoginAt', key: 'lastLoginAt',
            render: (v: string | null) => v ? new Date(v).toLocaleString('pt-BR') : '—',
          },
          {
            title: 'Ações', key: 'acoes',
            render: (_: unknown, row: UserRow) => row.isAdmin ? null : (
              <Space>
                <Popconfirm
                  title={row.blocked ? 'Desbloquear este usuário?' : 'Bloquear este usuário?'}
                  onConfirm={() => toggleBlock(row)}
                >
                  <Button size="small">{row.blocked ? 'Desbloquear' : 'Bloquear'}</Button>
                </Popconfirm>
                <Popconfirm title="Excluir este usuário? Esta ação não pode ser desfeita." onConfirm={() => removeUser(row)}>
                  <Button size="small" danger>Excluir</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
    </div>
  );
}
