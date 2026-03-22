import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { DeleteTaskCommand, DeleteTaskCommandReturnType } from '../impl/delete-task.command';

@CommandHandler(DeleteTaskCommand)
export class DeleteTaskHandler implements ICommandHandler<
  DeleteTaskCommand,
  DeleteTaskCommandReturnType
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ data }: DeleteTaskCommand): Promise<DeleteTaskCommandReturnType> {
    const existing = await this.prisma.task.findUnique({
      where: { id: data.taskId },
    });

    if (!existing) {
      throw new NotFoundException('Task not found');
    }

    await this.prisma.task.delete({ where: { id: data.taskId } });

    return { success: true };
  }
}
