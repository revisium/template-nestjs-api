import { Injectable, Logger } from '@nestjs/common';
import { ICacheService } from './cache.interface';

interface CacheRecord {
  value: unknown;
  expiresAt?: number;
  tags: string[];
}

@Injectable()
export class CacheService implements ICacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly store = new Map<string, CacheRecord>();
  private readonly tagIndex = new Map<string, Set<string>>();

  async getOrSet<T>(options: {
    key: string;
    ttlMs?: number;
    tags?: string[];
    factory: () => Promise<T>;
  }): Promise<T> {
    const cached = await this.get<T>(options.key);
    if (cached !== undefined) return cached;

    const value = await options.factory();
    await this.set(options.key, value, options.ttlMs, options.tags);
    return value;
  }

  async get<T>(key: string): Promise<T | undefined> {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.removeEntry(key);
      return undefined;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlMs?: number, tags?: string[]): Promise<void> {
    const entryTags = tags || [];

    this.store.set(key, {
      value,
      expiresAt: ttlMs ? Date.now() + ttlMs : undefined,
      tags: entryTags,
    });

    for (const tag of entryTags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    }
  }

  async delete(key: string): Promise<void> {
    this.removeEntry(key);
  }

  async deleteByTag(tag: string): Promise<void> {
    const keys = this.tagIndex.get(tag);
    if (!keys) return;

    for (const key of keys) {
      this.store.delete(key);
    }
    this.tagIndex.delete(tag);
    this.logger.debug(`Cache invalidated by tag: ${tag}`);
  }

  async clear(): Promise<void> {
    this.store.clear();
    this.tagIndex.clear();
    this.logger.log('Cache cleared');
  }

  private removeEntry(key: string): void {
    const entry = this.store.get(key);
    if (entry) {
      for (const tag of entry.tags) {
        this.tagIndex.get(tag)?.delete(key);
      }
      this.store.delete(key);
    }
  }
}
