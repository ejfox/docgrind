/**
 * Data Manager for DocGrind Application
 * Provides high-level APIs for data operations
 */

import {
  UserProgress,
  SessionData,
  ChapterProgress,
  ExerciseProgress,
  DailyActivity,
  SessionMode,
  ChapterStatus,
  ExerciseStatus,
  ExerciseType,
  StorageKeys,
  ChapterMetadata,
  ExerciseAttempt
} from './schema';

import {
  getFromStorage,
  saveToStorage,
  initializeUserProgress,
  validateUserProgress,
  recomputeStats,
  generateUUID,
  calculateCurrentStreak,
  calculateChartIntensity,
  migrateUserData,
  exportUserData,
  importUserData,
  createShareableProgress
} from './data-utils';

// =============================================================================
// MAIN DATA MANAGER CLASS
// =============================================================================

export class DataManager {
  private userProgress: UserProgress;
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private readonly AUTO_SAVE_INTERVAL = 30000; // 30 seconds

  constructor() {
    this.userProgress = this.loadUserProgress();
    this.startAutoSave();
  }

  // =============================================================================
  // DATA LOADING AND SAVING
  // =============================================================================

  /**
   * Loads user progress from localStorage or initializes new data
   */
  private loadUserProgress(): UserProgress {
    const stored = getFromStorage(StorageKeys.USER_PROGRESS, null);
    
    if (stored && validateUserProgress(stored)) {
      // Run migrations if needed
      const migrated = migrateUserData(stored);
      return migrated;
    }
    
    // Initialize new user progress
    const newProgress = initializeUserProgress();
    this.saveUserProgress(newProgress);
    return newProgress;
  }

  /**
   * Saves user progress to localStorage
   */
  private saveUserProgress(progress?: UserProgress): boolean {
    const dataToSave = progress || this.userProgress;
    dataToSave.lastActiveAt = new Date().toISOString();
    
    return saveToStorage(StorageKeys.USER_PROGRESS, dataToSave);
  }

