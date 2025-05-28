import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './User';

@Entity({ name: 'MonitoredUsers' })
export class MonitoredUser {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column({ type: 'varchar', length: 255 })
  reason!: string;

  @CreateDateColumn()
  detectedAt!: Date;

  @Column()
  actionsCount!: number;

  @Column()
  timeWindow!: number; // time window in minutes

  @Column({ type: 'bit', default: 1 })
  isActive!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt!: Date | null;

  @Column({ nullable: true })
  resolvedBy!: number | null;

  // ─────────────────────────────────────────────
  // Relations
  // ─────────────────────────────────────────────
  @ManyToOne(() => User, (user) => user.monitoringRecords)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => User, (user) => user.resolvedMonitorings)
  @JoinColumn({ name: 'resolvedBy' })
  resolvedByUser!: User;
} 