# Contract API — Sổ địa chỉ (Hướng A)

FE đã dựng xong và gọi theo đúng hợp đồng dưới đây. **Bạn dựng BE khớp các endpoint + shape này** thì FE chạy ngay, không cần sửa FE.

- Tất cả endpoint yêu cầu **đăng nhập** (dùng `JwtAccessGuard`), lấy user từ **`req.user.sub`**.
- Prefix toàn cục `/api`. Base path gợi ý: `@Controller('addresses')`.
- Kiểu tiền/tham chiếu: `id` là **uuid (string)**.

## 1. Entity / bảng gợi ý `addresses`

| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | FK -> users, ManyToOne |
| recipient_name | varchar(255) | họ tên người nhận |
| recipient_phone | varchar(20) | SĐT |
| address | text | địa chỉ đầy đủ |
| is_default | boolean default false | địa chỉ mặc định |
| created_at | timestamp | |

## 2. Các endpoint FE đang gọi

### GET `/api/addresses`
- Trả **mảng** địa chỉ của user hiện tại. Gợi ý: sắp `is_default = true` lên đầu, rồi `created_at DESC`.
- Response `200`:
```json
[
  { "id": "uuid", "recipient_name": "Nguyễn Văn A", "recipient_phone": "0912345678",
    "address": "123 Lê Lợi, Q1, TP.HCM", "is_default": true, "created_at": "2026-07-20T..." }
]
```

### POST `/api/addresses`
- Body:
```json
{ "recipient_name": "string", "recipient_phone": "string", "address": "string", "is_default": false }
```
- Validate gợi ý: name/phone/address **required**; phone khớp `^(0|\+84)\d{9,10}$`.
- Nếu `is_default = true` -> bỏ mặc định các địa chỉ khác của user. Nếu đây là địa chỉ ĐẦU TIÊN -> tự set default = true.
- Response `201`: object `Address` vừa tạo.

### PUT `/api/addresses/:id`
- Body: các field như POST nhưng **optional** (partial update).
- Chỉ cho sửa địa chỉ thuộc user hiện tại (nếu không -> 404).
- Response `200`: `Address` sau cập nhật.

### DELETE `/api/addresses/:id`
- Chỉ xoá địa chỉ của user hiện tại.
- Response `200`: `{ "message": "Đã xoá địa chỉ" }`.

### PATCH `/api/addresses/:id/default`
- Đặt địa chỉ này làm mặc định, bỏ mặc định các địa chỉ khác của user.
- Response `200`: `Address` (đã `is_default = true`).

## 3. Tích hợp với đặt hàng (QUAN TRỌNG)

FE gửi thêm `address_id` khi tạo đơn:

### POST `/api/orders`  (bổ sung field)
- Body giờ là:
```json
{ "address_id": "uuid", "discount_code": "string?", "note": "string?" }
```
- ⚠️ Backend đang bật `forbidNonWhitelisted: true` -> **BẮT BUỘC thêm `address_id` vào `CreateOrderDto`** (nếu không sẽ trả 400).
- Xử lý gợi ý: tra `address_id` (verify thuộc user), rồi **snapshot** `recipient_name / recipient_phone / address` vào đơn hàng (thêm 3 cột vào `orders`) — để lịch sử đơn giữ nguyên kể cả khi sau này user sửa/xoá địa chỉ.
- (Tuỳ chọn) trả các field người nhận này trong `GET /api/orders/:id` để màn "Đơn hàng của tôi" hiển thị.

## 4. Ghi chú
- Khi BE chưa dựng, FE vẫn chạy nhưng các trang địa chỉ sẽ báo lỗi/empty (do gọi API chưa có) — dựng BE xong là hết.
- FE liên quan: `src/api/addresses.ts`, `src/pages/account/AddressBookPage.tsx`, `src/pages/account/AddressFormModal.tsx`, tích hợp trong `src/pages/checkout/CheckoutPage.tsx`.