  /**
   * Starts auto-save timer
   */
  private startAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    
    this.autoSaveInterval = setInterval(() => {
      this.saveUserProgress();
    }, this.AUTO_SAVE_INTERVAL);
  }

  /**
   * Stops auto-save timer
   */
  public stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  /**
   * Forces immediate save
   */
  public forceSave(): boolean {
    return this.saveUserProgress();
  }

  // =============================================================================
  // SESSION MANAGEMENT
  // =============================================================================

  /**
   * Starts a new reading session
   */
  public startSession(chapterId: string, mode: SessionMode): SessionData {
    const session: SessionData = {
      id: generateUUID(),
      mode,
      startTime: new Date().toISOString(),
      endTime: null,
      targetDuration: this.getSessionDuration(mode),
      chapterId,
      scrollPosition: this.getChapterScrollPosition(chapterId),
      readingProgress: this.getChapterProgress(chapterId),
      timeSpent: 0,
      wordsRead: 0,
      pausedDuration: 0,
      isActive: true,
      isPaused: false,
      isCompleted: false,
      wasInterrupted: false
    };

    this.userProgress.currentSession = session;
    this.updateChapterStarted(chapterId);
    this.saveUserProgress();

    return session;
  }

  /**
   * Updates current session progress
   */
  public updateSession(updates: Partial<SessionData>): boolean {
    if (!this.userProgress.currentSession) return false;

    this.userProgress.currentSession = {
      ...this.userProgress.currentSession,
      ...updates
    };

    // Update chapter progress if reading progress changed
    if (updates.readingProgress !== undefined) {
      this.updateChapterProgress(
        this.userProgress.currentSession.chapterId,
        updates.readingProgress
      );
    }

    // Update scroll position if changed
    if (updates.scrollPosition !== undefined) {
      this.updateChapterScrollPosition(
        this.userProgress.currentSession.chapterId,
        updates.scrollPosition
      );
    }

    this.saveUserProgress();
    return true;
  }

  /**
   * Completes the current session
   */
  public completeSession(): boolean {
    if (!this.userProgress.currentSession) return false;

    const session = this.userProgress.currentSession;
    const now = new Date().toISOString();

    // Update session
    session.endTime = now;
    session.isActive = false;
    session.isCompleted = true;

    // Add to session history
    this.userProgress.sessions.unshift({
      id: session.id,
      date: now.split('T')[0],
      mode: session.mode,
      chapterId: session.chapterId,
      chapterTitle: this.getChapterTitle(session.chapterId),
      plannedDuration: session.targetDuration,
      actualDuration: session.timeSpent,
      wordsRead: session.wordsRead,
      progressMade: session.readingProgress - this.getChapterProgress(session.chapterId),
      completed: true,
      interrupted: false,
      timestamp: now
    });

    // Update daily activity
    this.updateDailyActivity(session);

    // Check if chapter is completed
    if (session.readingProgress >= 100) {
      this.completeChapter(session.chapterId);
    }

    // Clear current session
    this.userProgress.currentSession = null;

    // Trim session history to last 100 sessions
    this.userProgress.sessions = this.userProgress.sessions.slice(0, 100);

    // Recompute stats
    this.userProgress.stats = recomputeStats(this.userProgress);

    this.saveUserProgress();
    return true;
  }

  /**
   * Pauses the current session
   */
  public pauseSession(): boolean {
    if (!this.userProgress.currentSession) return false;

    this.userProgress.currentSession.isPaused = true;
    this.saveUserProgress();
    return true;
  }

  /**
   * Resumes the current session
   */
  public resumeSession(): boolean {
    if (!this.userProgress.currentSession) return false;

    this.userProgress.currentSession.isPaused = false;
    this.saveUserProgress();
    return true;
  }

  /**
   * Interrupts the current session (ended before completion)
   */
  public interruptSession(): boolean {
    if (!this.userProgress.currentSession) return false;

    const session = this.userProgress.currentSession;
    session.wasInterrupted = true;
    session.isActive = false;
    session.endTime = new Date().toISOString();

    // Add to session history
    this.userProgress.sessions.unshift({
      id: session.id,
      date: session.startTime.split('T')[0],
      mode: session.mode,
      chapterId: session.chapterId,
      chapterTitle: this.getChapterTitle(session.chapterId),
      plannedDuration: session.targetDuration,
      actualDuration: session.timeSpent,
      wordsRead: session.wordsRead,
      progressMade: session.readingProgress,
      completed: false,
      interrupted: true,
      timestamp: session.endTime
    });

    // Update daily activity
    this.updateDailyActivity(session);

    // Clear current session
    this.userProgress.currentSession = null;

    this.saveUserProgress();
    return true;
  }

  // =============================================================================
  // CHAPTER MANAGEMENT
  // =============================================================================

  /**
   * Gets chapter progress data
   */
  public getChapter(chapterId: string): ChapterProgress | null {
    return this.userProgress.chapters[chapterId] || null;
  }

  /**
   * Gets all chapters
   */
  public getAllChapters(): Record<string, ChapterProgress> {
    return this.userProgress.chapters;
  }

  /**
   * Initializes a new chapter
   */
  public initializeChapter(metadata: ChapterMetadata): ChapterProgress {
    const chapter: ChapterProgress = {
      id: metadata.id,
      title: metadata.title,
      url: metadata.url,
      category: metadata.category,
      status: ChapterStatus.NOT_STARTED,
      completionPercentage: 0,
      lastScrollPosition: 0,
      estimatedWordCount: metadata.estimatedWordCount,
      estimatedReadingTime: metadata.estimatedReadingTime,
      sessionsStarted: 0,
      sessionsCompleted: 0,
      totalTimeSpent: 0,
      firstStarted: null,
      lastAccessed: null,
      completedAt: null,
      exercisesGenerated: false,
      exercisesCompleted: 0,
      exercisesTotal: 0
    };

    this.userProgress.chapters[metadata.id] = chapter;
    this.saveUserProgress();

    return chapter;
  }

  /**
   * Updates chapter progress
   */
  public updateChapterProgress(chapterId: string, progress: number): boolean {
    const chapter = this.userProgress.chapters[chapterId];
    if (!chapter) return false;

    chapter.completionPercentage = Math.min(100, Math.max(0, progress));
    chapter.lastAccessed = new Date().toISOString();

    // Update status based on progress
    if (progress >= 100 && chapter.status !== ChapterStatus.COMPLETED) {
      chapter.status = ChapterStatus.EXERCISES_PENDING;
    } else if (progress > 0 && chapter.status === ChapterStatus.NOT_STARTED) {
      chapter.status = ChapterStatus.IN_PROGRESS;
    }

    this.saveUserProgress();
    return true;
  }

  /**
   * Updates chapter scroll position
   */
  public updateChapterScrollPosition(chapterId: string, position: number): boolean {
    const chapter = this.userProgress.chapters[chapterId];
    if (!chapter) return false;

    chapter.lastScrollPosition = position;
    this.saveUserProgress();
    return true;
  }

  /**
   * Marks chapter as started
   */
  private updateChapterStarted(chapterId: string): void {
    const chapter = this.userProgress.chapters[chapterId];
    if (!chapter) return;

    chapter.sessionsStarted++;
    chapter.lastAccessed = new Date().toISOString();

    if (!chapter.firstStarted) {
      chapter.firstStarted = chapter.lastAccessed;
    }

    if (chapter.status === ChapterStatus.NOT_STARTED) {
      chapter.status = ChapterStatus.IN_PROGRESS;
    }
  }

  /**
   * Completes a chapter
   */
  private completeChapter(chapterId: string): void {
    const chapter = this.userProgress.chapters[chapterId];
    if (!chapter) return;

    chapter.status = ChapterStatus.COMPLETED;
    chapter.completedAt = new Date().toISOString();
    chapter.completionPercentage = 100;

    // Generate exercises if enabled
    if (this.userProgress.settings.exercises.autoGenerateOnComplete) {
      this.generateExercises(chapterId);
    }
  }

  // =============================================================================
  // EXERCISE MANAGEMENT
  // =============================================================================

  /**
   * Generates exercises for a chapter
   */
  public generateExercises(chapterId: string): ExerciseProgress[] {
    const chapter = this.userProgress.chapters[chapterId];
    if (!chapter) return [];

    const exercises: ExerciseProgress[] = [];
    const exerciseTypes = [ExerciseType.MULTIPLE_CHOICE, ExerciseType.CODE_COMPLETION, ExerciseType.DEBUGGING];

    for (let i = 0; i < 3; i++) {
      const exercise: ExerciseProgress = {
        id: generateUUID(),
        chapterId,
        type: exerciseTypes[i % exerciseTypes.length],
        title: `Exercise ${i + 1}: ${chapter.title}`,
        description: `Practice exercise based on ${chapter.title}`,
        prompt: `// This would be generated by LLM based on chapter content\n// Exercise ${i + 1} for ${chapter.title}`,
        hints: [
          'Think about the core concepts from the chapter',
          'Review the examples provided',
          'Consider edge cases'
        ],
        difficulty: 'medium',
        status: ExerciseStatus.PENDING,
        attempts: [],
        userCode: '',
        isCorrect: false,
        createdAt: new Date().toISOString(),
        firstAttemptAt: null,
        completedAt: null,
        timeSpent: 0,
        hintsUsed: 0
      };

      exercises.push(exercise);
      this.userProgress.exercises[exercise.id] = exercise;
    }

    // Update chapter exercise tracking
    chapter.exercisesGenerated = true;
    chapter.exercisesTotal = exercises.length;

    this.saveUserProgress();
    return exercises;
  }

  /**
   * Submits an exercise attempt
   */
  public submitExerciseAttempt(
    exerciseId: string,
    code: string,
    isCorrect: boolean,
    output: string,
    errorMessage?: string
  ): ExerciseAttempt {
    const exercise = this.userProgress.exercises[exerciseId];
    if (!exercise) throw new Error('Exercise not found');

    const attempt: ExerciseAttempt = {
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      code,
      output,
      isCorrect,
      errorMessage,
      timeSpent: 0 // This would be tracked by the UI
    };

    exercise.attempts.push(attempt);
    exercise.userCode = code;
    exercise.isCorrect = isCorrect;

    if (!exercise.firstAttemptAt) {
      exercise.firstAttemptAt = attempt.timestamp;
    }

    if (isCorrect) {
      exercise.status = ExerciseStatus.COMPLETED;
      exercise.completedAt = attempt.timestamp;
      
      // Update chapter exercise completion
      const chapter = this.userProgress.chapters[exercise.chapterId];
      if (chapter) {
        chapter.exercisesCompleted++;
      }
    } else {
      exercise.status = ExerciseStatus.IN_PROGRESS;
    }

    this.saveUserProgress();
    return attempt;
  }

  /**
   * Uses a hint for an exercise
   */
  public useExerciseHint(exerciseId: string): boolean {
    const exercise = this.userProgress.exercises[exerciseId];
    if (!exercise) return false;

    exercise.hintsUsed++;
    this.saveUserProgress();
    return true;
  }

  /**
   * Gets exercises for a chapter
   */
  public getChapterExercises(chapterId: string): ExerciseProgress[] {
    return Object.values(this.userProgress.exercises).filter(
      exercise => exercise.chapterId === chapterId
    );
  }

  // =============================================================================
  // DAILY ACTIVITY TRACKING
  // =============================================================================

  /**
   * Updates daily activity from session data
   */
  private updateDailyActivity(session: SessionData): void {
    const date = session.startTime.split('T')[0];
    const activity = this.userProgress.dailyActivity[date] || {
      date,
      chaptersRead: 0,
      chaptersCompleted: 0,
      sessionsCompleted: 0,
      totalReadingTime: 0,
      exercisesAttempted: 0,
      exercisesCompleted: 0,
      exerciseTime: 0,
      totalActiveTime: 0,
      streak: 0,
      intensity: 0,
      sessionModes: []
    };

    // Update activity metrics
    activity.chaptersRead = new Set([
      ...activity.sessionModes,
      ...this.getChaptersReadToday(date)
    ]).size;

    activity.sessionsCompleted++;
    activity.totalReadingTime += session.timeSpent;
    activity.totalActiveTime += session.timeSpent;

    if (!activity.sessionModes.includes(session.mode)) {
      activity.sessionModes.push(session.mode);
    }

    // Calculate intensity
    activity.intensity = calculateChartIntensity(activity.totalActiveTime);

    this.userProgress.dailyActivity[date] = activity;
  }

  /**
   * Gets chapters read on a specific date
   */
  private getChaptersReadToday(date: string): string[] {
    return this.userProgress.sessions
      .filter(session => session.date === date)
      .map(session => session.chapterId);
  }

  /**
   * Gets daily activity for chart display
   */
  public getDailyActivityForChart(days: number = 365): Array<{date: string, value: number}> {
    const result: Array<{date: string, value: number}> = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const activity = this.userProgress.dailyActivity[dateStr];
      result.push({
        date: dateStr,
        value: activity ? activity.intensity : 0
      });
    }
    
    return result;
  }

  // =============================================================================
  // GETTER METHODS
  // =============================================================================

  /**
   * Gets current session
   */
  public getCurrentSession(): SessionData | null {
    return this.userProgress.currentSession;
  }

  /**
   * Gets user settings
   */
  public getSettings() {
    return this.userProgress.settings;
  }

  /**
   * Gets computed statistics
   */
  public getStats() {
    return this.userProgress.stats;
  }

  /**
   * Gets current streak
   */
  public getCurrentStreak(): number {
    return calculateCurrentStreak(this.userProgress.dailyActivity);
  }

  /**
   * Gets chapter progress percentage
   */
  private getChapterProgress(chapterId: string): number {
    return this.userProgress.chapters[chapterId]?.completionPercentage || 0;
  }

  /**
   * Gets chapter scroll position
   */
  private getChapterScrollPosition(chapterId: string): number {
    return this.userProgress.chapters[chapterId]?.lastScrollPosition || 0;
  }

  /**
   * Gets chapter title
   */
  private getChapterTitle(chapterId: string): string {
    return this.userProgress.chapters[chapterId]?.title || 'Unknown Chapter';
  }

  /**
   * Gets session duration in minutes based on mode
   */
  private getSessionDuration(mode: SessionMode): number {
    switch (mode) {
      case SessionMode.FIVE_MIN: return 5;
      case SessionMode.FIFTEEN_MIN: return 15;
      case SessionMode.JOY: return 60;
      case SessionMode.ZEN: return 0; // unlimited
      default: return 15;
    }
  }

  // =============================================================================
  // SETTINGS MANAGEMENT
  // =============================================================================

  /**
   * Updates user settings
   */
  public updateSettings(settings: Partial<typeof this.userProgress.settings>): boolean {
    this.userProgress.settings = {
      ...this.userProgress.settings,
      ...settings
    };

    this.saveUserProgress();
    return true;
  }

  // =============================================================================
  // DATA EXPORT/IMPORT
  // =============================================================================

  /**
   * Exports user data
   */
  public exportData() {
    return exportUserData();
  }

  /**
   * Imports user data
   */
  public importData(data: any): boolean {
    const success = importUserData(data);
    if (success) {
      this.userProgress = this.loadUserProgress();
    }
    return success;
  }

  /**
   * Creates shareable progress snapshot
   */
  public createShareableSnapshot() {
    return createShareableProgress(this.userProgress);
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Refreshes computed statistics
   */
  public refreshStats(): void {
    this.userProgress.stats = recomputeStats(this.userProgress);
    this.saveUserProgress();
  }

  /**
   * Clears all user data (for testing/reset)
   */
  public clearAllData(): boolean {
    try {
      localStorage.removeItem(StorageKeys.USER_PROGRESS);
      this.userProgress = initializeUserProgress();
      this.saveUserProgress();
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  /**
   * Gets data size in bytes
   */
  public getDataSize(): number {
    const serialized = JSON.stringify(this.userProgress);
    return new Blob([serialized]).size;
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let dataManagerInstance: DataManager | null = null;

/**
 * Gets the singleton DataManager instance
 */
export function getDataManager(): DataManager {
  if (!dataManagerInstance) {
    dataManagerInstance = new DataManager();
  }
  return dataManagerInstance;
}

/**
 * Resets the singleton instance (for testing)
 */
export function resetDataManager(): void {
  if (dataManagerInstance) {
    dataManagerInstance.stopAutoSave();
    dataManagerInstance = null;
  }
}