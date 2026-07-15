import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { DiscountCode } from './discount-code.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from './payment.entity';

// simulated_success / cancelled / pending / paid / shipped
export type OrderStatus = 'simulated_success' | 'cancelled' | 'pending' | 'paid' | 'shipped';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, (user) => user.orders, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  cart_id: string | null;

  @Column({ type: 'uuid', nullable: true })
  discount_code_id: string | null;

  @ManyToOne(() => DiscountCode, (discountCode) => discountCode.orders, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'discount_code_id' })
  discount_code: DiscountCode | null;

  @Column({ type: 'bigint' })
  subtotal: number;

  @Column({ type: 'bigint', default: 0 })
  shipping_fee: number;

  @Column({ type: 'bigint', default: 0 })
  discount_amount: number;

  @Column({ type: 'bigint' })
  total: number;

  // simulated_success / cancelled / pending / paid / shipped
  @Column({ type: 'varchar', length: 30, default: 'simulated_success' })
  status: OrderStatus;

  // Ghi chú đơn hàng
  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];

  @OneToOne(() => Payment, (payment) => payment.order)
  payment: Payment;
}