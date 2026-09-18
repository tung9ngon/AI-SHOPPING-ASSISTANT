import { useEffect, useRef, useState } from 'react';
import { App, AutoComplete, Checkbox, Form, Input, Modal, Select } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { addressApi } from '../../api/addresses';
import {
  locationApi,
  type AddressPrediction,
  type District,
  type Province,
} from '../../api/location';
import { getErrorMessage } from '../../api/client';
import { phoneRule } from '../../utils/validators';
import type { Address } from '../../types';

interface FormValues {
  recipient_name: string;
  phone_number: string;
  province: string;
  district: string;
  street: string;
  is_default?: boolean;
}

// Ghép địa chỉ đầy đủ; nếu phần nhập tay/chọn từ gợi ý ĐÃ chứa sẵn
// quận/tỉnh thì không nối lặp lại nữa.
function composeAddress(street: string, district: string, province: string): string {
  const s = street.trim().replace(/[,\s]+$/, '');
  const parts = [s];
  if (district && !s.toLowerCase().includes(district.toLowerCase())) parts.push(district);
  if (province && !s.toLowerCase().includes(province.toLowerCase())) parts.push(province);
  return parts.join(', ');
}

// Tách ngược full_address cũ (khi sửa): "street, district, province".
// Chỉ nhận khi 2 phần cuối khớp đúng tên trong danh sách; không khớp thì trả
// nguyên chuỗi vào ô địa chỉ để người dùng tự chọn lại tỉnh/quận.
function parseAddress(full: string, provinces: Province[]) {
  const parts = full.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 3) {
    const provinceName = parts[parts.length - 1];
    const districtName = parts[parts.length - 2];
    const province = provinces.find(
      (p) => p.name.toLowerCase() === provinceName.toLowerCase(),
    );
    if (province) {
      return {
        street: parts.slice(0, -2).join(', '),
        district: districtName,
        province: province.name,
        provinceCode: province.code,
      };
    }
  }
  return { street: full, district: '', province: '', provinceCode: null };
}

