import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import TaskGroup from './TaskGroup';

export interface ITask {
  id: string;
  name: string;
  priority: '1' | '2' | '3';
  status: 'completed' | 'inprogress' | 'todo';
  notes?: string;
}

@Entity('tasks')
export default class Task implements ITask {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 1,
  })
  priority!: '1' | '2' | '3';

  @Column({
    type: 'varchar',
    default: 'todo',
  })
  status!: 'completed' | 'inprogress' | 'todo';

  @Column({
    type: 'varchar',
    nullable: true,
  })
  notes?: string;

  @ManyToOne(() => TaskGroup, (task_group) => task_group.tasks)
  @JoinColumn({ name: 'task_group_id' })
  task_group!: TaskGroup;
}
