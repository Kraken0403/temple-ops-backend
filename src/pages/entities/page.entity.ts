import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
  } from 'typeorm';
  
  @Entity('pages')
  @Unique(['slug'])
  export class Page {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    slug: string;
  
    @Column()
    title: string;
  
    @Column()
    template: string;
  
    @Column({ type: 'simple-json' })
    content: Record<string, any>;
  
    @Column({ type: 'simple-json', nullable: true })
    meta?: Record<string, any>;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  