/**
 * Data utilities for DocGrind application
 * Handles localStorage operations, data validation, and migrations
 */

import { 
  UserProgress, 
  ChapterMetadata, 
  SessionMode, 
  ChapterStatus, 
  ExerciseStatus,
  DailyActivity,
  ComputedStats,
  StorageKeys,
  DataExport,
  MigrationScript,
  EXAMPLE_USER_PROGRESS
} from './schema';

// =============================================================================
// DATA VALIDATION
// =============================================================================

/**
 * Validates user progress data structure
 */
export function validateUserProgress(data: any): data is UserProgress {
  if (!data || typeof data !== 'object') return false;
  
  // Check required fields
  if (!data.version || !data.userId || !data.createdAt) return false;
  
  // Validate nested structures
  if (!data.chapters || typeof data.chapters !== 'object') return false;
  if (!data.exercises || typeof data.exercises !== 'object') return false;
  if (!data.dailyActivity || typeof data.dailyActivity !== 'object') return false;
  if (!data.settings || typeof data.settings !== 'object') return false;
  if (!data.stats || typeof data.stats !== 'object') return false;
  
  return true;
}

/**
 * Validates chapter metadata structure
 */
export function validateChapterMetadata(data: any): data is ChapterMetadata {
  if (!data || typeof data !== 'object') return false;
  
  // Check required fields
  if (!data.id || !data.title || !data.url) return false;
  if (!data.category || !data.difficulty) return false;
  if (typeof data.estimatedWordCount !== 'number') return false;
  if (typeof data.estimatedReadingTime !== 'number') return false;
  
  return true;
}

// =============================================================================
// LOCALSTORAGE OPERATIONS
// =============================================================================

/**
 * Safely retrieves data from localStorage with error handling
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === 'undefined') return defaultValue;
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    
    const parsed = JSON.parse(item);
    return parsed as T;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Safely saves data to localStorage with error handling
 */
export function saveToStorage(key: string, data: any): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Removes data from localStorage
 */
