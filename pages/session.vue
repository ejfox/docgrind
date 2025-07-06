<template>
  <div class="session-page">
    <!-- Page header -->
    <div class="page-header">
      <h1 class="page-title">Start Reading Session</h1>
      <p class="page-description">
        Choose a chapter and session mode to begin your focused reading practice.
      </p>
    </div>

    <!-- Current session warning -->
    <div v-if="currentSession" class="current-session-warning" role="alert">
      <div class="warning-content">
        <span class="warning-icon">⚠️</span>
        <div class="warning-text">
          <h3>Active Session Detected</h3>
          <p>
            You have an active {{ getSessionModeLabel(currentSession.mode) }} session for 
            <strong>{{ getChapterTitle(currentSession.chapterId) }}</strong>
          </p>
        </div>
      </div>
      <div class="warning-actions">
        <button 
          @click="resumeCurrentSession" 
          class="button button--primary"
          :disabled="isLoading"
        >
          Resume Session
        </button>
        <button 
          @click="endCurrentSession" 
          class="button button--secondary"
          :disabled="isLoading"
        >
          End Session
        </button>
      </div>
    </div>

    <!-- Chapter selection -->
    <div v-if="!currentSession" class="chapter-selection">
      <div class="selection-header">
        <h2 class="selection-title">Select Chapter</h2>
        <div class="selection-filters">
          <select 
            v-model="selectedCategory"
            class="filter-select"
            aria-label="Filter chapters by category"
          >
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
          
          <select 
            v-model="selectedStatus"
            class="filter-select"
            aria-label="Filter chapters by status"
          >
            <option value="">All Statuses</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <!-- Chapter list -->
      <div v-if="isLoadingChapters" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading chapters...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="loadChapters" class="button button--secondary">
          Try Again
        </button>
      </div>
      
      <div v-else-if="filteredChapters.length === 0" class="empty-state">
        <p>No chapters found matching your filters.</p>
        <button @click="clearFilters" class="button button--secondary">
          Clear Filters
        </button>
      </div>
      
      <div v-else class="chapters-grid">
        <div 
          v-for="chapter in filteredChapters" 
          :key="chapter.id"
          class="chapter-card"
          :class="{ 'chapter-card--selected': selectedChapter === chapter.id }"
          @click="selectChapter(chapter.id)"
          @keydown.enter="selectChapter(chapter.id)"
          @keydown.space.prevent="selectChapter(chapter.id)"
          tabindex="0"
          role="button"
          :aria-pressed="selectedChapter === chapter.id"
        >
          <div class="chapter-header">
            <div class="chapter-status">
              <span class="status-indicator" :class="`status-${chapter.status}`">
                {{ getStatusIcon(chapter.status) }}
              </span>
              <span class="status-label">{{ getStatusLabel(chapter.status) }}</span>
            </div>
            <div class="chapter-category">{{ chapter.category }}</div>
          </div>
          
          <h3 class="chapter-title">{{ chapter.title }}</h3>
          
          <div class="chapter-meta">
            <div class="meta-item">
              <span class="meta-icon">📄</span>
              <span class="meta-text">{{ chapter.estimatedWordCount }} words</span>
            </div>
            <div class="meta-item">
              <span class="meta-icon">⏱️</span>
              <span class="meta-text">{{ chapter.estimatedReadingTime }}m read</span>
            </div>
          </div>
          
          <div v-if="chapter.status !== 'not_started'" class="chapter-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :style="{ width: `${chapter.completionPercentage}%` }"
              ></div>
            </div>
            <span class="progress-text">{{ chapter.completionPercentage }}% complete</span>
          </div>
          
          <div v-if="chapter.lastAccessed" class="chapter-last-read">
            Last read: {{ formatDate(chapter.lastAccessed) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Session mode selection -->
    <div v-if="selectedChapter && !currentSession" class="session-mode-selection">
      <SessionSelector 
        :chapterId="selectedChapter"
        @sessionStarted="handleSessionStarted"
        @modeSelected="handleModeSelected"
      />
    </div>

    <!-- Quick actions -->
    <div class="quick-actions">
      <h2 class="quick-actions-title">Quick Actions</h2>
      <div class="actions-grid">
        <NuxtLink to="/chapters" class="action-card">
          <div class="action-icon">📚</div>
          <div class="action-content">
            <h3 class="action-title">Browse All Chapters</h3>
            <p class="action-description">Explore the complete JavaScript documentation</p>
          </div>
        </NuxtLink>
        
        <NuxtLink to="/progress" class="action-card">
          <div class="action-icon">📊</div>
          <div class="action-content">
            <h3 class="action-title">View Progress</h3>
            <p class="action-description">Check your reading statistics and streak</p>
          </div>
        </NuxtLink>
        
        <NuxtLink to="/exercises" class="action-card">
          <div class="action-icon">🎯</div>
          <div class="action-content">
            <h3 class="action-title">Practice Exercises</h3>
            <p class="action-description">Test your knowledge with coding challenges</p>
          </div>
        </NuxtLink>
        
        <button @click="startRandomSession" class="action-card action-card--button">
          <div class="action-icon">🎲</div>
          <div class="action-content">
            <h3 class="action-title">Random Chapter</h3>
            <p class="action-description">Start a session with a random unread chapter</p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useDataManager } from '~/composables/useDataManager'
import { SessionMode, ChapterStatus } from '~/types/schema'
import type { ChapterProgress } from '~/types/schema'

// Page meta
definePageMeta({
  title: 'Start Session - DocGrind',
  description: 'Choose a chapter and session mode to begin your focused reading practice.'
})

// Data manager
const { 
  currentSession,
  chapters,
  isLoading,
  resumeSession,
  completeSession,
  interruptSession,
  startSession
} = useDataManager()

// Local state
const selectedChapter = ref<string | null>(null)
const selectedCategory = ref('')
const selectedStatus = ref('')
const isLoadingChapters = ref(false)
const error = ref<string | null>(null)
// Mock chapter data (in real app, this would come from MDN API)
const mockChapters: ChapterProgress[] = [
  {
    id: 'js-variables',
    title: 'Variables and Constants',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_Types#Variables',
    category: 'JavaScript Basics',
    status: ChapterStatus.NOT_STARTED,
    completionPercentage: 0,
    lastScrollPosition: 0,
    estimatedWordCount: 1200,
    estimatedReadingTime: 6,
    sessionsStarted: 0,
    sessionsCompleted: 0,
    totalTimeSpent: 0,
    firstStarted: null,
    lastAccessed: null,
    completedAt: null,
    exercisesGenerated: false,
    exercisesCompleted: 0,
    exercisesTotal: 0
  },
  {
    id: 'js-functions',
    title: 'Functions',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions',
    category: 'JavaScript Basics',
    status: ChapterStatus.IN_PROGRESS,
    completionPercentage: 35,
    lastScrollPosition: 1200,
    estimatedWordCount: 2400,
    estimatedReadingTime: 12,
    sessionsStarted: 2,
    sessionsCompleted: 1,
    totalTimeSpent: 15,
    firstStarted: '2024-01-15T10:00:00Z',
    lastAccessed: '2024-01-18T14:30:00Z',
    completedAt: null,
    exercisesGenerated: false,
    exercisesCompleted: 0,
    exercisesTotal: 0
  },
  {
    id: 'js-objects',
    title: 'Objects and Properties',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects',
    category: 'JavaScript Basics',
    status: ChapterStatus.COMPLETED,
    completionPercentage: 100,
    lastScrollPosition: 0,
    estimatedWordCount: 1800,
    estimatedReadingTime: 9,
    sessionsStarted: 3,
    sessionsCompleted: 3,
    totalTimeSpent: 28,
    firstStarted: '2024-01-10T09:00:00Z',
    lastAccessed: '2024-01-12T16:45:00Z',
    completedAt: '2024-01-12T16:45:00Z',
    exercisesGenerated: true,
    exercisesCompleted: 3,
    exercisesTotal: 3
  },
  {
    id: 'js-arrays',
    title: 'Arrays and Array Methods',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array',
    category: 'JavaScript Basics',
    status: ChapterStatus.NOT_STARTED,
    completionPercentage: 0,
    lastScrollPosition: 0,
    estimatedWordCount: 3200,
    estimatedReadingTime: 16,
    sessionsStarted: 0,
    sessionsCompleted: 0,
    totalTimeSpent: 0,
    firstStarted: null,
    lastAccessed: null,
    completedAt: null,
    exercisesGenerated: false,
    exercisesCompleted: 0,
    exercisesTotal: 0
  },
  {
    id: 'js-promises',
    title: 'Promises and Async/Await',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises',
    category: 'Advanced JavaScript',
    status: ChapterStatus.NOT_STARTED,
    completionPercentage: 0,
    lastScrollPosition: 0,
    estimatedWordCount: 2800,
    estimatedReadingTime: 14,
    sessionsStarted: 0,
    sessionsCompleted: 0,
    totalTimeSpent: 0,
    firstStarted: null,
    lastAccessed: null,
    completedAt: null,
    exercisesGenerated: false,
    exercisesCompleted: 0,
    exercisesTotal: 0
  },
  {
    id: 'js-modules',
    title: 'JavaScript Modules',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules',
    category: 'Advanced JavaScript',
    status: ChapterStatus.NOT_STARTED,
    completionPercentage: 0,
    lastScrollPosition: 0,
    estimatedWordCount: 2100,
    estimatedReadingTime: 10,
    sessionsStarted: 0,
    sessionsCompleted: 0,
    totalTimeSpent: 0,
    firstStarted: null,
    lastAccessed: null,
    completedAt: null,
    exercisesGenerated: false,
    exercisesCompleted: 0,
    exercisesTotal: 0
  }
]

const availableChapters = ref<ChapterProgress[]>(mockChapters)

// Computed properties
const categories = computed(() => {
  return [...new Set(availableChapters.value.map(ch => ch.category))].sort()
})

const filteredChapters = computed(() => {
  let filtered = availableChapters.value
  
  if (selectedCategory.value) {
    filtered = filtered.filter(ch => ch.category === selectedCategory.value)
  }
  
  if (selectedStatus.value) {
    filtered = filtered.filter(ch => ch.status === selectedStatus.value)
  }
  
  return filtered.sort((a, b) => {
    // Sort by status (not started first, then in progress, then completed)
    const statusOrder = { 'not_started': 0, 'in_progress': 1, 'completed': 2 }
    if (a.status !== b.status) {
      return statusOrder[a.status] - statusOrder[b.status]
    }
    
    // Then sort by category
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category)
    }
    
    // Finally sort by title
    return a.title.localeCompare(b.title)
  })
})

