import { Router } from 'express';

import authentication from './middlewares/authentication';
import UserController from './controllers/user.controller';
import TaskGroupController from './controllers/task-group.controller';

const routes = Router();
const userController = new UserController();
const taskGroupController = new TaskGroupController();

routes.post('/registrar-usuario', userController.store);
routes.post('/login', userController.login);

routes.use(authentication);

routes.get('/tarefas', taskGroupController.index);
routes.get('/tarefas/:taskGroupId', taskGroupController.show);
routes.post('/tarefas/novo-grupo', taskGroupController.store);

export default routes;
