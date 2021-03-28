import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getCustomRepository } from 'typeorm';

import { UserRepository } from '../repositories/user.repository';

export default async function (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | Response<unknown, Record<string, unknown>>> {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'Token missing!' });
  }

  const [, token] = authorization.split(' ');

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET as string) as {
      id: string;
      email: string;
    };
    const { id, email } = decoded; // payload

    // Find user on database
    // const userRepository = getCustomRepository(UserRepository);
    // const user = await userRepository.findOne({ where: { id, email } });
    // if (!user) {
    //   return res.status(401).json({ error: 'User does not exist!' });
    // }

    // Passing email and user id forward
    res.locals.id = id;
    res.locals.email = email;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token!' });
  }
}
