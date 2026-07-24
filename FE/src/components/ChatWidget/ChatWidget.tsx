import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RobotOutlined,
  CloseOutlined,
  SendOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import type { ProductListItem } from '../../api/products';
import { chatApi, type ChatHistoryItem } from '../../api/chat';
import { getErrorMessage } from '../../api/client';
import { formatVND } from '../../utils/format';
import './ChatWidget.css';

type Message =
  | { role: 'bot' | 'user'; type: 'text'; text: string }
  | { role: 'bot'; type: 'products'; items: ProductListItem[] };

const SUGGESTIONS = ['Laptop cho sinh viên', 'Điện thoại dưới 10 triệu', 'Có hãng nào?', 'Đồng hồ thông minh'];

const WELCOME =
  'Xin chào 👋 Mình là trợ lý AI của AI Shop. Bạn đang tìm sản phẩm gì? Mình có thể tư vấn laptop, điện thoại, đồng hồ... theo nhu cầu và ngân sách của bạn.';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', type: 'text', text: WELCOME },
  ]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Tự cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, open]);

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || typing) return;
    setInput('');

    // Lịch sử cho AI (chỉ text, tính TRƯỚC khi thêm tin nhắn mới).
    const history: ChatHistoryItem[] = messages
      .filter((m): m is Extract<Message, { type: 'text' }> => m.type === 'text')
      .map((m) => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text }));

    setMessages((m) => [...m, { role: 'user', type: 'text', text }]);
    setTyping(true);

    try {
      const res = await chatApi.send(text, history);
      const { reply, products } = res.data;
      setMessages((m) => {
        const next: Message[] = [...m];
        if (reply) next.push({ role: 'bot', type: 'text', text: reply });
        if (products && products.length > 0) {
          next.push({ role: 'bot', type: 'products', items: products });
        }
        return next;
      });
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: 'bot', type: 'text', text: getErrorMessage(err) },
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
          {messages.length <= 1 && (
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
              placeholder="Nhập câu hỏi của bạn..."
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
