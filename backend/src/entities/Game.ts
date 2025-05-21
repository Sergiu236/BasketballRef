import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
  } from 'typeorm';
  import { Referee } from './Referee';
  import { User } from './User';
  
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
  
    @Column({ nullable: true })
    createdById!: number | null;
  
    @Column({ nullable: true })
    updatedById!: number | null;
  
    // ─────────────────────────────────────────────
    // Relations
    // ─────────────────────────────────────────────
    @ManyToOne(() => Referee, (ref) => ref.games, {
      onDelete: 'CASCADE',
      eager: true,
    })
    @JoinColumn({ name: 'refereeId' })
    referee!: Referee;
  
    @ManyToOne(() => User, (user) => user.createdGames)
    @JoinColumn({ name: 'createdById' })
    createdBy!: User;
  
    @ManyToOne(() => User, (user) => user.updatedGames)
    @JoinColumn({ name: 'updatedById' })
    updatedBy!: User;
  }
  