// Methods
const loadChapters = async () => {
  isLoadingChapters.value = true
  error.value = null
  
  try {
    // In a real app, this would fetch from MDN API
    // For now, we'll use mock data and merge with existing progress
    const existingChapters = chapters.value
    
    availableChapters.value = mockChapters.map(mockChapter => {
      const existing = existingChapters[mockChapter.id]
      return existing || mockChapter
    })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load chapters'
  } finally {
    isLoadingChapters.value = false
  }
}

const selectChapter = (chapterId: string) => {
  selectedChapter.value = chapterId
}

const clearFilters = () => {
  selectedCategory.value = ''
  selectedStatus.value = ''
}

const resumeCurrentSession = async () => {
  if (!currentSession.value) return
  
  try {
    await navigateTo(`/read/${currentSession.value.chapterId}`)
  } catch (err) {
    console.error('Failed to resume session:', err)
  }
}

const endCurrentSession = async () => {
  if (!currentSession.value) return
  
  try {
    await interruptSession()
  } catch (err) {
    console.error('Failed to end session:', err)
  }
}

const startRandomSession = async () => {
  const notStartedChapters = availableChapters.value.filter(
    ch => ch.status === ChapterStatus.NOT_STARTED
  )
  
  if (notStartedChapters.length === 0) {
    // If no unread chapters, pick any incomplete chapter
    const incompleteChapters = availableChapters.value.filter(
      ch => ch.status !== ChapterStatus.COMPLETED
    )
    
    if (incompleteChapters.length === 0) {
      error.value = 'No chapters available for random selection'
      return
    }
    
    const randomChapter = incompleteChapters[Math.floor(Math.random() * incompleteChapters.length)]
    selectedChapter.value = randomChapter.id
  } else {
    const randomChapter = notStartedChapters[Math.floor(Math.random() * notStartedChapters.length)]
    selectedChapter.value = randomChapter.id
  }
}

