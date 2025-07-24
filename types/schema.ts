/**
 * DocGrind Application Data Schema
 * Comprehensive TypeScript interfaces for localStorage persistence
 */

// =============================================================================
// ENUMS AND CONSTANTS
// =============================================================================

export enum SessionMode {
  FIVE_MIN = '5min',
  FIFTEEN_MIN = '15min',
  JOY = 'joy', // 1 hour
  ZEN = 'zen' // unlimited
}

export enum ExerciseType {
  MULTIPLE_CHOICE = 'multiple_choice',
  CODE_COMPLETION = 'code_completion',
  DEBUGGING = 'debugging',
  IMPLEMENTATION = 'implementation'
}

export enum ExerciseStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped'
}

export enum ChapterStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  EXERCISES_PENDING = 'exercises_pending'
}

export enum ReminderTime {
  NOON = '12:00',
  AFTERNOON = '15:00',
  EVENING = '18:00'
}

// =============================================================================
// CORE DATA INTERFACES
// =============================================================================

/**
 * Main user progress data - root level localStorage object
 */
export interface UserProgress {
  version: string; // Schema version for migrations
  userId: string; // Generated UUID for user identification
  createdAt: string; // ISO timestamp
  lastActiveAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  
  // Current session state
  currentSession: SessionData | null;
  
  // Reading progress
  chapters: Record<string, ChapterProgress>;
  exercises: Record<string, ExerciseProgress>;
  
  // Historical data
  dailyActivity: Record<string, DailyActivity>; // date string -> activity
  sessions: SessionHistory[]; // Last 100 sessions for analysis
  
  // User preferences
  settings: UserSettings;
  
  // Computed stats (cached for performance)
  stats: ComputedStats;
}

/**
 * Current reading session data
 */
export interface SessionData {
  id: string; // UUID
  mode: SessionMode;
  startTime: string; // ISO timestamp
  endTime?: string; // ISO timestamp when session ends
  targetDuration: number; // in minutes, 0 for unlimited
  
  // Chapter being read
  chapterId: string;
  
  // Reading state
  scrollPosition: number; // pixels from top
  readingProgress: number; // percentage (0-100)
  
  // Session metrics
  timeSpent: number; // actual minutes spent reading
  wordsRead: number; // estimated words read
  pausedDuration?: number; // minutes paused/away
  
  // Session flags
  isActive: boolean;
  isPaused?: boolean;
  isCompleted?: boolean;
  wasInterrupted?: boolean; // if session ended before target time
}

/**
 * Historical session data for display
 */
export interface SessionHistory {
  id: string;
  date: string;
  mode: SessionMode;
  chapterId: string;
  chapterTitle: string;
  plannedDuration: number; // minutes
  actualDuration: number; // minutes
  wordsRead: number;
  progressMade: number; // percentage
  completed: boolean;
  interrupted: boolean;
  timestamp: string; // ISO timestamp
}

/**
 * Chapter-specific progress data
 */
export interface ChapterProgress {
  id: string; // MDN chapter identifier
  title: string;
  url: string;
  category: string; // e.g., "JavaScript", "Web APIs", etc.
  
  // Progress tracking
  status: ChapterStatus;
  completionPercentage: number; // 0-100
  lastScrollPosition: number;
  readingProgress: number; // 0-100 percentage
  
  // Reading metadata
  estimatedWordCount: number;
  estimatedReadingTime: number; // minutes
  
  // Session history for this chapter
  sessionsStarted: number;
  sessionsCompleted: number;
  totalTimeSpent: number; // minutes
  timeSpent: number; // minutes (alias for totalTimeSpent)
  sessionsCount: number; // total sessions count
  
  // Timestamps
  firstStarted: string | null; // ISO timestamp
  lastAccessed: string | null; // ISO timestamp
  lastReadAt: string; // ISO timestamp
  completedAt: string | null; // ISO timestamp
  
