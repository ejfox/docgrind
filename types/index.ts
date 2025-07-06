/**
 * DocGrind Data Schema - Main Export File
 * 
 * This file provides a clean API for importing all data schema components
 * and utilities needed for the DocGrind application.
 */

// =============================================================================
// CORE INTERFACES AND TYPES
// =============================================================================

export {
  // Main data structures
  UserProgress,
  SessionData,
  ChapterProgress,
  ExerciseProgress,
  DailyActivity,
  ComputedStats,
  
  // Chapter and exercise metadata
  ChapterMetadata,
  ChapterSection,
  ExerciseAttempt,
  
  // Settings and preferences
  UserSettings,
  
  // Utility types
  SessionHistory,
  ShareableProgress,
  DataExport,
  MigrationScript,
  
  // Enums
  SessionMode,
  ExerciseType,
  ExerciseStatus,
  ChapterStatus,
  ReminderTime,
  StorageKeys,
  
  // Example data
  EXAMPLE_USER_PROGRESS
} from './schema';

// =============================================================================
// DATA UTILITIES
// =============================================================================

export {
  // Validation functions
  validateUserProgress,
  validateChapterMetadata,
  
  // localStorage operations
  getFromStorage,
  saveToStorage,
  removeFromStorage,
  getStorageSize,
  
  // Data initialization
  initializeUserProgress,
  
  // Computed statistics
  calculateCurrentStreak,
  calculateOverallProgress,
  calculateChartIntensity,
  recomputeStats,
  
  // Helper functions
  generateUUID,
  
  // Data export/import
  exportUserData,
  importUserData,
  createShareableProgress,
  
  // Schema migrations
  MIGRATIONS,
  migrateUserData
} from './data-utils';

// =============================================================================
// DATA MANAGER
// =============================================================================

export {
  DataManager,
  getDataManager,
  resetDataManager
} from './data-manager';

// =============================================================================
// EXAMPLE USAGE
// =============================================================================

export {
  // Example workflows
  exampleReadingSession,
  exampleExerciseWorkflow,
  exampleProgressTracking,
  exampleSettingsManagement,
  exampleDataBackup,
  exampleStreakTracking,
  examplePerformanceMonitoring,
  exampleComprehensiveDemo,
  
  // Utility functions
  createSampleData,
  resetAllData,
  
  // Main demo function
  default as runDemo
} from './example-usage';

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard for SessionData
 */
export function isSessionData(obj: any): obj is SessionData {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.mode === 'string' &&
    typeof obj.startTime === 'string' &&
    typeof obj.chapterId === 'string' &&
    typeof obj.isActive === 'boolean';
}

/**
 * Type guard for ChapterProgress
 */
export function isChapterProgress(obj: any): obj is ChapterProgress {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.status === 'string' &&
    typeof obj.completionPercentage === 'number';
}

/**
 * Type guard for ExerciseProgress
 */
export function isExerciseProgress(obj: any): obj is ExerciseProgress {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.chapterId === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.status === 'string' &&
    Array.isArray(obj.attempts);
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Quick setup function for new applications
 */
export function quickSetup() {
  const dataManager = getDataManager();
  
  // Initialize with sample data if no data exists
  const stats = dataManager.getStats();
  if (stats.totalChaptersAvailable === 0) {
    console.log('No existing data found. Creating sample data...');
    createSampleData();
  }
  
  return dataManager;
}

/**
 * Get current application state summary
 */
export function getCurrentState() {
  const dataManager = getDataManager();
  const stats = dataManager.getStats();
  const currentSession = dataManager.getCurrentSession();
  const settings = dataManager.getSettings();
  
  return {
    isActive: currentSession !== null,
    currentSession,
    stats,
    settings,
    dataSize: dataManager.getDataSize(),
    lastUpdated: stats.lastUpdated
  };
}

/**
 * Health check for data integrity
 */
export function healthCheck() {
  const dataManager = getDataManager();
  const userProgress = dataManager.userProgress;
  
  const checks = {
    hasValidVersion: !!userProgress.version,
    hasValidUserId: !!userProgress.userId,
    hasValidStats: !!userProgress.stats.lastUpdated,
    hasValidSettings: !!userProgress.settings.reading.estimatedWPM,
    storageWorking: true,
    dataSize: dataManager.getDataSize()
  };
  
  // Test storage
  try {
    const testKey = 'docgrind_health_check';
    const testValue = { test: true, timestamp: Date.now() };
    saveToStorage(testKey, testValue);
    const retrieved = getFromStorage(testKey, null);
    removeFromStorage(testKey);
    
    checks.storageWorking = retrieved !== null;
  } catch (error) {
    checks.storageWorking = false;
  }
  
  const isHealthy = Object.values(checks).every(check => 
    typeof check === 'boolean' ? check : true
  );
  
  return {
    isHealthy,
    checks,
    timestamp: new Date().toISOString()
  };
}

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Default configuration for the data schema
 */
export const DEFAULT_CONFIG = {
  version: '1.0.0',
  autoSaveInterval: 30000, // 30 seconds
  maxSessionHistory: 100,
  maxDataRetentionDays: 90,
  chartDays: 365,
  defaultSessionMode: SessionMode.FIFTEEN_MIN,
  defaultEstimatedWPM: 200,
  maxExerciseAttempts: 3,
  exercisesPerChapter: 3
} as const;

/**
 * Storage configuration
 */
export const STORAGE_CONFIG = {
  keys: StorageKeys,
  maxSize: 5 * 1024 * 1024, // 5MB
  warningThreshold: 0.8, // 80%
  compressionEnabled: false // Could be added in future
} as const;

// =============================================================================
// VERSION INFORMATION
// =============================================================================

export const VERSION_INFO = {
  schemaVersion: '1.0.0',
  apiVersion: '1.0.0',
  compatibleVersions: ['1.0.0'],
  lastUpdated: '2024-01-15T10:00:00Z'
} as const;

// Re-export main types for convenience
export type {
  UserProgress,
  SessionData,
  ChapterProgress,
  ExerciseProgress,
  DailyActivity,
  ComputedStats,
  ChapterMetadata,
  UserSettings,
  ShareableProgress,
  DataExport
} from './schema';