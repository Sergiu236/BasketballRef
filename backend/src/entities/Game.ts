import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
  } from 'typeorm';
  import { Referee } from './Referee';
  
  @Entity({ name: 'Games' })
  export class Game {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @Column({ type: 'datetime2' })
    @Index()
    date!: Date;
  
    @Column({ type: 'nvarchar', length: 200 })
    @Index()
    location!: string;
  
    @Column({
      type: 'nvarchar',
      length: 20,
      default: () => "('scheduled')",   // matches the SQL script exactly
    })
    @Index()
    status!: string;
  
    // ─────────────────────────────────────────────
    // Relations
    // ─────────────────────────────────────────────
    @ManyToOne(() => Referee, (ref) => ref.games, {
      onDelete: 'CASCADE',
      eager: true,
    })
    @JoinColumn({ name: 'refereeId' })
    referee!: Referee;
  }
  