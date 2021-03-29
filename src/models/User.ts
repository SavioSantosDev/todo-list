import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export interface IUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  password: string;
  created_at: Date;
}

@Entity('users')
export default class User implements IUser {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  name!: string;

  @Column({
    type: 'varchar',
    unique: true,
    length: 255,
  })
  email!: string;

  @Column({
    type: 'varchar',
  })
  password_hash!: string;

  password!: string; // Virtual

  @CreateDateColumn()
  created_at!: Date;

  async passwordIsValid(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password_hash);
  }

  generateToken(): string {
    return jwt.sign(
      { id: this.id, email: this.email },
      process.env.TOKEN_SECRET as string,
      { expiresIn: process.env.TOKEN_EXPIRATION },
    );
  }
}
