import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'LoginAttempts' })
export class LoginAttempt {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  username!: string;

  @Column({ type: 'varchar', length: 45 })
  @Index()
  ipAddress!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent!: string | null;

  @Column({ type: 'boolean', default: false })
  successful!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  failureReason!: string | null;

  @CreateDateColumn()
  @Index()
  attemptedAt!: Date;
} 