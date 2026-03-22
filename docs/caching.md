# Caching

## Architecture

```
CacheModule.forRoot()
├── CacheService (in-memory, tag-based)  — when CACHE_ENABLED=true
├── NoopCacheService (pass-through)      — when CACHE_ENABLED=false
└── AuthCacheService (permission cache)  — always available
```

## ICacheService Interface

```typescript
interface ICacheService {
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
```

## Tag-Based Invalidation

Every cached value can have **tags**. Calling `deleteByTag(tag)` removes all entries with that tag:

```typescript
// Set with tags
await cache.set('user:123', userData, 60000, ['users', 'user:123']);

// Invalidate all user caches
await cache.deleteByTag('users');

// Invalidate specific user
await cache.deleteByTag('user:123');
```

## AuthCacheService (Built-in)

Caches role permissions to avoid repeated DB queries:

```typescript
@Injectable()
export class CaslAbilityFactory {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authCache: AuthCacheService,
  ) {}

  async createAbility(roleId: string): Promise<MongoAbility> {
    // Cached for 24h, tagged for targeted invalidation
    const permissions = await this.authCache.rolePermissions(roleId, () =>
      this.prisma.permission.findMany({ where: { roleId } }),
    );
    // ... build CASL ability
  }
}
```

Invalidation:
```typescript
// When role permissions change
await authCacheService.invalidateRole('editor');

// Nuclear: clear all auth caches
await authCacheService.invalidateAll();
```

## Creating Domain-Specific Cache Services

Follow the AuthCacheService pattern:

```typescript
@Injectable()
export class ProductCacheService {
  constructor(@Inject(CACHE_SERVICE_TOKEN) private readonly cache: ICacheService) {}

  async getProduct<T>(productId: string, factory: () => Promise<T>): Promise<T> {
    return this.cache.getOrSet({
      key: `product:${productId}`,
      ttlMs: 300000, // 5 minutes
      tags: ['products', `product:${productId}`],
      factory,
    });
  }

  async invalidateProduct(productId: string): Promise<void> {
    await this.cache.deleteByTag(`product:${productId}`);
  }

  async invalidateAll(): Promise<void> {
    await this.cache.deleteByTag('products');
  }
}
```

Register in `CacheModule`:
```typescript
providers: [
  { provide: CACHE_SERVICE_TOKEN, useClass: ... },
  AuthCacheService,
  ProductCacheService,  // Add here
],
exports: [CACHE_SERVICE_TOKEN, AuthCacheService, ProductCacheService],
```

## Cache Key Conventions

| Pattern | Example | Use Case |
|---|---|---|
| `domain:id` | `auth:role:permissions:admin` | Single resource |
| `domain:scope:id` | `product:org:123:list` | Scoped resource |

## Tag Conventions

| Level | Tag | Invalidation |
|---|---|---|
| **Nuclear** | `auth` | All auth caches |
| **Scope** | `auth:role:admin` | All caches for admin role |
| **Resource** | `product:123` | Single product |

## TTL Strategy

| Type | TTL | Rationale |
|---|---|---|
| Role permissions | 24h | Roles change rarely |
| User session data | 10min | Needs freshness |
| Immutable data | 24h+ | Never changes |
| External API data | 5-10min | May update externally |

## Event-Driven Invalidation

Use CQRS events to trigger cache invalidation:

```typescript
@EventsHandler(PermissionsUpdatedEvent)
export class PermissionsUpdatedCacheHandler {
  constructor(private readonly authCache: AuthCacheService) {}

  async handle(event: PermissionsUpdatedEvent) {
    await this.authCache.invalidateRole(event.roleId);
  }
}
```

## Configuration

| Env Variable | Default | Description |
|---|---|---|
| `CACHE_ENABLED` | `false` | Enable in-memory caching |

When disabled, `NoopCacheService` is injected — `getOrSet` calls factory directly, all other operations are no-ops.

## Upgrading to BentoCache (L1 + L2)

For production with multiple instances, replace `CacheService` with BentoCache:
1. Add `bentocache` and `ioredis` dependencies
2. Configure L1 (memory) + L2 (Redis) + bus (Redis)
3. Replace `CacheService` implementation
4. See BentoCache documentation for the full L1+L2+bus pattern