  // Exercise tracking
  exercisesGenerated: boolean;
  exercisesCompleted: number;
  exercisesTotal: number;
  totalExercises: number; // alias for exercisesTotal
  
  // Additional metadata
  difficulty?: string; // 'beginner', 'intermediate', 'advanced'
  bookmarks: any[];
  notes: any[];
}

/**
 * Exercise progress data
 */
export interface ExerciseProgress {
  id: string; // Generated UUID
  chapterId: string; // Parent chapter
  type: ExerciseType;
  title: string;
  description: string;
  
  // Exercise content
  prompt: string;
  expectedOutput?: string;
  hints: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  
  // Progress tracking
  status: ExerciseStatus;
  attempts: ExerciseAttempt[];
  
  // User's solution
  userCode: string;
  isCorrect: boolean;
  
  // Timestamps
  createdAt: string; // ISO timestamp
  firstAttemptAt: string | null; // ISO timestamp
  completedAt: string | null; // ISO timestamp
  
  // Metadata
  timeSpent: number; // minutes
  hintsUsed: number;
}

/**
 * Individual exercise attempt
 */
export interface ExerciseAttempt {
  id: string;
  timestamp: string; // ISO timestamp
  code: string;
  output: string;
  isCorrect: boolean;
  errorMessage?: string;
  timeSpent: number; // minutes for this attempt
}

/**
 * Daily activity tracking for contribution chart
 */
export interface DailyActivity {
  date: string; // YYYY-MM-DD format
  
  // Reading metrics
  chaptersRead: number;
  chaptersCompleted: number;
  sessionsCompleted: number;
  totalReadingTime: number; // minutes
  timeSpent: number; // minutes (alias for totalReadingTime)
  wordsRead: number; // words read this day
  
  // Exercise metrics
  exercisesAttempted: number;
  exercisesCompleted: number;
  exerciseTime: number; // minutes
  
  // Computed metrics
  totalActiveTime: number; // minutes
  streak: number; // days (computed)
  intensity: number; // 0-4 for GitHub-style chart
  
  // Session modes used
  sessionModes: SessionMode[];
}

/**
 * Historical session data for analysis
 */
export interface SessionHistory {
  id: string;
  date: string; // YYYY-MM-DD format
  mode: SessionMode;
  chapterId: string;
  chapterTitle: string;
  
  // Session metrics
  plannedDuration: number; // minutes
  actualDuration: number; // minutes
  wordsRead: number;
  progressMade: number; // percentage points
  
  // Timing
  startTime: string; // ISO timestamp
  endTime: string; // ISO timestamp
  
  // Completion status
  completed: boolean;
  interrupted: boolean;
  isCompleted: boolean; // alias for completed
  
  timestamp: string; // ISO timestamp
}

/**
 * User settings and preferences
 */
export interface UserSettings {
  // Email notifications
  emailReminders: {
    enabled: boolean;
    email: string;
    times: ReminderTime[];
    streakWarning: boolean; // warn when streak is at risk
  };
  
  // Reading preferences
  reading: {
    defaultSessionMode: SessionMode;
    autoAdvanceChapters: boolean;
    showReadingProgress: boolean;
    pauseOnFocusLoss: boolean;
    estimatedWPM: number; // words per minute reading speed
  };
  
  // Exercise preferences
  exercises: {
    autoGenerateOnComplete: boolean;
    showHints: boolean;
    skipExercises: boolean;
    maxAttempts: number;
  };
  
  // Dashboard preferences
  dashboard: {
    showStats: boolean;
    showStreak: boolean;
    showChart: boolean;
    chartTimeRange: 'week' | 'month' | 'year';
  };
  
  // Data preferences
  data: {
    autoBackup: boolean;
    retentionDays: number; // how long to keep old sessions
  };
  
  // Global settings (legacy)
  autoSaveInterval: number; // seconds
}

/**
 * Computed statistics (cached for performance)
 */
export interface ComputedStats {
  lastUpdated: string; // ISO timestamp
  
