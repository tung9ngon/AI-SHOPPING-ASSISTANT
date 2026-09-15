import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  BellOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import Logo from '../../components/Logo';
import './AuthLayout.css';

// Lý do nên có tài khoản — đặt cạnh biểu mẫu để người dùng biết mình đổi lấy gì
// khi bỏ công đăng ký, thay vì chỉ thấy một ô nhập trống.
const POINTS = [
  { icon: <RobotOutlined />, text: 'Trợ lý AI gợi ý sản phẩm theo nhu cầu và ngân sách' },
  { icon: <BellOutlined />, text: 'Theo dõi giá, báo ngay khi sản phẩm giảm' },
  { icon: <SafetyCertificateOutlined />, text: 'Hàng chính hãng, bảo hành toàn quốc' },
];

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  /** Dòng điều hướng cuối thẻ (vd "Chưa có tài khoản? Đăng ký ngay") */
  footer?: ReactNode;
}) {
  return (
    <div className="auth">
      {/* ===== Cột thương hiệu (ẩn trên màn hẹp) ===== */}
      <aside className="auth__brand">
        <div className="auth__rings" aria-hidden="true" />

        <Link to="/" className="auth__logo" aria-label="NexTech — về trang chủ">
          <Logo white height={46} />
        </Link>

        <h2 className="auth__tagline">
          Mua công nghệ <em>thông minh hơn</em>
        </h2>

        <ul className="auth__points">
          {POINTS.map((p) => (
            <li className="auth__point" key={p.text}>
              <span aria-hidden="true">{p.icon}</span>
              {p.text}
            </li>
          ))}
        </ul>
      </aside>

      {/* ===== Cột biểu mẫu ===== */}
      <main className="auth__panel">
        <div className="auth__card">
          <Link to="/" className="auth__back">
            <ArrowLeftOutlined aria-hidden="true" /> Về trang chủ
          </Link>

          <Link to="/" className="auth__mobile-logo" aria-label="NexTech — về trang chủ">
            <Logo height={40} />
          </Link>

          <h1 className="auth__title">{title}</h1>
          {subtitle && <p className="auth__subtitle">{subtitle}</p>}

          {children}

          {footer && <div className="auth__foot">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
