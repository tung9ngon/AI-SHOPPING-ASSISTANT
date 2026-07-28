import { useEffect, useRef, type ReactNode, type CSSProperties } from 'react';

/**
 * ScrollReveal — bọc nội dung và thêm hiệu ứng fade-in từ dưới lên khi vào viewport.
 * Dùng IntersectionObserver, không cần thư viện ngoài.
 *
 * Props:
 * - delay: ms delay trước khi animation bắt đầu (dùng cho stagger effect)
 * - threshold: tỉ lệ phần tử cần hiện trong viewport để trigger (0–1)
 * - className / style: pass-through
 */
export default function ScrollReveal({
  children,
  delay = 0,
  threshold = 0.15,
  className = '',
  style,
}: {
  children: ReactNode;
  delay?: number;
  threshold?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Delay cho stagger effect
          setTimeout(() => {
            el.classList.add('sr-visible');
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold]);

  return (
    <div
      ref={ref}
      className={`sr-wrapper ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
