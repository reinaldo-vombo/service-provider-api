// src/index.ts
import express, { Request, Response } from 'express';
import globalErrorHandler from './error/globalErrorHandler';
import routes from './routes/';
import config from './config';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript with Express!!');
});
app.use('/api/v1', routes);

app.use(globalErrorHandler);

app.listen(config.PORT, () => {
  console.log(`Server is running on http://localhost:${config.PORT}`);
});
