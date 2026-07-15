import { Entity, PrimaryColumn, Column, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_preferences')
export class UserPreference {
  // 1 user có 1 hồ sơ
  @PrimaryColumn({ type: 'uuid' })
  user_id: string;

  @OneToOne(() => User, (user) => user.preference, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Danh mục quan tâm kèm trọng số, VD: {"laptop":0.8,"dien_thoai":0.5}
  @Column({ type: 'json', nullable: true })
  preferred_categories: Record<string, number> | null;

  // Khoảng ngân sách hay tìm, VD: {"min":10000000,"max":20000000}
  @Column({ type: 'json', nullable: true })
  budget_range: { min: number; max: number } | null;

  // Thương hiệu ưa thích, VD: ["Apple","Dell"]
  @Column({ type: 'json', nullable: true })
  preferred_brands: string[] | null;

  // Thuộc tính quan tâm: pin tốt, mỏng nhẹ, hiệu năng cao...
  @Column({ type: 'json', nullable: true })
  preferred_attributes: string[] | null;

  // Tóm tắt nhu cầu gần nhất để AI gợi lại ngay khi user quay lại
  @Column({ type: 'text', nullable: true })
  last_intent_summary: string | null;

  // Cập nhật mỗi khi có event mới hoặc job tổng hợp định kỳ
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

