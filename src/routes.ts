import { Router } from 'express';

import authentication from './middlewares/authentication';
import UserController from './controllers/user.controller';
import TaskGroupController from './controllers/task-group.controller';
import TaskController from './controllers/task.controller';

const routes = Router();
const userController = new UserController();
const taskGroupController = new TaskGroupController();
const taskController = new TaskController();

routes.post('/registrar-usuario', userController.store);
routes.post('/login', userController.login);

routes.use(authentication);

routes.get('/tarefas', taskGroupController.index);
routes.get('/tarefas/:taskGroupId', taskGroupController.show);
routes.post('/tarefas/novo-grupo', taskGroupController.store);

routes.post('/tarefas/:taskGroupId/nova-tarefa', taskController.store);

export default routes;
