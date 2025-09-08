#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Paths
const PROJECT_ROOT = path.join(__dirname, '..');
const REGISTRY_PATH = path.join(PROJECT_ROOT, 'src/data/dataSourceRegistry.json');
const HISTORY_PATH = path.join(PROJECT_ROOT, 'src/data/dataSourceHistory.json');

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
  } catch (error) {
    console.error('Error saving registry:', error);
  }
}

// Load history
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

// Process turnover data
async function processTurnoverData(source) {
  console.log('   Processing turnover data...');
  
  try {
    // Run the turnover processing script
    const { stdout, stderr } = await execAsync('node scripts/processTurnoverData.js');
    
    if (stderr) {
      console.error('   ⚠️  Processing warnings:', stderr);
    }
    
    console.log('   ✅ Turnover data processed successfully');
    
    // Run data sync to update static data
    const syncResult = await execAsync('npm run data:sync');
    console.log('   ✅ Data synced to staticData.js');
    
    return {
      success: true,
      changes: ['Processed turnover data', 'Updated fy25TurnoverData.json', 'Synced to staticData.js']
    };
  } catch (error) {
    console.error('   ❌ Error processing turnover data:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Process exit survey PDF
async function processExitSurveyPDF(source) {
  console.log('   Processing exit survey PDF...');
  
  // Since PDFs need manual data extraction, we'll just mark them as reviewed
  console.log('   ℹ️  PDF files require manual data extraction');
  console.log('   📋 Please review the PDF and update staticData.js manually');
  
  return {
    success: true,
    changes: ['PDF marked for manual review'],
    requiresManualUpdate: true
  };
}

// Process HR slides
async function processHRSlides(source) {
  console.log('   Processing HR presentation slides...');
  
  console.log('   ℹ️  PowerPoint slides require manual data extraction');
  console.log('   📋 Please review the slides and update staticData.js with:');
  console.log('      - Faculty turnover by division rates');
  console.log('      - Other pre-calculated metrics');
  
  return {
    success: true,
    changes: ['Slides marked for manual review'],
    requiresManualUpdate: true
  };
}

// Refresh a specific source
async function refreshSource(sourceId) {
  console.log(`\n🔄 Refreshing source: ${sourceId}`);
  
  // Load registry
  const registry = loadRegistry();
  const history = loadHistory();
  
  // Find source
  const sourceIndex = registry.sources.findIndex(s => s.id === sourceId);
  if (sourceIndex === -1) {
    console.error(`   ❌ Source not found: ${sourceId}`);
    return false;
  }
  
  const source = registry.sources[sourceIndex];
  console.log(`   Source: ${source.name}`);
  console.log(`   Type: ${source.type}`);
  
  let result;
  
  // Process based on type
  switch (source.category) {
    case 'turnover':
      result = await processTurnoverData(source);
      break;
    case 'exit-surveys':
      result = await processExitSurveyPDF(source);
      break;
    case 'hr-slides':
      result = await processHRSlides(source);
      break;
    default:
      console.log(`   ⚠️  Unknown category: ${source.category}`);
      result = { success: false, error: 'Unknown category' };
  }
  
  // Update source in registry
  if (result.success) {
    registry.sources[sourceIndex] = {
      ...source,
      lastRefreshed: new Date().toISOString(),
      status: result.requiresManualUpdate ? 'manual-review' : 'up-to-date'
    };
    
    // Add history entry
    const historyEntry = {
      sourceId: source.id,
      timestamp: new Date().toISOString(),
      action: 'refresh',
      success: true,
      changes: result.changes,
      requiresManualUpdate: result.requiresManualUpdate || false,
      user: process.env.USER || 'System'
    };
    
    history.entries = [historyEntry, ...history.entries].slice(0, 100);
    
    console.log(`   ✅ Refresh completed successfully`);
    if (result.requiresManualUpdate) {
      console.log(`   ⚠️  Manual update required for this source`);
    }
  } else {
    // Add error history entry
    const historyEntry = {
      sourceId: source.id,
      timestamp: new Date().toISOString(),
      action: 'refresh',
      success: false,
      error: result.error,
      user: process.env.USER || 'System'
    };
    
    history.entries = [historyEntry, ...history.entries].slice(0, 100);
    
    console.log(`   ❌ Refresh failed: ${result.error}`);
  }
  
  // Save updates
  saveRegistry(registry);
  saveHistory(history);
  
  return result.success;
}

// Refresh all sources that need it
async function refreshAllSources() {
  console.log('🔄 Data Source Refresh Tool');
  console.log('================================\n');
  
  const registry = loadRegistry();
  
  // Find sources that need refresh
  const sourcesToRefresh = registry.sources.filter(source => {
    return source.status === 'changed' || 
           source.status === 'pending' || 
           !source.lastRefreshed;
  });
  
  if (sourcesToRefresh.length === 0) {
    console.log('✅ All sources are up to date!');
    return;
  }
  
  console.log(`Found ${sourcesToRefresh.length} sources to refresh:\n`);
  sourcesToRefresh.forEach(s => console.log(`  - ${s.name}`));
  
  // Refresh each source
  let successCount = 0;
  let failCount = 0;
  
  for (const source of sourcesToRefresh) {
    const success = await refreshSource(source.id);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  // Summary
  console.log('\n================================');
  console.log('📊 Refresh Summary:');
  console.log(`   Successful: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log(`   Total: ${sourcesToRefresh.length}`);
  
  // Run validation
  console.log('\n🔍 Running data validation...');
  try {
    await execAsync('npm run data:validate');
    console.log('✅ Data validation passed');
  } catch (error) {
    console.error('⚠️  Data validation found issues - please review');
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  // Refresh all sources that need it
  refreshAllSources();
} else if (args[0] === '--all') {
  // Force refresh all sources
  console.log('Force refreshing all sources...\n');
  refreshAllSources();
} else {
  // Refresh specific source
  refreshSource(args[0]);
}

module.exports = {
  refreshSource,
  refreshAllSources
};