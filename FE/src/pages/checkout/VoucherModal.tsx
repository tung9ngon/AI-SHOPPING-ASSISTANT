import { useEffect, useMemo, useState } from 'react';
import { App, Button, Empty, Input, Modal, Skeleton, Tag, Typography } from 'antd';
import { CheckCircleFilled, TagOutlined } from '@ant-design/icons';
import {
  calcVoucherAmount,
  discountApi,
  isVoucherEligible,
  type Voucher,
} from '../../api/discount';
import { getErrorMessage } from '../../api/client';
import { formatVND } from '../../utils/format';

const { Text } = Typography;

interface Props {
  open: boolean;
  subtotal: number;
  shippingFee: number;
  selectedDiscount: Voucher | null; // voucher giảm tiền hàng đang chọn
  selectedFreeship: Voucher | null; // voucher miễn phí ship đang chọn
  onClose: () => void;
  onConfirm: (discount: Voucher | null, freeship: Voucher | null) => void;
}

// Nhãn hiển thị ngắn gọn cho giá trị voucher
function voucherHeadline(v: Voucher): string {
  const value = Number(v.discount_value);
  if (v.discount_type === 'percent') {
    return `Giảm ${value}%`;
  }
  if (v.discount_type === 'free_shipping') {
    return `Miễn phí ship ${formatVND(value)}`;
  }
  return `Giảm ${formatVND(value)}`;
}

function formatShortDate(value: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('vi-VN');
}

// Một thẻ voucher (kiểu Shopee): dải màu trái + nội dung + nút chọn
function VoucherRow({
  v,
  subtotal,
  shippingFee,
  selected,
  onToggle,
}: {
  v: Voucher;
  subtotal: number;
  shippingFee: number;
  selected: boolean;
  onToggle: () => void;
}) {
  const eligible = isVoucherEligible(v, subtotal);
  const amount = calcVoucherAmount(v, subtotal, shippingFee);
  const isFreeship = v.discount_type === 'free_shipping';
  const stripColor = isFreeship ? '#26aa99' : '#ff6a00';
  const stripLabel = isFreeship ? 'VẬN\nCHUYỂN' : 'GIẢM\nGIÁ';
  const minValue = v.min_order_value == null ? 0 : Number(v.min_order_value);
  const expiry = formatShortDate(v.valid_until);

  return (
    <div
      onClick={() => eligible && onToggle()}
      style={{
        display: 'flex',
        border: `1px solid ${selected ? stripColor : '#eee'}`,
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 12,
        background: eligible ? '#fff' : '#fafafa',
        opacity: eligible ? 1 : 0.6,
        cursor: eligible ? 'pointer' : 'not-allowed',
        boxShadow: selected ? `0 0 0 1px ${stripColor}` : 'none',
      }}
    >
      {/* Dải màu bên trái */}
      <div
        style={{
          width: 88,
          flexShrink: 0,
          background: stripColor,
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 8,
          textAlign: 'center',
        }}
      >
        <TagOutlined style={{ fontSize: 20, marginBottom: 4 }} />
        <div style={{ fontSize: 11, fontWeight: 700, whiteSpace: 'pre-line', lineHeight: 1.2 }}>
          {stripLabel}
        </div>
      </div>

      {/* Nội dung */}
      <div style={{ flex: 1, minWidth: 0, padding: '10px 12px' }}>
        <div style={{ fontWeight: 600 }}>{voucherHeadline(v)}</div>
        {v.description && (
          <div style={{ color: '#666', fontSize: 13 }}>{v.description}</div>
        )}
        <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
          {minValue > 0 ? `Đơn tối thiểu ${formatVND(minValue)}` : 'Áp dụng mọi đơn hàng'}
        </div>
        {expiry && (
          <div style={{ color: '#aaa', fontSize: 12 }}>HSD: {expiry}</div>
        )}
        {eligible ? (
          <Tag color={isFreeship ? 'cyan' : 'orange'} style={{ marginTop: 6 }}>
            {isFreeship ? 'Giảm phí ship' : 'Giảm'} {formatVND(amount)}
          </Tag>
        ) : (
          <div style={{ color: '#fa541c', fontSize: 12, marginTop: 6 }}>
            Mua thêm {formatVND(minValue - subtotal)} để dùng mã này
          </div>
        )}
      </div>

      {/* Nút chọn */}
      <div
        style={{
          width: 44,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected ? (
          <CheckCircleFilled style={{ color: stripColor, fontSize: 22 }} />
        ) : (
          <span
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: `2px solid ${eligible ? '#ccc' : '#e0e0e0'}`,
              display: 'inline-block',
            }}
          />
        )}
      </div>
    </div>
  );
}

