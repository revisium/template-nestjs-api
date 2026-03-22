import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { UpdateTaskCommand, UpdateTaskCommandReturnType } from '../impl/update-task.command';

@CommandHandler(UpdateTaskCommand)
export class UpdateTaskHandler implements ICommandHandler<
  UpdateTaskCommand,
  UpdateTaskCommandReturnType
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ data }: UpdateTaskCommand): Promise<UpdateTaskCommandReturnType> {
    const existing = await this.prisma.task.findUnique({
      where: { id: data.taskId },
    });

    if (!existing) {
      throw new NotFoundException('Task not found');
    }

    await this.prisma.task.update({
      where: { id: data.taskId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status !== undefined && { status: data.status }),
      },
    });

    return { id: data.taskId };
  }
}
