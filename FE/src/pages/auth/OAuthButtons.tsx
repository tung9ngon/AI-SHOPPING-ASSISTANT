import { Button, Divider } from 'antd';
import { GoogleOutlined, FacebookFilled } from '@ant-design/icons';
import { authApi } from '../../api/auth';

// Bắt đầu luồng OAuth bằng cách điều hướng CẢ trình duyệt sang backend
// (không dùng axios) để backend redirect sang Google/Facebook rồi quay lại.
export default function OAuthButtons() {
  return (
    <>
      <Divider plain>hoặc</Divider>
      <Button
        block
        icon={<GoogleOutlined />}
        style={{ marginBottom: 12 }}
        onClick={() => {
          window.location.href = authApi.googleUrl;
        }}
      >
        Tiếp tục với Google
      </Button>
      <Button
        block
        icon={<FacebookFilled />}
        onClick={() => {
          window.location.href = authApi.facebookUrl;
        }}
      >
        Tiếp tục với Facebook
      </Button>
    </>
  );
}
