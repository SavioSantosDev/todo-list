import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Task from './Task';
import User from './User';

export interface ITasKGroup {
  id: string;
  name: string;
  description: string;
}

@Entity('task_groups')
export default class TaskGroup implements ITasKGroup {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  name!: string;

  @Column('varchar')
  description!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => Task, (task) => task.task_group, {
    cascade: ['insert', 'update'],
  })
  @JoinColumn({ name: 'task_group_id' })
  tasks!: Task[];
}
