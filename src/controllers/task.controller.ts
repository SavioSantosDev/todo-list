import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import * as yup from 'yup';

import { ITask } from '../models/Task';
import TaskGroupRepository from '../repositories/task-group.repository';
import TaskRepository from '../repositories/task.repository';

export default class TaskController {
  async store(
    req: Request,
    res: Response,
  ): Promise<Response<unknown, Record<string, unknown>>> {
    try {
      const { name, priority, notes }: ITask = req.body;
      const { taskGroupId } = req.params;

      // Validating fields
      const schema = yup.object().shape({
        name: yup.string().required().max(255),
        priority: yup.string().required().matches(/[1-3]/).max(1),
        notes: yup.string().nullable(),
      });
      await schema.validate({ name, priority, notes });

      const taskGroupRepository = getCustomRepository(TaskGroupRepository);
      const taskRepository = getCustomRepository(TaskRepository);

      const taskGroup = await taskGroupRepository.findOne({ id: taskGroupId });
      const createdTask = taskRepository.create({
        name,
        priority,
        notes,
        task_group: taskGroup,
      });
      await taskRepository.save(createdTask);

      return res.status(201).json(createdTask);
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        return res.status(401).json({ error: err.errors });
      }

      console.log(err);
      return res.status(500).json({ error: 'Internal server error!' });
    }
  }
}
