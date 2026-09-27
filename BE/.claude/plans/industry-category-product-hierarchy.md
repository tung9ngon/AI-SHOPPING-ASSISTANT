# Plan: Thêm cấu trúc Ngành học - Danh mục - Sản phẩm

## Context

Hiện tại hệ thống có cấu trúc phẳng:
- **Category**: chỉ có name, icon, sortOrder, isActive (không có hierarchy)
- **Product**: link đến 1 Category qua `category_id`

Yêu cầu: Xây dựng hierarchy 3 cấp:
```
Ngành học (Industry)
  └── Danh mục (Category)
        └── Sản phẩm (Product)
```

## Cách tiếp cận được chọn: **Separate Industry Entity**

### Tại sao không dùng self-referencing (parent_id)?
- Phân biệt rõ ràng giữa Industry và Category (khác nhau về bản chất)
- Truy vấn đơn giản hơn (không cần recursive CTE)
- Schema dễ hiểu, dễ maintain
- Có thể mở rộng thêm metadata riêng cho từng loại

## Database Changes

### 1. Tạo bảng `industries`

```sql
CREATE TABLE industries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Thêm `industry_id` vào bảng `categories`

```sql
ALTER TABLE categories ADD COLUMN industry_id UUID REFERENCES industries(id) ON DELETE SET NULL;
CREATE INDEX idx_categories_industry ON categories(industry_id);
```

### 3. Cập nhật Product entity (giữ nguyên category_id)

Products tiếp tục link đến Category, không cần thay đổi.

---

## Entity Files

### 1. Tạo `src/database/industry.entity.ts`

```typescript
@Entity('industries')
export class Industry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon: string | null;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Category, (category) => category.industry)
  categories: Category[];
}
```

### 2. Cập nhật `src/database/category.entity.ts`

Thêm relationship đến Industry:

```typescript
@ManyToOne(() => Industry, (industry) => industry.categories, {
  nullable: true,
  onDelete: 'SET NULL',
})
@JoinColumn({ name: 'industry_id' })
industry: Industry | null;

@Column({ type: 'uuid', nullable: true })
industry_id: string | null;
```

---

## DTOs

### 1. Admin Industry DTOs (`src/admin/industry/industry.admin.dto.ts`)

```typescript
export class CreateIndustryDto {
  name: string;
  icon?: string;
  sort_order?: number;
  is_active?: boolean;
}

export class UpdateIndustryDto {
  name?: string;
  icon?: string;
  sort_order?: number;
  is_active?: boolean;
}

export class QueryIndustryDto {
  search?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}
```

### 2. User Industry DTOs (`src/users/industry/industry.dto.ts`)

```typescript
export class IndustryQueryDto {
  include_products?: boolean; // true = nested categories with products
  page?: number;
  limit?: number;
}
```

---

## Services

### 1. Admin Industry Service (`src/admin/industry/industry.admin.service.ts`)

Methods:
- `findAll(query)` - List all with search/filter/pagination
- `findOne(id)` - Get single with categories
- `create(dto)` - Create new industry
- `update(id, dto)` - Update industry
- `delete(id)` - Soft delete
- `deleteHard(id)` - Hard delete (only if no categories)

### 2. User Industry Service (`src/users/industry/industry.service.ts`)

Methods:
- `findAllActive()` - List all active industries with categories (no products)
- `findOneActive(id, includeProducts, page, limit)` - Get industry with categories and optionally products

---

## Controllers

### 1. Admin Controller (`src/admin/industry/industry.admin.controller.ts`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/industries` | List all |
| GET | `/admin/industries/:id` | Get one with categories |
| POST | `/admin/industries` | Create |
| PATCH | `/admin/industries/:id` | Update |
| DELETE | `/admin/industries/:id` | Soft delete |
| DELETE | `/admin/industries/:id/hard` | Hard delete |

### 2. User Controller (`src/users/industry/industry.controller.ts`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/industries` | List active industries with categories |
| GET | `/industries/:id` | Get industry with categories & products |

---

## Module Updates

### 1. Create `src/admin/industry/industry.admin.module.ts`

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Industry, Category])],
  controllers: [IndustryAdminController],
  providers: [IndustryAdminService],
})
export class IndustryAdminModule {}
```

### 2. Create `src/users/industry/industry.module.ts`

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Industry, Category, Product])],
  controllers: [IndustryController],
  providers: [IndustryService],
})
export class IndustryModule {}
```

### 3. Update `src/app.module.ts`

Add imports:
- `IndustryAdminModule` to `AdminModule` imports
- `IndustryModule` to `UserModule` imports

### 4. Update `src/database/index.ts`

Export `Industry` entity.

---

## API Response Examples

### GET /industries (User)
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Công nghệ thông tin",
      "icon": "💻",
      "sort_order": 1,
      "categories": [
        {
          "id": "uuid",
          "name": "Laptop",
          "icon": "💻",
          "product_count": 25
        },
        {
          "id": "uuid", 
          "name": "Điện thoại",
          "icon": "📱",
          "product_count": 18
        }
      ]
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 20
}
```

### GET /industries/:id (User - with products)
```json
{
  "id": "uuid",
  "name": "Công nghệ thông tin",
  "icon": "💻",
  "categories": [
    {
      "id": "uuid",
      "name": "Laptop",
      "products": {
        "items": [...],
        "total": 25,
        "page": 1,
        "limit": 20
      }
    }
  ]
}
```

---

## Files to Create/Modify

### Create (mới hoàn toàn):
- `src/database/industry.entity.ts`
- `src/admin/industry/industry.admin.controller.ts`
- `src/admin/industry/industry.admin.service.ts`
- `src/admin/industry/industry.admin.module.ts`
- `src/admin/industry/industry.admin.dto.ts`
- `src/users/industry/industry.controller.ts`
- `src/users/industry/industry.service.ts`
- `src/users/industry/industry.module.ts`
- `src/users/industry/industry.dto.ts`

### Modify:
- `src/database/category.entity.ts` - thêm industry_id
- `src/database/index.ts` - export Industry
- `src/admin/admin.module.ts` - import IndustryAdminModule
- `src/users/app.module.ts` (hoặc user.module) - import IndustryModule

---

## Migration Commands

```bash
# Tạo migration mới
npx typeorm migration:create -n AddIndustryTable

# Chạy migration
npm run migration:run

# Revert migration  
npm run migration:revert
```

---

## Verification

1. **Unit Tests:**
   - Test Industry CRUD operations
   - Test cascade behavior (delete industry → categories set null)
   - Test pagination

2. **Integration Tests:**
   - Test `/industries` endpoint trả về đúng hierarchy
   - Test `/industries/:id` với products
   - Test admin endpoints với auth guard

3. **Manual Testing:**
   - Tạo industry mới qua admin API
   - Gán category vào industry
   - Verify products vẫn link đúng qua category
   - Test filter products theo industry

---

## Backward Compatibility

- Category entity giữ nguyên `category_id` của Product
- API `/categories` vẫn hoạt động (categories không có industry_id sẽ trả về null)
- Frontend có thể migrate dần: hiển thị industries → categories → products
