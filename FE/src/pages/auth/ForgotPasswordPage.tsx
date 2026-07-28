import { Form, Input, Button, App, Steps } from 'antd';
import { MailOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import AuthLayout from './AuthLayout';
import { emailRules, passwordRules } from './passwordRule';
import { authApi } from '../../api/auth';
import { getErrorMessage } from '../../api/client';

const OTP_COOLDOWN_SEC = 60; // chặn gửi OTP dồn dập; khớp thời hạn OTP 5 phút ở BE

export default function ForgotPasswordPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    },
    [],
  );

  const startCooldown = () => {
    setCooldown(OTP_COOLDOWN_SEC);
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    cooldownTimer.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          if (cooldownTimer.current) clearInterval(cooldownTimer.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const sendOtp = async (values: { email: string }) => {
    if (cooldown > 0) return;
    setLoading(true);
    try {
      await authApi.forgotPassword(values.email);
      setEmail(values.email);
      message.success('Nếu email tồn tại, mã OTP đã được gửi');
      setStep(1);
      startCooldown();
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (values: { otp: string }) => {
    setLoading(true);
    try {
      await authApi.verifyResetOtp(email, values.otp);
      message.success('Xác thực OTP thành công');
      setStep(2);
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (values: { password: string }) => {
    setLoading(true);
    try {
      await authApi.resetPassword(email, values.password);
      message.success('Đặt lại mật khẩu thành công, mời đăng nhập');
      navigate('/login');
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Quên mật khẩu" subtitle="Đặt lại mật khẩu qua email">
      <Steps
        size="small"
        current={step}
        items={[{ title: 'Email' }, { title: 'OTP' }, { title: 'Mật khẩu mới' }]}
        style={{ marginBottom: 24 }}
      />

      {step === 0 && (
        <Form layout="vertical" onFinish={sendOtp} requiredMark={false}>
          <Form.Item name="email" label="Email" rules={emailRules}>
            <Input prefix={<MailOutlined />} placeholder="email@example.com" size="large" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
            disabled={cooldown > 0}
          >
            {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : 'Gửi mã OTP'}
          </Button>
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
            Gửi lại / đổi email
          </Button>
        </Form>
      )}

      {step === 2 && (
        <Form layout="vertical" onFinish={resetPassword} requiredMark={false}>
          <Form.Item name="password" label="Mật khẩu mới" rules={passwordRules}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" size="large" />
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
            Đặt lại mật khẩu
          </Button>
        </Form>
      )}

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <Link to="/login">Quay lại đăng nhập</Link>
      </div>
    </AuthLayout>
  );
}
