import { Module, OnApplicationShutdown, Logger } from '@nestjs/common';

const DEFAULT_SHUTDOWN_TIMEOUT = 10000;

@Module({})
export class GracefulShutdownModule implements OnApplicationShutdown {
  private readonly logger = new Logger(GracefulShutdownModule.name);

  async onApplicationShutdown(signal?: string) {
    this.logger.log(`Application shutting down (signal: ${signal || 'unknown'})`);
    const envValue = process.env['GRACEFUL_SHUTDOWN_TIMEOUT'];
    const parsed = envValue !== undefined ? Number(envValue) : NaN;
    const timeout = !Number.isNaN(parsed) && parsed >= 0 ? parsed : DEFAULT_SHUTDOWN_TIMEOUT;
    await new Promise((resolve) => setTimeout(resolve, timeout));
  }
}
