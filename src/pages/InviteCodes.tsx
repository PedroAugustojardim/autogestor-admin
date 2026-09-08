import { useEffect, useState, useCallback } from 'react';
import { Typography, Table, Tag, Button, Modal, InputNumber, Form, Space, message, Alert } from 'antd';
import { CopyOutlined, PlusOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Title, Paragraph, Text } = Typography;

interface InviteCodeRow {
  id: number;
  usedAt: string | null;
  usedByName: string | null;
  expiresAt: string | null;
  createdAt: string;
  status: 'usado' | 'expirado' | 'disponível';
}

const STATUS_COLOR: Record<InviteCodeRow['status'], string> = {
  usado: 'blue',
  expirado: 'default',
  'disponível': 'green',
};

export default function InviteCodes() {
  const [items, setItems] = useState<InviteCodeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[] | null>(null);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<InviteCodeRow[]>('/admin/invite-codes');
      setItems(data);
    } catch (err: any) {
      message.error(err?.response?.data?.error ?? 'Erro ao carregar códigos de convite');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleGenerate = async (values: { quantidade: number; diasValidade: number }) => {
    setGenerating(true);
    try {
      const { data } = await api.post('/admin/invite-codes', values);
      setGeneratedCodes(data.codigos);
      load();
    } catch (err: any) {
      message.error(err?.response?.data?.error ?? 'Não foi possível gerar os códigos');
    } finally {
      setGenerating(false);
    }
  };

  const copyAll = (codes: string[]) => {
    navigator.clipboard.writeText(codes.join('\n'));
    message.success('Códigos copiados');
  };

  const closeModal = () => {
    setModalOpen(false);
    setGeneratedCodes(null);
    form.resetFields();
  };

  return (
    <div>
      <Title level={4}>Códigos de convite</Title>

      <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)} style={{ marginBottom: 16 }}>
        Gerar códigos
      </Button>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        columns={[
          {
            title: 'Status', dataIndex: 'status',
            render: (v: InviteCodeRow['status']) => <Tag color={STATUS_COLOR[v]}>{v}</Tag>,
          },
          { title: 'Usado por', dataIndex: 'usedByName', render: (v: string | null) => v ?? '—' },
          {
            title: 'Usado em', dataIndex: 'usedAt',
            render: (v: string | null) => v ? new Date(v).toLocaleString('pt-BR') : '—',
          },
          {
            title: 'Expira em', dataIndex: 'expiresAt',
            render: (v: string | null) => v ? new Date(v).toLocaleDateString('pt-BR') : 'nunca',
          },
          {
            title: 'Gerado em', dataIndex: 'createdAt',
            render: (v: string) => new Date(v).toLocaleDateString('pt-BR'),
          },
        ]}
        locale={{ emptyText: 'Nenhum código gerado ainda' }}
      />

      <Modal
        title="Gerar códigos de convite"
        open={modalOpen}
        onCancel={closeModal}
        footer={generatedCodes ? [<Button key="close" onClick={closeModal}>Fechar</Button>] : null}
      >
        {generatedCodes ? (
          <>
            <Alert
              type="warning"
              showIcon
              message="Copie agora — os códigos não ficam visíveis de novo depois de fechar esta janela."
              style={{ marginBottom: 16 }}
            />
            <Space direction="vertical" style={{ width: '100%' }}>
              {generatedCodes.map((c) => (
                <Text key={c} code copyable style={{ fontSize: 16 }}>{c}</Text>
              ))}
            </Space>
            <Button
              icon={<CopyOutlined />}
              style={{ marginTop: 16 }}
              onClick={() => copyAll(generatedCodes)}
            >
              Copiar todos
            </Button>
          </>
        ) : (
          <Form form={form} layout="vertical" onFinish={handleGenerate} initialValues={{ quantidade: 5, diasValidade: 90 }}>
            <Paragraph type="secondary">
              O código aparece em texto puro só nesta tela, uma única vez — a listagem
              nunca mostra o valor de novo (fica guardado só como hash). Copie e envie
              ao convidado antes de fechar.
            </Paragraph>
            <Form.Item name="quantidade" label="Quantidade" rules={[{ required: true }]}>
              <InputNumber min={1} max={50} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="diasValidade" label="Validade (dias)" rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={generating} block>
              Gerar
            </Button>
          </Form>
        )}
      </Modal>
    </div>
  );
}
