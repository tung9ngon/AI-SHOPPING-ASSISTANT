import { useState } from 'react';
import type { CSSProperties } from 'react';

// Logo dùng chung cho toàn site. Trỏ tới /logo.png (đặt trong FE/public/).
// Trên nền TỐI (header navy, footer, sidebar admin) truyền prop `white`
// để dùng bản chữ trắng /logo-white.png — nếu không chữ "Nex" (navy) sẽ
// chìm vào nền tối.
// Nếu file ảnh chưa tồn tại / lỗi tải, tự fallback về chữ "NexTech"
// để giao diện không bao giờ bị vỡ.
type LogoProps = {
  height?: number;
  /** true khi đặt trên nền tối — dùng bản wordmark trắng */
  white?: boolean;
  style?: CSSProperties;
  className?: string;
};

export default function Logo({ height = 40, white = false, style, className }: LogoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={className}
        style={{ fontWeight: 800, whiteSpace: 'nowrap', color: white ? '#fff' : '#1a1a2e', ...style }}
      >
        Nex<span style={{ color: '#f26d21' }}>Tech</span>
      </span>
    );
  }

  return (
    <img
      src={white ? '/logo-white.png' : '/logo.png'}
      alt="NexTech"
      className={className}
      onError={() => setFailed(true)}
      style={{
        height,
        width: 'auto',
        display: 'block',
        objectFit: 'contain',
        ...style,
      }}
    />
  );
}
