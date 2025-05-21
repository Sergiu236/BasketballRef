import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './User';

export enum LogAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
}

export enum EntityType {
  REFEREE = 'referee',
  GAME = 'game',
  USER = 'user',
  MONITORED_USER = 'monitored_user',
}

@Entity({ name: 'Logs' })
export class Log {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column({ type: 'varchar', length: 50 })
  action!: string;

  @Column({ type: 'varchar', length: 50 })
  entityType!: string;

  @Column({ type: 'integer', nullable: true })
  entityId!: number | null;

  @CreateDateColumn()
  timestamp!: Date;

  @Column({ type: 'text', nullable: true })
  details!: string | null;

  // ─────────────────────────────────────────────
  // Relations
  // ─────────────────────────────────────────────
  @ManyToOne(() => User, (user) => user.logs)
  @JoinColumn({ name: 'userId' })
  user!: User;
} 