const handleSessionStarted = (sessionId: string, mode: SessionMode) => {
  // Navigation will be handled by the SessionSelector component
}

const handleModeSelected = (mode: SessionMode) => {
  // Optional: track mode selection for analytics
}

// Utility functions
const getSessionModeLabel = (mode: SessionMode): string => {
  switch (mode) {
    case SessionMode.FIVE_MIN: return '5-minute'
    case SessionMode.FIFTEEN_MIN: return '15-minute'
    case SessionMode.JOY: return 'Joy mode'
    case SessionMode.ZEN: return 'Zen mode'
    default: return 'Unknown'
  }
}

const getChapterTitle = (chapterId: string): string => {
  const chapter = availableChapters.value.find(ch => ch.id === chapterId)
  return chapter?.title || 'Unknown Chapter'
}

const getStatusIcon = (status: ChapterStatus): string => {
  switch (status) {
    case ChapterStatus.NOT_STARTED: return '⚪'
    case ChapterStatus.IN_PROGRESS: return '🟡'
    case ChapterStatus.COMPLETED: return '🟢'
    case ChapterStatus.EXERCISES_PENDING: return '🔵'
    default: return '⚪'
  }
}

const getStatusLabel = (status: ChapterStatus): string => {
  switch (status) {
    case ChapterStatus.NOT_STARTED: return 'Not Started'
    case ChapterStatus.IN_PROGRESS: return 'In Progress'
    case ChapterStatus.COMPLETED: return 'Completed'
    case ChapterStatus.EXERCISES_PENDING: return 'Exercises Pending'
    default: return 'Unknown'
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  
  return date.toLocaleDateString()
}

// Lifecycle
onMounted(() => {
  loadChapters()
})
</script>

<style scoped>
.session-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 1rem 0;
}

