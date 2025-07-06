/**
 * Example usage of DocGrind data schema
 * Demonstrates common patterns and workflows
 */

import { 
  getDataManager, 
  DataManager 
} from './data-manager';

import {
  SessionMode,
  ChapterStatus,
  ExerciseType,
  ExerciseStatus,
  ChapterMetadata,
  UserProgress,
  SessionData,
  ChapterProgress,
  ExerciseProgress,
  DailyActivity
} from './schema';

// =============================================================================
// EXAMPLE 1: COMPLETE READING SESSION WORKFLOW
// =============================================================================

/**
 * Example: Complete reading session from start to finish
 */
export async function exampleReadingSession() {
  const dataManager = getDataManager();
  
  // 1. Initialize chapter metadata (normally loaded from MDN API)
  const chapterMetadata: ChapterMetadata = {
    id: 'mdn-js-variables',
    title: 'Variables and Constants',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_Types#Variables',
    sections: [
      {
        id: 'declaring-variables',
        title: 'Declaring Variables',
        order: 1,
        wordCount: 250,
        estimatedReadingTime: 1.5,
        scrollStart: 0,
        scrollEnd: 25
      },
      {
        id: 'variable-scope',
        title: 'Variable Scope',
        order: 2,
        wordCount: 300,
        estimatedReadingTime: 2,
        scrollStart: 25,
        scrollEnd: 60
      },
      {
        id: 'constants',
        title: 'Constants',
        order: 3,
        wordCount: 200,
        estimatedReadingTime: 1.5,
        scrollStart: 60,
        scrollEnd: 100
      }
    ],
    category: 'JavaScript',
    subcategory: 'Language Basics',
    tags: ['variables', 'const', 'let', 'var', 'scope'],
    difficulty: 'beginner',
    estimatedWordCount: 750,
    estimatedReadingTime: 5,
    prerequisites: [],
    nextChapters: ['mdn-js-data-types', 'mdn-js-functions'],
    hasExercises: true,
    hasCodeExamples: true,
    hasInteractiveContent: false,
    version: '1.0.0',
    lastUpdated: '2024-01-15T10:00:00Z'
  };
  
  // 2. Initialize chapter in user progress
  const chapter = dataManager.initializeChapter(chapterMetadata);
  console.log('Chapter initialized:', chapter.title);
  
  // 3. Start a 15-minute reading session
  const session = dataManager.startSession(chapter.id, SessionMode.FIFTEEN_MIN);
  console.log('Session started:', session.id);
  
  // 4. Simulate reading progress updates
  const progressUpdates = [
    { time: 2, scroll: 300, progress: 15, words: 120 },
    { time: 5, scroll: 600, progress: 35, words: 280 },
    { time: 8, scroll: 900, progress: 55, words: 450 },
    { time: 12, scroll: 1200, progress: 75, words: 600 },
    { time: 15, scroll: 1500, progress: 100, words: 750 }
  ];
  
  for (const update of progressUpdates) {
    dataManager.updateSession({
      timeSpent: update.time,
      scrollPosition: update.scroll,
      readingProgress: update.progress,
      wordsRead: update.words
    });
    
    // Log progress
    console.log(`Progress: ${update.progress}% at ${update.time} minutes`);
    
    // Simulate pause/resume
    if (update.time === 8) {
      dataManager.pauseSession();
      console.log('Session paused for interruption');
      
      // Resume after 30 seconds
      setTimeout(() => {
        dataManager.resumeSession();
        console.log('Session resumed');
      }, 500);
    }
  }
  
  // 5. Complete the session
  const completed = dataManager.completeSession();
  console.log('Session completed:', completed);
  
  // 6. Check if exercises were generated
  const exercises = dataManager.getChapterExercises(chapter.id);
  console.log(`Generated ${exercises.length} exercises`);
  
  return {
    chapter,
    session,
    exercises,
    stats: dataManager.getStats()
  };
}

// =============================================================================
// EXAMPLE 2: EXERCISE COMPLETION WORKFLOW
// =============================================================================

/**
 * Example: Complete exercise workflow with multiple attempts
 */
