import hrDatabase from '../database/HRDatabase.js';
import { dataValidator } from './dataValidation.js';
import { globalCache } from './cacheUtils.js';
import _ from 'lodash';

/**
 * Real-time Data Synchronization System
 * 
 * This module provides comprehensive real-time data synchronization capabilities:
 * - WebSocket-based real-time updates
 * - Conflict resolution and data merging
 * - Optimistic updates with rollback
 * - Data versioning and change tracking
 * - Offline synchronization with queue
 * - Event-driven data broadcasting
 */

export class DataSynchronizationManager {
  constructor(options = {}) {
    this.config = {
      enableRealTime: true,
      enableOptimisticUpdates: true,
      conflictResolutionStrategy: 'lastWriteWins', // 'lastWriteWins', 'manual', 'merge'
      syncInterval: 30000, // 30 seconds
      maxRetryAttempts: 3,
      retryDelay: 1000,
      enableOfflineQueue: true,
      maxQueueSize: 100,
      enableChangeTracking: true,
      broadcastChanges: true,
      ...options
    };

    // Connection management
    this.websocket = null;
    this.connectionState = 'disconnected';
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;

    // Data management
    this.pendingChanges = new Map();
    this.conflictQueue = [];
    this.offlineQueue = [];
    this.dataVersions = new Map();
    this.changeLog = [];
    this.maxChangeLogSize = 1000;

    // Event system
    this.eventListeners = new Map();
    this.changeSubscribers = new Set();

    // Sync state
    this.lastSyncTimestamp = null;
    this.syncInProgress = false;
    this.optimisticUpdates = new Map();

    // Performance tracking
    this.syncStats = {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      conflictsResolved: 0,
      optimisticUpdatesRolledBack: 0,
      averageSyncTime: 0,
      dataTransferred: 0
    };

    this.initialize();
  }

  // ==========================================
  // INITIALIZATION AND CONNECTION MANAGEMENT
  // ==========================================

  async initialize() {
    try {
      // Set up periodic sync if real-time is disabled
      if (!this.config.enableRealTime) {
        this.setupPeriodicSync();
      } else {
        await this.connectWebSocket();
      }

      // Set up offline detection
      this.setupOfflineDetection();
      
      // Initialize change tracking
      if (this.config.enableChangeTracking) {
        this.setupChangeTracking();
      }

      console.log('Data synchronization manager initialized');
    } catch (error) {
      console.error('Failed to initialize sync manager:', error);
    }
  }

  async connectWebSocket() {
    try {
      // In a real implementation, this would connect to an actual WebSocket server
      // For this demo, we'll simulate WebSocket behavior
      this.websocket = this.createMockWebSocket();
      this.connectionState = 'connecting';

      this.websocket.onopen = () => {
        this.connectionState = 'connected';
        this.reconnectAttempts = 0;
        this.emit('connectionStateChanged', { state: 'connected' });
        console.log('WebSocket connected');
      };

      this.websocket.onmessage = (event) => {
        this.handleIncomingMessage(event.data);
      };

      this.websocket.onclose = () => {
        this.connectionState = 'disconnected';
        this.emit('connectionStateChanged', { state: 'disconnected' });
        this.scheduleReconnect();
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('connectionError', { error });
      };

    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.scheduleReconnect();
    }
  }