  // Overall progress
  totalChaptersAvailable: number;
  totalChaptersStarted: number;
  totalChaptersCompleted: number;
  overallProgressPercentage: number;
  
  // Reading stats
  totalReadingTime: number; // minutes
  totalWordsRead: number;
  averageSessionDuration: number; // minutes
  longestReadingStreak: number; // days
  currentStreak: number; // days
  
  // Exercise stats
  totalExercisesGenerated: number;
  totalExercisesCompleted: number;
  averageExerciseTime: number; // minutes
  exerciseSuccessRate: number; // percentage
  
  // Time-based stats
  totalActiveTime: number; // minutes
  averageDailyTime: number; // minutes
  mostActiveDay: string; // day of week
  preferredSessionMode: SessionMode;
  
  // Streaks and achievements
  streaks: {
    current: number;
    longest: number;
    lastActivityDate: string; // YYYY-MM-DD
  };
  
  // Performance metrics
  averageCompletionRate: number; // percentage of started sessions completed
  chapterRetentionRate: number; // percentage of chapters completed once started
}

// =============================================================================
// CHAPTER METADATA
// =============================================================================

/**
 * MDN chapter metadata (could be fetched from API or stored locally)
 */
export interface ChapterMetadata {
  id: string; // Unique identifier
  title: string;
  url: string;
  
  // Content structure
  sections: ChapterSection[];
  
  // Metadata
  category: string;
  subcategory?: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  
  // Content metrics
  estimatedWordCount: number;
  estimatedReadingTime: number; // minutes
  
  // Relationships
  prerequisites: string[]; // chapter IDs
  nextChapters: string[]; // suggested next chapters
  
  // Content flags
  hasExercises: boolean;
  hasCodeExamples: boolean;
  hasInteractiveContent: boolean;
  
  // Versioning
  version: string;
  lastUpdated: string; // ISO timestamp
}

/**
 * Individual section within a chapter
 */
export interface ChapterSection {
  id: string;
  title: string;
  order: number;
  
  // Content metrics
  wordCount: number;
  estimatedReadingTime: number; // minutes
  
  // Progress tracking
  scrollStart: number; // percentage of chapter
  scrollEnd: number; // percentage of chapter
}

// =============================================================================
// SHAREABLE PROGRESS DATA
// =============================================================================

/**
 * Shareable progress snapshot for screenshots/sharing
 */
export interface ShareableProgress {
  id: string;
  createdAt: string; // ISO timestamp
  
  // User identification (anonymous)
  username: string; // display name, not real name
  
  // Progress summary
  totalChapters: number;
  completedChapters: number;
  currentStreak: number;
  longestStreak: number;
  totalReadingTime: number; // hours
  
  // Recent activity (last 30 days)
  recentActivity: DailyActivity[];
  
  // Achievements/badges
  achievements: string[];
  
