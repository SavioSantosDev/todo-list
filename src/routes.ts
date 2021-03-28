import { Router } from 'express';

import UserController from './controllers/user.controller';
import authentication from './middlewares/authentication';

const routes = Router();
const userController = new UserController();

routes.post('/registrar-usuario', userController.store);
routes.post('/login', userController.login);

routes.use(authentication);

routes.get('/dashboard', (req, res) => {
  return res.json({ success: 'Authenticated' });
});

export default routes;
