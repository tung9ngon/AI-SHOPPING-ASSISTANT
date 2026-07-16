import { useCallback, useEffect, useState } from 'react';
import {
  App,
  Avatar,
  Button,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Pagination,
  Rate,
  Skeleton,
  Space,
  Typography,
} from 'antd';
import { EditOutlined, UserOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { productApi } from '../../api/products';
import { getErrorMessage } from '../../api/client';
import { formatDate } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';

const { Text, Paragraph } = Typography;

const PAGE_SIZE = 10;

// Shape thật của review item từ BE (product.service.findReviews)
interface ReviewItem {
  id: string;
  user_name: string;
  avatar_url: string | null;
  rating: string | number; // decimal -> string ở runtime
  title: string | null;
  content: string | null;
  created_at: string;
}

export default function ReviewsSection({
  productId,
  onReviewAdded,
}: {
  productId: string;
  onReviewAdded?: () => void;
}) {
  const { message } = App.useApp();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [items, setItems] = useState<ReviewItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<{ rating: number; title?: string; content?: string }>();

  const load = useCallback(
    (p: number) => {
      setLoading(true);
      productApi
        .reviews(productId, { page: p, limit: PAGE_SIZE })
        .then((res) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data = res.data as any;
          setItems(data.items ?? []);
          setTotal(data.total ?? 0);
        })
        .catch((err) => {
          setItems([]);
          setTotal(0);
          message.error(getErrorMessage(err));
        })
        .finally(() => setLoading(false));
    },
    [productId, message],
  );

  useEffect(() => {
    setPage(1);
    load(1);
  }, [load]);

  const openForm = () => {
    if (!isAuthenticated) {
      message.info('Vui lòng đăng nhập để viết đánh giá');
      navigate('/login', { state: { from: location } });
      return;
    }
    setFormOpen(true);
  };

  const submit = async () => {
    // validateFields reject khi form không hợp lệ — không phải lỗi hệ thống,
    // chỉ cần dừng lại (AntD đã hiển thị lỗi dưới field).
    let values: { rating: number; title?: string; content?: string };
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setSubmitting(true);
    try {
      await productApi.createReview(productId, {
        rating: values.rating,
        title: values.title?.trim() || undefined,
        content: values.content?.trim() || undefined,
      });
      message.success('Cảm ơn bạn đã đánh giá!');
      setFormOpen(false);
      form.resetFields();
      setPage(1);
      load(1);
      onReviewAdded?.();
    } catch (err) {
      // BE trả 403 nếu chưa mua hàng hoặc đã đánh giá rồi — hiện message gốc.
      message.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button type="primary" ghost icon={<EditOutlined />} onClick={openForm}>
          Viết đánh giá
        </Button>
      </div>

      {loading ? (
        <Skeleton active avatar paragraph={{ rows: 3 }} />
      ) : items.length === 0 ? (
        <Empty description="Chưa có đánh giá nào — hãy là người đầu tiên!" />
      ) : (
        <>
          <List
            itemLayout="vertical"
            dataSource={items}
            renderItem={(r) => (
              <List.Item key={r.id}>
                <List.Item.Meta
                  avatar={<Avatar src={r.avatar_url || undefined} icon={<UserOutlined />} />}
                  title={
                    <Space size="middle" wrap>
                      <Text strong>{r.user_name}</Text>
                      <Rate disabled allowHalf value={Number(r.rating)} style={{ fontSize: 13 }} />
                      <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
                        {formatDate(r.created_at)}
                      </Text>
                    </Space>
                  }
                  description={r.title && <Text strong>{r.title}</Text>}
                />
                {r.content && (
                  <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                    {r.content}
                  </Paragraph>
                )}
              </List.Item>
            )}
          />
          {total > PAGE_SIZE && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Pagination
                current={page}
                pageSize={PAGE_SIZE}
                total={total}
                showSizeChanger={false}
                onChange={(p) => {
                  setPage(p);
                  load(p);
                }}
              />
            </div>
          )}
        </>
      )}

      <Modal
        title="Viết đánh giá"
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        onOk={submit}
        okText="Gửi đánh giá"
        cancelText="Huỷ"
        confirmLoading={submitting}
      >
        <Paragraph type="secondary" style={{ fontSize: 13 }}>
          Lưu ý: bạn cần đã mua sản phẩm này (đơn hàng hoàn tất) mới có thể đánh giá.
        </Paragraph>
        <Form form={form} layout="vertical" initialValues={{ rating: 5 }}>
          <Form.Item
            name="rating"
            label="Chấm điểm"
            rules={[
              {
                validator: (_, v) =>
                  v >= 1 ? Promise.resolve() : Promise.reject(new Error('Vui lòng chấm ít nhất 1 sao')),
              },
            ]}
          >
            {/* allowClear=false: không cho bấm lại sao để về 0 (BE yêu cầu rating >= 1) */}
            <Rate allowClear={false} />
          </Form.Item>
          <Form.Item name="title" label="Tiêu đề (tuỳ chọn)" rules={[{ max: 255 }]}>
            <Input placeholder="VD: Sản phẩm tốt trong tầm giá" />
          </Form.Item>
          <Form.Item name="content" label="Nội dung (tuỳ chọn)" rules={[{ max: 2000 }]}>
            <Input.TextArea rows={4} placeholder="Chia sẻ trải nghiệm của bạn..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
