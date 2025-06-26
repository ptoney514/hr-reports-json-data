/**
 * Advanced Caching Utility for Dashboard Data
 * Provides in-memory and localStorage caching with TTL, compression, and invalidation
 */

// Cache configuration
const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  MAX_MEMORY_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_LOCALSTORAGE_SIZE: 5 * 1024 * 1024, // 5MB
  CLEANUP_INTERVAL: 60 * 1000, // 1 minute
  COMPRESSION_THRESHOLD: 1024, // 1KB
};

// Cache stores
const memoryCache = new Map();
const cacheMetadata = new Map();
let currentMemorySize = 0;

/**
 * Cache entry structure
 */
class CacheEntry {
  constructor(data, ttl = CACHE_CONFIG.DEFAULT_TTL, metadata = {}) {
    this.data = data;
    this.timestamp = Date.now();
    this.ttl = ttl;
    this.accessCount = 0;
    this.lastAccessed = this.timestamp;
    this.size = this.calculateSize(data);
    this.compressed = false;
    this.metadata = metadata;
  }

  calculateSize(data) {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      // Fallback size estimation
      return JSON.stringify(data).length * 2;
    }
  }

  isExpired() {
    return Date.now() - this.timestamp > this.ttl;
  }

  updateAccess() {
    this.accessCount++;
    this.lastAccessed = Date.now();
  }

  shouldCompress() {
    return this.size > CACHE_CONFIG.COMPRESSION_THRESHOLD && !this.compressed;
  }
}

/**
 * Memory cache operations
 */
export const memoryCache_operations = {
  set: (key, data, ttl, metadata) => {
    const entry = new CacheEntry(data, ttl, metadata);
    
    // Check if we need to make space
    if (currentMemorySize + entry.size > CACHE_CONFIG.MAX_MEMORY_SIZE) {
      memoryCache_operations.evictLRU(entry.size);
    }

    // Compress large entries
    if (entry.shouldCompress()) {
      entry.data = compressData(entry.data);
      entry.compressed = true;
      entry.size = entry.calculateSize(entry.data);
    }

    memoryCache.set(key, entry);
    cacheMetadata.set(key, {
      type: 'memory',
      size: entry.size,
      timestamp: entry.timestamp
    });
    
    currentMemorySize += entry.size;
    return true;
  },

  get: (key) => {
    const entry = memoryCache.get(key);
    if (!entry) return null;

    if (entry.isExpired()) {
      memoryCache_operations.delete(key);
      return null;
    }

    entry.updateAccess();
    
    // Decompress if needed
    let data = entry.data;
    if (entry.compressed) {
      data = decompressData(data);
    }

    return {
      data,
      metadata: entry.metadata,
      age: Date.now() - entry.timestamp,
      accessCount: entry.accessCount
    };
  },

  delete: (key) => {
    const entry = memoryCache.get(key);
    if (entry) {
      currentMemorySize -= entry.size;
      memoryCache.delete(key);
      cacheMetadata.delete(key);
      return true;
    }
    return false;
  },

  clear: () => {
    memoryCache.clear();
    cacheMetadata.clear();
    currentMemorySize = 0;
  },

  evictLRU: (spaceNeeded) => {
    const entries = Array.from(memoryCache.entries())
      .map(([key, entry]) => ({ key, entry }))
      .sort((a, b) => a.entry.lastAccessed - b.entry.lastAccessed);

    let freedSpace = 0;
    for (const { key } of entries) {
      if (freedSpace >= spaceNeeded) break;
      const entry = memoryCache.get(key);
      if (entry) {
        freedSpace += entry.size;
        memoryCache_operations.delete(key);
      }
    }
  },

  getStats: () => ({
    size: memoryCache.size,
    memoryUsage: currentMemorySize,
    memoryUsageFormatted: formatBytes(currentMemorySize),
    maxMemory: CACHE_CONFIG.MAX_MEMORY_SIZE,
    memoryUsagePercent: (currentMemorySize / CACHE_CONFIG.MAX_MEMORY_SIZE) * 100
  })
};

/**
 * LocalStorage cache operations
 */
