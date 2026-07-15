import { Form, Input, Button, App } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AuthLayout from './AuthLayout';
import OAuthButtons from './OAuthButtons';
import { emailRules } from './passwordRule';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getErrorMessage } from '../../api/client';

export default function LoginPage() {
  const { login } = useAuth();
  const { refresh } = useCart();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Sau khi đăng nhập, quay lại trang trước đó (nếu bị chặn bởi ProtectedRoute).
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      await refresh();
      message.success('Đăng nhập thành công');
      navigate(from, { replace: true });
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Đăng nhập" subtitle="Chào mừng bạn quay lại 👋">
      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item name="email" label="Email" rules={emailRules}>
          <Input prefix={<MailOutlined />} placeholder="email@example.com" size="large" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
        </Form.Item>

        <div style={{ textAlign: 'right', marginBottom: 12 }}>
          <Link to="/forgot-password">Quên mật khẩu?</Link>
        </div>

        <Button type="primary" htmlType="submit" block size="large" loading={loading}>
          Đăng nhập
        </Button>
      </Form>

      <OAuthButtons />

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
      </div>
    </AuthLayout>
  );
}