export async function exampleExerciseWorkflow() {
  const dataManager = getDataManager();
  
  // Assume we have a chapter with exercises
  const exercises = dataManager.getChapterExercises('mdn-js-variables');
  if (exercises.length === 0) {
    console.log('No exercises found. Generate some first.');
    return;
  }
  
  const exercise = exercises[0];
  console.log('Starting exercise:', exercise.title);
  
  // 1. First attempt (incorrect)
  const attempt1 = dataManager.submitExerciseAttempt(
    exercise.id,
    'var x = 5;', // Using var instead of let/const
    false,
    'Code runs but uses deprecated var keyword',
    'Consider using let or const instead of var'
  );
  console.log('First attempt failed:', attempt1.errorMessage);
  
  // 2. Use a hint
  dataManager.useExerciseHint(exercise.id);
  console.log('Hint used. Hints used:', exercise.hintsUsed);
  
  // 3. Second attempt (correct)
  const attempt2 = dataManager.submitExerciseAttempt(
    exercise.id,
    'const x = 5;',
    true,
    'Variable declared successfully using const'
  );
  console.log('Second attempt succeeded!');
  
  // 4. Check updated exercise status
  const updatedExercise = dataManager.userProgress.exercises[exercise.id];
  console.log('Exercise status:', updatedExercise.status);
  console.log('Total attempts:', updatedExercise.attempts.length);
  
  return {
    exercise: updatedExercise,
    attempts: [attempt1, attempt2],
    stats: dataManager.getStats()
  };
}

// =============================================================================
// EXAMPLE 3: PROGRESS TRACKING AND ANALYTICS
// =============================================================================

/**
 * Example: Comprehensive progress tracking and analytics
 */
export async function exampleProgressTracking() {
  const dataManager = getDataManager();
  
  // 1. Get current statistics
  const stats = dataManager.getStats();
  console.log('=== CURRENT STATISTICS ===');
  console.log(`Overall Progress: ${stats.overallProgressPercentage}%`);
  console.log(`Current Streak: ${stats.currentStreak} days`);
  console.log(`Total Reading Time: ${stats.totalReadingTime} minutes`);
  console.log(`Chapters Completed: ${stats.totalChaptersCompleted}/${stats.totalChaptersAvailable}`);
  console.log(`Exercise Success Rate: ${stats.exerciseSuccessRate}%`);
  
  // 2. Get daily activity for last 30 days
  const chartData = dataManager.getDailyActivityForChart(30);
  console.log('\n=== ACTIVITY CHART DATA ===');
  console.log('Last 30 days activity:');
  chartData.forEach(day => {
    const bars = '█'.repeat(day.value);
    console.log(`${day.date}: ${bars} (${day.value})`);
  });
  
  // 3. Analyze reading patterns
  const sessions = dataManager.userProgress.sessions;
  const sessionsByMode = sessions.reduce((acc, session) => {
    acc[session.mode] = (acc[session.mode] || 0) + 1;
    return acc;
  }, {} as Record<SessionMode, number>);
  
  console.log('\n=== READING PATTERNS ===');
  Object.entries(sessionsByMode).forEach(([mode, count]) => {
    console.log(`${mode}: ${count} sessions`);
  });
  
  // 4. Chapter completion analysis
  const chapters = Object.values(dataManager.getAllChapters());
  const chaptersByStatus = chapters.reduce((acc, chapter) => {
    acc[chapter.status] = (acc[chapter.status] || 0) + 1;
    return acc;
  }, {} as Record<ChapterStatus, number>);
  
  console.log('\n=== CHAPTER STATUS ===');
  Object.entries(chaptersByStatus).forEach(([status, count]) => {
    console.log(`${status}: ${count} chapters`);
  });
  
  // 5. Recent activity summary
  const recentActivity = Object.values(dataManager.userProgress.dailyActivity)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);
  
  console.log('\n=== RECENT ACTIVITY (Last 7 days) ===');
  recentActivity.forEach(day => {
    console.log(`${day.date}: ${day.totalReadingTime}min reading, ${day.exercisesCompleted} exercises`);
  });
  
  return {
    stats,
    chartData,
    sessionsByMode,
    chaptersByStatus,
    recentActivity
  };
}

// =============================================================================
// EXAMPLE 4: SETTINGS AND PREFERENCES
// =============================================================================

/**
 * Example: Managing user settings and preferences
 */
