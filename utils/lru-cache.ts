// Define types for cached data with timestamps
export interface CachedData<T> {
  data: T;
  timestamp: number;
}

// LRU Cache implementation for caching loan statistics
export class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;
  private hitCount: number = 0;
  private missCount: number = 0;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const value = this.cache.get(key)!;
      this.cache.delete(key);
      this.cache.set(key, value);
      this.hitCount++;
      return value;
    }
    this.missCount++;
    return undefined;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // Update existing key
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  size(): number {
    return this.cache.size;
  }

  // Get keys in order from least recently used to most recently used
  keys(): K[] {
    return Array.from(this.cache.keys());
  }

  // Get values in order from least recently used to most recently used
  values(): V[] {
    return Array.from(this.cache.values());
  }

  // Check if cache is at capacity
  isFull(): boolean {
    return this.cache.size >= this.capacity;
  }

  // Get cache statistics
  getStats() {
    const total = this.hitCount + this.missCount;
    const hitRate = total > 0 ? (this.hitCount / total) * 100 : 0;

    return {
      size: this.cache.size,
      capacity: this.capacity,
      utilization: (this.cache.size / this.capacity) * 100,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: hitRate,
    };
  }

  // Reset cache statistics without clearing the cache
  resetStats(): void {
    this.hitCount = 0;
    this.missCount = 0;
  }
}

// Create singleton instances for different cache types
export const statsCache = new LRUCache<string, CachedData<any>>(50);
export const loansCache = new LRUCache<string, CachedData<any>>(100);
export const paymentsCache = new LRUCache<string, CachedData<any>>(200);

// Cache key generators
export const createStatsKey = (userId: string, timeframe: string = "30d") =>
  `stats:${userId}:${timeframe}`;

export const createLoansKey = (userId: string, status?: string) =>
  `loans:${userId}${status ? `:${status}` : ""}`;

export const createPaymentsKey = (userId: string, loanId?: string) =>
  `payments:${userId}${loanId ? `:${loanId}` : ""}`;

// Cache TTL helpers with different default TTLs for different data types
export const isCacheExpired = (
  cachedData: CachedData<any> | undefined,
  ttlMs: number = 30 * 60 * 1000 // Default 10 minutes
): boolean => {
  if (!cachedData || !cachedData.timestamp) return true;
  return Date.now() - cachedData.timestamp > ttlMs;
};

export const wrapWithTimestamp = <T>(data: T): CachedData<T> => ({
  data,
  timestamp: Date.now(),
});
