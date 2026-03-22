import { nanoid } from 'nanoid';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

export interface PreparedTask {
  userId: string;
  userEmail: string;
  taskId: string;
  taskTitle: string;
}

export async function prepareTask(prisma: PrismaService): Promise<PreparedTask> {
  const id = nanoid();
  const userEmail = `test-${id}@example.com`;
  const username = `user-${id}`;

  const user = await prisma.user.create({
    data: {
      email: userEmail,
      username,
      password: '$2b$10$fakehash.for.testing.only.not.a.real.hash',
      roleId: 'admin',
    },
  });

  const task = await prisma.task.create({
    data: {
      title: `Test Task ${id}`,
      description: `Description for task ${id}`,
      userId: user.id,
    },
  });

  return {
    userId: user.id,
    userEmail,
    taskId: task.id,
    taskTitle: task.title,
  };
}