export default function VoucherModal({
  open,
  subtotal,
  shippingFee,
  selectedDiscount,
  selectedFreeship,
  onClose,
  onConfirm,
}: Props) {
  const { message } = App.useApp();

  const [loading, setLoading] = useState(false);
  const [discounts, setDiscounts] = useState<Voucher[]>([]);
  const [freeships, setFreeships] = useState<Voucher[]>([]);

  // Lựa chọn tạm trong modal, chỉ chốt khi bấm "Đồng ý"
  const [draftDiscount, setDraftDiscount] = useState<Voucher | null>(null);
  const [draftFreeship, setDraftFreeship] = useState<Voucher | null>(null);

  const [codeInput, setCodeInput] = useState('');
  const [applying, setApplying] = useState(false);

  // Nạp danh sách + đồng bộ lựa chọn hiện tại mỗi khi mở modal.
  useEffect(() => {
    if (!open) return;
    // Cờ ignore: bỏ qua kết quả trả về muộn nếu modal bị đóng/mở lại nhanh.
    let ignore = false;
    setDraftDiscount(selectedDiscount);
    setDraftFreeship(selectedFreeship);
    setCodeInput('');

    setLoading(true);
    // Lấy tất cả mã đang active (không lọc theo order_value) để vẫn hiển thị
    // mã chưa đủ điều kiện dưới dạng disabled — giống Shopee.
    Promise.all([
      discountApi.list({ limit: 50 }),
      discountApi.listFreeship({ limit: 50 }),
    ])
      .then(([dRes, fRes]) => {
        if (ignore) return;
        setDiscounts(dRes.data.items ?? []);
        setFreeships(fRes.data.items ?? []);
      })
      .catch((err) => {
        if (!ignore) message.error(getErrorMessage(err));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Gộp mã nhập tay (nếu chưa có trong danh sách) để nó vẫn hiển thị được.
  const mergeVoucher = (list: Voucher[], v: Voucher) =>
    list.some((x) => x.code === v.code) ? list : [v, ...list];

  const applyManualCode = async () => {
    const code = codeInput.trim().toUpperCase();
    if (!code) return;
    setApplying(true);
    try {
      const res = await discountApi.validate(code, subtotal, shippingFee);
      const r = res.data;
      if (!r.is_valid) {
        message.error(r.message || 'Mã giảm giá không hợp lệ');
        return;
      }
      // Dựng 1 Voucher từ kết quả validate để đưa vào danh sách + chọn luôn.
      const v: Voucher = {
        code: r.code,
        description: null,
        discount_type: r.discount_type ?? 'fixed_amount',
        discount_value: r.discount_value ?? 0,
        min_order_value: r.min_order_value ?? null,
        // Giữ trần giảm từ BE để calcVoucherAmount không tính vượt (mã percent có max_discount).
        max_discount: r.max_discount ?? null,
        valid_until: null,
      };
      if (v.discount_type === 'free_shipping') {
        setFreeships((prev) => mergeVoucher(prev, v));
        setDraftFreeship(v);
      } else {
        setDiscounts((prev) => mergeVoucher(prev, v));
        setDraftDiscount(v);
      }
      setCodeInput('');
      message.success(`Đã thêm mã "${v.code}"`);
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setApplying(false);
    }
  };

  const toggle = (
    v: Voucher,
    current: Voucher | null,
    setter: (x: Voucher | null) => void,
  ) => {
    setter(current?.code === v.code ? null : v);
  };

  const savingSummary = useMemo(() => {
    let saved = 0;
    if (draftDiscount) saved += calcVoucherAmount(draftDiscount, subtotal, shippingFee);
    if (draftFreeship) saved += calcVoucherAmount(draftFreeship, subtotal, shippingFee);
    return saved;
  }, [draftDiscount, draftFreeship, subtotal, shippingFee]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Chọn Voucher"
      width={560}
      styles={{ body: { maxHeight: '65vh', overflowY: 'auto', paddingTop: 12 } }}
      footer={[
        <Button key="back" onClick={onClose}>
          Trở lại
        </Button>,
        <Button
          key="ok"
          type="primary"
          onClick={() => onConfirm(draftDiscount, draftFreeship)}
        >
          Đồng ý{savingSummary > 0 ? ` · Giảm ${formatVND(savingSummary)}` : ''}
        </Button>,
      ]}
    >
      {/* Ô nhập mã thủ công */}
      <Input.Search
        placeholder="Nhập mã voucher"
        enterButton="Áp dụng"
        value={codeInput}
        loading={applying}
        onChange={(e) => setCodeInput(e.target.value)}
        onSearch={applyManualCode}
        style={{ marginBottom: 16 }}
      />

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <>
          <Text strong>Mã Giảm Giá</Text>
          <div style={{ marginTop: 8 }}>
            {discounts.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có mã giảm giá"
                style={{ margin: '12px 0' }}
              />
            ) : (
              discounts.map((v) => (
                <VoucherRow
                  key={v.code}
                  v={v}
                  subtotal={subtotal}
                  shippingFee={shippingFee}
                  selected={draftDiscount?.code === v.code}
                  onToggle={() => toggle(v, draftDiscount, setDraftDiscount)}
                />
              ))
            )}
          </div>

          <Text strong>Mã Miễn Phí Vận Chuyển</Text>
          <div style={{ marginTop: 8 }}>
            {freeships.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có mã miễn phí vận chuyển"
                style={{ margin: '12px 0' }}
              />
            ) : (
              freeships.map((v) => (
                <VoucherRow
                  key={v.code}
                  v={v}
                  subtotal={subtotal}
                  shippingFee={shippingFee}
                  selected={draftFreeship?.code === v.code}
                  onToggle={() => toggle(v, draftFreeship, setDraftFreeship)}
                />
              ))
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
