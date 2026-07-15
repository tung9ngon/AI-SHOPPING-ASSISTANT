import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Order } from './order.entity';

export type DiscountType = 'percent' | 'fixed_amount';

@Entity('discount_codes')
export class DiscountCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Mã giảm giá: SALE10, WELCOME...
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  // percent / fixed_amount
  @Column({ type: 'varchar', length: 20 })
  discount_type: DiscountType;

  // 10 (=10%) hoặc 50000 (=50k VNĐ)
  @Column({ type: 'bigint' })
  discount_value: number;

  // Giá trị đơn hàng tối thiểu
  @Column({ type: 'bigint', nullable: true })
  min_order_value: number | null;

  // Giảm tối đa (cho percent)
  @Column({ type: 'bigint', nullable: true })
  max_discount: number | null;

  // Số lần dùng tối đa
  @Column({ type: 'int', nullable: true })
  usage_limit: number | null;

  @Column({ type: 'int', default: 0 })
  used_count: number;

  @Column({ type: 'timestamp', nullable: true })
  valid_from: Date;

  @Column({ type: 'timestamp', nullable: true })
  valid_until: Date | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @OneToMany(() => Order, (order) => order.discount_code)
  orders: Order[];
}

