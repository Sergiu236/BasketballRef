import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    Index,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { Game } from './Game';
  import { User } from './User';
  
  @Entity({ name: 'Referees' })
  export class Referee {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @Column({ type: 'varchar', length: 100 })
    @Index()
    firstName!: string;
  
    @Column({ type: 'varchar', length: 100 })
    @Index()
    lastName!: string;
  
    @Column({ type: 'varchar', length: 50 })
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
  
    @Column({ type: 'varchar', length: 200, nullable: true })
    t1VsT2!: string | null;
  
    @Column({ type: 'date', nullable: true })
    matchDate!: Date | null;
  
    @Column({ type: 'varchar', length: 200 })
    photo!: string;
  
    @Column({ nullable: true })
    userId!: number | null;
  
    // ─────────────────────────────────────────────
    // Relations
    // ─────────────────────────────────────────────
    @OneToMany(() => Game, (game) => game.referee, { cascade: ['insert', 'update'] })
    games!: Game[];
  
    @ManyToOne(() => User, (user) => user.referees, { nullable: true })
    @JoinColumn({ name: 'userId' })
    user!: User;
  }
  