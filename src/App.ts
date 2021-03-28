import dotenv from 'dotenv';
dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});

import express from 'express';

import createConnection from './database/';
import routes from './routes';

class App {
  app;

  constructor() {
    createConnection();
    this.app = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(express.json());
  }

  routes() {
    this.app.use(routes);
  }
}

export default new App().app;
