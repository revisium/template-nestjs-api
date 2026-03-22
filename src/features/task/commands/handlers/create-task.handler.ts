import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateTaskCommand, CreateTaskCommandReturnType } from '../impl/create-task.command';

@CommandHandler(CreateTaskCommand)
export class CreateTaskHandler implements ICommandHandler<
  CreateTaskCommand,
  CreateTaskCommandReturnType
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ data }: CreateTaskCommand): Promise<CreateTaskCommandReturnType> {
    const task = await this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        userId: data.userId,
      },
    });

    return { id: task.id };
  }
}