export async function exampleSettingsManagement() {
  const dataManager = getDataManager();
  
  // 1. Get current settings
  const currentSettings = dataManager.getSettings();
  console.log('Current settings:', currentSettings);
  
  // 2. Update email reminder settings
  dataManager.updateSettings({
    emailReminders: {
      enabled: true,
      email: 'user@example.com',
      times: ['12:00', '15:00', '18:00'],
      streakWarning: true
    }
  });
  console.log('Email reminders enabled');
  
  // 3. Update reading preferences
  dataManager.updateSettings({
    reading: {
      defaultSessionMode: SessionMode.JOY, // Change to 1-hour sessions
      autoAdvanceChapters: true,
      showReadingProgress: true,
      pauseOnFocusLoss: true,
      estimatedWPM: 250 // Faster reading speed
    }
  });
  console.log('Reading preferences updated');
  
  // 4. Update exercise preferences
  dataManager.updateSettings({
    exercises: {
      autoGenerateOnComplete: true,
      showHints: true,
      skipExercises: false,
      maxAttempts: 5 // Allow more attempts
    }
  });
  console.log('Exercise preferences updated');
  
  // 5. Update dashboard preferences
  dataManager.updateSettings({
    dashboard: {
      showStats: true,
      showStreak: true,
      showChart: true,
      chartTimeRange: 'year' // Show yearly chart
    }
  });
  console.log('Dashboard preferences updated');
  
  return dataManager.getSettings();
}

// =============================================================================
// EXAMPLE 5: DATA EXPORT AND IMPORT
// =============================================================================

/**
 * Example: Data backup and restore operations
 */
export async function exampleDataBackup() {
  const dataManager = getDataManager();
  
  // 1. Export current data
  const exportData = dataManager.exportData();
  console.log('Data exported successfully');
  console.log(`Export size: ${JSON.stringify(exportData).length} characters`);
  console.log(`Export timestamp: ${exportData.exportedAt}`);
  
  // 2. Create a shareable progress snapshot
  const shareableData = dataManager.createShareableSnapshot();
  console.log('\n=== SHAREABLE PROGRESS ===');
  console.log(`Username: ${shareableData.username}`);
  console.log(`Completed Chapters: ${shareableData.completedChapters}/${shareableData.totalChapters}`);
  console.log(`Current Streak: ${shareableData.currentStreak} days`);
  console.log(`Longest Streak: ${shareableData.longestStreak} days`);
  console.log(`Total Reading Time: ${shareableData.totalReadingTime} hours`);
  
  // 3. Simulate data corruption and restore
  console.log('\n=== TESTING DATA RECOVERY ===');
  
  // Get current data size
  const originalSize = dataManager.getDataSize();
  console.log(`Original data size: ${originalSize} bytes`);
  
  // Save a backup
  const backupData = dataManager.exportData();
  
  // Simulate corruption by clearing some data
  console.log('Simulating data corruption...');
  // In real scenario, this might be localStorage corruption
  
  // Restore from backup
  const restoreSuccess = dataManager.importData(backupData);
  console.log(`Data restore ${restoreSuccess ? 'successful' : 'failed'}`);
  
  const restoredSize = dataManager.getDataSize();
  console.log(`Restored data size: ${restoredSize} bytes`);
  
  return {
    exportData,
    shareableData,
    originalSize,
    restoredSize,
    restoreSuccess
  };
}

// =============================================================================
// EXAMPLE 6: STREAK TRACKING AND MOTIVATION
// =============================================================================

/**
 * Example: Advanced streak tracking and motivation features
 */
