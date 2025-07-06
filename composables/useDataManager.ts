import { computed, ref, readonly, onBeforeUnmount } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { 
  SessionMode,
  ChapterStatus,
  type UserProgress, 
  type SessionData, 
  type ChapterProgress, 
  type DailyActivity, 
  type ComputedStats
} from '~/types/schema'

// Default values for localStorage
const DEFAULT_USER_PROGRESS: UserProgress = {
  version: "1.0.0",
  userId: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
      streakWarning: false
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
      autoBackup: false,
      retentionDays: 90
    },
    autoSaveInterval: 30
  },
  stats: {
    lastUpdated: new Date().toISOString(),
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
      lastActivityDate: new Date().toISOString().split('T')[0]
    },
    averageCompletionRate: 0,
    chapterRetentionRate: 0
  },
  createdAt: new Date().toISOString(),
  lastActiveAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

export const useDataManager = () => {
  // Reactive localStorage using VueUse
  const userProgress = useLocalStorage('docgrind-user-progress', DEFAULT_USER_PROGRESS)
  const exercises = useLocalStorage('docgrind-exercises', {})
  const activityData = useLocalStorage('docgrind-activity', {})

  // Auto-save interval
  let autoSaveInterval: NodeJS.Timeout | null = null

  // Initialize data manager
  const initializeDataManager = async () => {
    try {
      // Update timestamp
      userProgress.value.updatedAt = new Date().toISOString()
      
      // Start auto-save on client-side only
      if (process.client) {
        startAutoSave()
      }
      
      return true
    } catch (error) {
      console.error('DataManager initialization error:', error)
      return false
    }
  }

  // Start auto-save mechanism
  const startAutoSave = () => {
    if (autoSaveInterval) return
    
    autoSaveInterval = setInterval(() => {
      userProgress.value.updatedAt = new Date().toISOString()
    }, userProgress.value.settings.autoSaveInterval * 1000)
  }

  // Stop auto-save
  const stopAutoSave = () => {
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval)
      autoSaveInterval = null
    }
  }

  // Start a new reading session
  const startSession = async (chapterId: string, mode: SessionMode): Promise<SessionData> => {
    const session: SessionData = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      chapterId,
      mode,
      startTime: new Date().toISOString(),
      targetDuration: getSessionDuration(mode),
      timeSpent: 0,
      wordsRead: 0,
      scrollPosition: 0,
      readingProgress: 0,
      isActive: true
    }

    userProgress.value.currentSession = session
    userProgress.value.updatedAt = new Date().toISOString()

    return session
  }

  // Update current session
  const updateSession = async (updates: Partial<SessionData>): Promise<void> => {
    if (!userProgress.value.currentSession) return

    Object.assign(userProgress.value.currentSession, updates)
    userProgress.value.updatedAt = new Date().toISOString()
  }

  // Complete current session
  const completeSession = async (): Promise<void> => {
    if (!userProgress.value.currentSession) return

    const session = userProgress.value.currentSession
    session.endTime = new Date().toISOString()
    session.isActive = false

    // Update chapter progress
    const chapterId = session.chapterId
    if (!userProgress.value.chapters[chapterId]) {
      userProgress.value.chapters[chapterId] = {
        id: chapterId,
        title: '',
        url: '',
        category: '',
        status: ChapterStatus.IN_PROGRESS,
        completionPercentage: 0,
        lastScrollPosition: 0,
        readingProgress: 0,
        estimatedWordCount: 0,
        estimatedReadingTime: 0,
        sessionsStarted: 0,
        sessionsCompleted: 0,
        totalTimeSpent: 0,
        timeSpent: 0,
        sessionsCount: 0,
        firstStarted: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        lastReadAt: new Date().toISOString(),
        completedAt: null,
        exercisesGenerated: false,
        exercisesCompleted: 0,
        exercisesTotal: 0,
        totalExercises: 0,
        bookmarks: [],
        notes: []
      }
    }

    const chapterProgress = userProgress.value.chapters[chapterId]
    chapterProgress.timeSpent += session.timeSpent
    chapterProgress.sessionsCount += 1
    chapterProgress.readingProgress = Math.max(chapterProgress.readingProgress, session.readingProgress)
    chapterProgress.lastReadAt = new Date().toISOString()

    if (session.readingProgress >= 100) {
      chapterProgress.status = ChapterStatus.COMPLETED
      chapterProgress.completedAt = new Date().toISOString()
    }

    // Add to session history
    userProgress.value.sessions.unshift({
      id: session.id,
      date: new Date().toISOString().split('T')[0],
      mode: session.mode,
      chapterId: session.chapterId,
      chapterTitle: chapterProgress.title || 'Unknown Chapter',
      plannedDuration: session.targetDuration,
      actualDuration: session.timeSpent,
      wordsRead: session.wordsRead,
      progressMade: session.readingProgress,
      startTime: session.startTime,
      endTime: session.endTime!,
      completed: session.readingProgress >= 100,
      interrupted: false,
      isCompleted: session.readingProgress >= 100,
      timestamp: session.endTime!
    })

    // Keep only last 100 sessions
    if (userProgress.value.sessions.length > 100) {
      userProgress.value.sessions = userProgress.value.sessions.slice(0, 100)
    }

    // Update daily activity
    const today = new Date().toISOString().split('T')[0]
    if (!userProgress.value.dailyActivity[today]) {
      userProgress.value.dailyActivity[today] = {
        date: today,
        chaptersRead: 0,
        chaptersCompleted: 0,
        sessionsCompleted: 0,
        totalReadingTime: 0,
        timeSpent: 0,
        wordsRead: 0,
        exercisesAttempted: 0,
        exercisesCompleted: 0,
        exerciseTime: 0,
        totalActiveTime: 0,
        streak: 0,
        intensity: 0,
        sessionModes: []
      }
    }

    const todayActivity = userProgress.value.dailyActivity[today]
    todayActivity.sessionsCompleted += 1
    todayActivity.timeSpent += session.timeSpent
    todayActivity.totalReadingTime += session.timeSpent
    todayActivity.wordsRead += session.wordsRead

    // Update stats
    await updateStats()

    // Clear current session
    userProgress.value.currentSession = null
    userProgress.value.updatedAt = new Date().toISOString()
  }

  // Update computed statistics
  const updateStats = async (): Promise<void> => {
    const chapters = Object.values(userProgress.value.chapters)
    const completedChapters = chapters.filter(c => c.status === ChapterStatus.COMPLETED)
    const startedChapters = chapters.filter(c => c.status !== ChapterStatus.NOT_STARTED)
    const sessions = userProgress.value.sessions
    const activities = Object.values(userProgress.value.dailyActivity)

    const totalReadingTime = activities.reduce((sum, a) => sum + a.timeSpent, 0)
    const totalWordsRead = activities.reduce((sum, a) => sum + a.wordsRead, 0)
    const totalExercisesCompleted = activities.reduce((sum, a) => sum + a.exercisesCompleted, 0)
    const totalExercisesGenerated = chapters.reduce((sum, c) => sum + (c.exercisesTotal || 0), 0)

    const stats: ComputedStats = {
      lastUpdated: new Date().toISOString(),
      totalChaptersAvailable: chapters.length,
      totalChaptersStarted: startedChapters.length,
      totalChaptersCompleted: completedChapters.length,
      overallProgressPercentage: chapters.length > 0 ? (completedChapters.length / chapters.length) * 100 : 0,
      totalReadingTime,
      totalWordsRead,
      averageSessionDuration: sessions.length > 0 ? sessions.reduce((sum, s) => sum + s.actualDuration, 0) / sessions.length : 0,
      longestReadingStreak: calculateLongestStreak(),
      currentStreak: calculateCurrentStreak(),
      totalExercisesGenerated,
      totalExercisesCompleted,
      averageExerciseTime: 0, // Would need exercise timing data
      exerciseSuccessRate: totalExercisesGenerated > 0 ? (totalExercisesCompleted / totalExercisesGenerated) * 100 : 0,
      totalActiveTime: totalReadingTime,
      averageDailyTime: activities.length > 0 ? totalReadingTime / activities.length : 0,
      mostActiveDay: 'Monday', // Would need analysis of daily patterns
      preferredSessionMode: SessionMode.FIFTEEN_MIN, // Would need analysis of session modes
      streaks: {
        current: calculateCurrentStreak(),
        longest: calculateLongestStreak(),
        lastActivityDate: activities.length > 0 ? 
          activities.sort((a, b) => b.date.localeCompare(a.date))[0].date : 
          new Date().toISOString().split('T')[0]
      },
      averageCompletionRate: sessions.length > 0 ? 
        (sessions.filter(s => s.isCompleted).length / sessions.length) * 100 : 0,
      chapterRetentionRate: startedChapters.length > 0 ? 
        (completedChapters.length / startedChapters.length) * 100 : 0
    }

    userProgress.value.stats = stats
    userProgress.value.updatedAt = new Date().toISOString()
  }

  // Calculate current streak
  const calculateCurrentStreak = (): number => {
    const activities = Object.values(userProgress.value.dailyActivity)
      .sort((a, b) => b.date.localeCompare(a.date))

    let streak = 0
    const today = new Date().toISOString().split('T')[0]
    
    for (let i = 0; i < activities.length; i++) {
      const expectedDate = new Date()
      expectedDate.setDate(expectedDate.getDate() - i)
      const expectedDateStr = expectedDate.toISOString().split('T')[0]
      
      if (activities[i]?.date === expectedDateStr && activities[i].sessionsCompleted > 0) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  // Calculate longest streak
  const calculateLongestStreak = (): number => {
    const activities = Object.values(userProgress.value.dailyActivity)
      .filter(a => a.sessionsCompleted > 0)
      .sort((a, b) => a.date.localeCompare(b.date))

    let longestStreak = 0
    let currentStreak = 0
    let lastDate: Date | null = null

    for (const activity of activities) {
      const date = new Date(activity.date)
      
      if (lastDate && date.getTime() - lastDate.getTime() === 24 * 60 * 60 * 1000) {
        currentStreak++
      } else {
        currentStreak = 1
      }
      
      longestStreak = Math.max(longestStreak, currentStreak)
      lastDate = date
    }

    return longestStreak
  }

  // Get session duration in minutes
  const getSessionDuration = (mode: SessionMode): number => {
    switch (mode) {
      case SessionMode.FIVE_MIN: return 5
      case SessionMode.FIFTEEN_MIN: return 15
      case SessionMode.JOY: return 60
      case SessionMode.ZEN: return 0 // unlimited
      default: return 15
    }
  }

  // Update user settings
  const updateSettings = async (newSettings: Partial<typeof userProgress.value.settings>): Promise<void> => {
    Object.assign(userProgress.value.settings, newSettings)
    userProgress.value.updatedAt = new Date().toISOString()
  }

  // Export data
  const exportData = () => {
    return {
      userProgress: userProgress.value,
      exercises: exercises.value,
      activityData: activityData.value,
      exportedAt: new Date().toISOString()
    }
  }

  // Import data
  const importData = async (data: any): Promise<boolean> => {
    try {
      if (data.userProgress) {
        userProgress.value = data.userProgress
      }
      if (data.exercises) {
        exercises.value = data.exercises
      }
      if (data.activityData) {
        activityData.value = data.activityData
      }
      
      userProgress.value.updatedAt = new Date().toISOString()
      return true
    } catch (error) {
      console.error('Error importing data:', error)
      return false
    }
  }

  // Clear all data
  const clearAllData = async (): Promise<void> => {
    userProgress.value = { ...DEFAULT_USER_PROGRESS }
    exercises.value = {}
    activityData.value = {}
  }

  // Computed properties
  const getUserProgress = computed(() => userProgress.value)
  const getUserStats = computed(() => userProgress.value.stats)
  const getActivityData = computed(() => {
    // Transform daily activity for the contribution chart
    const activities = Object.values(userProgress.value.dailyActivity)
    return activities.reduce((acc, activity) => {
      acc[activity.date] = activity.timeSpent
      return acc
    }, {} as Record<string, number>)
  })

  // Cleanup on unmount
  onBeforeUnmount(() => {
    stopAutoSave()
  })

  // Additional computed properties
  const currentSession = computed(() => userProgress.value.currentSession)
  const chapters = computed(() => userProgress.value.chapters)
  const settings = computed(() => userProgress.value.settings)
  const isLoading = ref(false)
  const isSessionActive = computed(() => !!currentSession.value?.isActive)
  const isSessionPaused = ref(false)
  const sessionElapsed = computed(() => {
    if (!currentSession.value) return 0
    const startTime = new Date(currentSession.value.startTime).getTime()
    const now = new Date().getTime()
    return Math.floor((now - startTime) / 60000) // minutes
  })
  const sessionTimeLeft = computed(() => {
    if (!currentSession.value || currentSession.value.mode === SessionMode.ZEN) return 0
    return Math.max(0, currentSession.value.targetDuration - sessionElapsed.value)
  })
  
  // Progress-related computed properties
  const stats = computed(() => userProgress.value.stats)
  const currentStreak = computed(() => userProgress.value.stats.currentStreak)
  const totalChaptersCompleted = computed(() => userProgress.value.stats.totalChaptersCompleted)
  const totalReadingTime = computed(() => userProgress.value.stats.totalReadingTime)

  // Additional session methods
  const resumeSession = async () => {
    if (!currentSession.value) return
    isSessionPaused.value = false
    // Resume session logic
  }

  const pauseSession = async () => {
    if (!currentSession.value) return
    isSessionPaused.value = true
    // Pause session logic
  }

  const interruptSession = async () => {
    if (!currentSession.value) return
    userProgress.value.currentSession = null
    userProgress.value.updatedAt = new Date().toISOString()
  }

  const updateSessionProgress = (progress: { scrollPosition: number; readingProgress: number }) => {
    if (!currentSession.value) return
    currentSession.value.scrollPosition = progress.scrollPosition
    currentSession.value.readingProgress = progress.readingProgress
    userProgress.value.updatedAt = new Date().toISOString()
  }

  const updateChapterProgress = (chapterId: string, readingProgress: number) => {
    if (!userProgress.value.chapters[chapterId]) {
      userProgress.value.chapters[chapterId] = {
        id: chapterId,
        title: '',
        url: '',
        category: '',
        status: ChapterStatus.IN_PROGRESS,
        completionPercentage: 0,
        lastScrollPosition: 0,
        readingProgress: 0,
        estimatedWordCount: 0,
        estimatedReadingTime: 0,
        sessionsStarted: 0,
        sessionsCompleted: 0,
        totalTimeSpent: 0,
        timeSpent: 0,
        sessionsCount: 0,
        firstStarted: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        lastReadAt: new Date().toISOString(),
        completedAt: null,
        exercisesGenerated: false,
        exercisesCompleted: 0,
        exercisesTotal: 0,
        totalExercises: 0,
        bookmarks: [],
        notes: []
      }
    }
    
    const chapter = userProgress.value.chapters[chapterId]
    chapter.readingProgress = Math.max(chapter.readingProgress, readingProgress)
    chapter.lastReadAt = new Date().toISOString()
    
    if (readingProgress >= 100 && chapter.status !== ChapterStatus.COMPLETED) {
      chapter.status = ChapterStatus.COMPLETED
      chapter.completedAt = new Date().toISOString()
    }
    
    userProgress.value.updatedAt = new Date().toISOString()
  }

  const generateExercises = async (chapterId: string) => {
    // Mock exercise generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    if (!userProgress.value.chapters[chapterId]) return
    
    const chapter = userProgress.value.chapters[chapterId]
    chapter.totalExercises = 3
    chapter.exercisesCompleted = 0
    userProgress.value.updatedAt = new Date().toISOString()
  }

  const getDataSize = (): number => {
    // Calculate total size of stored data
    try {
      const userProgressSize = JSON.stringify(userProgress.value).length
      const exercisesSize = JSON.stringify(exercises.value).length
      const activitySize = JSON.stringify(activityData.value).length
      return userProgressSize + exercisesSize + activitySize
    } catch (error) {
      console.error('Error calculating data size:', error)
      return 0
    }
  }

  const getActivityChartData = (days: number = 30): Array<{date: string, value: number}> => {
    const chartData: Array<{date: string, value: number}> = []
    const now = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      // Get activity data for this date
      const activityForDate = userProgress.value.dailyActivity[dateStr]
      
      // Convert activity to a 0-4 scale for the chart
      let value = 0
      if (activityForDate) {
        const sessionsCompleted = activityForDate.sessionsCompleted
        const timeSpent = activityForDate.timeSpent
        
        // Simple activity level calculation
        if (sessionsCompleted > 0) {
          if (timeSpent >= 60) value = 4      // Very high (1+ hour)
          else if (timeSpent >= 30) value = 3  // High (30+ min)
          else if (timeSpent >= 15) value = 2  // Moderate (15+ min)
          else if (timeSpent >= 5) value = 1   // Light (5+ min)
        }
      }
      
      chartData.push({ date: dateStr, value })
    }
    
    return chartData
  }

  return {
    // State
    userProgress: readonly(userProgress),
    currentSession,
    chapters,
    settings,
    isLoading,
    isSessionActive,
    isSessionPaused,
    sessionElapsed,
    sessionTimeLeft,
    
    // Progress computed properties
    stats,
    currentStreak,
    totalChaptersCompleted,
    totalReadingTime,
    
    // Computed
    getUserProgress,
    getUserStats,
    getActivityData,
    
    // Methods
    initializeDataManager,
    startSession,
    updateSession,
    completeSession,
    resumeSession,
    pauseSession,
    interruptSession,
    updateSessionProgress,
    updateChapterProgress,
    generateExercises,
    getDataSize,
    getActivityChartData,
    updateSettings,
    updateStats,
    exportData,
    importData,
    clearAllData,
    
    // Lifecycle
    startAutoSave,
    stopAutoSave
  }
}