export const localStorage_operations = {
  set: (key, data, ttl, metadata) => {
    try {
      const entry = new CacheEntry(data, ttl, metadata);
      const cacheKey = `cache_${key}`;
      
      // Check localStorage size
      const currentSize = localStorage_operations.getSize();
      if (currentSize + entry.size > CACHE_CONFIG.MAX_LOCALSTORAGE_SIZE) {
        localStorage_operations.evictOldest();
      }

      // Compress if needed
      if (entry.shouldCompress()) {
        entry.data = compressData(entry.data);
        entry.compressed = true;
      }

      localStorage.setItem(cacheKey, JSON.stringify(entry));
      
      // Update metadata
      const metadata_key = `cache_meta_${key}`;
      localStorage.setItem(metadata_key, JSON.stringify({
        type: 'localStorage',
        size: entry.size,
        timestamp: entry.timestamp
      }));

      return true;
    } catch (error) {
      console.warn('LocalStorage cache set failed:', error);
      return false;
    }
  },

  get: (key) => {
    try {
      const cacheKey = `cache_${key}`;
      const stored = localStorage.getItem(cacheKey);
      if (!stored) return null;

      const entry = JSON.parse(stored);
      const cacheEntry = Object.assign(new CacheEntry(), entry);

      if (cacheEntry.isExpired()) {
        localStorage_operations.delete(key);
        return null;
      }

      // Decompress if needed
      let data = cacheEntry.data;
      if (cacheEntry.compressed) {
        data = decompressData(data);
      }

      return {
        data,
        metadata: cacheEntry.metadata,
        age: Date.now() - cacheEntry.timestamp
      };
    } catch (error) {
      console.warn('LocalStorage cache get failed:', error);
      localStorage_operations.delete(key);
      return null;
    }
  },

  delete: (key) => {
    try {
      localStorage.removeItem(`cache_${key}`);
      localStorage.removeItem(`cache_meta_${key}`);
      return true;
    } catch (error) {
      console.warn('LocalStorage cache delete failed:', error);
      return false;
    }
  },

  clear: () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.warn('LocalStorage cache clear failed:', error);
      return false;
    }
  },

  evictOldest: () => {
    try {
      const cacheKeys = Object.keys(localStorage)
        .filter(key => key.startsWith('cache_meta_'))
        .map(key => {
          const metadata = JSON.parse(localStorage.getItem(key));
          return { key: key.replace('cache_meta_', ''), timestamp: metadata.timestamp };
        })
        .sort((a, b) => a.timestamp - b.timestamp);

      // Remove oldest 25% of entries
      const toRemove = Math.ceil(cacheKeys.length * 0.25);
      for (let i = 0; i < toRemove; i++) {
        localStorage_operations.delete(cacheKeys[i].key);
      }
    } catch (error) {
      console.warn('LocalStorage eviction failed:', error);
    }
  },

  getSize: () => {
    try {
      let total = 0;
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cache_')) {
          total += localStorage.getItem(key).length;
        }
      });
      return total;
    } catch {
      return 0;
    }
  },

  getStats: () => {
    const size = localStorage_operations.getSize();
    return {
      size: Object.keys(localStorage).filter(k => k.startsWith('cache_')).length,
      storageUsage: size,
      storageUsageFormatted: formatBytes(size),
      maxStorage: CACHE_CONFIG.MAX_LOCALSTORAGE_SIZE,
      storageUsagePercent: (size / CACHE_CONFIG.MAX_LOCALSTORAGE_SIZE) * 100
    };
  }
};

/**
 * Main cache interface
 */
export class DataCache {
  constructor(options = {}) {
    this.options = {
      useMemory: true,
      useLocalStorage: true,
      defaultTTL: CACHE_CONFIG.DEFAULT_TTL,
      keyPrefix: 'dashboard',
      ...options
    };
  }

  generateKey(base, params = {}) {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return `${this.options.keyPrefix}_${base}${paramString ? '_' + paramString : ''}`;
  }

  async set(key, data, options = {}) {
    const {
      ttl = this.options.defaultTTL,
      useMemory = this.options.useMemory,
      useLocalStorage = this.options.useLocalStorage,
      metadata = {}
    } = options;

    const fullKey = this.generateKey(key, options.params);
    
    const results = {};
    
    // Store in memory cache first (faster access)
    if (useMemory) {
      results.memory = memoryCache_operations.set(fullKey, data, ttl, metadata);
    }

    // Store in localStorage for persistence
    if (useLocalStorage) {
      results.localStorage = localStorage_operations.set(fullKey, data, ttl, metadata);
    }

    return results;
  }

  async get(key, options = {}) {
    const {
      useMemory = this.options.useMemory,
      useLocalStorage = this.options.useLocalStorage
    } = options;

    const fullKey = this.generateKey(key, options.params);

    // Try memory cache first
    if (useMemory) {
      const memoryResult = memoryCache_operations.get(fullKey);
      if (memoryResult) {
        return { ...memoryResult, source: 'memory' };
      }
    }

    // Fallback to localStorage
    if (useLocalStorage) {
      const localResult = localStorage_operations.get(fullKey);
      if (localResult) {
        // Populate memory cache for faster future access
        if (useMemory) {
          memoryCache_operations.set(fullKey, localResult.data, undefined, localResult.metadata);
        }
        return { ...localResult, source: 'localStorage' };
      }
    }

    return null;
  }

