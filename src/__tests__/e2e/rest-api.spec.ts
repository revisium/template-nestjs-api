import { INestApplication } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import {
  getTestApp,
  closeTestApp,
  prepareTask,
  PreparedTask,
  generateTestToken,
  anonGet,
  anonPost,
  authGet,
  authPost,
  authPatch,
  authDelete,
} from '../utils';

describe('REST API (E2E)', () => {
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
      username: 'rest-e2e-admin',
      roleId: 'admin',
    });
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe('Authorization', () => {
    it('should return 401 for unauthenticated request', async () => {
      await anonGet(app, '/api/tasks').expect(401);
    });

    it('should return 401 for invalid token', async () => {
      await authGet(app, '/api/tasks', 'invalid-token').expect(401);
    });

    it('should return 401 for unauthenticated POST', async () => {
      await anonPost(app, '/api/tasks', { title: 'Unauthorized' }).expect(401);
    });
  });

  describe('GET /api/tasks', () => {
    it('should return tasks list', async () => {
      const res = await authGet(app, '/api/tasks', adminToken).expect(200);

      expect(res.body.items).toBeDefined();
      expect(res.body.totalCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/tasks/:taskId', () => {
    it('should return a task by id', async () => {
      const res = await authGet(app, `/api/tasks/${fixture.taskId}`, adminToken).expect(200);

      expect(res.body.id).toBe(fixture.taskId);
      expect(res.body.title).toBe(fixture.taskTitle);
    });

    it('should return 404 for non-existent task', async () => {
      await authGet(app, '/api/tasks/non-existent-id', adminToken).expect(404);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const res = await authPost(app, '/api/tasks', adminToken, {
        title: 'E2E Created Task',
        description: 'Created via E2E test',
      }).expect(201);

      expect(res.body.id).toBeDefined();
    });

    it('should reject invalid input (empty body)', async () => {
      await authPost(app, '/api/tasks', adminToken, {}).expect(400);
    });
  });

  describe('PATCH /api/tasks/:taskId', () => {
    it('should update a task', async () => {
      const res = await authPatch(app, `/api/tasks/${fixture.taskId}`, adminToken, {
        title: 'Updated Title',
      }).expect(200);

      expect(res.body.id).toBe(fixture.taskId);
    });
  });

  describe('DELETE /api/tasks/:taskId', () => {
    it('should delete a task', async () => {
      const created = await authPost(app, '/api/tasks', adminToken, {
        title: 'To Be Deleted',
      }).expect(201);

      await authDelete(app, `/api/tasks/${created.body.id}`, adminToken).expect(200);

      await authGet(app, `/api/tasks/${created.body.id}`, adminToken).expect(404);
    });
  });
});
