import express from 'express';

class App {
  app;

  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(express.json());
  }

  routes() {
    this.app.use((req, res) => {
      return res.send('Hello world!');
    });
  }
}

export default new App().app;
