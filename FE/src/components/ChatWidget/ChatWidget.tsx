import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RobotOutlined,
  CloseOutlined,
  SendOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { productApi, type ProductListItem, type ProductQuery } from '../../api/products';
import { categoryApi } from '../../api/categories';
import type { Category } from '../../types';
import { formatVND } from '../../utils/format';
import './ChatWidget.css';

type Message =
  | { role: 'bot' | 'user'; type: 'text'; text: string }
  | { role: 'bot'; type: 'products'; items: ProductListItem[] };

const SUGGESTIONS = ['Laptop', 'Điện thoại', 'Đồng hồ', 'Dưới 10 triệu'];

const STOPWORDS = new Set([
  'tôi', 'toi', 'muốn', 'muon', 'mua', 'cần', 'can', 'tìm', 'tim', 'kiếm', 'kiem',
  'cho', 'giá', 'gia', 'sản', 'san', 'phẩm', 'pham', 'có', 'co', 'với', 'voi',
  'một', 'mot', 'cái', 'cai', 'chiếc', 'chiec', 'hãy', 'hay', 'gợi', 'goi', 'ý', 'y',
  'khoảng', 'khoang', 'tầm', 'tam', 'từ', 'tu', 'đến', 'den', 'và', 'va', 'là', 'la',
]);

/**
 * "AI" theo luật: trích xuất thương hiệu, danh mục, khoảng giá và từ khoá từ câu
 * của người dùng, rồi tạo query cho GET /api/products.
 * (Chưa phải LLM thật — xem ghi chú trong code base về việc thêm endpoint AI.)
 */
function buildQuery(
  text: string,
  brands: string[],
  categories: Category[],
): ProductQuery {
  const lower = text.toLowerCase();
  const q: ProductQuery = { limit: 4 };

  // Thương hiệu
  const brand = brands.find((b) => lower.includes(b.toLowerCase()));
  if (brand) q.brand = brand;

  // Danh mục (khớp tên danh mục hoặc từ đồng nghĩa phổ biến)
  const SYNONYM: Record<string, string[]> = {
    laptop: ['laptop', 'máy tính', 'may tinh'],
    'điện thoại': ['điện thoại', 'dien thoai', 'phone', 'smartphone'],
    'đồng hồ': ['đồng hồ', 'dong ho', 'watch', 'smartwatch'],
  };
  const cat = categories.find((c) => {
    const key = c.name.toLowerCase();
    const words = SYNONYM[key] ?? [key];
    return words.some((w) => lower.includes(w));
  });
  if (cat) q.categoryId = cat.id;

  // Khoảng giá: "dưới N triệu / nghìn / k"
  const parseAmount = (m: RegExpMatchArray): number => {
    const num = parseFloat(m[1].replace(',', '.'));
    const unit = m[2] || '';
    if (/tri/.test(unit)) return num * 1_000_000;
    if (/ngh|k/.test(unit)) return num * 1_000;
    return num;
  };
  const under = lower.match(/(?:dưới|duoi|<|tối đa|toi da)\s*([\d.,]+)\s*(triệu|trieu|nghìn|nghin|k)?/);
  const over = lower.match(/(?:trên|tren|>|từ|tu)\s*([\d.,]+)\s*(triệu|trieu|nghìn|nghin|k)?/);
  if (under) q.maxPrice = parseAmount(under);
  if (over) q.minPrice = parseAmount(over);

  // Từ khoá còn lại (khi không nhận ra brand/category) -> search theo tên
  if (!q.brand && !q.categoryId) {
    const keyword = lower
      .replace(/[.,!?]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1 && !STOPWORDS.has(w) && !/^\d+$/.test(w))
      .sort((a, b) => b.length - a.length)[0];
    if (keyword) q.search = keyword;
  }

  return q;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      type: 'text',
      text: 'Xin chào 👋 Mình là trợ lý AI của AI Shop. Bạn đang tìm sản phẩm gì? (VD: "laptop Dell", "điện thoại dưới 10 triệu")',
    },
  ]);
  const brandsRef = useRef<string[]>([]);
  const catsRef = useRef<Category[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Tải sẵn brand + category để "hiểu" câu hỏi
  useEffect(() => {
    productApi.brands().then((r) => (brandsRef.current = r.data)).catch(() => {});
    categoryApi.list().then((r) => (catsRef.current = r.data)).catch(() => {});
  }, []);

  // Tự cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, open]);

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || typing) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', type: 'text', text }]);
    setTyping(true);

    try {
      const query = buildQuery(text, brandsRef.current, catsRef.current);
      const res = await productApi.list(query);
      const items = res.data.items ?? [];
      // Trễ nhẹ cho tự nhiên
      await new Promise((r) => setTimeout(r, 450));

      if (items.length > 0) {
        setMessages((m) => [
          ...m,
          { role: 'bot', type: 'text', text: `Mình tìm thấy ${res.data.total} sản phẩm phù hợp. Vài gợi ý cho bạn:` },
          { role: 'bot', type: 'products', items },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          {
            role: 'bot',
            type: 'text',
            text: 'Mình chưa tìm thấy sản phẩm phù hợp 😥. Bạn thử từ khoá khác như "laptop", "điện thoại" hoặc nêu khoảng giá nhé.',
          },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'bot', type: 'text', text: 'Có lỗi khi tìm kiếm, bạn thử lại giúp mình nhé.' },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      {!open && (
        <button className="chat-fab" onClick={() => setOpen(true)} aria-label="Chat với trợ lý AI">
          <RobotOutlined />
          <span className="chat-fab__dot" />
        </button>
      )}

      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <div className="chat-header__avatar">
              <RobotOutlined />
            </div>
            <div>
              <div className="chat-header__title">Trợ lý AI</div>
              <div className="chat-header__status">Trực tuyến</div>
            </div>
            <button className="chat-header__close" onClick={() => setOpen(false)} aria-label="Đóng">
              <CloseOutlined />
            </button>
          </div>

          <div className="chat-body" ref={bodyRef}>
            {messages.map((msg, i) =>
              msg.type === 'products' ? (
                <div className="chat-products" key={i}>
                  {msg.items.map((p) => (
                    <div
                      className="chat-product"
                      key={p.id}
                      onClick={() => {
                        navigate(`/products/${p.id}`);
                        setOpen(false);
                      }}
                    >
                      {p.primary_image ? (
                        <img className="chat-product__img" src={p.primary_image} alt="" />
                      ) : (
                        <div className="chat-product__img">
                          <PictureOutlined />
                        </div>
                      )}
                      <div style={{ minWidth: 0 }}>
                        <div className="chat-product__name">{p.name}</div>
                        <div className="chat-product__price">{formatVND(p.price)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`chat-msg chat-msg--${msg.role}`} key={i}>
                  {msg.text}
                </div>
              ),
            )}
            {typing && (
              <div className="chat-typing">
                <span />
                <span />
                <span />
              </div>
            )}
          </div>

          {/* Gợi ý nhanh chỉ hiện khi hội thoại còn ngắn */}
          {messages.length <= 2 && (
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s) => (
                <button className="chat-chip" key={s} onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Nhập nhu cầu của bạn..."
            />
            <button onClick={() => send()} disabled={!input.trim() || typing} aria-label="Gửi">
              <SendOutlined />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