  createMockWebSocket() {
    // Mock WebSocket for demonstration purposes
    return {
      onopen: null,
      onmessage: null,
      onclose: null,
      onerror: null,
      send: (data) => {
        console.log('Mock WebSocket send:', data);
        // Simulate server response
        setTimeout(() => {
          if (this.websocket.onmessage) {
            this.websocket.onmessage({
              data: JSON.stringify({
                type: 'ack',
                messageId: JSON.parse(data).messageId,
                timestamp: new Date().toISOString()
              })
            });
          }
        }, 100);
      },
      close: () => {
        if (this.websocket.onclose) {
          setTimeout(() => this.websocket.onclose(), 100);
        }
      }
    };
  }

  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connectWebSocket();
    }, delay);
  }

  setupPeriodicSync() {
    setInterval(async () => {
      if (!this.syncInProgress) {
        await this.performSync();
      }
    }, this.config.syncInterval);
  }

  setupOfflineDetection() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.emit('onlineStatusChanged', { online: true });
        if (this.config.enableOfflineQueue && this.offlineQueue.length > 0) {
          this.processOfflineQueue();
        }
      });

      window.addEventListener('offline', () => {
        this.emit('onlineStatusChanged', { online: false });
      });
    }
  }

  setupChangeTracking() {
    // Monitor changes to the database and track them
    setInterval(() => {
      this.trackDataChanges();
    }, 5000); // Check every 5 seconds
  }

  // ==========================================
  // REAL-TIME DATA OPERATIONS
  // ==========================================

  /**
   * Broadcast data change to all connected clients
   */
  async broadcastChange(changeType, dataType, data, metadata = {}) {
    if (!this.config.broadcastChanges) return;

    const changeEvent = {
      type: 'dataChange',
      changeType, // 'create', 'update', 'delete'
      dataType,
      data,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        version: this.generateVersion(),
        clientId: this.getClientId()
      }
    };

    // Add to change log
    this.addToChangeLog(changeEvent);

    // Broadcast via WebSocket
    if (this.connectionState === 'connected') {
      this.sendWebSocketMessage(changeEvent);
    }

    // Notify local subscribers
    this.notifyChangeSubscribers(changeEvent);

    return changeEvent;
  }

  /**
   * Handle incoming real-time messages
   */
  async handleIncomingMessage(messageData) {
    try {
      const message = JSON.parse(messageData);

      switch (message.type) {
        case 'dataChange':
          await this.handleRemoteDataChange(message);
          break;
        case 'syncRequest':
          await this.handleSyncRequest(message);
          break;
        case 'conflict':
          await this.handleConflict(message);
          break;
        case 'ack':
          this.handleAcknowledgment(message);
          break;
        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling incoming message:', error);
    }
  }

  /**
   * Handle remote data changes
   */
  async handleRemoteDataChange(changeEvent) {
    const { changeType, dataType, data, metadata } = changeEvent;

    try {
      // Check for conflicts
      const currentVersion = this.dataVersions.get(`${dataType}:current`);
      if (currentVersion && metadata.version <= currentVersion) {
        await this.handleVersionConflict(changeEvent, currentVersion);
        return;
      }

      // Apply the change
      switch (changeType) {
        case 'update':
          await this.applyRemoteUpdate(dataType, data, metadata);
          break;
        case 'create':
          await this.applyRemoteCreate(dataType, data, metadata);
          break;
        case 'delete':
          await this.applyRemoteDelete(dataType, data, metadata);
          break;
      }

      // Update version tracking
      this.dataVersions.set(`${dataType}:current`, metadata.version);

      // Invalidate cache
      await globalCache.clear(dataType);

      // Notify listeners
      this.emit('remoteDataChanged', { changeType, dataType, data, metadata });

    } catch (error) {
      console.error('Error applying remote change:', error);
      this.emit('remoteChangeError', { error, changeEvent });
    }
  }

  // ==========================================
  // OPTIMISTIC UPDATES
  // ==========================================

  /**
   * Perform optimistic update
   */
  async performOptimisticUpdate(dataType, data, operation = 'update') {
    if (!this.config.enableOptimisticUpdates) {
      return this.performRegularUpdate(dataType, data, operation);
    }

    const updateId = this.generateUpdateId();
    const originalData = await this.getOriginalData(dataType);

    try {
      // Store original data for potential rollback
      this.optimisticUpdates.set(updateId, {
        dataType,
        originalData,
        optimisticData: data,
        operation,
        timestamp: Date.now()
      });

      // Apply optimistic update locally
      await this.applyLocalUpdate(dataType, data, operation);

      // Send to server for confirmation
      const serverResponse = await this.sendUpdateToServer(dataType, data, operation, updateId);

      if (serverResponse.success) {
        // Server confirmed - remove from optimistic updates
        this.optimisticUpdates.delete(updateId);
        return { success: true, updateId, confirmed: true };
      } else {
        // Server rejected - rollback
        await this.rollbackOptimisticUpdate(updateId, serverResponse.reason);
        return { success: false, updateId, reason: serverResponse.reason };
      }

    } catch (error) {
      // Error occurred - rollback
      await this.rollbackOptimisticUpdate(updateId, error.message);
      throw error;
    }
  }

  /**
   * Rollback optimistic update
   */
  async rollbackOptimisticUpdate(updateId, reason) {
    const optimisticUpdate = this.optimisticUpdates.get(updateId);
    if (!optimisticUpdate) return;

    try {
      const { dataType, originalData, operation } = optimisticUpdate;

      // Restore original data
      await this.applyLocalUpdate(dataType, originalData, 'restore');

      // Remove from optimistic updates
      this.optimisticUpdates.delete(updateId);

      // Update stats
      this.syncStats.optimisticUpdatesRolledBack++;

      // Notify listeners
      this.emit('optimisticUpdateRolledBack', {
        updateId,
        dataType,
        reason,
        originalData
      });

      console.log(`Optimistic update ${updateId} rolled back: ${reason}`);

    } catch (rollbackError) {
      console.error('Error rolling back optimistic update:', rollbackError);
      this.emit('rollbackError', { updateId, error: rollbackError });
    }
  }

  // ==========================================
  // CONFLICT RESOLUTION
  // ==========================================

  /**
   * Handle version conflicts
   */
  async handleVersionConflict(incomingChange, currentVersion) {
    const conflict = {
      id: this.generateConflictId(),
      type: 'version',
      incoming: incomingChange,
      current: currentVersion,
      timestamp: Date.now()
    };

    this.conflictQueue.push(conflict);

    switch (this.config.conflictResolutionStrategy) {
      case 'lastWriteWins':
        await this.resolveConflictLastWriteWins(conflict);
        break;
      case 'merge':
        await this.resolveConflictMerge(conflict);
        break;
      case 'manual':
        this.emit('conflictRequiresManualResolution', conflict);
        break;
      default:
        console.warn('Unknown conflict resolution strategy');
    }
  }

  /**
   * Resolve conflict using last-write-wins strategy
   */
  async resolveConflictLastWriteWins(conflict) {
    try {
      const { incoming } = conflict;
      
      // Apply the incoming change (last write wins)
      await this.applyRemoteUpdate(
        incoming.dataType, 
        incoming.data, 
        incoming.metadata
      );

      this.syncStats.conflictsResolved++;
      this.emit('conflictResolved', { conflict, strategy: 'lastWriteWins' });

    } catch (error) {
      console.error('Error resolving conflict with last-write-wins:', error);
      this.emit('conflictResolutionError', { conflict, error });
    }
  }

  /**
   * Resolve conflict using merge strategy
   */
  async resolveConflictMerge(conflict) {
    try {
      const { incoming } = conflict;
      const currentData = await this.getOriginalData(incoming.dataType);
      
      // Perform intelligent merge
      const mergedData = this.mergeData(currentData, incoming.data);
      
      // Apply merged data
      await this.applyLocalUpdate(incoming.dataType, mergedData, 'update');
      
      // Broadcast merged result
      await this.broadcastChange('update', incoming.dataType, mergedData, {
        mergedFrom: [conflict.current, incoming.metadata.version]
      });

      this.syncStats.conflictsResolved++;
      this.emit('conflictResolved', { conflict, strategy: 'merge', mergedData });

    } catch (error) {
      console.error('Error resolving conflict with merge:', error);
      this.emit('conflictResolutionError', { conflict, error });
    }
  }

  /**
   * Intelligent data merging
   */
  mergeData(currentData, incomingData) {
    // Simple merge strategy - can be enhanced based on data structure
    const merged = _.cloneDeep(currentData);
    
    // Merge non-conflicting changes
    Object.keys(incomingData).forEach(key => {
      if (key === 'lastUpdated' || key === 'metadata') {
        // Always use the most recent timestamp
        if (new Date(incomingData[key]) > new Date(merged[key])) {
          merged[key] = incomingData[key];
        }
      } else if (typeof incomingData[key] === 'object' && !Array.isArray(incomingData[key])) {
        // Recursively merge objects
        merged[key] = this.mergeData(merged[key] || {}, incomingData[key]);
      } else {
        // For primitive values, use incoming if different
        if (merged[key] !== incomingData[key]) {
          merged[key] = incomingData[key];
        }
      }
    });

    return merged;
  }

  // ==========================================
  // OFFLINE SYNCHRONIZATION
  // ==========================================

  /**
   * Queue operation for offline processing
   */
  queueOfflineOperation(operation) {
    if (!this.config.enableOfflineQueue) return false;

    if (this.offlineQueue.length >= this.config.maxQueueSize) {
      // Remove oldest operation
      this.offlineQueue.shift();
    }

    this.offlineQueue.push({
      ...operation,
      id: this.generateOperationId(),
      queuedAt: Date.now()
    });

    return true;
  }

  /**
   * Process offline queue when connection is restored
   */
  async processOfflineQueue() {
    if (this.offlineQueue.length === 0) return;

    console.log(`Processing ${this.offlineQueue.length} offline operations`);

    const results = [];
    const operations = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const operation of operations) {
      try {
        const result = await this.executeQueuedOperation(operation);
        results.push({ operation, result, success: true });
      } catch (error) {
        console.error('Error executing queued operation:', error);
        results.push({ operation, error, success: false });
        
        // Re-queue if retryable
        if (this.isRetryableError(error) && operation.retryCount < this.config.maxRetryAttempts) {
          this.offlineQueue.push({
            ...operation,
            retryCount: (operation.retryCount || 0) + 1
          });
        }
      }
    }

    this.emit('offlineQueueProcessed', { results });
    return results;
  }

  /**
   * Execute a queued operation
   */
  async executeQueuedOperation(operation) {
    const { type, dataType, data, metadata } = operation;

    switch (type) {
      case 'update':
        return await this.performRegularUpdate(dataType, data, 'update');
      case 'create':
        return await this.performRegularUpdate(dataType, data, 'create');
      case 'delete':
        return await this.performRegularUpdate(dataType, data, 'delete');
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Generate unique identifiers
   */
  generateVersion() {
    return `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateUpdateId() {
    return `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateConflictId() {
    return `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateOperationId() {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getClientId() {
    if (!this.clientId) {
      this.clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return this.clientId;
  }

  /**
   * Data operations
   */
  async getOriginalData(dataType) {
    switch (dataType) {
      case 'workforce':
        return await hrDatabase.getWorkforceData();
      case 'turnover':
        return await hrDatabase.getTurnoverData();
      default:
        throw new Error(`Unknown data type: ${dataType}`);
    }
  }

  async applyLocalUpdate(dataType, data, operation) {
    switch (dataType) {
      case 'workforce':
        return await hrDatabase.updateWorkforceData(data);
      case 'turnover':
        return await hrDatabase.updateTurnoverData(data);
      default:
        throw new Error(`Unknown data type: ${dataType}`);
    }
  }

  async applyRemoteUpdate(dataType, data, metadata) {
    // Apply remote update with validation
    const validationResult = await dataValidator.validateAndSanitize(data, dataType);
    
    if (!validationResult.isValid) {
      throw new Error(`Remote data validation failed: ${JSON.stringify(validationResult.validation.errors)}`);
    }

    return await this.applyLocalUpdate(dataType, validationResult.data, 'update');
  }

  async applyRemoteCreate(dataType, data, metadata) {
    // Similar to update but for create operations
    return await this.applyRemoteUpdate(dataType, data, metadata);
  }

  async applyRemoteDelete(dataType, data, metadata) {
    // Handle delete operations
    console.log(`Delete operation for ${dataType} not implemented in demo`);
  }

  /**
   * Communication methods
   */
  sendWebSocketMessage(message) {
    if (this.websocket && this.connectionState === 'connected') {
      const messageWithId = {
        ...message,
        messageId: this.generateUpdateId(),
        timestamp: new Date().toISOString()
      };
      
      this.websocket.send(JSON.stringify(messageWithId));
      return messageWithId;
    }
    return null;
  }

  async sendUpdateToServer(dataType, data, operation, updateId) {
    // Simulate server communication
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate server response
        const success = Math.random() > 0.1; // 90% success rate
        resolve({
          success,
          updateId,
          reason: success ? null : 'Simulated server error',
          timestamp: new Date().toISOString()
        });
      }, 100);
    });
  }

  async performRegularUpdate(dataType, data, operation) {
    try {
      const result = await this.applyLocalUpdate(dataType, data, operation);
      await this.broadcastChange(operation, dataType, data);
      return { success: true, result };
    } catch (error) {
      console.error('Regular update failed:', error);
      throw error;
    }
  }

  /**
   * Event system
   */
  on(event, listener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(listener);
  }

  off(event, listener) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(listener);
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  /**
   * Change tracking and logging
   */
  addToChangeLog(changeEvent) {
    this.changeLog.push(changeEvent);
    
    if (this.changeLog.length > this.maxChangeLogSize) {
      this.changeLog.shift();
    }
  }

  async trackDataChanges() {
    // Simple change detection - in production, this would be more sophisticated
    try {
      const currentWorkforceData = await hrDatabase.getWorkforceData();
      const currentTurnoverData = await hrDatabase.getTurnoverData();
      
      // Compare with previous versions to detect changes
      const workforceVersion = this.dataVersions.get('workforce:current');
      const turnoverVersion = this.dataVersions.get('turnover:current');
      
      if (currentWorkforceData && currentWorkforceData.lastUpdated !== workforceVersion) {
        this.dataVersions.set('workforce:current', currentWorkforceData.lastUpdated);
      }
      
      if (currentTurnoverData && currentTurnoverData.lastUpdated !== turnoverVersion) {
        this.dataVersions.set('turnover:current', currentTurnoverData.lastUpdated);
      }
      
    } catch (error) {
      console.error('Error tracking data changes:', error);
    }
  }

  notifyChangeSubscribers(changeEvent) {
    this.changeSubscribers.forEach(subscriber => {
      try {
        subscriber(changeEvent);
      } catch (error) {
        console.error('Error notifying change subscriber:', error);
      }
    });
  }

  subscribeToChanges(callback) {
    this.changeSubscribers.add(callback);
    return () => this.changeSubscribers.delete(callback);
  }

  /**
   * Error handling
   */
  isRetryableError(error) {
    // Define which errors are retryable
    const retryableErrors = [
      'NetworkError',
      'TimeoutError',
      'TemporaryServerError'
    ];
    
    return retryableErrors.some(type => error.message.includes(type));
  }

  /**
   * Statistics and monitoring
   */
  getStats() {
    return {
      ...this.syncStats,
      connectionState: this.connectionState,
      offlineQueueSize: this.offlineQueue.length,
      conflictQueueSize: this.conflictQueue.length,
      optimisticUpdatesCount: this.optimisticUpdates.size,
      changeLogSize: this.changeLog.length,
      lastSyncTimestamp: this.lastSyncTimestamp,
      changeSubscribers: this.changeSubscribers.size
    };
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown() {
    if (this.websocket) {
      this.websocket.close();
    }
    
    this.eventListeners.clear();
    this.changeSubscribers.clear();
    this.conflictQueue = [];
    this.optimisticUpdates.clear();
    
    console.log('Data synchronization manager shutdown complete');
  }
}

// Create singleton instance
export const dataSyncManager = new DataSynchronizationManager();

// Export convenience methods
export const performOptimisticUpdate = (dataType, data, operation) => 
  dataSyncManager.performOptimisticUpdate(dataType, data, operation);

export const subscribeToDataChanges = (callback) => 
  dataSyncManager.subscribeToChanges(callback);

export const getSyncStats = () => dataSyncManager.getStats();

export const broadcastDataChange = (changeType, dataType, data, metadata) =>
  dataSyncManager.broadcastChange(changeType, dataType, data, metadata);

export default dataSyncManager;