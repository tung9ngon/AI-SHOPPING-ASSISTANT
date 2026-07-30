import { useEffect, useState } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
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
  Upload,
} from 'antd';
import {
  UserOutlined,
  SaveOutlined,
  MailOutlined,
  PhoneOutlined,
  UploadOutlined,
  DeleteOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { profileApi } from '../../api/profile';
import { categoryApi } from '../../api/categories';
import { productApi } from '../../api/products';
import { getErrorMessage } from '../../api/client';
import { formatDateShort } from '../../utils/format';
import { phoneRule } from '../../utils/validators';
import { useAuth } from '../../context/AuthContext';
import type { MeAccount, ShoppingProfile, UserPreferences } from '../../types';
import AddressBookPage from './AddressBookPage';

const { Title, Text } = Typography;

const AGE_RANGES = ['<18', '18-24', '25-34', '35-44', '45-54', '55+'];

const AVATAR_MAX_MB = 5; // giới hạn kích thước file gốc trước khi nén

// Đọc file ảnh -> thu nhỏ về tối đa `max` px (giữ tỉ lệ) -> data URL JPEG.
// Vì BE không có endpoint upload file (không chạm BE), ta lưu ảnh dưới dạng
// base64 vào cột avatar_url (kiểu 'text'). Nén nhỏ để payload/localStorage gọn.
function fileToResizedDataUrl(file: File, max = 256, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không đọc được file ảnh'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('File ảnh không hợp lệ'));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Trình duyệt không hỗ trợ xử lý ảnh'));
        // Nền trắng để tránh vùng trong suốt (PNG) thành đen khi xuất JPEG
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ================= Tab 1: Thông tin tài khoản =================
function AccountInfoTab() {
  const { message } = App.useApp();
  const { user, setUser } = useAuth();
  const [form] = Form.useForm();
  const [me, setMe] = useState<MeAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false); // đang nén ảnh vừa chọn
  // Ảnh đại diện quản lý bằng state (không còn ô nhập URL): '' = không có ảnh.
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [initialAvatar, setInitialAvatar] = useState<string>('');

  useEffect(() => {
    let ignore = false;
    profileApi
      .getMe()
      .then((res) => {
        if (ignore) return;
        setMe(res.data);
        form.setFieldsValue({
          full_name: res.data.full_name,
          phone_number: res.data.phone_number ?? '',
        });
        setAvatarUrl(res.data.avatar_url ?? '');
        setInitialAvatar(res.data.avatar_url ?? '');
      })
      .catch((err) => {
        if (!ignore) message.error(getErrorMessage(err));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Người dùng chọn ảnh từ máy: validate -> nén -> preview. Trả false để antd
  // KHÔNG tự upload (không có endpoint BE); ảnh chỉ nằm ở FE tới khi bấm Lưu.
  const beforeUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng chọn một tệp ảnh');
      return Upload.LIST_IGNORE;
    }
    if (file.size > AVATAR_MAX_MB * 1024 * 1024) {
      message.error(`Ảnh phải nhỏ hơn ${AVATAR_MAX_MB}MB`);
      return Upload.LIST_IGNORE;
    }
    setProcessing(true);
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      setAvatarUrl(dataUrl);
    } catch (err) {
      message.error((err as Error).message || 'Không xử lý được ảnh');
    } finally {
      setProcessing(false);
    }
    return Upload.LIST_IGNORE;
  };

  const onFinish = async (values: { full_name: string; phone_number?: string }) => {
    setSaving(true);
    try {
      const avatarChanged = avatarUrl !== initialAvatar;
      await profileApi.updateMe({
        full_name: values.full_name.trim(),
        // Luôn gửi (kể cả '') để BE xoá được khi user xoá trắng ô SĐT.
        phone_number: values.phone_number?.trim() ?? '',
        // Chỉ gửi avatar khi có thay đổi ('' để xoá ảnh hiện tại)
        ...(avatarChanged ? { avatar_url: avatarUrl } : {}),
      });
      setInitialAvatar(avatarUrl);
      message.success('Đã cập nhật thông tin tài khoản');
      // Đồng bộ header (avatar + tên) qua AuthContext
      if (user) {
        setUser({
          ...user,
          full_name: values.full_name.trim(),
          avatar_url: avatarUrl || null,
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
              src={avatarUrl || undefined}
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
              {formatDateShort(me?.created_at)}
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
              rules={[phoneRule]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="0901234567" allowClear />
            </Form.Item>

            <Form.Item label="Ảnh đại diện">
              <Space align="center" size="middle">
                <Avatar
                  size={64}
                  src={avatarUrl || undefined}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#ff6a00', flexShrink: 0 }}
                />
                <Space direction="vertical" size={4}>
                  <Space>
                    <Upload
                      accept="image/*"
                      showUploadList={false}
                      maxCount={1}
                      beforeUpload={beforeUpload}
                    >
                      <Button icon={<UploadOutlined />} loading={processing}>
                        {avatarUrl ? 'Đổi ảnh' : 'Tải ảnh lên'}
                      </Button>
                    </Upload>
                    {avatarUrl && (
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        disabled={processing}
                        onClick={() => setAvatarUrl('')}
                      >
                        Xoá ảnh
                      </Button>
                    )}
                  </Space>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    JPG/PNG, tối đa {AVATAR_MAX_MB}MB. Ảnh sẽ được thu nhỏ tự động.
                  </Text>
                </Space>
              </Space>
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
    let ignore = false;
    Promise.all([
      profileApi.getProfile(),
      profileApi.getPreferences(),
      categoryApi.list().catch(() => ({ data: [] as { name: string }[] })),
      productApi.brands().catch(() => ({ data: [] as string[] })),
    ])
      .then(([profileRes, prefRes, catRes, brandRes]) => {
        if (ignore) return;
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
      .catch((err) => {
        if (!ignore) message.error(getErrorMessage(err));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
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
                // Ô trống phải ra undefined (không phải 0) để hasMin/hasMax coi là
                // "chưa nhập", tránh khoá nhầm bằng guard min>max khi user xoá ô.
                parser={(v) => {
                  const raw = (v ?? '').replace(/,/g, '').trim();
                  return raw === '' ? (undefined as unknown as number) : Number(raw);
                }}
              />
            </Form.Item>
            <Form.Item name="budget_max" noStyle>
              <InputNumber<number>
                style={{ width: '50%' }}
                min={0}
                placeholder="Tối đa"
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(v) => {
                  const raw = (v ?? '').replace(/,/g, '').trim();
                  return raw === '' ? (undefined as unknown as number) : Number(raw);
                }}
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
  useDocumentTitle('Tài khoản của tôi');
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
          { key: 'addresses', label: 'Sổ địa chỉ', children: <AddressBookPage /> },
        ]}
      />
    </div>
  );
}
