import { INestApplication } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import {
  getTestApp,
  closeTestApp,
  prepareTask,
  PreparedTask,
  generateTestToken,
  gqlQuery,
  gqlRawQuery,
} from '../utils';

describe('GraphQL API (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let fixture: PreparedTask;
  let adminToken: string;

  beforeAll(async () => {
    app = await getTestApp();
    prisma = app.get(PrismaService);
    fixture = await prepareTask(prisma);
    adminToken = generateTestToken(app, {
      userId: fixture.userId,
      email: fixture.userEmail,
      username: 'gql-e2e-admin',
      roleId: 'admin',
    });
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe('Authorization', () => {
    it('should return error for unauthenticated query', async () => {
      const result = await gqlRawQuery({
        app,
        query: `query { tasks { items { id } totalCount } }`,
      });

      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should return error for invalid token', async () => {
      const result = await gqlRawQuery({
        app,
        token: 'invalid-token',
        query: `query { tasks { items { id } totalCount } }`,
      });

      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });

  describe('Query: task', () => {
    it('should return a task by id', async () => {
      const result = await gqlQuery<{ task: { id: string; title: string } }>({
        app,
        token: adminToken,
        query: `
          query GetTask($taskId: String!) {
            task(taskId: $taskId) {
              id
              title
              description
              status
            }
          }
        `,
        variables: { taskId: fixture.taskId },
      });

      expect(result.task.id).toBe(fixture.taskId);
      expect(result.task.title).toBe(fixture.taskTitle);
    });
  });

  describe('Query: tasks', () => {
    it('should return tasks list', async () => {
      const result = await gqlQuery<{
        tasks: { items: Array<{ id: string }>; totalCount: number };
      }>({
        app,
        token: adminToken,
        query: `
          query GetTasks {
            tasks {
              items {
                id
                title
                status
              }
              totalCount
            }
          }
        `,
      });

      expect(result.tasks.items.length).toBeGreaterThanOrEqual(1);
      expect(result.tasks.totalCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Mutation: createTask', () => {
    it('should create a new task', async () => {
      const result = await gqlQuery<{ createTask: { id: string } }>({
        app,
        token: adminToken,
        query: `
          mutation CreateTask($data: CreateTaskInput!) {
            createTask(data: $data) {
              id
            }
          }
        `,
        variables: { data: { title: 'GraphQL E2E Task' } },
      });

      expect(result.createTask.id).toBeDefined();
    });
  });

  describe('Mutation: updateTask', () => {
    it('should update a task', async () => {
      const result = await gqlQuery<{ updateTask: { id: string } }>({
        app,
        token: adminToken,
        query: `
          mutation UpdateTask($data: UpdateTaskInput!) {
            updateTask(data: $data) {
              id
            }
          }
        `,
        variables: {
          data: { taskId: fixture.taskId, title: 'Updated via GraphQL' },
        },
      });

      expect(result.updateTask.id).toBe(fixture.taskId);
    });
  });

  describe('Mutation: deleteTask', () => {
    it('should delete a task', async () => {
      const created = await gqlQuery<{ createTask: { id: string } }>({
        app,
        token: adminToken,
        query: `
          mutation CreateTask($data: CreateTaskInput!) {
            createTask(data: $data) {
              id
            }
          }
        `,
        variables: { data: { title: 'To Be Deleted GQL' } },
      });

      const result = await gqlQuery<{ deleteTask: { success: boolean } }>({
        app,
        token: adminToken,
        query: `
          mutation DeleteTask($taskId: String!) {
            deleteTask(taskId: $taskId) {
              success
            }
          }
        `,
        variables: { taskId: created.createTask.id },
      });

      expect(result.deleteTask.success).toBe(true);
    });
  });
});