.page-description {
  font-size: 1.25rem;
  color: var(--text-color);
  opacity: 0.8;
  margin: 0;
  line-height: 1.6;
}

.current-session-warning {
  background: var(--warning-color);
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.warning-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.warning-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.warning-text h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.warning-text p {
  margin: 0;
  opacity: 0.9;
}

.warning-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.chapter-selection {
  margin-bottom: 3rem;
}

.selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.selection-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.selection-filters {
  display: flex;
  gap: 1rem;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 0.875rem;
  min-width: 140px;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
}

.chapters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.chapter-card {
  background: var(--bg-color);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.chapter-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.chapter-card:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 122, 204, 0.2);
}

.chapter-card--selected {
  border-color: var(--primary-color);
  background: rgba(0, 122, 204, 0.05);
}

.chapter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chapter-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator {
  font-size: 0.875rem;
}

.status-label {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.chapter-category {
  font-size: 0.75rem;
  color: var(--primary-color);
  font-weight: 500;
  background: rgba(0, 122, 204, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.chapter-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.chapter-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--text-color);
  opacity: 0.7;
}

.meta-icon {
  font-size: 0.875rem;
}

.chapter-progress {
  margin-bottom: 1rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--border-color);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: var(--text-color);
  opacity: 0.8;
}

.chapter-last-read {
  font-size: 0.875rem;
  color: var(--text-color);
  opacity: 0.6;
  font-style: italic;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-color);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.session-mode-selection {
  margin-bottom: 3rem;
}

.quick-actions {
  border-top: 1px solid var(--border-color);
  padding-top: 2rem;
}

.quick-actions-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 1.5rem 0;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-color);
  transition: all 0.3s ease;
}

.action-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-card--button {
  background: none;
  cursor: pointer;
  font-size: inherit;
  font-family: inherit;
  text-align: left;
  width: 100%;
}

.action-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.action-content {
  flex: 1;
}

.action-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.action-description {
  font-size: 0.875rem;
  opacity: 0.7;
  margin: 0;
}

.button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.button--primary {
  background: var(--primary-color);
  color: white;
}

.button--primary:hover {
  background: #005a9e;
}

.button--secondary {
  background: var(--secondary-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.button--secondary:hover {
  background: var(--border-color);
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive design */
@media (max-width: 768px) {
  .session-page {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .selection-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .selection-filters {
    flex-direction: column;
  }
  
  .chapters-grid {
    grid-template-columns: 1fr;
  }
  
  .current-session-warning {
    flex-direction: column;
    text-align: center;
  }
  
  .warning-actions {
    justify-content: center;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .chapter-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>