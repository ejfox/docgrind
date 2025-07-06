# Reading Progress Tracking System

A sophisticated, standalone reading progress tracking system built with TypeScript and Vue 3. This system provides comprehensive position tracking, reading analytics, bookmark management, and accessibility features for documents and articles.

## Features

### Core Functionality
- **Real-time Position Tracking**: Uses Intersection Observer for accurate scroll position and element visibility tracking
- **Reading Time Calculation**: Tracks reading sessions, duration, and calculates reading speed
- **Progress Analytics**: Detailed progress percentage with chapter completion tracking
- **Bookmark System**: Create, manage, and navigate bookmarks with metadata
- **Resume Capability**: Automatically save and restore reading position
- **Data Persistence**: All data stored in localStorage with compression and versioning

### Advanced Features
- **Reading Speed Estimation**: Calculates reading speed based on content type and user behavior
- **Completion Time Prediction**: Estimates remaining reading time based on current progress
- **Content Analysis**: Analyzes different content types (headings, code blocks, images, etc.)
- **Session Management**: Tracks multiple reading sessions with detailed analytics
- **Auto-bookmarking**: Creates automatic bookmarks at milestones and long reading sessions

### Accessibility
- **Screen Reader Support**: Comprehensive ARIA labels and live announcements
- **Keyboard Navigation**: Full keyboard accessibility with customizable shortcuts
- **Skip Links**: Navigation shortcuts for screen reader users
- **Focus Management**: Proper focus handling and restoration
- **Reduced Motion**: Respects user preferences for reduced motion

### Performance & Reliability
- **Error Handling**: Comprehensive error handling with retry mechanisms
- **Performance Optimization**: Debounced scroll events and efficient observer usage
- **Storage Management**: Intelligent storage cleanup and quota management
- **Browser Compatibility**: Graceful fallbacks for unsupported features

## Installation

Simply copy the files to your project and import the composable:

```typescript
import { useReadingProgress } from '~/composables/useReadingProgress'
```

## Quick Start

```vue
<template>
  <div>
    <!-- Progress bar -->
    <div class="progress-bar" :style="{ width: progressPercentage + '%' }"></div>
    
    <!-- Reading controls -->
    <button @click="startTracking">Start Reading</button>
    <button @click="createBookmark('Chapter 1')">Bookmark</button>
    <button @click="resumeReading" :disabled="!canResume">Resume</button>
    
    <!-- Your content -->
    <article>
      <h1>Your Article Title</h1>
      <p>Your article content...</p>
    </article>
  </div>
</template>

<script setup>
import { useReadingProgress } from '~/composables/useReadingProgress'

const {
  progressPercentage,
  startTracking,
  createBookmark,
  resumeReading,
  canResume
} = useReadingProgress({
  documentId: 'my-article',
  enableTimeTracking: true,
  enableBookmarks: true
})
</script>
```

## API Reference

### useReadingProgress(options)

The main composable that provides all reading progress functionality.

#### Options

```typescript
interface UseReadingProgressOptions {
  documentId: string                    // Unique identifier for the document
  containerSelector?: string            // Container element selector (default: 'body')
  contentSelectors?: string[]           // Content elements to track
  intersectionThreshold?: number[]      // Intersection observer threshold
  intersectionRootMargin?: string       // Intersection observer root margin
  scrollDebounceDelay?: number          // Debounce delay for scroll events
  autoSaveInterval?: number             // Auto-save interval in milliseconds
  enableTimeTracking?: boolean          // Enable time tracking
  enableBookmarks?: boolean             // Enable bookmark functionality
  averageReadingSpeed?: number          // Average reading speed in WPM
  storageKeyPrefix?: string             // Storage key prefix
  enableAccessibility?: boolean         // Enable accessibility features
  debug?: boolean                       // Enable debug mode
  autoResume?: boolean                  // Auto-resume on mount
  enableVisibilityTracking?: boolean    // Track page visibility
  enableFocusTracking?: boolean         // Track window focus
  minActiveTime?: number                // Minimum time to consider as active reading
}
```

#### Returns

```typescript
interface UseReadingProgressReturn {
  // State
  state: ReadingTrackerState
  currentPosition: ReadingPosition
  elements: ContentElement[]
  visibleElements: ContentElement[]
  bookmarks: ReadingBookmark[]
  sessions: ReadingSession[]
  analytics: ReadingAnalytics
  error: Error | null
  
  // Computed Properties
  progressPercentage: number
  estimatedTimeRemaining: number
  estimatedTotalTime: number
  currentReadingSpeed: number
  isReading: boolean
  canResume: boolean
  wordsRead: number
  totalWords: number
  
  // Methods
  startTracking(): void
  stopTracking(): void
  pauseTracking(): void
  resumeTracking(): void
  resumeReading(): void
  jumpToPosition(position: ReadingPosition): void
  jumpToElement(elementId: string): void
  jumpToBookmark(bookmarkId: string): void
  createBookmark(title: string, description?: string, tags?: string[]): ReadingBookmark | null
  deleteBookmark(bookmarkId: string): boolean
  saveProgress(): Promise<boolean>
  loadProgress(): Promise<boolean>
  exportData(): Promise<string | null>
  importData(jsonData: string): Promise<boolean>
  resetProgress(): Promise<void>
}
```

## Core Classes

### PositionTracker

