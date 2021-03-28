import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import * as yup from 'yup';
import { ValidationError } from 'yup';

import { UserRepository } from '../repositories/user.repository';

export default class UserController {
  async store(
    req: Request,
    res: Response,
  ): Promise<Response<unknown, Record<string, unknown>>> {
    try {
      const userRepository = getCustomRepository(UserRepository);
      const { name, email, password } = req.body;

      const schema = yup.object().shape({
        name: yup.string().required().max(255),
        email: yup.string().required().email().max(255),
        password: yup.string().min(8).max(50),
      });

      await schema.validate({ name, email, password }, { abortEarly: false });

      if (await userRepository.findOne({ email })) {
        return res.status(401).json({ error: 'User already exits!' });
      }

      const createdUser = await userRepository.createUserAndSave({
        name,
        email,
        password,
      });

      return res.status(201).json({ createdUser });
    } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(401).json({ error: err.errors });
      }
      console.log(err);
      return res.status(500).json({ error: 'Deu pau no servidor!!!!' });
    }
  }

  async login(
    req: Request,
    res: Response,
  ): Promise<Response<unknown, Record<string, unknown>>> {
    try {
      const userRepository = getCustomRepository(UserRepository);
      const { email, password } = req.body;

      // Validating the fields
      const schema = yup.object().shape({
        email: yup.string().required().email().max(255),
        password: yup.string().min(8).max(50),
      });
      await schema.validate({ email, password }, { abortEarly: false });

      // Check email and password
      const user = await userRepository.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'User does not exist!' });
      }
      if (!(await user.passwordIsValid(password))) {
        return res.status(401).json({ error: 'Icorrect password!' });
      }

      // Generate and return JWB
      const token = user.generateToken();
      return res.json({ token });
    } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(401).json({ error: err.errors });
      }
      console.log(err);
      return res.status(500).json({ error: 'Deu pau no servidor!!!!' });
    }
  }
}
