import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Referee } from './Referee';
import { Log } from './Log';
import { Game } from './Game';
import { MonitoredUser } from './MonitoredUser';
import { UserSession } from './UserSession';

export enum UserRole {
  REGULAR = 'Regular',
  ADMIN = 'Admin',
}

@Entity({ name: 'Users' })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  username!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  email!: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: UserRole.REGULAR,
  })
  role!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin!: Date | null;

  // ─────────────────────────────────────────────
  // Relations
  // ─────────────────────────────────────────────
  @OneToMany(() => Referee, (referee) => referee.user)
  referees!: Referee[];

  @OneToMany(() => Log, (log) => log.user)
  logs!: Log[];

  @OneToMany(() => Game, (game) => game.createdBy)
  createdGames!: Game[];

  @OneToMany(() => Game, (game) => game.updatedBy)
  updatedGames!: Game[];

  @OneToMany(() => MonitoredUser, (monitoredUser) => monitoredUser.user)
  monitoringRecords!: MonitoredUser[];

  @OneToMany(() => MonitoredUser, (monitoredUser) => monitoredUser.resolvedByUser)
  resolvedMonitorings!: MonitoredUser[];

  @OneToMany(() => UserSession, (session) => session.user)
  sessions!: UserSession[];
} 