Handles real-time position tracking using Intersection Observer.

```typescript
const tracker = new PositionTracker({
  documentId: 'my-doc',
  containerSelector: 'main',
  contentSelectors: ['h1', 'h2', 'h3', 'p']
}, {
  onPositionChange: (position) => console.log('Position changed:', position),
  onElementVisible: (element) => console.log('Element visible:', element)
})
```

### ReadingProgressCalculator

Calculates reading progress, time estimates, and analytics.

```typescript
const calculator = new ReadingProgressCalculator('my-doc', 200)
const session = calculator.startSession()
calculator.updateActivity(visibleElements)
const progress = calculator.updateProgress(elements, position)
```

### BookmarkManager

Manages bookmarks with full CRUD operations.

```typescript
const bookmarkManager = new BookmarkManager('my-doc')
const bookmark = bookmarkManager.createBookmark(position, 'Chapter 1', 'Important section')
const bookmarks = bookmarkManager.getAllBookmarks()
```

### StorageManager

Handles data persistence with compression and versioning.

```typescript
const storage = new StorageManager('reading-progress')
await storage.saveProgress(progress)
const savedProgress = await storage.loadProgress('my-doc')
```

## Content Types

The system recognizes and handles different content types:

- **Headings** (`h1-h6`): Faster reading speed, used for chapter detection
- **Paragraphs** (`p`): Standard reading speed
- **Code Blocks** (`pre`, `code`): Slower reading speed
- **Images** (`img`): Time-based processing
- **Lists** (`ul`, `ol`, `li`): Slightly faster reading speed
- **Tables** (`table`): Slower reading speed for data processing

## Accessibility Features

### Keyboard Shortcuts (with Alt key)
- `Alt + P`: Show progress dialog
- `Alt + B`: Create bookmark
- `Alt + N`: Next chapter
- `Alt + M`: Previous chapter
- `Alt + R`: Resume reading
- `Alt + H`: Show keyboard shortcuts
- `Space`: Toggle tracking
- `Escape`: Close dialogs

### Screen Reader Support
- Progress announcements at 25%, 50%, 75%, and 100%
- Chapter change announcements
- Bookmark creation confirmations
- Reading time estimates
- Comprehensive ARIA labels

### Skip Links
- Skip to main content
- Skip to reading progress
- Skip to bookmarks
- Skip to chapter navigation

## Error Handling

The system includes comprehensive error handling:

```typescript
// Wrap operations with error handling
const { handleError, withErrorHandling } = useErrorHandler()

// Async operations with retry
const data = await withErrorHandling(
  () => fetchData(),
  'Data fetching operation'
)

// Storage operations with quota handling
const success = await withStorageErrorHandling(
  () => storage.saveProgress(progress),
  'Save progress operation'
)
```

## Performance Considerations

### Optimization Features
- **Debounced Scroll Events**: Prevents excessive position updates
- **Intersection Observer**: Efficient element visibility tracking
- **Compressed Storage**: Reduces localStorage usage
- **Memory Management**: Automatic cleanup of old data
- **Lazy Loading**: Content analysis performed on-demand

### Storage Management
- Automatic cleanup when approaching storage limits
- Data compression to maximize storage efficiency
- Version migration for backward compatibility
- Export/import functionality for data portability

## Browser Compatibility

- **Modern Browsers**: Full feature support
- **Intersection Observer**: Required for position tracking
- **localStorage**: Required for data persistence
- **Graceful Degradation**: Fallbacks for unsupported features

## Examples

### Basic Usage
```vue
<script setup>
const { progressPercentage, startTracking } = useReadingProgress({
  documentId: 'article-1'
})

onMounted(() => {
  startTracking()
})
</script>
```

### With Bookmarks
```vue
<script setup>
const { 
  bookmarks, 
  createBookmark, 
  jumpToBookmark 
} = useReadingProgress({
  documentId: 'article-1',
  enableBookmarks: true
})

const addBookmark = () => {
  createBookmark('Important Point', 'This section explains the key concept')
}
</script>
```

### With Analytics
```vue
<script setup>
const { 
  analytics, 
  currentReadingSpeed, 
  estimatedTimeRemaining 
} = useReadingProgress({
  documentId: 'article-1',
  enableTimeTracking: true
})

watch(analytics, (newAnalytics) => {
  console.log('Reading speed:', newAnalytics.averageReadingSpeed)
  console.log('Session count:', newAnalytics.sessionCount)
})
</script>
```

## Data Export/Import

Export reading data:
```typescript
const exportData = async () => {
  const data = await exportData()
  // Save to file or send to server
}
```

Import reading data:
```typescript
const importData = async (jsonData: string) => {
  const success = await importData(jsonData)
  if (success) {
    console.log('Data imported successfully')
  }
}
```

## Contributing

The system is designed to be modular and extensible. Key areas for contribution:

1. **New Content Types**: Add support for specialized content
2. **Reading Speed Algorithms**: Improve speed calculation accuracy
3. **Accessibility Features**: Enhance screen reader support
4. **Performance Optimizations**: Reduce memory usage and improve efficiency
5. **Analytics**: Add new metrics and insights

## License

This system is provided as-is for educational and development purposes. Please ensure compliance with your project's licensing requirements.

## Support

For issues, questions, or contributions, please refer to the project documentation or create an issue in the project repository.