import { Inject, Injectable } from '@nestjs/common';
import { CACHE_SERVICE_TOKEN } from '../cache.constants';
import { ICacheService } from '../cache.interface';

const AUTH_CACHE_TAGS = {
  ALL: 'auth',
  ROLE_PERMISSIONS: (roleId: string) => `auth:role:${roleId}`,
};

const AUTH_CACHE_KEYS = {
  ROLE_PERMISSIONS: (roleId: string) => `auth:role:permissions:${roleId}`,
};

const HOURS_PER_DAY = 24;
const MS_PER_HOUR = 3600000;
const AUTH_CACHE_TTL_MS = HOURS_PER_DAY * MS_PER_HOUR;

@Injectable()
export class AuthCacheService {
  constructor(@Inject(CACHE_SERVICE_TOKEN) private readonly cache: ICacheService) {}

  async rolePermissions<T>(roleId: string, factory: () => Promise<T>): Promise<T> {
    return this.cache.getOrSet({
      key: AUTH_CACHE_KEYS.ROLE_PERMISSIONS(roleId),
      ttlMs: AUTH_CACHE_TTL_MS,
      tags: [AUTH_CACHE_TAGS.ALL, AUTH_CACHE_TAGS.ROLE_PERMISSIONS(roleId)],
      factory,
    });
  }

  async invalidateRole(roleId: string): Promise<void> {
    await this.cache.deleteByTag(AUTH_CACHE_TAGS.ROLE_PERMISSIONS(roleId));
  }

  async invalidateAll(): Promise<void> {
    await this.cache.deleteByTag(AUTH_CACHE_TAGS.ALL);
  }
}