// Modal thêm/sửa địa chỉ. `editing` = null -> thêm mới; có giá trị -> sửa.
// Địa chỉ chọn theo tầng: Tỉnh/Thành -> Quận/Huyện -> địa chỉ cụ thể (gợi ý
// từ Photon/OpenStreetMap, không cần key) + bản đồ Leaflet/OSM: chọn gợi ý
// thì ghim vị trí, bấm lên bản đồ thì tự điền địa chỉ gần nhất.
export default function AddressFormModal({
  open,
  editing,
  onClose,
  onSaved,
}: {
  open: boolean;
  editing: Address | null;
  onClose: () => void;
  onSaved: (saved: Address) => void;
}) {
  const { message } = App.useApp();
  const [form] = Form.useForm<FormValues>();
  const [saving, setSaving] = useState(false);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressPrediction[]>([]);
  const suggestTimer = useRef<ReturnType<typeof setTimeout>>();

  const loadDistricts = (provinceCode: number) => {
    setDistrictsLoading(true);
    locationApi
      .districts(provinceCode)
      .then(setDistricts)
      .catch(() => setDistricts([]))
      .finally(() => setDistrictsLoading(false));
  };

  useEffect(() => {
    if (!open) return;
    setSuggestions([]);
    setDistricts([]);
    form.resetFields();

    locationApi
      .provinces()
      .then((list) => {
        setProvinces(list);
        if (editing) {
          const parsed = parseAddress(editing.full_address, list);
          form.setFieldsValue({
            recipient_name: editing.recipient_name ?? '',
            phone_number: editing.phone_number ?? '',
            province: parsed.province,
            district: parsed.district,
            street: parsed.street,
            is_default: editing.is_default,
          });
          if (parsed.provinceCode != null) loadDistricts(parsed.provinceCode);
        }
      })
      .catch(() => {
        setProvinces([]);
        // Không tải được danh sách tỉnh (mất mạng...) — vẫn cho sửa phần khác
        if (editing) {
          form.setFieldsValue({
            recipient_name: editing.recipient_name ?? '',
            phone_number: editing.phone_number ?? '',
            street: editing.full_address,
            is_default: editing.is_default,
          });
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing, form]);

  const onProvinceChange = (name: string) => {
    // Đổi tỉnh thì quận cũ không còn hợp lệ
    form.setFieldValue('district', undefined);
    setDistricts([]);
    const province = provinces.find((p) => p.name === name);
    if (province) loadDistricts(province.code);
  };

  // Gợi ý địa chỉ: debounce 350ms, kèm ngữ cảnh quận/tỉnh đã chọn để kết quả sát hơn
  const onStreetSearch = (text: string) => {
    clearTimeout(suggestTimer.current);
    if (text.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    suggestTimer.current = setTimeout(() => {
      const { district, province } = form.getFieldsValue(['district', 'province']);
      const context = [district, province].filter(Boolean).join(', ');
      locationApi
        .suggest(context ? `${text}, ${context}` : text)
        .then(setSuggestions);
    }, 350);
  };

  // ===== Bản đồ Leaflet + tile OpenStreetMap (miễn phí, không key) =====
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);

  // Đặt/di chuyển chấm định vị rồi đưa bản đồ tới đó
  const placeMarker = (lat: number, lon: number) => {
    const map = mapRef.current;
    if (!map) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lon]);
    } else {
      markerRef.current = L.circleMarker([lat, lon], {
        radius: 8,
        color: '#1677ff',
        fillColor: '#1677ff',
        fillOpacity: 0.7,
      }).addTo(map);
    }
    map.setView([lat, lon], Math.max(map.getZoom(), 16));
  };

  // Bấm lên bản đồ: ghim vị trí + điền địa chỉ gần nhất vào ô nhập
  const onMapClick = (e: L.LeafletMouseEvent) => {
    placeMarker(e.latlng.lat, e.latlng.lng);
    locationApi.reverse(e.latlng.lat, e.latlng.lng).then((found) => {
      if (found) form.setFieldValue('street', found.street);
    });
  };

  // Chọn một gợi ý: ô địa chỉ chỉ giữ phần tên/đường (quận/tỉnh đã có ở
  // 2 select, composeAddress sẽ tự nối) + ghim vị trí lên bản đồ.
  const onStreetSelect = (value: string) => {
    const s = suggestions.find((x) => x.description === value);
    if (!s) return;
    form.setFieldValue('street', s.street);
    placeMarker(s.lat, s.lon);
  };

  // Modal destroyOnClose -> tạo map sau khi mở xong (div đã đúng kích thước),
  // huỷ khi đóng để lần mở sau tạo lại sạch.
  const onModalOpenChange = (visible: boolean) => {
    if (visible) {
      if (mapDivRef.current && !mapRef.current) {
        const map = L.map(mapDivRef.current).setView([16.047, 108.206], 5); // giữa VN
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap',
        }).addTo(map);
        map.on('click', onMapClick);
        mapRef.current = map;
      }
    } else {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    }
  };

  // Phòng khi component bị unmount lúc modal còn mở (chuyển trang...)
  useEffect(
    () => () => {
      mapRef.current?.remove();
    },
    [],
  );

  const submit = async () => {
    let values: FormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setSaving(true);
    try {
      const payload = {
        recipient_name: values.recipient_name.trim(),
        phone_number: values.phone_number.trim(),
        full_address: composeAddress(values.street, values.district, values.province),
        is_default: values.is_default ?? false,
      };
      const res = editing
        ? await addressApi.update(editing.id, payload)
        : await addressApi.create(payload);
      message.success(editing ? 'Đã cập nhật địa chỉ' : 'Đã thêm địa chỉ');
      onSaved(res.data);
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={editing ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
      onCancel={onClose}
      onOk={submit}
      okText={editing ? 'Lưu' : 'Thêm'}
      cancelText="Huỷ"
      confirmLoading={saving}
      destroyOnClose
      afterOpenChange={onModalOpenChange}
    >
      <Form form={form} layout="vertical" requiredMark>
        <Form.Item
          name="recipient_name"
          label="Họ và tên người nhận"
          rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
        >
          <Input placeholder="Nguyễn Văn A" />
        </Form.Item>
        <Form.Item
          name="phone_number"
          label="Số điện thoại"
          rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }, phoneRule]}
        >
          <Input placeholder="0912345678" />
        </Form.Item>

        <Form.Item
          name="province"
          label="Tỉnh / Thành phố"
          rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố' }]}
        >
          <Select
            showSearch
            placeholder="Chọn tỉnh/thành phố"
            optionFilterProp="label"
            onChange={onProvinceChange}
            options={provinces.map((p) => ({ value: p.name, label: p.name }))}
            notFoundContent={provinces.length === 0 ? 'Không tải được danh sách' : undefined}
          />
        </Form.Item>

        {/* Khoá tới khi chọn tỉnh — chọn theo đúng thứ tự tỉnh -> quận/huyện */}
        <Form.Item
          name="district"
          label="Quận / Huyện"
          rules={[{ required: true, message: 'Vui lòng chọn quận/huyện' }]}
        >
          <Select
            showSearch
            placeholder={districts.length === 0 ? 'Chọn tỉnh/thành phố trước' : 'Chọn quận/huyện'}
            optionFilterProp="label"
            disabled={districts.length === 0 && !districtsLoading}
            loading={districtsLoading}
            options={districts.map((d) => ({ value: d.name, label: d.name }))}
          />
        </Form.Item>

        <Form.Item
          name="street"
          label="Địa chỉ cụ thể"
          extra={
            <>
              <EnvironmentOutlined /> Gõ để nhận gợi ý, hoặc bấm thẳng lên bản
              đồ để ghim vị trí
            </>
          }
          rules={[
            { required: true, message: 'Vui lòng nhập địa chỉ cụ thể' },
            { max: 255, message: 'Địa chỉ tối đa 255 ký tự' },
          ]}
        >
          <AutoComplete
            options={suggestions.map((s) => ({ value: s.description, key: s.place_id }))}
            onSearch={onStreetSearch}
            onSelect={onStreetSelect}
            placeholder="Số nhà, tên đường, phường/xã"
          />
        </Form.Item>

        {/* Bản đồ OpenStreetMap. position:relative + zIndex:0 tạo stacking
            context riêng để pane của Leaflet không đè dropdown của antd. */}
        <div
          ref={mapDivRef}
          style={{
            height: 220,
            borderRadius: 8,
            marginBottom: 16,
            position: 'relative',
            zIndex: 0,
          }}
        />

        <Form.Item name="is_default" valuePropName="checked">
          <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
}
