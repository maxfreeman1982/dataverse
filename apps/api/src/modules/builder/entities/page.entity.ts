import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { User } from '../../users/user.entity';
import { PageComponent } from './page-component.entity';

export enum PageStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

registerEnumType(PageStatus, {
  name: 'PageStatus',
});

@ObjectType()
@Entity('pages')
export class Page {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field()
  @Column({ unique: true })
  slug: string;

  @Field(() => PageStatus)
  @Column({
    type: 'simple-enum',
    enum: PageStatus,
    default: PageStatus.DRAFT,
  })
  status: PageStatus;

  @Field({ nullable: true })
  @Column({ name: 'icon', nullable: true })
  icon?: string;

  @Field({ nullable: true })
  @Column({ name: 'cover_image', nullable: true })
  coverImage?: string;

  @Field(() => [PageComponent], { nullable: true })
  @OneToMany(() => PageComponent, (component) => component.page, {
    cascade: true,
    eager: true,
  })
  components?: PageComponent[];

  @Column({ name: 'created_by' })
  createdById: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field({ nullable: true })
  @Column({ name: 'published_at', nullable: true })
  publishedAt?: Date;
}
