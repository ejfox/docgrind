<template>
  <div class="reading-progress-example">
    <!-- Skip links for accessibility -->
    <div id="skip-links" class="sr-only">
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <a href="#reading-progress" class="skip-link">Skip to reading progress</a>
    </div>

    <!-- Reading Progress Header -->
    <header class="reading-header" id="reading-progress">
      <div class="progress-bar-container">
        <div 
          class="progress-bar" 
          :style="{ width: progressPercentage + '%' }"
          role="progressbar"
          :aria-valuenow="progressPercentage"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="`Reading progress: ${progressPercentage}% complete`"
        ></div>
      </div>
      
      <div class="reading-stats">
        <span class="stat">
          <strong>{{ Math.round(progressPercentage) }}%</strong> Complete
        </span>
        
        <span class="stat" v-if="estimatedTimeRemaining > 0">
          <strong>{{ formatTime(estimatedTimeRemaining) }}</strong> Remaining
        </span>
        
        <span class="stat" v-if="currentReadingSpeed > 0">
          <strong>{{ currentReadingSpeed }}</strong> WPM
        </span>
        
        <span class="stat">
          <strong>{{ wordsRead }}</strong> / {{ totalWords }} Words
        </span>
      </div>

      <div class="reading-controls">
        <button 
          @click="toggleTracking"
          :class="{ active: isReading }"
          :aria-label="isReading ? 'Pause reading tracking' : 'Start reading tracking'"
        >
          {{ isReading ? 'Pause' : 'Start' }} Tracking
        </button>
        
        <button 
          @click="showBookmarkDialog = true"
          :disabled="!canCreateBookmark"
          aria-label="Create bookmark at current position"
        >
          Add Bookmark
        </button>
        
        <button 
          @click="resumeReading"
          :disabled="!canResume"
          aria-label="Resume reading from last position"
        >
          Resume Reading
        </button>
        
        <button 
          @click="showProgressDialog = true"
          aria-label="Show detailed reading progress"
        >
          Progress Details
        </button>
      </div>
    </header>

    <!-- Error notifications -->
    <div v-if="error" class="error-notification" role="alert">
      <p>{{ errorMessage }}</p>
      <button @click="dismissError">Dismiss</button>
    </div>

    <!-- Main content -->
    <main id="main-content" class="main-content">
      <article class="reading-content">
        <h1>Sample Reading Content</h1>
        
        <p>This is a sample document to demonstrate the reading progress tracking system. The system will track your scroll position, reading time, and provide bookmark functionality.</p>
        
        <h2>Features</h2>
        
        <p>The reading progress system includes:</p>
        
        <ul>
          <li>Real-time position tracking using Intersection Observer</li>
          <li>Reading time and session duration tracking</li>
          <li>Automatic progress calculation</li>
          <li>Bookmark creation and management</li>
          <li>Resume capability from last position</li>
        </ul>
        
        <h2>Accessibility</h2>
        
        <p>The system includes comprehensive accessibility features:</p>
        
        <ul>
          <li>Screen reader announcements for progress milestones</li>
          <li>Keyboard navigation support</li>
          <li>Skip links for navigation</li>
          <li>ARIA labels and descriptions</li>
          <li>Focus management</li>
        </ul>
        
        <h2>Technical Implementation</h2>
        
        <p>The system is built using modern web technologies:</p>
        
        <pre><code>// Example usage
