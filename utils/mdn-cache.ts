/**
 * MDN Content Caching System
 * Implements intelligent caching strategies for MDN content
 */

import type { MDNCache, MDNContent, MDNContentTree, MDNError } from '~/types/mdn';

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
  persistToDisk: boolean;
  compressionEnabled: boolean;
}

export class MDNContentCache {
  private cache = new Map<string, MDNCache>();
  private accessTime = new Map<string, number>();
  private hitCount = new Map<string, number>();
  private missCount = 0;
  private totalRequests = 0;
  private config: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: config.maxSize || 1000,
      defaultTTL: config.defaultTTL || 3600000, // 1 hour
      cleanupInterval: config.cleanupInterval || 300000, // 5 minutes
      persistToDisk: config.persistToDisk || false,
      compressionEnabled: config.compressionEnabled || true,
      ...config
    };

    this.startCleanupTimer();
  }

  /**
   * Get item from cache
   */
  get<T = any>(key: string): T | null {
    this.totalRequests++;
    const item = this.cache.get(key);
    
    if (!item) {
      this.missCount++;
      return null;
    }

    // Check if expired
    if (Date.now() > item.timestamp + item.expiry) {
      this.cache.delete(key);
      this.accessTime.delete(key);
      this.hitCount.delete(key);
      this.missCount++;
      return null;
    }

    // Update access time and hit count
    this.accessTime.set(key, Date.now());
    this.hitCount.set(key, (this.hitCount.get(key) || 0) + 1);
    
    return this.deserializeData(item.data);
  }

  /**
   * Set item in cache
   */
  set<T = any>(key: string, data: T, ttl?: number): void {
    const expiry = ttl || this.config.defaultTTL;
    const serializedData = this.serializeData(data);
    
    // Check if we need to make room
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastRecent();
    }

    const cacheItem: MDNCache = {
      key,
      data: serializedData,
      timestamp: Date.now(),
      expiry
    };

    this.cache.set(key, cacheItem);
    this.accessTime.set(key, Date.now());
    this.hitCount.set(key, 0);
  }

  /**
   * Delete item from cache
   */
  delete(key: string): boolean {
    this.accessTime.delete(key);
    this.hitCount.delete(key);
    return this.cache.delete(key);
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    // Check if expired
    if (Date.now() > item.timestamp + item.expiry) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.accessTime.clear();
    this.hitCount.clear();
    this.missCount = 0;
    this.totalRequests = 0;
  }

  /**
   * Clear cache entries matching pattern
   */
  clearPattern(pattern: string): number {
    const regex = new RegExp(pattern);
    const keysToDelete = Array.from(this.cache.keys()).filter(key => regex.test(key));
    
    keysToDelete.forEach(key => this.delete(key));
    return keysToDelete.length;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.totalRequests > 0 ? 
      ((this.totalRequests - this.missCount) / this.totalRequests) * 100 : 0;

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: Math.round(hitRate * 100) / 100,
      totalRequests: this.totalRequests,
      hits: this.totalRequests - this.missCount,
      misses: this.missCount,
      memoryUsage: this.estimateMemoryUsage(),
      topKeys: this.getTopAccessedKeys(10)
    };
  }

  /**
   * Warm up cache with frequently accessed content
   */
  async warmup(contentProvider: any, paths: string[]): Promise<void> {
    const warmupPromises = paths.map(async (path) => {
      try {
        const content = await contentProvider.fetchContent(path);
        this.set(`content:${path}`, content);
      } catch (error) {
        console.warn(`Failed to warm up cache for path: ${path}`, error);
      }
    });

    await Promise.allSettled(warmupPromises);
  }

  /**
   * Prefetch related content
   */
  async prefetch(contentProvider: any, currentPath: string, depth: number = 2): Promise<void> {
    try {
      const tree = await contentProvider.fetchContentTree();
      const relatedPaths = this.findRelatedPaths(tree, currentPath, depth);
      
      const prefetchPromises = relatedPaths.map(async (path) => {
        if (!this.has(`content:${path}`)) {
          try {
            const content = await contentProvider.fetchContent(path);
            this.set(`content:${path}`, content, this.config.defaultTTL * 2); // Longer TTL for prefetched content
          } catch (error) {
            // Silently fail for prefetch operations
          }
        }
      });

      await Promise.allSettled(prefetchPromises);
    } catch (error) {
      console.warn('Failed to prefetch related content', error);
    }
  }

  /**
   * Serialize data for storage
   */
  private serializeData(data: any): string {
    try {
      const jsonString = JSON.stringify(data);
      return this.config.compressionEnabled ? this.compress(jsonString) : jsonString;
    } catch (error) {
      console.warn('Failed to serialize data', error);
      return JSON.stringify(data);
    }
  }

  /**
   * Deserialize data from storage
   */
  private deserializeData(data: string): any {
    try {
      const jsonString = this.config.compressionEnabled ? this.decompress(data) : data;
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn('Failed to deserialize data', error);
      return data;
    }
  }

  /**
   * Simple compression (placeholder for actual compression)
   */
  private compress(data: string): string {
    // In a real implementation, you might use libraries like pako for gzip compression
    return data;
  }

  /**
   * Simple decompression (placeholder for actual decompression)
   */
  private decompress(data: string): string {
    // In a real implementation, you might use libraries like pako for gzip decompression
    return data;
  }

  /**
   * Evict least recently used items
   */
  private evictLeastRecent(): void {
    const accessTimes = Array.from(this.accessTime.entries())
      .sort((a, b) => a[1] - b[1]);
    
    const keysToEvict = accessTimes.slice(0, Math.ceil(this.config.maxSize * 0.1));
    keysToEvict.forEach(([key]) => this.delete(key));
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Stop cleanup timer
   */
  stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now > item.timestamp + item.expiry) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(): number {
    let totalSize = 0;
    
    for (const item of this.cache.values()) {
      totalSize += item.data.length * 2; // Rough estimate for UTF-16
    }
    
    return totalSize;
  }

  /**
   * Get top accessed keys
   */
  private getTopAccessedKeys(limit: number): Array<{ key: string; hits: number }> {
    return Array.from(this.hitCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([key, hits]) => ({ key, hits }));
  }

  /**
   * Find related paths for prefetching
   */
  private findRelatedPaths(tree: MDNContentTree, currentPath: string, depth: number): string[] {
    const paths: string[] = [];
    const currentChapter = this.findChapterByPath(tree, currentPath);
    
    if (currentChapter) {
      // Add sibling paths
      if (currentChapter.parentId) {
        const parent = tree.chapters.get(currentChapter.parentId);
        if (parent?.children) {
          parent.children.forEach(child => {
            if (child.path !== currentPath) {
              paths.push(child.path);
            }
          });
        }
      }
      
      // Add child paths
      if (currentChapter.children) {
        currentChapter.children.forEach(child => {
          paths.push(child.path);
        });
      }
    }
    
    return paths.slice(0, depth * 5); // Limit prefetch
  }

  /**
   * Find chapter by path
   */
  private findChapterByPath(tree: MDNContentTree, path: string): any {
    for (const chapter of tree.chapters.values()) {
      if (chapter.path === path) {
        return chapter;
      }
    }
    return null;
  }

  /**
   * Destroy cache instance
   */
  destroy(): void {
    this.stopCleanupTimer();
    this.clear();
  }
}

// Global cache instance
let globalCache: MDNContentCache | null = null;

/**
 * Get or create global cache instance
 */
export function getMDNCache(config?: Partial<CacheConfig>): MDNContentCache {
  if (!globalCache) {
    globalCache = new MDNContentCache(config);
  }
  return globalCache;
}

/**
 * Cache decorator for methods
 */
export function cached(ttl?: number) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const cache = getMDNCache();
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;
      
      // Try to get from cache first
      const cached = cache.get(cacheKey);
      if (cached) {
        return cached;
      }
      
      // Execute original method
      const result = await originalMethod.apply(this, args);
      
      // Cache the result
      cache.set(cacheKey, result, ttl);
      
      return result;
    };
    
    return descriptor;
  };
}