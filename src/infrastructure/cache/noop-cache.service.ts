import { Injectable } from '@nestjs/common';
import { ICacheService } from './cache.interface';

@Injectable()
export class NoopCacheService implements ICacheService {
  async getOrSet<T>(options: {
    key: string;
    ttlMs?: number;
    tags?: string[];
    factory: () => Promise<T>;
  }): Promise<T> {
    return options.factory();
  }

  async get<T>(_key: string): Promise<T | undefined> {
    return undefined;
  }

  async set<T>(_key: string, _value: T, _ttlMs?: number, _tags?: string[]): Promise<void> {}

  async delete(_key: string): Promise<void> {}

  async deleteByTag(_tag: string): Promise<void> {}

  async clear(): Promise<void> {}
}