export async function exampleStreakTracking() {
  const dataManager = getDataManager();
  
  // 1. Get current streak information
  const currentStreak = dataManager.getCurrentStreak();
  const stats = dataManager.getStats();
  
  console.log('=== STREAK INFORMATION ===');
  console.log(`Current Streak: ${currentStreak} days`);
  console.log(`Longest Streak: ${stats.longestReadingStreak} days`);
  console.log(`Last Activity: ${stats.streaks.lastActivityDate}`);
  
  // 2. Check if streak is at risk
  const today = new Date().toISOString().split('T')[0];
  const lastActivity = stats.streaks.lastActivityDate;
  const daysSinceActivity = Math.floor(
    (new Date(today).getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  console.log(`Days since last activity: ${daysSinceActivity}`);
  
  if (daysSinceActivity >= 1) {
    console.log('🚨 STREAK AT RISK! 🚨');
    console.log(`Your ${currentStreak}-day streak is at risk!`);
    console.log('Complete a 5-minute session to maintain your streak.');
  }
  
  // 3. Analyze streak patterns
  const dailyActivity = Object.values(dataManager.userProgress.dailyActivity);
  const streakHistory = dailyActivity.map(day => ({
    date: day.date,
    streak: day.streak,
    activeTime: day.totalActiveTime
  }));
  
  console.log('\n=== STREAK HISTORY ===');
  streakHistory.slice(-10).forEach(day => {
    const indicator = day.activeTime > 0 ? '🔥' : '❄️';
    console.log(`${day.date}: ${indicator} ${day.streak} days`);
  });
  
  // 4. Calculate streak milestones
  const milestones = [7, 14, 30, 60, 90, 180, 365];
  const nextMilestone = milestones.find(m => m > currentStreak);
  
  if (nextMilestone) {
    const daysToMilestone = nextMilestone - currentStreak;
    console.log(`\n🎯 NEXT MILESTONE: ${nextMilestone} days`);
    console.log(`${daysToMilestone} days to go!`);
  }
  
  return {
    currentStreak,
    longestStreak: stats.longestReadingStreak,
    daysSinceActivity,
    streakAtRisk: daysSinceActivity >= 1,
    nextMilestone,
    streakHistory
  };
}

// =============================================================================
// EXAMPLE 7: PERFORMANCE MONITORING
// =============================================================================

/**
 * Example: Monitor data performance and storage usage
 */
export async function examplePerformanceMonitoring() {
  const dataManager = getDataManager();
  
  console.log('=== PERFORMANCE MONITORING ===');
  
  // 1. Check data size
  const dataSize = dataManager.getDataSize();
  const maxSize = 5 * 1024 * 1024; // 5MB typical localStorage limit
  const usagePercentage = (dataSize / maxSize) * 100;
  
  console.log(`Data size: ${dataSize} bytes`);
  console.log(`Storage usage: ${usagePercentage.toFixed(2)}%`);
  
  if (usagePercentage > 80) {
    console.log('⚠️  Storage usage is high. Consider data cleanup.');
  }
  
  // 2. Check session history size
  const sessionCount = dataManager.userProgress.sessions.length;
  console.log(`Session history: ${sessionCount} entries`);
  
  // 3. Check daily activity size
  const activityCount = Object.keys(dataManager.userProgress.dailyActivity).length;
  console.log(`Daily activity records: ${activityCount} entries`);
  
  // 4. Check exercise count
  const exerciseCount = Object.keys(dataManager.userProgress.exercises).length;
  console.log(`Exercise records: ${exerciseCount} entries`);
  
  // 5. Measure stats computation time
  const startTime = performance.now();
  dataManager.refreshStats();
  const endTime = performance.now();
  const computationTime = endTime - startTime;
  
  console.log(`Stats computation time: ${computationTime.toFixed(2)}ms`);
  
  // 6. Check for data integrity
  const userProgress = dataManager.userProgress;
  const hasCurrentSession = userProgress.currentSession !== null;
  const hasValidStats = userProgress.stats.lastUpdated !== null;
  const hasValidSettings = userProgress.settings.reading.estimatedWPM > 0;
  
  console.log('\n=== DATA INTEGRITY ===');
  console.log(`Current session: ${hasCurrentSession ? '✅' : '❌'}`);
  console.log(`Valid stats: ${hasValidStats ? '✅' : '❌'}`);
  console.log(`Valid settings: ${hasValidSettings ? '✅' : '❌'}`);
  
  return {
    dataSize,
    usagePercentage,
    sessionCount,
    activityCount,
    exerciseCount,
    computationTime,
    integrity: {
      hasCurrentSession,
      hasValidStats,
      hasValidSettings
    }
  };
}

// =============================================================================
// EXAMPLE 8: COMPREHENSIVE USAGE DEMO
// =============================================================================

/**
 * Example: Complete application workflow demonstration
 */
export async function exampleComprehensiveDemo() {
  console.log('🚀 Starting DocGrind Data Schema Demo');
  
  try {
    // 1. Reading session
    console.log('\n📚 Running reading session example...');
    const sessionResult = await exampleReadingSession();
    
    // 2. Exercise workflow
    console.log('\n💪 Running exercise workflow example...');
    const exerciseResult = await exampleExerciseWorkflow();
    
    // 3. Progress tracking
    console.log('\n📊 Running progress tracking example...');
    const progressResult = await exampleProgressTracking();
    
    // 4. Settings management
    console.log('\n⚙️ Running settings management example...');
    const settingsResult = await exampleSettingsManagement();
    
    // 5. Data backup
    console.log('\n💾 Running data backup example...');
    const backupResult = await exampleDataBackup();
    
    // 6. Streak tracking
    console.log('\n🔥 Running streak tracking example...');
    const streakResult = await exampleStreakTracking();
    
    // 7. Performance monitoring
    console.log('\n⚡ Running performance monitoring example...');
    const performanceResult = await examplePerformanceMonitoring();
    
    console.log('\n✅ All examples completed successfully!');
    
    return {
      session: sessionResult,
      exercise: exerciseResult,
      progress: progressResult,
      settings: settingsResult,
      backup: backupResult,
      streak: streakResult,
      performance: performanceResult
    };
    
  } catch (error) {
    console.error('❌ Error running examples:', error);
    throw error;
  }
}

// =============================================================================
// UTILITY FUNCTIONS FOR TESTING
// =============================================================================

/**
 * Utility: Create sample data for testing
 */
export function createSampleData() {
  const dataManager = getDataManager();
  
  // Create sample chapters
  const sampleChapters = [
    {
      id: 'mdn-js-variables',
      title: 'Variables and Constants',
      category: 'JavaScript',
      wordCount: 750,
      readingTime: 5
    },
    {
      id: 'mdn-js-data-types',
      title: 'Data Types',
      category: 'JavaScript',
      wordCount: 1200,
      readingTime: 8
    },
    {
      id: 'mdn-js-functions',
      title: 'Functions',
      category: 'JavaScript',
      wordCount: 1500,
      readingTime: 10
    }
  ];
  
  // Initialize chapters
  sampleChapters.forEach(chapter => {
    const metadata: ChapterMetadata = {
      id: chapter.id,
      title: chapter.title,
      url: `https://developer.mozilla.org/en-US/docs/Web/JavaScript/${chapter.id}`,
      sections: [],
      category: chapter.category,
      tags: [],
      difficulty: 'beginner',
      estimatedWordCount: chapter.wordCount,
      estimatedReadingTime: chapter.readingTime,
      prerequisites: [],
      nextChapters: [],
      hasExercises: true,
      hasCodeExamples: true,
      hasInteractiveContent: false,
      version: '1.0.0',
      lastUpdated: new Date().toISOString()
    };
    
    dataManager.initializeChapter(metadata);
  });
  
  // Create sample daily activity
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const activity: DailyActivity = {
      date: dateStr,
      chaptersRead: Math.floor(Math.random() * 3),
      chaptersCompleted: Math.floor(Math.random() * 2),
      sessionsCompleted: Math.floor(Math.random() * 4),
      totalReadingTime: Math.floor(Math.random() * 60),
      exercisesAttempted: Math.floor(Math.random() * 5),
      exercisesCompleted: Math.floor(Math.random() * 3),
      exerciseTime: Math.floor(Math.random() * 20),
      totalActiveTime: Math.floor(Math.random() * 80),
      streak: Math.max(0, 30 - i),
      intensity: Math.floor(Math.random() * 5),
      sessionModes: [SessionMode.FIFTEEN_MIN]
    };
    
    dataManager.userProgress.dailyActivity[dateStr] = activity;
  }
  
  // Force save and refresh stats
  dataManager.refreshStats();
  dataManager.forceSave();
  
  console.log('Sample data created successfully');
  return dataManager.userProgress;
}

/**
 * Utility: Reset all data for testing
 */
export function resetAllData() {
  const dataManager = getDataManager();
  const success = dataManager.clearAllData();
  console.log(`Data reset ${success ? 'successful' : 'failed'}`);
  return success;
}

// Export the main demo function as default
export default exampleComprehensiveDemo;