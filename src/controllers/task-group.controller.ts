import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import * as yup from 'yup';

import TaskGroupRepository from '../repositories/task-group.repository';
import { UserRepository } from '../repositories/user.repository';

export default class TaskGroupController {
  async store(
    req: Request,
    res: Response,
  ): Promise<Response<unknown, Record<string, unknown>>> {
    try {
      const { name, description } = req.body;

      // Validating the fields
      const schema = yup.object().shape({
        name: yup.string().required(),
        description: yup.string().required(),
      });
      await schema.validate({ name, description });

      // Find the current logged user
      const userRepository = getCustomRepository(UserRepository);
      const user = await userRepository.findOne({ id: res.locals.userId });

      // Creating and saving the task group
      const taskGroupRepository = getCustomRepository(TaskGroupRepository);
      const createdTaskGroup = taskGroupRepository.create({
        name,
        description,
        user,
      });
      await taskGroupRepository.save(createdTaskGroup);

      return res.status(201).json(createdTaskGroup);
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        return res.status(401).json({ error: err.errors });
      }
      console.log(err);
      return res.status(500).json({ error: 'Internal server error!' });
    }
  }

  async index(
    req: Request,
    res: Response,
  ): Promise<Response<unknown, Record<string, unknown>>> {
    try {
      const taskGroupRepository = getCustomRepository(TaskGroupRepository);
      const taskGroups = await taskGroupRepository.find({
        relations: ['user', 'tasks'],
      });
      return res.json(taskGroups);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal server error!' });
    }
  }

  async show(
    req: Request,
    res: Response,
  ): Promise<Response<unknown, Record<string, unknown>>> {
    try {
      const taskGroupRepository = getCustomRepository(TaskGroupRepository);
      const { taskGroupId } = req.params;

      const taskGroup = await taskGroupRepository.findOne(
        { id: taskGroupId },
        { relations: ['user', 'tasks'] },
      );
      if (!taskGroup) {
        return res.status(401).json({ error: 'Task Group not exist!' });
      }

      return res.json(taskGroup);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal server error!' });
    }
  }
}