export function removeFromStorage(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Gets available storage space in bytes
 */
export function getStorageSize(): number {
  try {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  } catch (error) {
    console.error('Error calculating storage size:', error);
    return 0;
  }
}

// =============================================================================
// DATA INITIALIZATION
// =============================================================================

/**
 * Initializes default user progress data
 */
export function initializeUserProgress(): UserProgress {
  const now = new Date().toISOString();
  const userId = generateUUID();
  
  return {
    version: '1.0.0',
    userId,
    createdAt: now,
    lastActiveAt: now,
    currentSession: null,
    chapters: {},
    exercises: {},
    dailyActivity: {},
    sessions: [],
    settings: {
      emailReminders: {
        enabled: false,
        email: '',
        times: [],
        streakWarning: true
      },
      reading: {
        defaultSessionMode: SessionMode.FIFTEEN_MIN,
        autoAdvanceChapters: true,
        showReadingProgress: true,
        pauseOnFocusLoss: true,
        estimatedWPM: 200
      },
      exercises: {
        autoGenerateOnComplete: true,
        showHints: true,
        skipExercises: false,
        maxAttempts: 3
      },
      dashboard: {
        showStats: true,
        showStreak: true,
        showChart: true,
        chartTimeRange: 'month'
      },
      data: {
        autoBackup: true,
        retentionDays: 90
      }
    },
    stats: {
      lastUpdated: now,
      totalChaptersAvailable: 0,
      totalChaptersStarted: 0,
      totalChaptersCompleted: 0,
      overallProgressPercentage: 0,
      totalReadingTime: 0,
      totalWordsRead: 0,
      averageSessionDuration: 0,
      longestReadingStreak: 0,
      currentStreak: 0,
      totalExercisesGenerated: 0,
      totalExercisesCompleted: 0,
      averageExerciseTime: 0,
      exerciseSuccessRate: 0,
      totalActiveTime: 0,
      averageDailyTime: 0,
      mostActiveDay: 'Monday',
      preferredSessionMode: SessionMode.FIFTEEN_MIN,
      streaks: {
        current: 0,
        longest: 0,
        lastActivityDate: now.split('T')[0]
      },
      averageCompletionRate: 0,
      chapterRetentionRate: 0
    }
  };
}

// =============================================================================
// COMPUTED STATISTICS
// =============================================================================

/**
 * Calculates current reading streak from daily activity
 */
export function calculateCurrentStreak(dailyActivity: Record<string, DailyActivity>): number {
  const today = new Date().toISOString().split('T')[0];
  const sortedDates = Object.keys(dailyActivity).sort().reverse();
  
  let streak = 0;
  let currentDate = new Date(today);
  
  for (const dateStr of sortedDates) {
    const checkDate = currentDate.toISOString().split('T')[0];
    
    if (dateStr === checkDate && dailyActivity[dateStr].totalActiveTime > 0) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * Calculates overall progress percentage
 */
export function calculateOverallProgress(
  totalChaptersCompleted: number,
  totalChaptersAvailable: number
): number {
  if (totalChaptersAvailable === 0) return 0;
  return Math.round((totalChaptersCompleted / totalChaptersAvailable) * 100 * 10) / 10;
}

/**
 * Calculates GitHub-style chart intensity (0-4)
 */
export function calculateChartIntensity(activeTime: number): number {
  if (activeTime === 0) return 0;
  if (activeTime < 15) return 1;
  if (activeTime < 30) return 2;
  if (activeTime < 60) return 3;
  return 4;
}

/**
 * Recomputes all statistics from raw data
 */
export function recomputeStats(userProgress: UserProgress): ComputedStats {
  const chapters = Object.values(userProgress.chapters);
  const exercises = Object.values(userProgress.exercises);
  const dailyActivity = Object.values(userProgress.dailyActivity);
  const sessions = userProgress.sessions;
  
  // Chapter statistics
  const totalChaptersStarted = chapters.filter(c => c.status !== ChapterStatus.NOT_STARTED).length;
  const totalChaptersCompleted = chapters.filter(c => c.status === ChapterStatus.COMPLETED).length;
  const totalChaptersAvailable = chapters.length;
  
  // Reading statistics
  const totalReadingTime = chapters.reduce((sum, c) => sum + c.totalTimeSpent, 0);
  const totalWordsRead = chapters.reduce((sum, c) => sum + (c.estimatedWordCount * (c.completionPercentage / 100)), 0);
  
  // Exercise statistics
  const totalExercisesGenerated = exercises.length;
  const totalExercisesCompleted = exercises.filter(e => e.status === ExerciseStatus.COMPLETED).length;
  const exerciseSuccessRate = totalExercisesGenerated > 0 ? (totalExercisesCompleted / totalExercisesGenerated) * 100 : 0;
  
  // Time statistics
  const completedSessions = sessions.filter(s => s.completed);
  const averageSessionDuration = completedSessions.length > 0 
    ? completedSessions.reduce((sum, s) => sum + s.actualDuration, 0) / completedSessions.length 
    : 0;
  
  // Streak calculations
  const currentStreak = calculateCurrentStreak(userProgress.dailyActivity);
  const longestStreak = Math.max(...dailyActivity.map(d => d.streak), 0);
  
  return {
    lastUpdated: new Date().toISOString(),
    totalChaptersAvailable,
    totalChaptersStarted,
    totalChaptersCompleted,
    overallProgressPercentage: calculateOverallProgress(totalChaptersCompleted, totalChaptersAvailable),
    totalReadingTime,
    totalWordsRead,
    averageSessionDuration,
    longestReadingStreak: longestStreak,
    currentStreak,
    totalExercisesGenerated,
    totalExercisesCompleted,
    averageExerciseTime: exercises.length > 0 ? exercises.reduce((sum, e) => sum + e.timeSpent, 0) / exercises.length : 0,
    exerciseSuccessRate,
    totalActiveTime: dailyActivity.reduce((sum, d) => sum + d.totalActiveTime, 0),
    averageDailyTime: dailyActivity.length > 0 ? dailyActivity.reduce((sum, d) => sum + d.totalActiveTime, 0) / dailyActivity.length : 0,
    mostActiveDay: getMostActiveDay(dailyActivity),
    preferredSessionMode: getPreferredSessionMode(sessions),
    streaks: {
      current: currentStreak,
      longest: longestStreak,
      lastActivityDate: dailyActivity.length > 0 ? dailyActivity[dailyActivity.length - 1].date : new Date().toISOString().split('T')[0]
    },
    averageCompletionRate: sessions.length > 0 ? (completedSessions.length / sessions.length) * 100 : 0,
    chapterRetentionRate: totalChaptersStarted > 0 ? (totalChaptersCompleted / totalChaptersStarted) * 100 : 0
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Generates a UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Gets the most active day of the week from daily activity
 */
function getMostActiveDay(dailyActivity: DailyActivity[]): string {
  const dayTotals: Record<string, number> = {
    'Sunday': 0, 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0,
    'Thursday': 0, 'Friday': 0, 'Saturday': 0
  };
  
  dailyActivity.forEach(activity => {
    const date = new Date(activity.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    dayTotals[dayName] += activity.totalActiveTime;
  });
  
  return Object.entries(dayTotals).reduce((a, b) => dayTotals[a[0]] > dayTotals[b[0]] ? a : b)[0];
}

/**
 * Gets the preferred session mode from session history
 */
function getPreferredSessionMode(sessions: any[]): SessionMode {
  const modeCounts: Record<SessionMode, number> = {
    [SessionMode.FIVE_MIN]: 0,
    [SessionMode.FIFTEEN_MIN]: 0,
    [SessionMode.JOY]: 0,
    [SessionMode.ZEN]: 0
  };
  
  sessions.forEach(session => {
    modeCounts[session.mode]++;
  });
  
  return Object.entries(modeCounts).reduce((a, b) => modeCounts[a[0] as SessionMode] > modeCounts[b[0] as SessionMode] ? a : b)[0] as SessionMode;
}

// =============================================================================
// DATA EXPORT/IMPORT
// =============================================================================

/**
 * Exports all user data for backup
 */
export function exportUserData(): DataExport {
  const userProgress = getFromStorage(StorageKeys.USER_PROGRESS, initializeUserProgress());
  const chapterMetadata = getFromStorage(StorageKeys.CHAPTER_METADATA, []);
  
  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    userData: userProgress,
    chapterMetadata
  };
}

/**
 * Imports user data from backup
 */
export function importUserData(exportData: DataExport): boolean {
  try {
    // Validate export data
    if (!exportData.userData || !validateUserProgress(exportData.userData)) {
      throw new Error('Invalid user data format');
    }
    
    // Save data to localStorage
    saveToStorage(StorageKeys.USER_PROGRESS, exportData.userData);
    
    if (exportData.chapterMetadata) {
      saveToStorage(StorageKeys.CHAPTER_METADATA, exportData.chapterMetadata);
    }
    
    return true;
  } catch (error) {
    console.error('Error importing user data:', error);
    return false;
  }
}

/**
 * Creates a shareable progress snapshot
 */
export function createShareableProgress(userProgress: UserProgress): any {
  const last30Days = Object.entries(userProgress.dailyActivity)
    .filter(([date]) => {
      const activityDate = new Date(date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return activityDate >= thirtyDaysAgo;
    })
    .map(([_, activity]) => activity);
  
  return {
    id: generateUUID(),
    createdAt: new Date().toISOString(),
    username: `DocGrind User ${userProgress.userId.slice(-4)}`,
    totalChapters: userProgress.stats.totalChaptersAvailable,
    completedChapters: userProgress.stats.totalChaptersCompleted,
    currentStreak: userProgress.stats.currentStreak,
    longestStreak: userProgress.stats.longestReadingStreak,
    totalReadingTime: Math.round(userProgress.stats.totalReadingTime / 60 * 10) / 10, // convert to hours
    recentActivity: last30Days,
    achievements: [], // TODO: implement achievements system
    chartData: {
      dates: last30Days.map(a => a.date),
      values: last30Days.map(a => a.intensity)
    }
  };
}

// =============================================================================
// SCHEMA MIGRATIONS
// =============================================================================

/**
 * Available migration scripts
 */
export const MIGRATIONS: MigrationScript[] = [
  // Example migration from v1.0.0 to v1.1.0
  {
    from: '1.0.0',
    to: '1.1.0',
    migrate: (oldData: any) => {
      // Add new fields with default values
      return {
        ...oldData,
        version: '1.1.0',
        // Add any new fields here
      };
    }
  }
];

/**
 * Runs necessary migrations on user data
 */
export function migrateUserData(userData: any): UserProgress {
  let currentVersion = userData.version || '1.0.0';
  let migratedData = userData;
  
  // Find and run applicable migrations
  const applicableMigrations = MIGRATIONS.filter(m => 
    isVersionNewer(m.from, currentVersion) || m.from === currentVersion
  );
  
  for (const migration of applicableMigrations) {
    console.log(`Migrating from ${migration.from} to ${migration.to}`);
    migratedData = migration.migrate(migratedData);
    currentVersion = migration.to;
  }
  
  return migratedData;
}

/**
 * Checks if version A is newer than version B
 */
function isVersionNewer(versionA: string, versionB: string): boolean {
  const a = versionA.split('.').map(Number);
  const b = versionB.split('.').map(Number);
  
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const numA = a[i] || 0;
    const numB = b[i] || 0;
    
    if (numA > numB) return true;
    if (numA < numB) return false;
  }
  
  return false;
}