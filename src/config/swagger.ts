import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Node Express API',
      version: '1.0.0',
      description: 'A simple Express API with Swagger documentation',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Users',
        description: 'User management endpoints',
      },
      {
        name: 'Employees',
        description: 'Employee management endpoints',
      },
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/app.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
