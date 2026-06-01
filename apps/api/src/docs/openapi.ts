import { Role, TaskStatus } from '@prisma/client';

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Task Platform API',
    version: '1.0.0',
    description: 'Versioned REST API with authentication, role-based access, and task management.',
  },
  servers: [{ url: 'http://localhost:4000/api/v1' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Role: {
        type: 'string',
        enum: [Role.USER, Role.ADMIN],
      },
      TaskStatus: {
        type: 'string',
        enum: [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE],
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register a new user',
        responses: { 201: { description: 'User registered' } },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login and receive an auth cookie',
        responses: { 200: { description: 'Authenticated' } },
      },
    },
    '/tasks': {
      get: {
        security: [{ bearerAuth: [] }],
        summary: 'List tasks visible to the current user',
        responses: { 200: { description: 'Task list' } },
      },
      post: {
        security: [{ bearerAuth: [] }],
        summary: 'Create a task',
        responses: { 201: { description: 'Task created' } },
      },
    },
  },
} as const;
