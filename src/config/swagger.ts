import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🧩 Plataforma de Reservas API',
      version: '1.0.0',
      description:
        'API RESTful para gerenciamento de usuários, serviços e reservas. Inclui autenticação JWT e histórico de transações.',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Servidor de Desenvolvimento',
      },
      {
        url: 'https://seu-dominio.com/api',
        description: 'Servidor de Produção',
      },
    ],
  },
  // Aqui você aponta para os arquivos onde estão as rotas e as anotações Swagger
  apis: [
    './src/routes/*.ts', // rotas principais
    './src/modules/**/*.routes.ts', // rotas de módulos
    './src/modules/**/*.controller.ts', // se tiver controllers com docs
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
