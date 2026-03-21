import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req) => {
          const traceId = req.headers['x-trace-id'] as string;
          const safePattern = /^[a-zA-Z0-9_-]{1,64}$/;
          return traceId && safePattern.test(traceId) ? traceId : randomUUID();
        },
      },
    }),
    PinoLoggerModule.forRoot({
      pinoHttp: {
        level: process.env['LOG_LEVEL'] || 'info',
        transport:
          process.env['NODE_ENV'] !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
        autoLogging: false,
      },
    }),
  ],
})
export class LoggingModule {}
