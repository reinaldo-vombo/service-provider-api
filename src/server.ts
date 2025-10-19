// src/index.ts
import express, { Request, Response } from 'express';
import globalErrorHandler from './error/globalErrorHandler';
import routes from './routes/';
import config from './config';
import { setupSwagger } from './config/swagger';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript with Express!!');
});

setupSwagger(app);
app.use('/api/v1', routes);

app.use(globalErrorHandler);

app.listen(config.PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${config.PORT}`);
  console.log('📘 Documentação Swagger: http://localhost:3000/docs');
});
