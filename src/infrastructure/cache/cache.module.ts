import { DynamicModule, Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { NoopCacheService } from './noop-cache.service';
import { AuthCacheService } from './services/auth-cache.service';
import { CACHE_SERVICE_TOKEN } from './cache.constants';

@Module({})
export class CacheModule {
  static forRoot(): DynamicModule {
    const isEnabled = process.env['CACHE_ENABLED'] === 'true';

    return {
      module: CacheModule,
      global: true,
      providers: [
        {
          provide: CACHE_SERVICE_TOKEN,
          useClass: isEnabled ? CacheService : NoopCacheService,
        },
        AuthCacheService,
      ],
      exports: [CACHE_SERVICE_TOKEN, AuthCacheService],
    };
  }
}
