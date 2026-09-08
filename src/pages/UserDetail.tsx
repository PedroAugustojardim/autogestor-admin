import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Descriptions, Table, Tag, Spin, Alert, Button, Card, Row, Col, Statistic } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import api from '../services/api';
import { PLANO_LABEL, PLANO_COLOR, Plano } from '../utils/plano';

const { Title } = Typography;

interface Vehicle {
  id: number;
  tipo: string;
  marca: string;
  modelo: string;
  apelido: string | null;
}

interface Expense {
  id: number;
  valor: string;
  data: string;
  descricao: string | null;
}

interface Payment {
  id: number;
  plano: Plano;
  valor: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface UserDetailData {
  id: number;
  name: string;
  email: string;
  plano: Plano;
  blocked: boolean;
  isAdmin: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  deletedAt: string | null;
  vehicles: Vehicle[];
  expenses: { recentes: Expense[]; totalGasto: number };
  payments: Payment[];
}

const PAYMENT_STATUS_LABEL: Record<Payment['status'], { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'gold' },
  approved: { label: 'Aprovado', color: 'green' },
  rejected: { label: 'Rejeitado', color: 'red' },
};

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<UserDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<UserDetailData>(`/admin/users/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.response?.data?.error ?? 'Não foi possível carregar o usuário'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spin />;
  if (error) return <Alert type="error" message={error} />;
  if (!data) return null;

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/users')} style={{ marginBottom: 16 }}>
        Voltar
      </Button>

      <Title level={4}>{data.name}</Title>

      <Descriptions bordered column={2} size="small" style={{ marginBottom: 24 }}>
        <Descriptions.Item label="Email">{data.email}</Descriptions.Item>
        <Descriptions.Item label="Plano">
          <Tag color={PLANO_COLOR[data.plano]}>{PLANO_LABEL[data.plano]}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          {data.deletedAt ? <Tag color="default">Excluído</Tag>
            : data.blocked ? <Tag color="red">Bloqueado</Tag>
            : <Tag color="green">Ativo</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="Administrador">{data.isAdmin ? 'Sim' : 'Não'}</Descriptions.Item>
        <Descriptions.Item label="Último acesso">
          {data.lastLoginAt ? new Date(data.lastLoginAt).toLocaleString('pt-BR') : '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Cadastrado em">{new Date(data.createdAt).toLocaleDateString('pt-BR')}</Descriptions.Item>
      </Descriptions>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card><Statistic title="Veículos" value={data.vehicles.length} /></Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total gasto registrado"
              value={data.expenses.totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              prefix="R$"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="Pagamentos" value={data.payments.length} /></Card>
        </Col>
      </Row>

      <Title level={5}>Veículos</Title>
      <Table
        rowKey="id"
        dataSource={data.vehicles}
        pagination={false}
        style={{ marginBottom: 24 }}
        columns={[
          { title: 'Tipo', dataIndex: 'tipo' },
          { title: 'Marca', dataIndex: 'marca' },
          { title: 'Modelo', dataIndex: 'modelo' },
          { title: 'Apelido', dataIndex: 'apelido', render: (v: string | null) => v ?? '—' },
        ]}
        locale={{ emptyText: 'Nenhum veículo cadastrado' }}
      />

      <Title level={5}>Gastos recentes</Title>
      <Table
        rowKey="id"
        dataSource={data.expenses.recentes}
        pagination={false}
        style={{ marginBottom: 24 }}
        columns={[
          { title: 'Data', dataIndex: 'data', render: (v: string) => new Date(v).toLocaleDateString('pt-BR') },
          { title: 'Descrição', dataIndex: 'descricao', render: (v: string | null) => v ?? '—' },
          { title: 'Valor', dataIndex: 'valor', render: (v: string) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
        ]}
        locale={{ emptyText: 'Nenhum gasto registrado' }}
      />

      <Title level={5}>Pagamentos</Title>
      <Table
        rowKey="id"
        dataSource={data.payments}
        pagination={false}
        columns={[
          { title: 'Data', dataIndex: 'createdAt', render: (v: string) => new Date(v).toLocaleDateString('pt-BR') },
          { title: 'Plano', dataIndex: 'plano', render: (v: Plano) => PLANO_LABEL[v] },
          { title: 'Valor', dataIndex: 'valor', render: (v: string) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
          {
            title: 'Status', dataIndex: 'status',
            render: (v: Payment['status']) => <Tag color={PAYMENT_STATUS_LABEL[v].color}>{PAYMENT_STATUS_LABEL[v].label}</Tag>,
          },
        ]}
        locale={{ emptyText: 'Nenhum pagamento registrado' }}
      />
    </div>
  );
}