const { 
  startTracking, 
  stopTracking, 
  createBookmark,
  progressPercentage,
  estimatedTimeRemaining 
} = useReadingProgress({
  documentId: 'sample-document',
  enableTimeTracking: true,
  enableBookmarks: true,
  averageReadingSpeed: 200
})
</code></pre>
        
        <h2>Data Persistence</h2>
        
        <p>All reading progress data is automatically saved to localStorage with compression and includes:</p>
        
        <ul>
          <li>Reading sessions with timestamps</li>
          <li>Bookmark data with metadata</li>
          <li>Position information</li>
          <li>Reading analytics</li>
        </ul>
        
        <h2>Error Handling</h2>
        
        <p>The system includes comprehensive error handling for:</p>
        
        <ul>
          <li>Storage quota exceeded scenarios</li>
          <li>Network connectivity issues</li>
          <li>Observer API failures</li>
          <li>Browser compatibility issues</li>
        </ul>
        
        <h2>Performance Optimization</h2>
        
        <p>The system is optimized for performance with:</p>
        
        <ul>
          <li>Debounced scroll tracking</li>
          <li>Efficient intersection observers</li>
          <li>Minimal DOM manipulation</li>
          <li>Compressed data storage</li>
        </ul>
        
        <p>Continue reading to see more features in action...</p>
        
        <!-- Add more content to demonstrate scrolling -->
        <div v-for="i in 10" :key="i" class="content-section">
          <h3>Section {{ i }}</h3>
          <p>This is section {{ i }} of the sample content. It contains multiple paragraphs to demonstrate the reading progress tracking capabilities.</p>
          <p>The system tracks your position as you scroll through the content, calculating reading time and providing accurate progress indicators.</p>
          <p>Each section contributes to the overall reading progress calculation, taking into account word count, content type, and reading speed.</p>
        </div>
      </article>
    </main>

    <!-- Bookmark Dialog -->
    <dialog 
      v-if="showBookmarkDialog"
      open
      class="bookmark-dialog"
      aria-labelledby="bookmark-dialog-title"
    >
      <h2 id="bookmark-dialog-title">Create Bookmark</h2>
      
      <form @submit.prevent="createBookmark">
        <div class="form-group">
          <label for="bookmark-title">Title</label>
          <input 
            id="bookmark-title"
            v-model="newBookmark.title"
            type="text"
            required
            placeholder="Enter bookmark title"
          >
        </div>
        
        <div class="form-group">
          <label for="bookmark-description">Description (optional)</label>
          <textarea 
            id="bookmark-description"
            v-model="newBookmark.description"
            placeholder="Enter bookmark description"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="bookmark-tags">Tags (comma-separated)</label>
          <input 
            id="bookmark-tags"
            v-model="newBookmark.tags"
            type="text"
            placeholder="important, reference, note"
          >
        </div>
        
        <div class="form-actions">
          <button type="submit">Create Bookmark</button>
          <button type="button" @click="showBookmarkDialog = false">Cancel</button>
        </div>
      </form>
    </dialog>

    <!-- Progress Dialog -->
    <dialog 
      v-if="showProgressDialog"
      open
      class="progress-dialog"
      aria-labelledby="progress-dialog-title"
    >
      <h2 id="progress-dialog-title">Reading Progress</h2>
      
      <div class="progress-details">
        <div class="progress-section">
          <h3>Current Session</h3>
          <p v-if="state.currentSession">
            Started: {{ formatDate(state.currentSession.startTime) }}<br>
            Words read: {{ state.currentSession.wordsRead }}<br>
            Reading speed: {{ state.currentSession.readingSpeed }} WPM
          </p>
          <p v-else>No active session</p>
        </div>
        
        <div class="progress-section">
          <h3>Overall Progress</h3>
          <p>
            Total words: {{ totalWords }}<br>
            Words read: {{ wordsRead }}<br>
            Progress: {{ Math.round(progressPercentage) }}%<br>
            Estimated total time: {{ formatTime(estimatedTotalTime) }}
          </p>
        </div>
        
        <div class="progress-section">
          <h3>Bookmarks</h3>
          <div v-if="bookmarks.length > 0" class="bookmarks-list">
            <div 
              v-for="bookmark in bookmarks" 
              :key="bookmark.id"
              class="bookmark-item"
              @click="jumpToBookmark(bookmark.id)"
            >
              <h4>{{ bookmark.title }}</h4>
              <p>{{ Math.round(bookmark.position.scrollPercentage) }}% - {{ formatDate(bookmark.createdAt) }}</p>
            </div>
          </div>
          <p v-else>No bookmarks yet</p>
        </div>
        
        <div class="progress-section" v-if="analytics">
          <h3>Analytics</h3>
          <p>
            Total reading time: {{ formatTime(analytics.totalReadingTime) }}<br>
            Sessions: {{ analytics.sessionCount }}<br>
            Average speed: {{ Math.round(analytics.averageReadingSpeed) }} WPM<br>
            Completion rate: {{ Math.round(analytics.completionRate) }}%
          </p>
        </div>
      </div>
      
      <div class="dialog-actions">
        <button @click="exportData">Export Data</button>
        <button @click="resetProgress">Reset Progress</button>
        <button @click="showProgressDialog = false">Close</button>
      </div>
    </dialog>

    <!-- Floating bookmark indicators -->
    <div class="bookmark-indicators">
      <div 
        v-for="bookmark in bookmarks" 
        :key="bookmark.id"
        class="bookmark-indicator"
        :style="{ top: bookmark.position.scrollPercentage + '%' }"
        :title="bookmark.title"
        @click="jumpToBookmark(bookmark.id)"
      >
        📍
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useReadingProgress } from '~/composables/useReadingProgress'

// Reading progress composable
const {
  state,
  progressPercentage,
  estimatedTimeRemaining,
  estimatedTotalTime,
  currentReadingSpeed,
  isReading,
  canResume,
  wordsRead,
  totalWords,
  bookmarks,
  analytics,
  error,
  startTracking,
  stopTracking,
  resumeReading,
  jumpToBookmark,
  createBookmark: createBookmarkAction,
  deleteBookmark,
  exportData: exportDataAction,
  resetProgress: resetProgressAction
} = useReadingProgress({
  documentId: 'sample-document',
  enableTimeTracking: true,
  enableBookmarks: true,
  averageReadingSpeed: 200,
  enableAccessibility: true,
  debug: true
})

