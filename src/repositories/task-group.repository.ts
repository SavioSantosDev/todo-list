import { EntityRepository, Repository } from 'typeorm';
import TaskGroup from '../models/TaskGroup';

@EntityRepository(TaskGroup)
export default class TaskGroupRepository extends Repository<TaskGroup> {}