  async delete(key, options = {}) {
    const fullKey = this.generateKey(key, options.params);
    
    const results = {};
    results.memory = memoryCache_operations.delete(fullKey);
    results.localStorage = localStorage_operations.delete(fullKey);
    
    return results;
  }

  has(key, options = {}) {
    const fullKey = this.generateKey(key, options.params);
    
    // Check memory cache first
    const memoryEntry = memoryCache.get(fullKey);
    if (memoryEntry && !memoryEntry.isExpired()) {
      return true;
    }
    
    // Check localStorage
    const localResult = localStorage_operations.get(fullKey);
    return localResult !== null;
  }

  async clear(pattern) {
    if (pattern) {
      // Clear specific pattern
      const keys = this.getKeys();
      const matchingKeys = keys.filter(key => key.includes(pattern));
      
      for (const key of matchingKeys) {
        await this.delete(key.replace(`${this.options.keyPrefix}_`, ''));
      }
    } else {
      // Clear all
      memoryCache_operations.clear();
      localStorage_operations.clear();
    }
  }

  getKeys() {
    const memoryKeys = Array.from(memoryCache.keys());
    const localKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('cache_'))
      .map(key => key.replace('cache_', ''));
    
    return [...new Set([...memoryKeys, ...localKeys])];
  }

  getStats() {
    return {
      memory: memoryCache_operations.getStats(),
      localStorage: localStorage_operations.getStats(),
      total: {
        keys: this.getKeys().length,
        memoryAndStorage: memoryCache_operations.getStats().size + localStorage_operations.getStats().size
      }
    };
  }

  // Cache warming - preload common data
  async warm(warmupFunctions = []) {
    const results = [];
    for (const fn of warmupFunctions) {
      try {
        const result = await fn(this);
        results.push({ success: true, result });
      } catch (error) {
        results.push({ success: false, error });
      }
    }
    return results;
  }
}

/**
 * Compression utilities
 */
function compressData(data) {
  try {
    // Simple compression using JSON string manipulation
    // In production, consider using a proper compression library
    const jsonString = JSON.stringify(data);
    return btoa(jsonString);
  } catch {
    return data;
  }
}

function decompressData(compressedData) {
  try {
    const jsonString = atob(compressedData);
    return JSON.parse(jsonString);
  } catch {
    return compressedData;
  }
}

/**
 * Utility functions
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Cache cleanup service
 */
class CacheCleanupService {
  constructor() {
    this.intervalId = null;
  }

  start() {
    if (this.intervalId) return;
    
    this.intervalId = setInterval(() => {
      this.cleanup();
    }, CACHE_CONFIG.CLEANUP_INTERVAL);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  cleanup() {
    // Clean expired memory entries
    for (const [key, entry] of memoryCache.entries()) {
      if (entry.isExpired()) {
        memoryCache_operations.delete(key);
      }
    }

    // Clean expired localStorage entries
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_') && !key.startsWith('cache_meta_')) {
          const cacheKey = key.replace('cache_', '');
          const result = localStorage_operations.get(cacheKey);
          if (!result) {
            localStorage_operations.delete(cacheKey);
          }
        }
      });
    } catch (error) {
      console.warn('Cache cleanup failed:', error);
    }
  }
}

// Global cache instance
export const globalCache = new DataCache();

// Global cleanup service
export const cleanupService = new CacheCleanupService();

// Auto-start cleanup service
if (typeof window !== 'undefined') {
  cleanupService.start();
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    cleanupService.stop();
  });
}

// Cache invalidation strategies
export const invalidationStrategies = {
  // Time-based invalidation
  timeBasedInvalidation: (cache, key, maxAge) => {
    const result = cache.get(key);
    if (result && result.age > maxAge) {
      cache.delete(key);
      return true;
    }
    return false;
  },

  // Version-based invalidation
  versionBasedInvalidation: (cache, key, currentVersion) => {
    const result = cache.get(key);
    if (result && result.metadata.version !== currentVersion) {
      cache.delete(key);
      return true;
    }
    return false;
  },

  // Dependency-based invalidation
  dependencyBasedInvalidation: (cache, key, dependencies) => {
    const result = cache.get(key);
    if (result && result.metadata.dependencies) {
      const hasChangedDependency = dependencies.some(dep => 
        result.metadata.dependencies[dep] !== dependencies[dep]
      );
      if (hasChangedDependency) {
        cache.delete(key);
        return true;
      }
    }
    return false;
  }
};

export default {
  DataCache,
  globalCache,
  cleanupService,
  invalidationStrategies,
  memoryCache_operations,
  localStorage_operations
}; 