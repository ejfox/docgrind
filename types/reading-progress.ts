export interface ReadingPosition {
  /** Unique identifier for the document */
  documentId: string
  /** Current scroll position in pixels */
  scrollTop: number
  /** Total document height in pixels */
  documentHeight: number
  /** Current scroll percentage (0-100) */
  scrollPercentage: number
  /** Last updated timestamp */
  timestamp: number
  /** Current visible element ID */
  currentElementId?: string
  /** Current chapter or section */
  currentChapter?: string
  /** Reading session ID */
  sessionId: string
}

export interface ReadingSession {
  /** Session identifier */
  sessionId: string
  /** Document identifier */
  documentId: string
  /** Session start time */
  startTime: number
  /** Session end time */
  endTime?: number
  /** Total reading time in milliseconds */
  totalTime: number
  /** Words read during session */
  wordsRead: number
  /** Characters read during session */
  charactersRead: number
  /** Reading speed in words per minute */
  readingSpeed: number
  /** Session completion percentage */
  completionPercentage: number
}

export interface ReadingBookmark {
  /** Unique bookmark identifier */
  id: string
  /** Document identifier */
  documentId: string
  /** Bookmark title */
  title: string
  /** Bookmark description */
  description?: string
  /** Position data */
  position: ReadingPosition
  /** Creation timestamp */
  createdAt: number
  /** Last accessed timestamp */
  lastAccessed?: number
  /** Bookmark tags */
  tags?: string[]
  /** User notes */
  notes?: string
}

export interface ContentElement {
  /** Element identifier */
  id: string
  /** Element type */
  type: 'heading' | 'paragraph' | 'code' | 'image' | 'list' | 'table' | 'other'
  /** Element level (for headings) */
  level?: number
  /** Element text content */
  textContent: string
  /** Word count */
  wordCount: number
  /** Character count */
  characterCount: number
  /** Element position in document */
  offsetTop: number
  /** Element height */
  height: number
  /** Reading time estimate in milliseconds */
  estimatedReadingTime: number
  /** Whether element is currently visible */
  isVisible: boolean
  /** Percentage of element that's visible */
  visibilityPercentage: number
}

export interface ReadingProgress {
  /** Document identifier */
  documentId: string
  /** Overall progress percentage */
  progressPercentage: number
  /** Current reading position */
  currentPosition: ReadingPosition
  /** Reading sessions */
  sessions: ReadingSession[]
  /** Content elements */
  elements: ContentElement[]
  /** Bookmarks */
  bookmarks: ReadingBookmark[]
  /** Estimated total reading time */
  estimatedTotalTime: number
  /** Estimated remaining time */
  estimatedRemainingTime: number
  /** Average reading speed */
  averageReadingSpeed: number
  /** Total words in document */
  totalWords: number
  /** Words read so far */
  wordsRead: number
  /** Last updated timestamp */
  lastUpdated: number
}

export interface ReadingTrackerConfig {
  /** Document identifier */
  documentId: string
  /** Container element selector */
  containerSelector?: string
  /** Content element selectors */
  contentSelectors?: string[]
  /** Intersection observer threshold */
  intersectionThreshold?: number | number[]
  /** Intersection observer root margin */
  intersectionRootMargin?: string
  /** Debounce delay for scroll events */
  scrollDebounceDelay?: number
  /** Auto-save interval in milliseconds */
  autoSaveInterval?: number
  /** Enable time tracking */
  enableTimeTracking?: boolean
  /** Enable bookmark functionality */
  enableBookmarks?: boolean
  /** Average reading speed (words per minute) */
  averageReadingSpeed?: number
  /** Storage key prefix */
  storageKeyPrefix?: string
  /** Enable accessibility features */
  enableAccessibility?: boolean
  /** Debug mode */
  debug?: boolean
}

export interface ReadingTrackerCallbacks {
  /** Called when position changes */
  onPositionChange?: (position: ReadingPosition) => void
  /** Called when progress updates */
  onProgressUpdate?: (progress: ReadingProgress) => void
  /** Called when session starts */
  onSessionStart?: (session: ReadingSession) => void
  /** Called when session ends */
  onSessionEnd?: (session: ReadingSession) => void
  /** Called when bookmark is created */
  onBookmarkCreated?: (bookmark: ReadingBookmark) => void
  /** Called when bookmark is removed */
  onBookmarkRemoved?: (bookmarkId: string) => void
  /** Called when element becomes visible */
  onElementVisible?: (element: ContentElement) => void
  /** Called when element becomes hidden */
  onElementHidden?: (element: ContentElement) => void
  /** Called on errors */
  onError?: (error: Error) => void
}

export interface ReadingTrackerState {
  /** Whether tracking is active */
  isTracking: boolean
  /** Whether document is loaded */
  isLoaded: boolean
  /** Current reading session */
  currentSession: ReadingSession | null
  /** Current reading progress */
  progress: ReadingProgress | null
  /** Whether user is actively reading */
  isActivelyReading: boolean
  /** Last activity timestamp */
  lastActivity: number
  /** Visibility state */
  isVisible: boolean
  /** Focus state */
  isFocused: boolean
}

export interface StorageData {
  /** Reading progress data */
  progress: ReadingProgress
  /** Storage version */
  version: number
  /** Last saved timestamp */
  lastSaved: number
}

export interface ReadingAnalytics {
  /** Total reading time across all sessions */
  totalReadingTime: number
  /** Number of reading sessions */
  sessionCount: number
  /** Average session duration */
  averageSessionDuration: number
  /** Total words read */
  totalWordsRead: number
  /** Average reading speed */
  averageReadingSpeed: number
  /** Reading consistency (sessions per day) */
  readingConsistency: number
  /** Completion rate percentage */
  completionRate: number
  /** Most read content types */
  contentTypeDistribution: Record<string, number>
  /** Reading patterns by time of day */
  timeOfDayPatterns: Record<string, number>
}