import { useEffect, useState } from 'react';
import { App, Checkbox, Form, Input, Modal } from 'antd';
import { addressApi } from '../../api/addresses';
import { getErrorMessage } from '../../api/client';
import { phoneRule } from '../../utils/validators';
import type { Address } from '../../types';

// Modal thêm/sửa địa chỉ. `editing` = null -> thêm mới; có giá trị -> sửa.
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
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editing) {
        form.setFieldsValue({
          recipient_name: editing.recipient_name,
          phone_number: editing.phone_number,
          full_address: editing.full_address,
          is_default: editing.is_default,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, editing, form]);

  const submit = async () => {
    let values: {
      recipient_name: string;
      phone_number: string;
      full_address: string;
      is_default?: boolean;
    };
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
        full_address: values.full_address.trim(),
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
          name="full_address"
          label="Địa chỉ"
          rules={[
            { required: true, message: 'Vui lòng nhập địa chỉ' },
            { max: 255, message: 'Địa chỉ tối đa 255 ký tự' },
          ]}
        >
          <Input.TextArea
            rows={2}
            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
          />
        </Form.Item>
        <Form.Item name="is_default" valuePropName="checked">
          <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
}
