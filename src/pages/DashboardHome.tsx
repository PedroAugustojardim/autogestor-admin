import { useEffect, useState } from 'react';
import { Typography, Card, Statistic, Row, Col, Spin, Alert } from 'antd';
import { UserOutlined, CrownOutlined, DollarOutlined, RiseOutlined, CarOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Title } = Typography;

interface Stats {
  usuarios: { total: number; novosNoMes: number; ativos7Dias: number; ativos30Dias: number };
  assinantes: { premiumMensal: number; premiumAnual: number; total: number; taxaConversao: number };
  receita: { mensal: number; anual: number };
  veiculosPorTipo: { tipo: string; quantidade: number }[];
}

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function DashboardHome() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Stats>('/admin/stats')
      .then(({ data }) => setStats(data))
      .catch((err) => setError(err?.response?.data?.error ?? 'Não foi possível carregar as métricas'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin />;
  if (error) return <Alert type="error" message={error} />;
  if (!stats) return null;

  return (
    <div>
      <Title level={4}>Dashboard</Title>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Total de usuários" value={stats.usuarios.total} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Novos este mês" value={stats.usuarios.novosNoMes} prefix={<RiseOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Ativos (7 dias)" value={stats.usuarios.ativos7Dias} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Ativos (30 dias)" value={stats.usuarios.ativos30Dias} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Assinantes Premium" value={stats.assinantes.total} prefix={<CrownOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Taxa de conversão" value={stats.assinantes.taxaConversao} suffix="%" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Receita mensal" value={formatBRL(stats.receita.mensal)} prefix="R$" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Receita anual" value={formatBRL(stats.receita.anual)} prefix={<DollarOutlined />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title={<span><CarOutlined /> Veículos por tipo</span>}>
            <Row gutter={16}>
              {stats.veiculosPorTipo.length > 0 ? stats.veiculosPorTipo.map((v) => (
                <Col span={6} key={v.tipo}>
                  <Statistic title={v.tipo} value={v.quantidade} />
                </Col>
              )) : <Col span={24}>Nenhum veículo cadastrado ainda.</Col>}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
