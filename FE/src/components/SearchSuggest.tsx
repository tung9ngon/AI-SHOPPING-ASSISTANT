import { useRef, useState } from 'react';
import { AutoComplete, Input } from 'antd';
import { PictureOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../api/products';
import type { ProductListItem } from '../api/products';
import { getItems } from '../types';
import { formatVND } from '../utils/format';
import './SearchSuggest.css';

const SUGGEST_LIMIT = 6;
const DEBOUNCE_MS = 250;

/**
 * Ô tìm kiếm trên header, kèm dropdown gợi ý sản phẩm khi đang gõ.
 *
 * Hành vi: gõ ký tự -> gợi ý hiện ra (chọn 1 gợi ý là nhảy thẳng vào trang
 * chi tiết sản phẩm đó); bấm nút tìm / Enter khi không chọn gợi ý nào mới
 * điều hướng sang trang kết quả tìm kiếm.
 */
export default function SearchSuggest({
  size = 'middle',
  onNavigate,
}: {
  size?: 'middle' | 'large';
  onNavigate?: () => void;
}) {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [items, setItems] = useState<ProductListItem[]>([]);
  const timer = useRef<number | undefined>(undefined);
  // Truy vấn mới nhất đã gửi đi — response về muộn của truy vấn cũ bị bỏ qua,
  // tránh gợi ý "nhảy ngược" khi gõ nhanh.
  const lastQuery = useRef('');

  const fetchSuggest = (value: string) => {
    window.clearTimeout(timer.current);
    const q = value.trim();
    lastQuery.current = q;
    if (!q) {
      setItems([]);
      return;
    }
    timer.current = window.setTimeout(() => {
      productApi
        .list({ search: q, limit: SUGGEST_LIMIT })
        .then((res) => {
          if (lastQuery.current === q) setItems(getItems(res.data));
        })
        .catch(() => {});
    }, DEBOUNCE_MS);
  };

  // Bấm nút tìm / Enter: sang trang danh sách với từ khoá hiện tại.
  const goSearch = (value: string) => {
    window.clearTimeout(timer.current);
    lastQuery.current = '';
    setItems([]);
    const q = value.trim();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
    onNavigate?.();
  };

  // Chọn 1 gợi ý: vào thẳng trang chi tiết sản phẩm đó.
  const goProduct = (id: string) => {
    window.clearTimeout(timer.current);
    lastQuery.current = '';
    const picked = items.find((p) => p.id === id);
    setText(picked ? picked.name : '');
    setItems([]);
    navigate(`/products/${id}`);
    onNavigate?.();
  };

  const options = items.map((p) => ({
    value: p.id,
    label: (
      <div className="ssuggest__item">
        {p.primary_image ? (
          <img className="ssuggest__img" src={p.primary_image} alt="" />
        ) : (
          <div className="ssuggest__img ssuggest__img--empty" aria-hidden="true">
            <PictureOutlined />
          </div>
        )}
        <div className="ssuggest__info">
          <div className="ssuggest__name">{p.name}</div>
          <div className="ssuggest__price tabular">{formatVND(p.price)}</div>
        </div>
      </div>
    ),
  }));

  return (
    <AutoComplete
      value={text}
      options={options}
      onChange={setText}
      onSearch={fetchSuggest}
      onSelect={goProduct}
      // Không tự tô sáng gợi ý đầu tiên: để Enter khi chưa chọn gì
      // vẫn đi tới trang tìm kiếm thay vì bị "nuốt" thành chọn gợi ý.
      defaultActiveFirstOption={false}
      style={{ width: '100%' }}
    >
      <Input.Search
        placeholder="Bạn cần tìm sản phẩm gì?"
        allowClear
        enterButton
        size={size}
        onSearch={goSearch}
        aria-label="Tìm kiếm sản phẩm"
      />
    </AutoComplete>
  );
}
