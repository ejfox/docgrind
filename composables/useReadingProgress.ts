import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { 
  ReadingProgress, 
  ReadingPosition, 
  ReadingSession, 
  ReadingBookmark,
  ReadingTrackerConfig,
  ReadingTrackerState,
  ContentElement,
  ReadingAnalytics
} from '~/types/reading-progress'
import { PositionTracker } from '~/utils/position-tracker'
import { ReadingProgressCalculator } from '~/utils/reading-progress-calculator'
import { StorageManager } from '~/utils/storage-manager'
import { BookmarkManager } from '~/utils/bookmark-manager'

interface UseReadingProgressOptions extends ReadingTrackerConfig {
  /** Auto-save interval in milliseconds */
  autoSaveInterval?: number
  /** Auto-resume on mount */
  autoResume?: boolean
  /** Enable visibility tracking */
  enableVisibilityTracking?: boolean
  /** Enable focus tracking */
  enableFocusTracking?: boolean
  /** Minimum reading time to consider as active */
  minActiveTime?: number
}

export function useReadingProgress(options: UseReadingProgressOptions) {
  // Configuration
  const config = ref<Required<UseReadingProgressOptions>>({
    documentId: options.documentId,
    containerSelector: options.containerSelector || 'body',
    contentSelectors: options.contentSelectors || [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'div', 'section', 'article',
      'pre', 'code', 'blockquote',
      'ul', 'ol', 'li', 'table'
    ],
    intersectionThreshold: options.intersectionThreshold || [0, 0.1, 0.25, 0.5, 0.75, 1],
    intersectionRootMargin: options.intersectionRootMargin || '0px',
    scrollDebounceDelay: options.scrollDebounceDelay || 100,
    autoSaveInterval: options.autoSaveInterval || 5000,
    enableTimeTracking: options.enableTimeTracking ?? true,
    enableBookmarks: options.enableBookmarks ?? true,
    averageReadingSpeed: options.averageReadingSpeed || 200,
    storageKeyPrefix: options.storageKeyPrefix || 'reading-progress',
    enableAccessibility: options.enableAccessibility ?? true,
    debug: options.debug ?? false,
    autoResume: options.autoResume ?? true,
    enableVisibilityTracking: options.enableVisibilityTracking ?? true,
    enableFocusTracking: options.enableFocusTracking ?? true,
    minActiveTime: options.minActiveTime || 3000
  })

  // State
  const state = ref<ReadingTrackerState>({
    isTracking: false,
    isLoaded: false,
    currentSession: null,
    progress: null,
    isActivelyReading: false,
    lastActivity: 0,
    isVisible: true,
    isFocused: true
  })

  // Reactive data
  const currentPosition = ref<ReadingPosition | null>(null)
  const elements = ref<ContentElement[]>([])
  const visibleElements = ref<ContentElement[]>([])
  const bookmarks = ref<ReadingBookmark[]>([])
  const sessions = ref<ReadingSession[]>([])
  const analytics = ref<ReadingAnalytics | null>(null)
  const error = ref<Error | null>(null)

  // Computed properties
  const progressPercentage = computed(() => state.value.progress?.progressPercentage || 0)
  const estimatedTimeRemaining = computed(() => state.value.progress?.estimatedRemainingTime || 0)
  const estimatedTotalTime = computed(() => state.value.progress?.estimatedTotalTime || 0)
  const currentReadingSpeed = computed(() => state.value.currentSession?.readingSpeed || 0)
  const isReading = computed(() => state.value.isTracking && state.value.isActivelyReading)
  const canResume = computed(() => currentPosition.value !== null)
  const wordsRead = computed(() => state.value.progress?.wordsRead || 0)
  const totalWords = computed(() => state.value.progress?.totalWords || 0)

  // Managers
  let positionTracker: PositionTracker | null = null
  let progressCalculator: ReadingProgressCalculator | null = null
  let storageManager: StorageManager | null = null
  let bookmarkManager: BookmarkManager | null = null

  // Timers
  let autoSaveTimer: number | null = null
  let activityTimer: number | null = null

  // Initialize managers
  const initializeManagers = () => {
    try {
      // Storage manager
      storageManager = new StorageManager(
        config.value.storageKeyPrefix,
        5 * 1024 * 1024, // 5MB
        true, // compression
        config.value.debug
      )

      // Progress calculator
      progressCalculator = new ReadingProgressCalculator(
        config.value.documentId,
        config.value.averageReadingSpeed
      )

      // Bookmark manager
      bookmarkManager = new BookmarkManager(
        config.value.documentId,
        (updatedBookmarks) => {
          bookmarks.value = updatedBookmarks
          saveProgress()
        },
        config.value.debug
      )

      // Position tracker
      positionTracker = new PositionTracker(config.value, {
        onPositionChange: handlePositionChange,
        onElementVisible: handleElementVisible,
        onElementHidden: handleElementHidden,
        onError: handleError
      })

      state.value.isLoaded = true
    } catch (err) {
      handleError(err as Error)
    }
  }

  // Event handlers
  const handlePositionChange = (position: ReadingPosition) => {
    currentPosition.value = position
    
    if (progressCalculator && positionTracker) {
      const allElements = positionTracker.getElements()
      const visible = positionTracker.getVisibleElements()
      
      elements.value = allElements
      visibleElements.value = visible
      
      // Update activity tracking
      progressCalculator.updateActivity(visible)
      
      // Update progress
      const progress = progressCalculator.updateProgress(allElements, position)
      state.value.progress = progress
      
      // Update analytics
      analytics.value = progressCalculator.getAnalytics()
      
      // Update activity state
      updateActivityState()
    }
  }

  const handleElementVisible = (element: ContentElement) => {
    if (config.value.debug) {
      console.log('Element visible:', element.id, element.type)
    }
    
    // Create auto-bookmark if conditions are met
    if (bookmarkManager && currentPosition.value) {
      const autoBookmark = bookmarkManager.createAutoBookmark(
        currentPosition.value,
        element,
        Date.now() - state.value.lastActivity
      )
      
      if (autoBookmark) {
        bookmarks.value = bookmarkManager.getAllBookmarks()
      }
    }
  }

  const handleElementHidden = (element: ContentElement) => {
    if (config.value.debug) {
      console.log('Element hidden:', element.id, element.type)
    }
  }

  const handleError = (err: Error) => {
    console.error('Reading progress error:', err)
    error.value = err
  }

  // Activity tracking
  const updateActivityState = () => {
    const now = Date.now()
    const timeSinceActivity = now - state.value.lastActivity
    
    state.value.isActivelyReading = 
      state.value.isTracking && 
      state.value.isVisible && 
      state.value.isFocused &&
      timeSinceActivity < config.value.minActiveTime
    
    state.value.lastActivity = now
  }

  const setupActivityTracking = () => {
    if (typeof window === 'undefined') return

    const updateActivity = () => {
      state.value.lastActivity = Date.now()
      updateActivityState()
    }

    // Mouse and keyboard activity
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart']
    events.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true })
    })

    // Visibility tracking
    if (config.value.enableVisibilityTracking) {
      const handleVisibilityChange = () => {
        state.value.isVisible = !document.hidden
        updateActivityState()
      }
      
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }

    // Focus tracking
    if (config.value.enableFocusTracking) {
      const handleFocusChange = (focused: boolean) => {
        state.value.isFocused = focused
        updateActivityState()
      }
      
      window.addEventListener('focus', () => handleFocusChange(true))
      window.addEventListener('blur', () => handleFocusChange(false))
    }

    // Cleanup function
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity)
      })
      
      if (config.value.enableVisibilityTracking) {
        document.removeEventListener('visibilitychange', () => {})
      }
      
      if (config.value.enableFocusTracking) {
        window.removeEventListener('focus', () => {})
        window.removeEventListener('blur', () => {})
      }
    }
  }

  // Auto-save functionality
  const setupAutoSave = () => {
    if (config.value.autoSaveInterval > 0) {
      autoSaveTimer = window.setInterval(() => {
        saveProgress()
      }, config.value.autoSaveInterval)
    }
  }

  const clearAutoSave = () => {
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer)
      autoSaveTimer = null
    }
  }

  // Storage operations
  const saveProgress = async () => {
    if (!storageManager || !state.value.progress) return false

    try {
      // Update progress with current bookmarks
      const updatedProgress = {
        ...state.value.progress,
        bookmarks: bookmarks.value,
        sessions: sessions.value
      }

      const success = await storageManager.saveProgress(updatedProgress)
      
      if (success) {
        await storageManager.savePosition(currentPosition.value!)
        await storageManager.saveSessions(config.value.documentId, sessions.value)
        await storageManager.saveBookmarks(config.value.documentId, bookmarks.value)
      }

      return success
    } catch (err) {
      handleError(err as Error)
      return false
    }
  }

  const loadProgress = async () => {
    if (!storageManager) return false

    try {
      const progress = await storageManager.loadProgress(config.value.documentId)
      const position = await storageManager.loadPosition(config.value.documentId)
      const savedSessions = await storageManager.loadSessions(config.value.documentId)
      const savedBookmarks = await storageManager.loadBookmarks(config.value.documentId)

      if (progress) {
        state.value.progress = progress
        
        if (progressCalculator) {
          // Load sessions into calculator
          savedSessions.forEach(session => {
            progressCalculator!.getAllSessions().push(session)
          })
        }
      }

      if (position) {
        currentPosition.value = position
      }

      if (savedSessions.length > 0) {
        sessions.value = savedSessions
      }

      if (savedBookmarks.length > 0) {
        bookmarks.value = savedBookmarks
        if (bookmarkManager) {
          bookmarkManager.loadBookmarks(savedBookmarks)
        }
      }

      return true
    } catch (err) {
      handleError(err as Error)
      return false
    }
  }

  // Public API
  const startTracking = async () => {
    if (state.value.isTracking) return

    try {
      state.value.isTracking = true
      
      if (progressCalculator) {
        const session = progressCalculator.startSession()
        state.value.currentSession = session
        sessions.value.push(session)
      }

      updateActivityState()
      setupAutoSave()
      
      if (config.value.debug) {
        console.log('Reading tracking started')
      }
    } catch (err) {
      handleError(err as Error)
    }
  }

  const stopTracking = async () => {
    if (!state.value.isTracking) return

    try {
      state.value.isTracking = false
      
      if (progressCalculator) {
        const completedSession = progressCalculator.endSession()
        if (completedSession) {
          state.value.currentSession = null
          
          // Update sessions array
          const sessionIndex = sessions.value.findIndex(s => s.sessionId === completedSession.sessionId)
          if (sessionIndex !== -1) {
            sessions.value[sessionIndex] = completedSession
          }
        }
      }

      await saveProgress()
      clearAutoSave()
      
      if (config.value.debug) {
        console.log('Reading tracking stopped')
      }
    } catch (err) {
      handleError(err as Error)
    }
  }

  const pauseTracking = () => {
    if (progressCalculator) {
      progressCalculator.pauseTracking()
    }
    state.value.isActivelyReading = false
  }

  const resumeTracking = () => {
    if (progressCalculator) {
      progressCalculator.resumeTracking()
    }
    updateActivityState()
  }

  const resumeReading = () => {
    if (currentPosition.value && positionTracker) {
      positionTracker.scrollToPosition(currentPosition.value)
      startTracking()
    }
  }

  const jumpToPosition = (position: ReadingPosition) => {
    if (positionTracker) {
      positionTracker.scrollToPosition(position)
    }
  }

  const jumpToElement = (elementId: string) => {
    if (positionTracker) {
      positionTracker.scrollToElement(elementId)
    }
  }

  const jumpToBookmark = (bookmarkId: string) => {
    if (bookmarkManager) {
      const bookmark = bookmarkManager.accessBookmark(bookmarkId)
      if (bookmark) {
        jumpToPosition(bookmark.position)
      }
    }
  }

  const createBookmark = (title: string, description?: string, tags?: string[]) => {
    if (bookmarkManager && currentPosition.value) {
      const element = visibleElements.value.find(el => el.id === currentPosition.value?.currentElementId)
      const bookmark = bookmarkManager.createBookmark(
        currentPosition.value,
        title,
        description,
        tags
      )
      bookmarks.value = bookmarkManager.getAllBookmarks()
      return bookmark
    }
    return null
  }

  const deleteBookmark = (bookmarkId: string) => {
    if (bookmarkManager) {
      const success = bookmarkManager.deleteBookmark(bookmarkId)
      if (success) {
        bookmarks.value = bookmarkManager.getAllBookmarks()
      }
      return success
    }
    return false
  }

  const exportData = async () => {
    if (!storageManager) return null
    return await storageManager.exportData()
  }

  const importData = async (jsonData: string) => {
    if (!storageManager) return false
    const success = await storageManager.importData(jsonData)
    if (success) {
      await loadProgress()
    }
    return success
  }

  const resetProgress = async () => {
    if (progressCalculator) {
      progressCalculator.reset()
    }
    
    if (bookmarkManager) {
      bookmarkManager.clearAllBookmarks()
    }
    
    if (storageManager) {
      await storageManager.clearDocument(config.value.documentId)
    }

    // Reset state
    state.value.progress = null
    state.value.currentSession = null
    currentPosition.value = null
    bookmarks.value = []
    sessions.value = []
    analytics.value = null
    error.value = null
  }

  // Lifecycle
  onMounted(async () => {
    await nextTick()
    initializeManagers()
    
    const activityCleanup = setupActivityTracking()
    
    // Load existing progress
    await loadProgress()
    
    // Auto-resume if enabled
    if (config.value.autoResume && currentPosition.value) {
      await startTracking()
    }

    // Store cleanup function
    onUnmounted(() => {
      stopTracking()
      activityCleanup?.()
      clearAutoSave()
      
      if (positionTracker) {
        positionTracker.destroy()
      }
    })
  })

  // Watch for configuration changes
  watch(() => config.value, (newConfig) => {
    if (config.value.debug) {
      console.log('Configuration updated:', newConfig)
    }
  }, { deep: true })

  return {
    // State
    state: readonly(state),
    currentPosition: readonly(currentPosition),
    elements: readonly(elements),
    visibleElements: readonly(visibleElements),
    bookmarks: readonly(bookmarks),
    sessions: readonly(sessions),
    analytics: readonly(analytics),
    error: readonly(error),
    
    // Computed
    progressPercentage,
    estimatedTimeRemaining,
    estimatedTotalTime,
    currentReadingSpeed,
    isReading,
    canResume,
    wordsRead,
    totalWords,
    
    // Methods
    startTracking,
    stopTracking,
    pauseTracking,
    resumeTracking,
    resumeReading,
    jumpToPosition,
    jumpToElement,
    jumpToBookmark,
    createBookmark,
    deleteBookmark,
    saveProgress,
    loadProgress,
    exportData,
    importData,
    resetProgress,
    
    // Configuration
    config: readonly(config)
  }
}