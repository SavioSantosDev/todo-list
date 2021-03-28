import { EntityRepository, Repository } from 'typeorm';
import bcrypt from 'bcryptjs';

import User, { IUser } from '../models/User';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  /**
   * It create a new instance of User, generate password_hash and save in database
   * @param userInfos { name, email, password }
   */
  async createUserAndSave(
    userInfos: Pick<IUser, 'name' | 'email' | 'password'>,
  ): Promise<User> {
    const user = new User();

    user.name = userInfos.name;
    user.email = userInfos.email;
    user.password_hash = await bcrypt.hash(userInfos.password, 10);

    const createdUser = this.create(user);
    await this.save(createdUser);
    return createdUser;
  }
}
