export interface CacheEntry<T> {
  key: string;
  value: T;
  ttlMs?: number;
  tags?: string[];
}

export interface ICacheService {
  getOrSet<T>(options: {
    key: string;
    ttlMs?: number;
    tags?: string[];
    factory: () => Promise<T>;
  }): Promise<T>;
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttlMs?: number, tags?: string[]): Promise<void>;
  delete(key: string): Promise<void>;
  deleteByTag(tag: string): Promise<void>;
  clear(): Promise<void>;
}
