import { Form, Input, Button, App, Steps } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, SafetyOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AuthLayout from './AuthLayout';
import OAuthButtons from './OAuthButtons';
import { emailRules, passwordRules } from './passwordRule';
import { authApi } from '../../api/auth';
import { getErrorMessage } from '../../api/client';

export default function RegisterPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0: email, 1: OTP, 2: đặt mật khẩu
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Bước 1: gửi OTP về email
  const sendOtp = async (values: { email: string }) => {
    setLoading(true);
    try {
      await authApi.sendOtp(values.email);
      setEmail(values.email);
      message.success('Đã gửi OTP tới email của bạn');
      setStep(1);
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: xác thực OTP
  const verifyOtp = async (values: { otp: string }) => {
    setLoading(true);
    try {
      await authApi.verifyOtp(email, values.otp);
      message.success('Xác thực email thành công');
      setStep(2);
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Bước 3: hoàn tất đăng ký
  const register = async (values: { full_name: string; password: string }) => {
    setLoading(true);
    try {
      await authApi.register({ email, password: values.password, full_name: values.full_name });
      message.success('Đăng ký thành công, mời bạn đăng nhập');
      navigate('/login');
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Đăng ký" subtitle="Tạo tài khoản mới">
      <Steps
        size="small"
        current={step}
        items={[{ title: 'Email' }, { title: 'OTP' }, { title: 'Mật khẩu' }]}
        style={{ marginBottom: 24 }}
      />

      {step === 0 && (
        <Form layout="vertical" onFinish={sendOtp} requiredMark={false} initialValues={{ email }}>
          <Form.Item name="email" label="Email" rules={emailRules}>
            <Input prefix={<MailOutlined />} placeholder="email@example.com" size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            Gửi mã OTP
          </Button>
          <OAuthButtons />
        </Form>
      )}

      {step === 1 && (
        <Form layout="vertical" onFinish={verifyOtp} requiredMark={false}>
          <p>
            Nhập mã OTP gồm 6 số đã gửi tới <b>{email}</b> (hết hạn sau 5 phút).
          </p>
          <Form.Item
            name="otp"
            label="Mã OTP"
            rules={[
              { required: true, message: 'Vui lòng nhập OTP' },
              { len: 6, message: 'OTP gồm 6 chữ số' },
            ]}
          >
            <Input prefix={<SafetyOutlined />} placeholder="123456" size="large" maxLength={6} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            Xác thực
          </Button>
          <Button type="link" block onClick={() => setStep(0)}>
            Đổi email / gửi lại
          </Button>
        </Form>
      )}

      {step === 2 && (
        <Form layout="vertical" onFinish={register} requiredMark={false}>
          <Form.Item
            name="full_name"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" size="large" />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={passwordRules}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="Xác nhận mật khẩu"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            Hoàn tất đăng ký
          </Button>
        </Form>
      )}

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </div>
    </AuthLayout>
  );
}
