import request from 'supertest';
import { getConnection } from 'typeorm';

import app from '../../src/App';
import createConnection from '../../src/database/';

describe('Create a new User', () => {
  beforeAll(async () => {
    const connection = await createConnection();
    await connection.runMigrations();
  });

  // Drop database and close the connection with BD
  afterAll(async () => {
    const connection = getConnection();
    await connection.dropDatabase();
    await connection.close();
  });

  const createUserRoute = '/registrar-usuario';

  it('should be not able to create a new user with invalid fields', async () => {
    const response = await request(app)
      .post(createUserRoute)
      .send({ name: 'Sávio', email: 'savioemaill.com' }); // invalid email and missing password
    expect(response.status).toBe(401);
  });

  it('should be able to create a new user with valid fields', async () => {
    const response = await request(app)
      .post(createUserRoute)
      .send({ name: 'Sávio', email: 'savio@email.com', password: '12345678' });
    expect(response.status).toBe(201);
  });

  it('should not be able to create a new user with exists email', async () => {
    const response = await request(app)
      .post(createUserRoute)
      .send({ name: 'Sávio', email: 'savio@email.com', password: '12345678' });
    expect(response.status).toBe(401);
  });
});
