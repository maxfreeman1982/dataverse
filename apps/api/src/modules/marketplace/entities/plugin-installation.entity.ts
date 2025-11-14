import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { User } from '../../auth/entities/user.entity';
import { Plugin } from './plugin.entity';

export enum InstallationStatus {
  INSTALLING = 'installing',
  INSTALLED = 'installed',
  FAILED = 'failed',
  UNINSTALLED = 'uninstalled',
}

registerEnumType(InstallationStatus, {
  name: 'InstallationStatus',
});

@ObjectType()
@Entity('plugin_installations')
export class PluginInstallation {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ name: 'plugin_id' })
  pluginId: string;

  @Field(() => Plugin)
  @ManyToOne(() => Plugin, (plugin) => plugin.installations)
  @JoinColumn({ name: 'plugin_id' })
  plugin: Plugin;

  @Field()
  @Column({ name: 'user_id' })
  userId: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field()
  @Column({ name: 'installed_version' })
  installedVersion: string;

  @Field(() => InstallationStatus)
  @Column({
    type: 'enum',
    enum: InstallationStatus,
    default: InstallationStatus.INSTALLING,
  })
  status: InstallationStatus;

  @Field()
  @Column({ default: true, name: 'is_enabled' })
  isEnabled: boolean;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  settings?: Record<string, any>;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true, name: 'error_message' })
  errorMessage?: string;

  @Field()
  @CreateDateColumn({ name: 'installed_at' })
  installedAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true, name: 'last_used_at' })
  lastUsedAt?: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
