import request from 'supertest';
import { createConnection, getConnection } from 'typeorm';

import app from '../../src/App';
import User from '../../src/models/User';

describe('Authentication', () => {
  // Run migrations and create a new user for test authentiation
  beforeAll(async () => {
    const connection = await createConnection();
    await connection.runMigrations();

    await request(app).post('/registrar-usuario').send({
      name: 'Test User',
      email: 'test@email.com',
      password: '12345678',
    });
  });

  // Drop database and close the connection with BD
  afterAll(async () => {
    const connection = getConnection();
    await connection.dropDatabase();
    await connection.close();
  });

  const loginRoute = '/login';

  it('should authenticate with valid credentials', async () => {
    const response = await request(app)
      .post(loginRoute)
      .send({ email: 'test@email.com', password: '12345678' });

    expect(response.status).toBe(200);
  });

  it('should not authenticate with invalid fields', async () => {
    const response = await request(app)
      .post(loginRoute)
      .send({ email: 'testemail.com', password: '123456' });

    expect(response.status).toBe(401);
  });

  it('should not authenticate with invalid credentials', async () => {
    const response = await request(app)
      .post(loginRoute)
      .send({ email: 'invalid@email.com', password: '87654321' });

    expect(response.status).toBe(401);
  });

  it('should return JWT token when authenticate', async () => {
    const response = await request(app)
      .post(loginRoute)
      .send({ email: 'test@email.com', password: '12345678' });

    expect(response.body).toHaveProperty('token');
  });
});

describe('Authentication in private routes with JWT token', () => {
  it('should not be able to access private routes without JWT token', async () => {
    const response = await request(app).get('/dashboard');

    expect(response.status).toBe(401);
  });

  it('should not be able to access private routes with invalid JWT token', async () => {
    const response = await request(app)
      .get('/dashboard')
      .set('Authorization', 'Bearer InvalidToken123ni31');

    expect(response.status).toBe(401);
  });

  it('should be able to access private routes when authenticate', async () => {
    const user = new User();

    const response = await request(app)
      .get('/dashboard')
      .set('Authorization', `Bearer ${user.generateToken()}`);

    expect(response.status).toBe(200);
  });
});
