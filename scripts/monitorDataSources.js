#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Paths
const PROJECT_ROOT = path.join(__dirname, '..');
const REGISTRY_PATH = path.join(PROJECT_ROOT, 'src/data/dataSourceRegistry.json');
const HISTORY_PATH = path.join(PROJECT_ROOT, 'src/data/dataSourceHistory.json');
const SOURCE_METRICS_PATH = path.join(PROJECT_ROOT, 'source-metrics');

// Calculate SHA256 hash of a file
function calculateFileHash(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  } catch (error) {
    console.error(`Error calculating hash for ${filePath}:`, error);
    return null;
  }
}

// Get file stats
function getFileStats(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return {
      size: stats.size,
      modified: stats.mtime.toISOString(),
      created: stats.birthtime.toISOString()
    };
  } catch (error) {
    console.error(`Error getting stats for ${filePath}:`, error);
    return null;
  }
}

// Load registry
function loadRegistry() {
  try {
    const data = fs.readFileSync(REGISTRY_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading registry:', error);
    return { sources: [], metadata: {} };
  }
}

// Save registry
function saveRegistry(registry) {
  try {
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
    console.log('✅ Registry updated successfully');
  } catch (error) {
    console.error('Error saving registry:', error);
  }
}

// Load or create history
function loadHistory() {
  try {
    if (fs.existsSync(HISTORY_PATH)) {
      const data = fs.readFileSync(HISTORY_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading history:', error);
  }
  return { entries: [] };
}

// Save history
function saveHistory(history) {
  try {
    fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('Error saving history:', error);
  }
}

// Monitor a single source
function monitorSource(source) {
  const fullPath = path.join(PROJECT_ROOT, source.path);
  const changes = [];
  
  console.log(`\n📊 Monitoring: ${source.name}`);
  console.log(`   Path: ${source.path}`);
  
  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    console.log(`   ⚠️  File not found!`);
    return {
      ...source,
      status: 'missing',
      lastScanned: new Date().toISOString()
    };
  }
  
  // Get file stats
  const stats = getFileStats(fullPath);
  if (!stats) {
    console.log(`   ⚠️  Could not read file stats`);
    return source;
  }
  
  // Calculate hash
  const currentHash = calculateFileHash(fullPath);
  
  // Check for changes
  const hasChanged = source.lastHash && source.lastHash !== currentHash;
  
  if (hasChanged) {
    console.log(`   🔄 File has changed!`);
    changes.push(`File modified on ${stats.modified}`);
    changes.push(`Hash changed from ${source.lastHash?.substring(0, 12)}... to ${currentHash?.substring(0, 12)}...`);
  } else if (!source.lastHash) {
    console.log(`   🆕 First scan of file`);
    changes.push('Initial scan completed');
  } else {
    console.log(`   ✅ No changes detected`);
  }
  
  // Update source
  const updatedSource = {
    ...source,
    lastModified: stats.modified,
    lastScanned: new Date().toISOString(),
    lastHash: currentHash,
    fileSize: stats.size,
    status: hasChanged ? 'changed' : (source.lastRefreshed ? 'up-to-date' : 'pending')
  };
  
  // Add history entry if changed
  if (hasChanged || !source.lastHash) {
    const historyEntry = {
      sourceId: source.id,
      timestamp: new Date().toISOString(),
      action: 'scan',
      changes: changes,
      hash: currentHash?.substring(0, 12) + '...',
      fileSize: stats.size
    };
    
    return { source: updatedSource, historyEntry };
  }
  
  return { source: updatedSource };
}

// Main monitoring function
function monitorAllSources() {
  console.log('🔍 Data Source Monitoring Tool');
  console.log('================================\n');
  
  // Load registry
  const registry = loadRegistry();
  const history = loadHistory();
  
  console.log(`Found ${registry.sources.length} data sources to monitor`);
  
  // Monitor each source
  const updatedSources = [];
  const newHistoryEntries = [];
  let changedCount = 0;
  let missingCount = 0;
  
  for (const source of registry.sources) {
    const result = monitorSource(source);
    
    if (result.source) {
      updatedSources.push(result.source);
      
      if (result.source.status === 'changed') {
        changedCount++;
      } else if (result.source.status === 'missing') {
        missingCount++;
      }
    }
    
    if (result.historyEntry) {
      newHistoryEntries.push(result.historyEntry);
    }
  }
  
  // Update registry
  registry.sources = updatedSources;
  registry.metadata.lastScan = new Date().toISOString();
  registry.metadata.totalSources = updatedSources.length;
  
  // Save registry
  saveRegistry(registry);
  
  // Update and save history
  if (newHistoryEntries.length > 0) {
    history.entries = [...newHistoryEntries, ...history.entries].slice(0, 100); // Keep last 100 entries
    saveHistory(history);
    console.log(`\n📝 Added ${newHistoryEntries.length} history entries`);
  }
  
  // Summary
  console.log('\n================================');
  console.log('📊 Monitoring Summary:');
  console.log(`   Total sources: ${updatedSources.length}`);
  console.log(`   Changed: ${changedCount}`);
  console.log(`   Missing: ${missingCount}`);
  console.log(`   Up to date: ${updatedSources.length - changedCount - missingCount}`);
  console.log(`   Last scan: ${new Date().toLocaleString()}`);
  
  if (changedCount > 0) {
    console.log('\n⚠️  Some files have changed. Consider refreshing the data.');
  }
  
  if (missingCount > 0) {
    console.log('\n❌ Some files are missing. Please check the source paths.');
  }
}

// Run if called directly
if (require.main === module) {
  monitorAllSources();
}

module.exports = {
  monitorAllSources,
  monitorSource,
  calculateFileHash,
  getFileStats
};