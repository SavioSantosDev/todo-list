import { ITask } from './../../src/models/Task';
import { createConnection, getConnection } from 'typeorm';
import request from 'supertest';

import app from '../../src/App';
import TaskGroup from '../../src/models/TaskGroup';
import Task from '../../src/models/Task';

let token: string;
const createTaskGroupRoute = '/tarefas/novo-grupo';
const indexTaskGroupsRoute = '/tarefas';

async function createConnectionAndRunMigrations() {
  const connection = await createConnection();
  await connection.runMigrations();
}

async function closeConnection() {
  const connection = getConnection();
  await connection.dropDatabase();
  await connection.close();
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

async function getIdOfTheFirstTaskGroup() {
  const id = (await indexAllTaskGroups()).body[0]?.id as string | undefined;
  return id;
}

async function showTaskGroup(isInvalidToken = false) {
  const response = await request(app)
    .get(`${indexTaskGroupsRoute}/${await getIdOfTheFirstTaskGroup()}`)
    .set('Authorization', `Bearer ${isInvalidToken ? 'InvalidToken' : token}`);
  return response;
}

async function createNewTask(
  name?: unknown,
  priority?: unknown,
  notes?: unknown,
  isInvalidToken = false,
) {
  const response = await request(app)
    .post(
      `${indexTaskGroupsRoute}/${await getIdOfTheFirstTaskGroup()}/nova-tarefa`,
    )
    .send({ name, priority, notes })
    .set('Authorization', `Bearer ${isInvalidToken ? 'InvalidToken' : token}`);
  return response;
}

describe('Task', () => {
  beforeAll(async () => {
    await createConnectionAndRunMigrations();
    await authenticateUserAndGetToken();
    await createTaskGroup();
  });

  afterAll(async () => {
    await closeConnection();
  });

  it('should not be able to create a new task with invalid or missing token', async () => {
    const response = await createNewTask(true);
    expect(response.status).toBe(401);
  });

  it('should not create a new task with invalid name field', async () => {
    const response1 = await createNewTask(null, '2', null);
    expect(response1.status).toBe(401);
  });

  it('shoud not create a new task with invalid priority field', async () => {
    const response1 = await createNewTask('Task name', null, null);
    const response2 = await createNewTask('Task name', 0, null);
    const response3 = await createNewTask('Task name', 4, null);
    const response4 = await createNewTask('Task name', 11, null);
    expect(response1.status).toBe(401);
    expect(response2.status).toBe(401);
    expect(response3.status).toBe(401);
    expect(response4.status).toBe(401);
  });

  it('should create a new task with valid fields', async () => {
    const response1 = await createNewTask('Task name', 1, null);
    const response2 = await createNewTask('Task name', '2', 'This is a note');
    const response3 = await createNewTask('Task name', 3, 'This is a note');
    expect(response1.status).toBe(201);
    expect(response2.status).toBe(201);
    expect(response3.status).toBe(201);
    expect(response1.body).toHaveProperty('id');
    expect(response1.body).toHaveProperty('name', 'Task name');
    expect(response1.body).toHaveProperty('priority', 1);
    expect(response1.body).toHaveProperty('status');
    expect(response1.body).toHaveProperty('notes');
    expect(response1.body).toHaveProperty('task_group');
  });
});
