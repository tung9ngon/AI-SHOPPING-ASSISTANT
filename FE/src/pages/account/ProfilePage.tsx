import { useEffect, useState } from 'react';
import {
  App,
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Skeleton,
  Space,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import {
  UserOutlined,
  SaveOutlined,
  MailOutlined,
  PhoneOutlined,
  PictureOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { profileApi } from '../../api/profile';
import { categoryApi } from '../../api/categories';
import { productApi } from '../../api/products';
import { getErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import type { MeAccount, ShoppingProfile, UserPreferences } from '../../types';

const { Title, Text } = Typography;

const AGE_RANGES = ['<18', '18-24', '25-34', '35-44', '45-54', '55+'];

function formatDate(iso?: string) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

// ================= Tab 1: Thông tin tài khoản =================
function AccountInfoTab() {
  const { message } = App.useApp();
  const { user, setUser } = useAuth();
  const [form] = Form.useForm();
  const [me, setMe] = useState<MeAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  useEffect(() => {
    profileApi
      .getMe()
      .then((res) => {
        setMe(res.data);
        form.setFieldsValue({
          full_name: res.data.full_name,
          phone_number: res.data.phone_number ?? '',
          avatar_url: res.data.avatar_url ?? '',
        });
        setAvatarPreview(res.data.avatar_url ?? '');
      })
      .catch((err) => message.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onFinish = async (values: {
    full_name: string;
    phone_number?: string;
    avatar_url?: string;
  }) => {
    setSaving(true);
    try {
      await profileApi.updateMe({
        full_name: values.full_name.trim(),
        // Chuỗi rỗng -> gửi rỗng để BE xoá; BE validate SĐT nếu có ký tự
        phone_number: values.phone_number?.trim() || undefined,
        avatar_url: values.avatar_url?.trim() || undefined,
      });
      message.success('Đã cập nhật thông tin tài khoản');
      // Đồng bộ header (avatar + tên) qua AuthContext
      if (user) {
        setUser({
          ...user,
          full_name: values.full_name.trim(),
          avatar_url: values.avatar_url?.trim() || null,
        });
      }
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Skeleton active avatar paragraph={{ rows: 6 }} />;

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} md={9}>
        <Card>
          <Space direction="vertical" align="center" style={{ width: '100%' }} size="middle">
            <Avatar
              size={104}
              src={avatarPreview || undefined}
              icon={<UserOutlined />}
              style={{ backgroundColor: '#ff6a00' }}
            />
            <Title level={4} style={{ margin: 0, textAlign: 'center' }}>
              {me?.full_name}
            </Title>
            <Tag icon={<CrownOutlined />} color={me?.role === 'admin' ? 'gold' : 'blue'}>
              {me?.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
            </Tag>
          </Space>
          <Divider />
          <Descriptions column={1} size="small" colon={false}>
            <Descriptions.Item label={<Text type="secondary">Email</Text>}>
              <Space>
                <MailOutlined />
                {me?.email || '—'}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label={<Text type="secondary">Trạng thái</Text>}>
              <Tag color={me?.is_active ? 'green' : 'red'}>
                {me?.is_active ? 'Đang hoạt động' : 'Đã khoá'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={<Text type="secondary">Ngày tham gia</Text>}>
              {formatDate(me?.created_at)}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>

      <Col xs={24} md={15}>
        <Card title="Chỉnh sửa thông tin">
          <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
            <Form.Item label="Email" tooltip="Email đăng nhập không thể thay đổi">
              <Input prefix={<MailOutlined />} value={me?.email ?? ''} disabled />
            </Form.Item>

            <Form.Item
              name="full_name"
              label="Họ và tên"
              rules={[
                { required: true, message: 'Vui lòng nhập họ tên' },
                { max: 150, message: 'Tối đa 150 ký tự' },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
            </Form.Item>

            <Form.Item
              name="phone_number"
              label="Số điện thoại"
              rules={[
                {
                  pattern: /^[0-9+ ]{8,15}$/,
                  message: 'Số điện thoại 8-15 ký tự (chỉ số, +, khoảng trắng)',
                },
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="0901234567" allowClear />
            </Form.Item>

            <Form.Item
              name="avatar_url"
              label="Ảnh đại diện (URL)"
              rules={[{ type: 'url', message: 'URL không hợp lệ' }]}
            >
              <Input
                prefix={<PictureOutlined />}
                placeholder="https://..."
                allowClear
                onChange={(e) => setAvatarPreview(e.target.value.trim())}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
                Lưu thay đổi
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}

// ================= Tab 2: Sở thích mua sắm =================
function PreferencesTab() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<{ label: string; value: string }[]>([]);
  const [brandOptions, setBrandOptions] = useState<{ label: string; value: string }[]>([]);
  const [intentSummary, setIntentSummary] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      profileApi.getProfile(),
      profileApi.getPreferences(),
      categoryApi.list().catch(() => ({ data: [] as { name: string }[] })),
      productApi.brands().catch(() => ({ data: [] as string[] })),
    ])
      .then(([profileRes, prefRes, catRes, brandRes]) => {
        const profile: ShoppingProfile = profileRes.data;
        const pref: UserPreferences = prefRes.data;
        setIntentSummary(pref.last_intent_summary);
        setCategoryOptions(
          (catRes.data ?? []).map((c) => ({ label: c.name, value: c.name })),
        );
        setBrandOptions((brandRes.data ?? []).map((b) => ({ label: b, value: b })));
        form.setFieldsValue({
          occupation: profile.occupation ?? '',
          age_range: profile.age_range ?? undefined,
          interests: profile.interests ?? [],
          preferred_categories: pref.preferred_categories ?? [],
          preferred_brands: pref.preferred_brands ?? [],
          budget_min: pref.budget_range?.min,
          budget_max: pref.budget_range?.max,
        });
      })
      .catch((err) => message.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onFinish = async (values: {
    occupation?: string;
    age_range?: string;
    interests?: string[];
    preferred_categories?: string[];
    preferred_brands?: string[];
    budget_min?: number;
    budget_max?: number;
  }) => {
    // Kiểm tra khoảng ngân sách hợp lệ
    const hasMin = values.budget_min != null;
    const hasMax = values.budget_max != null;
    if (hasMin !== hasMax) {
      message.error('Vui lòng nhập đủ cả ngân sách tối thiểu và tối đa');
      return;
    }
    if (hasMin && hasMax && (values.budget_min as number) > (values.budget_max as number)) {
      message.error('Ngân sách tối thiểu phải nhỏ hơn hoặc bằng tối đa');
      return;
    }

    setSaving(true);
    try {
      await Promise.all([
        profileApi.updateProfile({
          occupation: values.occupation?.trim() || undefined,
          age_range: values.age_range || undefined,
          interests: values.interests ?? [],
        }),
        profileApi.updatePreferences({
          preferred_categories: values.preferred_categories ?? [],
          preferred_brands: values.preferred_brands ?? [],
          budget_range:
            hasMin && hasMax
              ? { min: values.budget_min as number, max: values.budget_max as number }
              : undefined,
        }),
      ]);
      message.success('Đã lưu sở thích mua sắm');
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Skeleton active paragraph={{ rows: 8 }} />;

  return (
    <Card>
      <Text type="secondary">
        Thông tin này giúp trợ lý AI gợi ý sản phẩm phù hợp hơn với bạn.
      </Text>
      <Divider />
      <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="occupation" label="Nghề nghiệp" rules={[{ max: 100 }]}>
              <Input placeholder="VD: Lập trình viên, Sinh viên..." allowClear />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="age_range" label="Độ tuổi">
              <Select
                placeholder="Chọn nhóm tuổi"
                allowClear
                options={AGE_RANGES.map((r) => ({ label: r, value: r }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="interests" label="Sở thích">
          <Select
            mode="tags"
            placeholder="Nhập sở thích rồi Enter (VD: gaming, nhiếp ảnh...)"
            tokenSeparators={[',']}
          />
        </Form.Item>

        <Form.Item name="preferred_categories" label="Danh mục quan tâm">
          <Select
            mode="tags"
            placeholder="Chọn hoặc nhập danh mục"
            options={categoryOptions}
            tokenSeparators={[',']}
          />
        </Form.Item>

        <Form.Item name="preferred_brands" label="Thương hiệu yêu thích">
          <Select
            mode="tags"
            placeholder="Chọn hoặc nhập thương hiệu"
            options={brandOptions}
            tokenSeparators={[',']}
          />
        </Form.Item>

        <Form.Item label="Khoảng ngân sách (VND)">
          <Space.Compact style={{ width: '100%' }}>
            <Form.Item name="budget_min" noStyle>
              <InputNumber<number>
                style={{ width: '50%' }}
                min={0}
                placeholder="Tối thiểu"
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(v) => (v ? Number(v.replace(/,/g, '')) : 0)}
              />
            </Form.Item>
            <Form.Item name="budget_max" noStyle>
              <InputNumber<number>
                style={{ width: '50%' }}
                min={0}
                placeholder="Tối đa"
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(v) => (v ? Number(v.replace(/,/g, '')) : 0)}
              />
            </Form.Item>
          </Space.Compact>
        </Form.Item>

        {intentSummary && (
          <Form.Item label="Nhu cầu gần đây (AI ghi nhận)">
            <Input.TextArea value={intentSummary} readOnly autoSize={{ minRows: 1, maxRows: 3 }} />
          </Form.Item>
        )}

        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
            Lưu sở thích
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

// ================= Trang chính =================
export default function ProfilePage() {
  return (
    <div>
      <Title level={3} style={{ marginBottom: 16 }}>
        Tài khoản của tôi
      </Title>
      <Tabs
        defaultActiveKey="account"
        items={[
          { key: 'account', label: 'Thông tin tài khoản', children: <AccountInfoTab /> },
          { key: 'preferences', label: 'Sở thích mua sắm', children: <PreferencesTab /> },
        ]}
      />
    </div>
  );
}
