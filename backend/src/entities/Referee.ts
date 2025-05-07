import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    Index,
  } from 'typeorm';
  import { Game } from './Game';
  
  @Entity({ name: 'Referees' })
  export class Referee {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @Column({ type: 'nvarchar', length: 100 })
    @Index()
    firstName!: string;
  
    @Column({ type: 'nvarchar', length: 100 })
    @Index()
    lastName!: string;
  
    @Column({ type: 'nvarchar', length: 50 })
    @Index()
    league!: string;
  
    @Column()
    age!: number;
  
    @Column()
    grade!: number;
  
    @Column({ type: 'date' })
    promovationDate!: Date;
  
    @Column({ default: 0 })
    refereedGames!: number;
  
    @Column({ type: 'nvarchar', length: 200, nullable: true })
    t1VsT2!: string | null;
  
    @Column({ type: 'date', nullable: true })
    matchDate!: Date | null;
  
    @Column({ type: 'nvarchar', length: 200 })
    photo!: string;
  
    // ─────────────────────────────────────────────
    // Relations
    // ─────────────────────────────────────────────
    @OneToMany(() => Game, (game) => game.referee, { cascade: ['insert', 'update'] })
    games!: Game[];
  }
  