  // Visual chart data
  chartData: {
    dates: string[]; // YYYY-MM-DD format
    values: number[]; // intensity values 0-4
  };
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Data export structure for backup/restore
 */
export interface DataExport {
  version: string;
  exportedAt: string; // ISO timestamp
  userData: UserProgress;
  chapterMetadata: ChapterMetadata[];
}

/**
 * Migration script interface for schema updates
 */
export interface MigrationScript {
  from: string; // version
  to: string; // version
  migrate: (oldData: any) => UserProgress;
  rollback?: (newData: UserProgress) => any;
}

/**
 * localStorage keys used by the application
 */
export enum StorageKeys {
  USER_PROGRESS = 'docgrind_user_progress',
  CHAPTER_METADATA = 'docgrind_chapter_metadata',
  USER_SETTINGS = 'docgrind_user_settings',
  SCHEMA_VERSION = 'docgrind_schema_version'
}

// =============================================================================
// EXAMPLE DATA STRUCTURES
// =============================================================================

/**
 * Example user progress data for development/testing
 */
export const EXAMPLE_USER_PROGRESS: UserProgress = {
  version: '1.0.0',
  userId: '550e8400-e29b-41d4-a716-446655440000',
  createdAt: '2024-01-15T10:30:00Z',
  lastActiveAt: '2024-01-20T14:45:00Z',
  
  currentSession: {
    id: '550e8400-e29b-41d4-a716-446655440001',
    mode: SessionMode.FIFTEEN_MIN,
    startTime: '2024-01-20T14:30:00Z',
    endTime: null,
    targetDuration: 15,
    chapterId: 'mdn-js-variables',
    scrollPosition: 1200,
    readingProgress: 45,
    timeSpent: 8,
    wordsRead: 340,
    pausedDuration: 2,
    isActive: true,
    isPaused: false,
    isCompleted: false,
    wasInterrupted: false
  },
  
  chapters: {
    'mdn-js-variables': {
      id: 'mdn-js-variables',
      title: 'Variables and Constants',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_Types#Variables',
      category: 'JavaScript',
      status: ChapterStatus.IN_PROGRESS,
      completionPercentage: 45,
      lastScrollPosition: 1200,
      estimatedWordCount: 850,
      estimatedReadingTime: 4,
      sessionsStarted: 2,
      sessionsCompleted: 1,
      totalTimeSpent: 18,
      firstStarted: '2024-01-19T09:15:00Z',
      lastAccessed: '2024-01-20T14:30:00Z',
      completedAt: null,
      exercisesGenerated: false,
      exercisesCompleted: 0,
      exercisesTotal: 0
    }
  },
  
  exercises: {},
  
  dailyActivity: {
    '2024-01-20': {
      date: '2024-01-20',
      chaptersRead: 1,
      chaptersCompleted: 0,
      sessionsCompleted: 0,
      totalReadingTime: 8,
      exercisesAttempted: 0,
      exercisesCompleted: 0,
      exerciseTime: 0,
      totalActiveTime: 8,
      streak: 5,
      intensity: 1,
      sessionModes: [SessionMode.FIFTEEN_MIN]
    }
  },
  
  sessions: [],
  
  settings: {
    emailReminders: {
      enabled: true,
      email: 'user@example.com',
      times: [ReminderTime.NOON, ReminderTime.AFTERNOON],
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
    lastUpdated: '2024-01-20T14:45:00Z',
    totalChaptersAvailable: 45,
    totalChaptersStarted: 8,
    totalChaptersCompleted: 6,
    overallProgressPercentage: 13.3,
    totalReadingTime: 120,
    totalWordsRead: 12000,
    averageSessionDuration: 12,
    longestReadingStreak: 12,
    currentStreak: 5,
    totalExercisesGenerated: 18,
    totalExercisesCompleted: 15,
    averageExerciseTime: 5,
    exerciseSuccessRate: 83.3,
    totalActiveTime: 135,
    averageDailyTime: 15,
    mostActiveDay: 'Monday',
    preferredSessionMode: SessionMode.FIFTEEN_MIN,
    streaks: {
      current: 5,
      longest: 12,
      lastActivityDate: '2024-01-20'
    },
    averageCompletionRate: 78.5,
    chapterRetentionRate: 75.0
  }
};

// =============================================================================
// COMPUTED vs STORED DATA NOTES
// =============================================================================

/**
 * DATA STORAGE STRATEGY:
 * 
 * STORED DATA:
 * - Raw session data (start/end times, progress)
 * - Chapter completion states
 * - Exercise attempts and solutions
 * - User settings and preferences
 * - Daily activity snapshots
 * 
 * COMPUTED DATA (calculated on-demand):
 * - Current streak (from daily activity)
 * - Overall progress percentages
 * - Average session duration
 * - Reading speed estimates
 * - Chart data for visualization
 * 
 * MIGRATION CONSIDERATIONS:
 * - Version field in root object for schema updates
 * - Backwards compatibility for at least 2 versions
 * - Data export/import for major migrations
 * - Graceful degradation for missing fields
 */