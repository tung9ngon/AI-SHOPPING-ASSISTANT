import { useEffect, useMemo, useRef, useState } from 'react';
import {
  App,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tabs,
  Tag,
  Tooltip,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import {
  CheckCircleFilled,
  DeleteOutlined,
  PictureOutlined,
  PlusOutlined,
  StarFilled,
  StarOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { adminCategoryApi, adminProductApi } from '../../api/admin';
import { productApi } from '../../api/products';
import { getErrorMessage } from '../../api/client';
import type { Category, ProductImage, ProductSpec } from '../../types';
import { formatVND } from '../../utils/format';
import './ProductListPage.css';

const PAGE_SIZE = 18;

interface AdminProductRow {
  id: string;
  name: string;
  category_id?: string | null;
  category?: string | { id: string; name: string } | null;
  brand: string | null;
  price: number;
  rating: string | number | null;
  stock_quantity: number;
  is_active: boolean;
  description?: string | null;
  thumbnail?: string | null;
  images?: ProductImage[];
  specs?: ProductSpec[];
}

interface ProductFormValues {
  name: string;
  brand?: string;
  category_id?: string;
  price: number;
  stock_quantity: number;
  description?: string;
  is_active: boolean;
}

export interface ModalImageItem {
  key: string;
  id?: string;
  file?: File;
  previewUrl: string;
  is_primary: boolean;
  sort_order: number;
}

export interface ModalSpecItem {
  key: string;
  id?: string;
  spec_key: string;
  spec_value: string;
  spec_unit: string;
}

const SPEC_PRESETS = [
  { key: 'Màn hình', unit: 'inch' },
  { key: 'Chip / CPU', unit: '' },
  { key: 'RAM', unit: 'GB' },
  { key: 'Dung lượng lưu trữ', unit: 'GB' },
  { key: 'Pin', unit: 'mAh' },
  { key: 'Trọng lượng', unit: 'g' },
  { key: 'Hệ điều hành', unit: '' },
];

const SAMPLE_PRODUCTS: AdminProductRow[] = [
  ['Laptop UltraBook Pro 14 M3', 'Apple', 'Laptop', 34990000, 4.9, '#2b1b6f'],
  ['Điện thoại Galaxy S25 Ultra', 'Samsung', 'Điện thoại', 29990000, 4.8, '#155e75'],
  ['Laptop Gaming ROG Strix G16', 'Asus', 'Laptop', 41500000, 4.7, '#312e81'],
  ['Điện thoại iPhone 16 Pro', 'Apple', 'Điện thoại', 27990000, 4.9, '#0e7490'],
  ['Tai nghe WH-1000XM5', 'Sony', 'Tai nghe', 7990000, 4.8, '#23805f'],
  ['Đồng hồ Watch Series 10', 'Apple', 'Đồng hồ thông minh', 10990000, 4.7, '#8a4536'],
  ['Màn hình UltraSharp 27 4K', 'Dell', 'Màn hình', 12490000, 4.6, '#1f4b7a'],
  ['Điện thoại Redmi Note 14 Pro', 'Xiaomi', 'Điện thoại', 8490000, 4.5, '#155e75'],
  ['Chuột không dây MX Master 3S', 'Logitech', 'Phụ kiện', 2490000, 4.9, '#444444'],
  ['Tablet Galaxy Tab S10', 'Samsung', 'Tablet', 18990000, 4.6, '#5b2b82'],
  ['Laptop XPS 13 Plus', 'Dell', 'Laptop', 31990000, 4.5, '#312e81'],
  ['Tai nghe AirPods Pro 3', 'Apple', 'Tai nghe', 6490000, 4.8, '#23805f'],
  ['Máy ảnh Alpha A7 IV', 'Sony', 'Máy ảnh', 54990000, 4.9, '#7a2f68'],
  ['Màn hình Gaming 27 240Hz', 'LG', 'Màn hình', 9990000, 4.7, '#1f4b7a'],
  ['Bàn phím cơ MX Keys', 'Logitech', 'Phụ kiện', 3290000, 4.6, '#444444'],
  ['Đồng hồ Galaxy Watch 7', 'Samsung', 'Đồng hồ thông minh', 7490000, 4.5, '#8a4536'],
  ['Điện thoại Galaxy A55', 'Samsung', 'Điện thoại', 9990000, 4.4, '#155e75'],
  ['Tablet iPad Air M2', 'Apple', 'Tablet', 16990000, 4.8, '#5b2b82'],
].map(([name, brand, category, price, rating, color], index) => ({
  id: `sample-product-${index}`,
  name: String(name),
  brand: String(brand),
  category: String(category),
  price: Number(price),
  rating: Number(rating),
  stock_quantity: 0,
  is_active: true,
  thumbnail: String(color),
  images: [],
  specs: [
    { id: `spec-1-${index}`, spec_key: 'Hãng sản xuất', spec_value: String(brand), spec_unit: null },
    { id: `spec-2-${index}`, spec_key: 'Bảo hành', spec_value: '12', spec_unit: 'tháng' },
  ],
}));

function productCategoryName(product: AdminProductRow) {
  if (!product.category) return '-';
  if (typeof product.category === 'string') return product.category;
  return product.category.name;
}

function productThumb(product: AdminProductRow) {
  const source = product.thumbnail;
  if (source?.startsWith('http')) {
    return <img src={source} alt={product.name} className="admin-product-thumb-img" />;
  }

  return (
    <span
      className="admin-product-thumb-fallback"
      style={{ background: source || '#2b1b6f' }}
      aria-label={product.name}
    >
      ẢNH
    </span>
  );
}

function normalizeProduct(raw: unknown): AdminProductRow {
  const item = raw as AdminProductRow & {
    isActive?: boolean;
    category_name?: string;
    image?: string | null;
  };

  return {
    ...item,
    category: item.category ?? item.category_name ?? null,
    price: Number(item.price ?? 0),
    rating: item.rating ?? null,
    stock_quantity: Number(item.stock_quantity ?? 0),
    is_active: item.is_active ?? item.isActive ?? false,
    thumbnail: item.thumbnail ?? item.image ?? null,
  };
}

export default function ProductListPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm<ProductFormValues>();
  const [items, setItems] = useState<AdminProductRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allBrands, setAllBrands] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [brand, setBrand] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProductRow | null>(null);
  const [fallbackReason, setFallbackReason] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);

  // States cho Ảnh & Thông số trong Modal
  const [modalImages, setModalImages] = useState<ModalImageItem[]>([]);
  const [modalSpecs, setModalSpecs] = useState<ModalSpecItem[]>([]);
  const [initialImages, setInitialImages] = useState<ModalImageItem[]>([]);
  const [initialSpecs, setInitialSpecs] = useState<ModalSpecItem[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isSampleMode = !!fallbackReason;

  const sampleBrands = useMemo(
    () => Array.from(new Set(SAMPLE_PRODUCTS.map((product) => product.brand).filter(Boolean))) as string[],
    [],
  );

  const brandOptions = useMemo(() => {
    // Trước đây chỉ lấy brand từ `items` (danh sách của TRANG hiện tại, tối đa PAGE_SIZE sản phẩm)
    // nên mỗi trang hiển thị brand khác nhau. Giờ dùng allBrands lấy từ API riêng
    // (toàn bộ brand duy nhất trong hệ thống), chỉ fallback sang dữ liệu mẫu khi API lỗi.
    const source = isSampleMode ? sampleBrands : allBrands;
    return Array.from(new Set(source)).map((value) => ({
      value,
      label: value,
    }));
  }, [allBrands, sampleBrands, isSampleMode]);

  const query = useMemo(
    () => ({
      search: search.trim() || undefined,
      categoryId,
      brand,
      page,
      limit: PAGE_SIZE,
      sort: 'newest',
    }),
    [brand, categoryId, page, search],
  );

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await adminProductApi.list(query);
      const rows = (res.data.items ?? res.data.data ?? []).map(normalizeProduct);
      setItems(rows);
      setTotal(res.data.total ?? rows.length);
      setFallbackReason('');
    } catch (err) {
      const reason = getErrorMessage(err);
      const categoryName = categories.find((category) => category.id === categoryId)?.name;
      const filtered = SAMPLE_PRODUCTS.filter((product) => {
        const matchesSearch = !query.search || product.name.toLowerCase().includes(query.search.toLowerCase());
        const matchesCategory = !categoryName || productCategoryName(product) === categoryName;
        const matchesBrand = !brand || product.brand === brand;
        return matchesSearch && matchesCategory && matchesBrand;
      });
      setItems(filtered);
      setTotal(filtered.length);
      setFallbackReason(reason);
    } finally {
      setLoading(false);
    }
  };

  const loadBrands = () => {
    adminProductApi
      .listBrands()
      .then((res) => setAllBrands(res.data ?? []))
      .catch(() => setAllBrands([]));
  };

  useEffect(() => {
    adminCategoryApi
      .list({ limit: 100 })
      .then((res) => setCategories((res.data.items ?? res.data.data ?? []) as Category[]))
      .catch(() => setCategories([]));

    loadBrands();
  }, []);

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, categories]);

  const openCreateModal = () => {
    setEditing(null);
    form.setFieldsValue({
      name: '',
      brand: '',
      category_id: undefined,
      price: 0,
      stock_quantity: 0,
      description: '',
      is_active: true,
    });
    setModalImages([]);
    setModalSpecs([]);
    setInitialImages([]);
    setInitialSpecs([]);
    setImageUrlInput('');
    setModalOpen(true);
  };

  const openEditModal = async (product: AdminProductRow) => {
    setEditing(product);
    const productCategory =
      typeof product.category === 'object' && product.category ? product.category.id : product.category_id ?? undefined;
    form.setFieldsValue({
      name: product.name,
      brand: product.brand ?? '',
      category_id: productCategory,
      price: Number(product.price ?? 0),
      stock_quantity: Number(product.stock_quantity ?? 0),
      description: product.description ?? '',
      is_active: product.is_active,
    });

    setModalImages([]);
    setModalSpecs([]);
    setInitialImages([]);
    setInitialSpecs([]);
    setImageUrlInput('');
    setModalOpen(true);
    setDetailLoading(true);

    try {
      // Tải chi tiết sản phẩm bao gồm đầy đủ images và specs từ backend
      const res = await productApi.detail(product.id);
      const detail = res.data;

      const loadedImages: ModalImageItem[] = (detail.images ?? []).map((img, index) => ({
        key: img.id,
        id: img.id,
        previewUrl: img.image_url,
        is_primary: img.is_primary,
        sort_order: img.sort_order ?? index,
      }));

      // Nếu không có ảnh trong DB nhưng có thumbnail, dùng thumbnail làm ảnh xem trước
      if (loadedImages.length === 0 && detail.images?.length === 0 && product.thumbnail?.startsWith('http')) {
        loadedImages.push({
          key: 'thumb-legacy',
          previewUrl: product.thumbnail,
          is_primary: true,
          sort_order: 0,
        });
      }

      const loadedSpecs: ModalSpecItem[] = (detail.specs ?? []).map((s) => ({
        key: s.id,
        id: s.id,
        spec_key: s.spec_key,
        spec_value: s.spec_value,
        spec_unit: s.spec_unit ?? '',
      }));

      setModalImages(loadedImages);
      setModalSpecs(loadedSpecs);
      setInitialImages(loadedImages);
      setInitialSpecs(loadedSpecs);
    } catch {
      // Mẫu/offline fallback
      if (product.specs) {
        const loadedSpecs: ModalSpecItem[] = product.specs.map((s) => ({
          key: s.id,
          id: s.id,
          spec_key: s.spec_key,
          spec_value: s.spec_value,
          spec_unit: s.spec_unit ?? '',
        }));
        setModalSpecs(loadedSpecs);
        setInitialSpecs(loadedSpecs);
      }
      if (product.thumbnail?.startsWith('http')) {
        const loadedImages: ModalImageItem[] = [
          {
            key: 'thumb-sample',
            previewUrl: product.thumbnail,
            is_primary: true,
            sort_order: 0,
          },
        ];
        setModalImages(loadedImages);
        setInitialImages(loadedImages);
      }
    } finally {
      setDetailLoading(false);
    }
  };

  // --- Quản lý Ảnh ---
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: ModalImageItem[] = Array.from(files).map((file, index) => {
      const isFirst = modalImages.length === 0 && index === 0;
      return {
        key: `new-file-${Date.now()}-${index}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        is_primary: isFirst,
        sort_order: modalImages.length + index,
      };
    });

    setModalImages((prev) => {
      const next = [...prev, ...newItems];
      // Đảm bảo luôn có 1 ảnh làm primary
      if (!next.some((img) => img.is_primary) && next.length > 0) {
        next[0].is_primary = true;
      }
      return next;
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      message.error('Vui lòng nhập đường dẫn URL ảnh hợp lệ (http:// hoặc https://)');
      return;
    }

    const newItem: ModalImageItem = {
      key: `url-${Date.now()}-${Math.random()}`,
      previewUrl: url,
      is_primary: modalImages.length === 0,
      sort_order: modalImages.length,
    };

    setModalImages((prev) => {
      const next = [...prev, newItem];
      if (!next.some((img) => img.is_primary) && next.length > 0) {
        next[0].is_primary = true;
      }
      return next;
    });
    setImageUrlInput('');
  };

  const setPrimaryImage = (key: string) => {
    setModalImages((prev) =>
      prev.map((img) => ({
        ...img,
        is_primary: img.key === key,
      })),
    );
  };

  const removeImage = (key: string) => {
    setModalImages((prev) => {
      const filtered = prev.filter((img) => img.key !== key);
      // Nếu xoá ảnh chính, gán ảnh đầu tiên làm ảnh chính
      if (filtered.length > 0 && !filtered.some((img) => img.is_primary)) {
        filtered[0].is_primary = true;
      }
      return filtered;
    });
  };

  // --- Quản lý Thông số kỹ thuật ---
  const addSpecRow = (keyName = '', unit = '') => {
    setModalSpecs((prev) => [
      ...prev,
      {
        key: `spec-${Date.now()}-${Math.random()}`,
        spec_key: keyName,
        spec_value: '',
        spec_unit: unit,
      },
    ]);
  };

  const updateSpecRow = (key: string, field: 'spec_key' | 'spec_value' | 'spec_unit', value: string) => {
    setModalSpecs((prev) =>
      prev.map((item) => (item.key === key ? { ...item, [field]: value } : item)),
    );
  };

  const removeSpecRow = (key: string) => {
    setModalSpecs((prev) => prev.filter((item) => item.key !== key));
  };

  // --- Submit sản phẩm ---
  const submitProduct = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      let productId = editing?.id;

      if (editing) {
        // 1. Cập nhật thông tin cơ bản
        await adminProductApi.update(editing.id, {
          name: values.name.trim(),
          category_id: values.category_id || undefined,
          brand: values.brand?.trim() || '',
          price: values.price,
          stock_quantity: values.stock_quantity,
          description: values.description?.trim() || '',
          is_active: values.is_active,
        });

        // 2. Xử lý Ảnh
        const imageErrors: string[] = [];

        // Ảnh bị xoá
        const deletedImages = initialImages.filter((init) => init.id && !modalImages.some((m) => m.id === init.id));
        for (const img of deletedImages) {
          try {
            await adminProductApi.removeImage(editing.id, img.id!);
          } catch (e) {
            imageErrors.push(`Xoá ảnh thất bại: ${getErrorMessage(e)}`);
          }
        }
        // Ảnh mới (tải file HOẶC dán URL) và ảnh cũ có thay đổi is_primary/sort_order
        for (let i = 0; i < modalImages.length; i++) {
          const img = modalImages[i];
          if (img.file) {
            // Ảnh mới upload từ máy
            try {
              await adminProductApi.addImage(editing.id, {
                file: img.file,
                is_primary: img.is_primary,
                sort_order: i,
              });
            } catch (e) {
              imageErrors.push(`Thêm ảnh mới thất bại: ${getErrorMessage(e)}`);
            }
          } else if (img.id) {
            // Ảnh cũ đã có trong DB - cập nhật nếu is_primary hoặc sort_order thay đổi
            const initial = initialImages.find((init) => init.id === img.id);
            if (initial && (initial.is_primary !== img.is_primary || initial.sort_order !== i)) {
              try {
                await adminProductApi.updateImage(editing.id, img.id, {
                  is_primary: img.is_primary,
                  sort_order: i,
                });
              } catch (e) {
                imageErrors.push(`Cập nhật ảnh thất bại: ${getErrorMessage(e)}`);
              }
            }
          } else {
            // Ảnh mới thêm bằng cách dán URL (không có file, chưa có id trong DB).
            // Trước đây nhánh này không tồn tại nên ảnh dạng này bị "rơi mất" sau khi lưu/reload.
            try {
              await adminProductApi.addImage(editing.id, {
                image_url: img.previewUrl,
                is_primary: img.is_primary,
                sort_order: i,
              });
            } catch (e) {
              imageErrors.push(`Thêm ảnh (URL) thất bại: ${getErrorMessage(e)}`);
            }
          }
        }

        // 3. Xử lý Thông số kỹ thuật
        const deletedSpecs = initialSpecs.filter((init) => init.id && !modalSpecs.some((m) => m.id === init.id));
        for (const spec of deletedSpecs) {
          try {
            await adminProductApi.removeSpec(editing.id, spec.id!);
          } catch (e) {
            imageErrors.push(`Xoá thông số thất bại: ${getErrorMessage(e)}`);
          }
        }

        for (const spec of modalSpecs) {
          const k = spec.spec_key.trim();
          const v = spec.spec_value.trim();
          const u = spec.spec_unit.trim() || undefined;
          if (!k || !v) continue;

          if (spec.id) {
            // Cập nhật spec cũ
            const initial = initialSpecs.find((init) => init.id === spec.id);
            if (
              initial &&
              (initial.spec_key !== k || initial.spec_value !== v || (initial.spec_unit || '') !== (u || ''))
            ) {
              try {
                await adminProductApi.updateSpec(editing.id, spec.id, {
                  spec_key: k,
                  spec_value: v,
                  spec_unit: u ?? '',
                });
              } catch (e) {
                imageErrors.push(`Sửa thông số thất bại: ${getErrorMessage(e)}`);
              }
            }
          } else {
            // Thêm spec mới
            try {
              await adminProductApi.addSpec(editing.id, {
                spec_key: k,
                spec_value: v,
                spec_unit: u,
              });
            } catch (e) {
              imageErrors.push(`Thêm thông số thất bại: ${getErrorMessage(e)}`);
            }
          }
        }

        if (imageErrors.length > 0) {
          message.warning(
            `Đã lưu sản phẩm nhưng có ${imageErrors.length} thao tác lỗi: ${imageErrors.join('; ')}`,
          );
        } else {
          message.success('Đã cập nhật sản phẩm');
        }
      } else {
        // --- Thêm sản phẩm mới ---
        const res = await adminProductApi.create({
          name: values.name.trim(),
          category_id: values.category_id,
          brand: values.brand?.trim() || '',
          price: values.price,
          stock_quantity: values.stock_quantity ?? 0,
          description: values.description?.trim() || '',
          is_active: values.is_active,
        });
        productId = res.data.id;
        const createErrors: string[] = [];

        // Thêm các ảnh đã chọn (file upload HOẶC dán URL)
        for (let i = 0; i < modalImages.length; i++) {
          const img = modalImages[i];
          try {
            if (img.file) {
              await adminProductApi.addImage(productId, {
                file: img.file,
                is_primary: img.is_primary,
                sort_order: i,
              });
            } else {
              // Ảnh dán bằng URL - trước đây bị bỏ sót, không gửi lên BE nên mất luôn sau khi lưu
              await adminProductApi.addImage(productId, {
                image_url: img.previewUrl,
                is_primary: img.is_primary,
                sort_order: i,
              });
            }
          } catch (e) {
            createErrors.push(`Thêm ảnh thất bại: ${getErrorMessage(e)}`);
          }
        }

        // Thêm thông số kỹ thuật
        for (const spec of modalSpecs) {
          const k = spec.spec_key.trim();
          const v = spec.spec_value.trim();
          const u = spec.spec_unit.trim() || undefined;
          if (k && v) {
            try {
              await adminProductApi.addSpec(productId, {
                spec_key: k,
                spec_value: v,
                spec_unit: u,
              });
            } catch (e) {
              createErrors.push(`Thêm thông số thất bại: ${getErrorMessage(e)}`);
            }
          }
        }

        if (createErrors.length > 0) {
          message.warning(
            `Đã tạo sản phẩm nhưng có ${createErrors.length} thao tác lỗi: ${createErrors.join('; ')}`,
          );
        } else {
          message.success('Đã thêm sản phẩm mới thành công');
        }
      }

      setModalOpen(false);
      loadProducts();
      loadBrands();
    } catch (err) {
      // Nếu API báo lỗi (hoặc đang chạy mode mẫu), cập nhật state local để xem được
      if (isSampleMode || editing?.id.startsWith('sample-')) {
        const primaryImg = modalImages.find((img) => img.is_primary)?.previewUrl || modalImages[0]?.previewUrl || null;
        if (editing) {
          setItems((prev) =>
            prev.map((item) =>
              item.id === editing.id
                ? {
                  ...item,
                  name: values.name.trim(),
                  price: values.price,
                  description: values.description?.trim() || '',
                  is_active: values.is_active,
                  thumbnail: primaryImg || item.thumbnail,
                  specs: modalSpecs.map((s, idx) => ({
                    id: s.id || `sample-spec-${idx}`,
                    spec_key: s.spec_key,
                    spec_value: s.spec_value,
                    spec_unit: s.spec_unit || null,
                  })),
                }
                : item,
            ),
          );
          message.success('Đã cập nhật sản phẩm (chế độ dữ liệu mẫu)');
        } else {
          const categoryName = categories.find((c) => c.id === values.category_id)?.name || 'Khác';
          const newRow: AdminProductRow = {
            id: `sample-product-${Date.now()}`,
            name: values.name.trim(),
            brand: values.brand?.trim() || 'Khác',
            category: categoryName,
            price: values.price,
            rating: null,
            stock_quantity: values.stock_quantity ?? 0,
            is_active: values.is_active,
            description: values.description?.trim() || '',
            thumbnail: primaryImg || '#2b1b6f',
            specs: modalSpecs.map((s, idx) => ({
              id: `sample-spec-${idx}`,
              spec_key: s.spec_key,
              spec_value: s.spec_value,
              spec_unit: s.spec_unit || null,
            })),
          };
          setItems((prev) => [newRow, ...prev]);
          setTotal((t) => t + 1);
          message.success('Đã thêm sản phẩm mới (chế độ dữ liệu mẫu)');
        }
        setModalOpen(false);
      } else {
        message.error(getErrorMessage(err));
      }
    } finally {
      setSaving(false);
    }
  };

  const removeProduct = async (product: AdminProductRow) => {
    try {
      await adminProductApi.remove(product.id);
      message.success('Đã xoá sản phẩm thành công');
      setItems((prev) => prev.filter((p) => p.id !== product.id));
      setTotal((t) => Math.max(0, t - 1));
    } catch (err) {
      if (isSampleMode || product.id.startsWith('sample-')) {
        setItems((prev) => prev.filter((p) => p.id !== product.id));
        setTotal((t) => Math.max(0, t - 1));
        message.success('Đã xoá sản phẩm thành công (chế độ dữ liệu mẫu)');
      } else {
        message.error(getErrorMessage(err));
      }
    }
  };

  const columns: ColumnsType<AdminProductRow> = [
    {
      title: 'Ảnh',
      dataIndex: 'thumbnail',
      width: 100,
      render: (_, record) => productThumb(record),
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      render: (name: string) => <span className="admin-product-name">{name}</span>,
    },
    {
      title: 'Thương hiệu',
      dataIndex: 'brand',
      width: 190,
      render: (value: string | null) => value || '-',
    },
    {
      title: 'Danh mục',
      key: 'category',
      width: 210,
      render: (_, record) => <span className="admin-product-category">{productCategoryName(record)}</span>,
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      width: 190,
      render: (value: number) => <span className="admin-product-price">{formatVND(value)}</span>,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      width: 110,
      render: (value: string | number | null) => (
        <span className="admin-product-rating">
          <StarFilled /> {value ?? '-'}
        </span>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock_quantity',
      width: 110,
      render: (value: number) => (
        <Tag color={value > 0 ? 'blue' : 'red'}>{value ?? 0}</Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      width: 170,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>{isActive ? 'Đang bán' : 'Ngừng bán'}</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 140,
      align: 'right',
      render: (_, record) => (
        <div className="admin-product-actions">
          <Button type="link" onClick={() => openEditModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xoá sản phẩm?"
            description="Bạn có chắc chắn muốn xoá sản phẩm này không? Thao tác này sẽ xoá sản phẩm ngay lập tức."
            okText="Xoá ngay"
            cancelText="Huỷ"
            okButtonProps={{ danger: true }}
            onConfirm={() => removeProduct(record)}
          >
            <Button type="link" danger>
              Xoá
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPage(pagination.current ?? 1);
  };

  return (
    <div className="admin-product-page">
      {fallbackReason && (
        <div className="admin-product-note">Đang hiển thị dữ liệu mẫu: {fallbackReason}</div>
      )}

      <div className="admin-product-toolbar">
        <div className="admin-product-filters">
          <Input.Search
            allowClear
            placeholder="Tìm sản phẩm..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            onSearch={(value) => {
              setSearch(value);
              setPage(1);
            }}
            className="admin-product-search"
          />
          <Select
            allowClear
            placeholder="Tất cả danh mục"
            value={categoryId}
            onChange={(value) => {
              setCategoryId(value);
              setPage(1);
            }}
            className="admin-product-select"
            options={categories.map((category) => ({
              value: category.id,
              label: category.name,
            }))}
          />
          <Select
            allowClear
            placeholder="Tất cả thương hiệu"
            value={brand}
            onChange={(value) => {
              setBrand(value);
              setPage(1);
            }}
            className="admin-product-select"
            options={brandOptions}
          />
        </div>

        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          Thêm sản phẩm
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={items}
        loading={loading}
        className="admin-product-table"
        scroll={{ x: 1100 }}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total,
          showSizeChanger: false,
          hideOnSinglePage: total <= PAGE_SIZE,
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
        open={modalOpen}
        okText={editing ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
        cancelText="Huỷ"
        confirmLoading={saving}
        onOk={submitProduct}
        onCancel={() => setModalOpen(false)}
        width={760}
        destroyOnClose
        className="admin-product-modal"
      >
        <Spin spinning={detailLoading} tip="Đang tải dữ liệu chi tiết...">
          <Tabs
            defaultActiveKey="info"
            items={[
              {
                key: 'info',
                label: 'Thông tin cơ bản',
                children: (
                  <Form form={form} layout="vertical" className="admin-product-form">
                    <Row gutter={16}>
                      <Col span={16}>
                        <Form.Item
                          label="Tên sản phẩm"
                          name="name"
                          rules={[{ required: true, message: 'Nhập tên sản phẩm' }]}
                        >
                          <Input placeholder="Ví dụ: Laptop UltraBook Pro 14 M3" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="Thương hiệu" name="brand">
                          <Input placeholder="Ví dụ: Apple" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Danh mục" name="category_id">
                          <Select
                            allowClear
                            placeholder="Chọn danh mục"
                            options={categories.map((category) => ({
                              value: category.id,
                              label: category.name,
                            }))}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Giá (₫)"
                          name="price"
                          rules={[{ required: true, message: 'Nhập giá sản phẩm' }]}
                        >
                          <InputNumber<number>
                            min={0}
                            step={10000}
                            style={{ width: '100%' }}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => Number(value?.replace(/,/g, '') || 0)}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Số lượng tồn kho"
                          name="stock_quantity"
                          rules={[{ required: true, message: 'Nhập số lượng tồn kho' }]}
                        >
                          <InputNumber<number>
                            min={0}
                            style={{ width: '100%' }}
                            placeholder="Ví dụ: 100"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Rating (0.0 – 5.0)">
                          <Input
                            readOnly
                            disabled
                            prefix={<StarFilled style={{ color: '#faad14' }} />}
                            value={editing?.rating ? Number(editing.rating).toFixed(1) : 'Chưa có đánh giá'}
                          />
                          <div style={{ fontSize: 12, color: '#8b8f96', marginTop: 4 }}>
                            Rating được tính tự động từ đánh giá của khách hàng, không thể sửa tay.
                          </div>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item label="Mô tả sản phẩm" name="description">
                      <Input.TextArea rows={4} placeholder="Nhập bài viết mô tả chi tiết sản phẩm..." />
                    </Form.Item>

                    <Form.Item label="Trạng thái kinh doanh" name="is_active" valuePropName="checked">
                      <Switch checkedChildren="Đang bán" unCheckedChildren="Ngừng bán" />
                    </Form.Item>
                  </Form>
                ),
              },
              {
                key: 'images',
                label: `Hình ảnh (${modalImages.length})`,
                children: (
                  <div className="admin-product-images-tab">
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      accept="image/*"
                      multiple
                      onChange={handleFilesSelected}
                    />

                    <div className="admin-product-image-upload-bar">
                      <Button
                        type="dashed"
                        icon={<UploadOutlined />}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Tải ảnh từ máy
                      </Button>

                      <div className="admin-product-url-input">
                        <Input
                          placeholder="Hoặc dán URL ảnh (https://...)"
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          onPressEnter={handleAddImageUrl}
                        />
                        <Button type="primary" onClick={handleAddImageUrl}>
                          Thêm URL
                        </Button>
                      </div>
                    </div>

                    {modalImages.length === 0 ? (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Chưa có hình ảnh nào. Chọn ảnh từ máy hoặc nhập URL để thêm ảnh sản phẩm."
                        style={{ margin: '32px 0' }}
                      />
                    ) : (
                      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                        {modalImages.map((img) => (
                          <Col xs={12} sm={8} md={6} key={img.key}>
                            <Card
                              hoverable
                              className={`admin-image-card ${img.is_primary ? 'is-primary' : ''}`}
                              styles={{ body: { padding: 8 } }}
                              cover={
                                <div className="admin-image-preview-wrapper">
                                  <img src={img.previewUrl} alt="Preview" className="admin-image-preview" />
                                  {img.is_primary && (
                                    <Tag color="orange" className="admin-primary-tag">
                                      <CheckCircleFilled /> Ảnh chính
                                    </Tag>
                                  )}
                                </div>
                              }
                            >
                              <div className="admin-image-card-actions">
                                {!img.is_primary ? (
                                  <Tooltip title="Đặt làm ảnh chính">
                                    <Button
                                      size="small"
                                      type="default"
                                      icon={<StarOutlined />}
                                      onClick={() => setPrimaryImage(img.key)}
                                    >
                                      Ảnh chính
                                    </Button>
                                  </Tooltip>
                                ) : (
                                  <Tag color="gold" style={{ margin: 0 }}>
                                    <StarFilled /> Primary
                                  </Tag>
                                )}

                                <Tooltip title="Xoá ảnh này">
                                  <Button
                                    size="small"
                                    danger
                                    type="text"
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeImage(img.key)}
                                  />
                                </Tooltip>
                              </div>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    )}
                  </div>
                ),
              },
              {
                key: 'specs',
                label: `Thông số kỹ thuật (${modalSpecs.length})`,
                children: (
                  <div className="admin-product-specs-tab">
                    <div className="admin-specs-presets">
                      <span className="admin-specs-presets-title">Gợi ý nhanh:</span>
                      <Space wrap size={[6, 6]}>
                        {SPEC_PRESETS.map((preset) => (
                          <Tag.CheckableTag
                            key={preset.key}
                            checked={modalSpecs.some((s) => s.spec_key === preset.key)}
                            onChange={(checked) => {
                              if (checked) {
                                addSpecRow(preset.key, preset.unit);
                              }
                            }}
                          >
                            + {preset.key}
                          </Tag.CheckableTag>
                        ))}
                      </Space>
                    </div>

                    <div className="admin-specs-toolbar">
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={() => addSpecRow()}
                        style={{ width: '100%' }}
                      >
                        Thêm dòng thông số kỹ thuật
                      </Button>
                    </div>

                    {modalSpecs.length === 0 ? (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Chưa có thông số kỹ thuật nào. Bấm 'Thêm dòng' hoặc chọn Gợi ý nhanh ở trên."
                        style={{ margin: '32px 0' }}
                      />
                    ) : (
                      <div className="admin-specs-list">
                        <Row gutter={8} className="admin-specs-header">
                          <Col span={9}>Tên thông số (Key)</Col>
                          <Col span={9}>Giá trị (Value)</Col>
                          <Col span={4}>Đơn vị (Unit)</Col>
                          <Col span={2}></Col>
                        </Row>

                        {modalSpecs.map((spec) => (
                          <Row gutter={8} key={spec.key} className="admin-spec-row">
                            <Col span={9}>
                              <Input
                                placeholder="Vd: RAM, Màn hình..."
                                value={spec.spec_key}
                                onChange={(e) => updateSpecRow(spec.key, 'spec_key', e.target.value)}
                              />
                            </Col>
                            <Col span={9}>
                              <Input
                                placeholder="Vd: 16GB, 15.6 inch..."
                                value={spec.spec_value}
                                onChange={(e) => updateSpecRow(spec.key, 'spec_value', e.target.value)}
                              />
                            </Col>
                            <Col span={4}>
                              <Input
                                placeholder="Vd: GB, inch..."
                                value={spec.spec_unit}
                                onChange={(e) => updateSpecRow(spec.key, 'spec_unit', e.target.value)}
                              />
                            </Col>
                            <Col span={2} style={{ textAlign: 'center' }}>
                              <Button
                                danger
                                type="text"
                                icon={<DeleteOutlined />}
                                onClick={() => removeSpecRow(spec.key)}
                              />
                            </Col>
                          </Row>
                        ))}
                      </div>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </Spin>
      </Modal>
    </div>
  );
}