// UI state
const showBookmarkDialog = ref(false)
const showProgressDialog = ref(false)
const newBookmark = ref({
  title: '',
  description: '',
  tags: ''
})

// Computed properties
const canCreateBookmark = computed(() => progressPercentage.value > 0)
const errorMessage = computed(() => error.value?.message || 'An error occurred')

// Methods
const toggleTracking = () => {
  if (isReading.value) {
    stopTracking()
  } else {
    startTracking()
  }
}

const createBookmark = () => {
  if (!newBookmark.value.title) return
  
  const tags = newBookmark.value.tags 
    ? newBookmark.value.tags.split(',').map(t => t.trim())
    : undefined
  
  createBookmarkAction(
    newBookmark.value.title,
    newBookmark.value.description || undefined,
    tags
  )
  
  // Reset form
  newBookmark.value = {
    title: '',
    description: '',
    tags: ''
  }
  showBookmarkDialog.value = false
}

const exportData = async () => {
  try {
    const data = await exportDataAction()
    if (data) {
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'reading-progress-data.json'
      a.click()
      URL.revokeObjectURL(url)
    }
  } catch (err) {
    console.error('Failed to export data:', err)
  }
}

const resetProgress = async () => {
  if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
    await resetProgressAction()
    showProgressDialog.value = false
  }
}

const dismissError = () => {
  error.value = null
}

// Utility functions
const formatTime = (ms: number): string => {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
}

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString()
}

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  if (event.altKey) {
    switch (event.key) {
      case 'p':
        event.preventDefault()
        showProgressDialog.value = !showProgressDialog.value
        break
      case 'b':
        event.preventDefault()
        if (canCreateBookmark.value) {
          showBookmarkDialog.value = true
        }
        break
      case 'r':
        event.preventDefault()
        if (canResume.value) {
          resumeReading()
        }
        break
      case ' ':
        event.preventDefault()
        toggleTracking()
        break
    }
  }
}

// Lifecycle
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  
  // Auto-start tracking after a short delay
  setTimeout(() => {
    startTracking()
  }, 1000)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.reading-progress-example {
  max-width: 800px;
  margin: 0 auto;
  font-family: system-ui, -apple-system, sans-serif;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}

.reading-header {
  position: sticky;
  top: 0;
  background: white;
  border-bottom: 1px solid #e5e5e5;
  padding: 16px;
  z-index: 100;
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background: #e5e5e5;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
}

.progress-bar {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s ease;
}

.reading-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 14px;
}

.reading-controls {
  display: flex;
  gap: 8px;
}

.reading-controls button {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.reading-controls button:hover {
  background: #f9fafb;
}

.reading-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reading-controls button.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.error-notification {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  padding: 16px;
  margin: 16px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.main-content {
  padding: 24px;
}

.reading-content {
  line-height: 1.6;
}

.reading-content h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.reading-content h2 {
  font-size: 2rem;
  margin: 2rem 0 1rem;
}

.reading-content h3 {
  font-size: 1.5rem;
  margin: 1.5rem 0 0.5rem;
}

.reading-content p {
  margin-bottom: 1rem;
}

.reading-content ul {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.reading-content pre {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 1rem 0;
}

.content-section {
  margin: 2rem 0;
  padding: 1rem;
  border-left: 4px solid #e5e5e5;
}

.bookmark-dialog,
.progress-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 24px;
  min-width: 400px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 1000;
}

.bookmark-dialog::backdrop,
.progress-dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

.form-group textarea {
  height: 80px;
  resize: vertical;
}

.form-actions,
.dialog-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
}

.progress-details {
  display: grid;
  gap: 24px;
}

.progress-section h3 {
  margin-bottom: 8px;
}

.bookmarks-list {
  display: grid;
  gap: 8px;
}

.bookmark-item {
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.bookmark-item:hover {
  background: #f9fafb;
}

.bookmark-item h4 {
  margin: 0 0 4px;
  font-size: 14px;
}

.bookmark-item p {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.bookmark-indicators {
  position: fixed;
  right: 16px;
  top: 0;
  bottom: 0;
  width: 20px;
  pointer-events: none;
}

.bookmark-indicator {
  position: absolute;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 50%;
  cursor: pointer;
  pointer-events: auto;
  font-size: 12px;
  transform: translateY(-50%);
}

.bookmark-indicator:hover {
  background: #f9fafb;
}

@media (max-width: 768px) {
  .reading-stats {
    flex-direction: column;
    gap: 8px;
  }
  
  .reading-controls {
    flex-wrap: wrap;
  }
  
  .bookmark-dialog,
  .progress-dialog {
    min-width: 300px;
    margin: 16px;
  }
}
</style>