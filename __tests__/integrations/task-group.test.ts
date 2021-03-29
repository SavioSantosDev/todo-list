import { createConnection, getConnection } from 'typeorm';
import request from 'supertest';

import app from '../../src/App';
import TaskGroup from '../../src/models/TaskGroup';

let token: string; // Used in the headers
const createTaskGroupRoute = '/tarefas/novo-grupo';
const indexTaskGroupsRoute = '/tarefas';

async function createConnectionAndRunMigrations() {
  const connection = await createConnection();
  await connection.runMigrations();
}

async function authenticateUserAndGetToken() {
  await request(app).post('/registrar-usuario').send({
    name: 'Test User',
    email: 'test@email.com',
    password: '12345678',
  });
  const loginResponse = await request(app)
    .post('/login')
    .send({ email: 'test@email.com', password: '12345678' });
  token = loginResponse.body.token;
}

async function closeConnection() {
  const connection = getConnection();
  await connection.dropDatabase();
  await connection.close();
}

function generateTaskGroup() {
  const taskGroup = new TaskGroup();
  taskGroup.name = 'School';
  taskGroup.description = 'Tasks of the my School';
  return taskGroup;
}

async function createTaskGroup(isInvalidToken = false) {
  const response = await request(app)
    .post(createTaskGroupRoute)
    .send(generateTaskGroup())
    .set('Authorization', `Bearer ${isInvalidToken ? 'InvalidToken' : token}`);
  return response;
}

async function indexAllTaskGroups(isInvalidToken = false) {
  const response = await request(app)
    .get(indexTaskGroupsRoute)
    .set('Authorization', `Bearer ${isInvalidToken ? 'InvalidToken' : token}`);
  return response;
}

async function showTaskGroupWithId(id: string, isInvalidToken = false) {
  const response = await request(app)
    .get(`${indexTaskGroupsRoute}/${id}`)
    .set('Authorization', `Bearer ${isInvalidToken ? 'InvalidToken' : token}`);
  return response;
}

/**
 * The tests of the create task group functionality
 */
describe('Create a Task Group', () => {
  beforeAll(async () => {
    await createConnectionAndRunMigrations();
    await authenticateUserAndGetToken();
  });

  afterAll(closeConnection);

  it('should not be able to create a new Task Group with invalid token', async () => {
    const response = await createTaskGroup(true);
    expect(response.status).toBe(401);
  });

  it('should be able to create a new Task Group with valid fields', async () => {
    const response = await createTaskGroup();

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('name', 'School');
    expect(response.body).toHaveProperty(
      'description',
      'Tasks of the my School',
    );
  });

  it('should not be able to create a new Taks Group with invalid fields', async () => {
    const response = await request(app)
      .post(createTaskGroupRoute)
      .send({
        name: 12345,
      })
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(401);
  });
});

/**
 * The tests of the list all task groups and a single task group
 */
describe('Index the Task Groups', () => {
  beforeAll(async () => {
    await createConnectionAndRunMigrations();
    await authenticateUserAndGetToken();
  });

  afterAll(closeConnection);

  it('should not be able to list the Task Groups with invalid token', async () => {
    const response = await indexAllTaskGroups(true);
    expect(response.status).toBe(401);
  });

  it('should not list task groups when no there is', async () => {
    const response = await indexAllTaskGroups();
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(0);
  });

  it('should list all task groups when there is', async () => {
    await createTaskGroup();
    const response = await indexAllTaskGroups();
    expect(response.status).toBe(200);
    // Same data defined in createTaskGroup()
    expect(response.body[0]).toHaveProperty('name', 'School');
    expect(response.body[0]).toHaveProperty(
      'description',
      'Tasks of the my School',
    );
  });

  it('should not show a task group when pass an invalid token', async () => {
    const response = await showTaskGroupWithId('teste', true);
    expect(response.status).toBe(401);
  });

  it('should not show a task group when pass an invalid ID', async () => {
    const response = await showTaskGroupWithId('Invalid ID');
    expect(response.status).toBe(401);
  });

  it('should show the task group with the it respective ID', async () => {
    const firstTaskGroupId = (await indexAllTaskGroups()).body[0].id;
    const response = await showTaskGroupWithId(firstTaskGroupId);
    expect(response.status).toBe(200);
    // Same data defined in createTaskGroup()
    expect(response.body).toHaveProperty('name', 'School');
    expect(response.body).toHaveProperty(
      'description',
      'Tasks of the my School',
    );
  });
});
