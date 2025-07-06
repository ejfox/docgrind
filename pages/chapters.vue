<template>
  <div class="chapters-page">
    <!-- Page header -->
    <div class="page-header">
      <h1 class="page-title">JavaScript Documentation</h1>
      <p class="page-description">
        Explore and track your progress through the complete MDN JavaScript documentation.
        Start reading sessions, practice with exercises, and build your expertise.
      </p>
    </div>

    <!-- Search and filters -->
    <div class="search-section">
      <div class="search-bar">
        <div class="search-input-wrapper">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search chapters..."
            class="search-input"
            @input="handleSearch"
          >
          <button 
            v-if="searchQuery"
            @click="clearSearch"
            class="clear-search-button"
            aria-label="Clear search"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="filters-bar">
        <select 
          v-model="selectedCategory"
          class="filter-select"
          @change="applyFilters"
        >
          <option value="">All Categories</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>

        <select 
          v-model="selectedStatus"
          class="filter-select"
          @change="applyFilters"
        >
          <option value="">All Statuses</option>
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="exercises_pending">Exercises Pending</option>
        </select>

        <select 
          v-model="selectedDifficulty"
          class="filter-select"
          @change="applyFilters"
        >
          <option value="">All Difficulties</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <select 
          v-model="sortBy"
          class="filter-select"
          @change="applySorting"
        >
          <option value="category">Sort by Category</option>
          <option value="title">Sort by Title</option>
          <option value="difficulty">Sort by Difficulty</option>
          <option value="progress">Sort by Progress</option>
          <option value="lastAccessed">Sort by Last Read</option>
        </select>

        <button 
          @click="resetFilters"
          class="reset-filters-button"
          :disabled="!hasActiveFilters"
        >
          Reset Filters
        </button>
      </div>
    </div>

    <!-- Quick stats -->
    <div class="quick-stats">
      <div class="stat-item">
        <span class="stat-value">{{ filteredChapters.length }}</span>
        <span class="stat-label">chapters</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ completedCount }}</span>
        <span class="stat-label">completed</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ inProgressCount }}</span>
        <span class="stat-label">in progress</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ totalEstimatedTime }}</span>
        <span class="stat-label">hours total</span>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading chapters...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Failed to Load Chapters</h3>
      <p>{{ error }}</p>
      <button @click="loadChapters" class="retry-button">
        Try Again
      </button>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredChapters.length === 0" class="empty-state">
      <div class="empty-icon">📚</div>
      <h3>No Chapters Found</h3>
      <p v-if="hasActiveFilters">
        No chapters match your current filters. Try adjusting your search or filters.
      </p>
      <p v-else>
        No chapters are available right now. Check back later!
      </p>
      <button v-if="hasActiveFilters" @click="resetFilters" class="reset-button">
        Clear All Filters
      </button>
    </div>

    <!-- Chapters grid -->
    <div v-else class="chapters-grid">
      <div 
        v-for="chapter in filteredChapters" 
        :key="chapter.id"
        class="chapter-card"
        :class="getChapterCardClasses(chapter)"
      >
        <!-- Chapter header -->
        <div class="chapter-header">
          <div class="chapter-status">
            <span class="status-indicator" :class="`status-${chapter.status}`">
              {{ getStatusIcon(chapter.status) }}
            </span>
            <span class="status-label">{{ getStatusLabel(chapter.status) }}</span>
          </div>
          
          <div class="chapter-meta">
            <span class="chapter-category">{{ chapter.category }}</span>
            <span class="chapter-difficulty" :class="`difficulty-${chapter.difficulty}`">
              {{ chapter.difficulty }}
            </span>
          </div>
        </div>

        <!-- Chapter content -->
        <div class="chapter-content">
          <h3 class="chapter-title">{{ chapter.title }}</h3>
          
          <div class="chapter-info">
            <div class="info-item">
              <span class="info-icon">📄</span>
              <span class="info-text">{{ chapter.estimatedWordCount.toLocaleString() }} words</span>
            </div>
            <div class="info-item">
              <span class="info-icon">⏱️</span>
              <span class="info-text">{{ chapter.estimatedReadingTime }}m read</span>
            </div>
            <div v-if="chapter.hasCodeExamples" class="info-item">
              <span class="info-icon">💻</span>
              <span class="info-text">Code examples</span>
            </div>
          </div>

          <!-- Progress bar for started chapters -->
          <div v-if="chapter.status !== 'not_started'" class="progress-section">
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :style="{ width: `${chapter.completionPercentage}%` }"
              ></div>
            </div>
            <div class="progress-text">
              <span class="progress-percentage">{{ chapter.completionPercentage }}% complete</span>
              <span v-if="chapter.lastAccessed" class="progress-date">
                Last read {{ formatDate(chapter.lastAccessed) }}
              </span>
            </div>
          </div>

          <!-- Exercise status -->
          <div v-if="chapter.exercisesTotal > 0" class="exercises-section">
            <div class="exercises-info">
              <span class="exercises-icon">🎯</span>
              <span class="exercises-text">
                {{ chapter.exercisesCompleted }}/{{ chapter.exercisesTotal }} exercises completed
              </span>
            </div>
            <div class="exercises-progress">
              <div 
                class="exercises-bar"
                :style="{ width: `${(chapter.exercisesCompleted / chapter.exercisesTotal) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Chapter actions -->
        <div class="chapter-actions">
          <button 
            @click="startReading(chapter)"
            class="action-button action-button--primary"
            :disabled="isStartingSession"
          >
            <span v-if="chapter.status === 'not_started'" class="button-text">Start Reading</span>
            <span v-else class="button-text">Continue Reading</span>
            <span class="button-icon">📖</span>
          </button>
          
          <div class="secondary-actions">
            <button 
              @click="viewExercises(chapter)"
              class="action-button action-button--secondary"
              :disabled="!chapter.exercisesGenerated"
              :title="chapter.exercisesGenerated ? 'View exercises' : 'No exercises available'"
            >
              <span class="button-icon">🎯</span>
            </button>
            
            <button 
              @click="viewChapterDetails(chapter)"
              class="action-button action-button--secondary"
              title="View chapter details"
            >
              <span class="button-icon">ℹ️</span>
            </button>
            
            <a 
              :href="chapter.url"
              target="_blank"
              rel="noopener noreferrer"
              class="action-button action-button--secondary"
              title="Open on MDN"
            >
              <span class="button-icon">🔗</span>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Chapter details modal -->
    <div v-if="selectedChapterDetails" class="modal-overlay" @click="closeChapterDetails">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">{{ selectedChapterDetails.title }}</h2>
          <button @click="closeChapterDetails" class="close-button" aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="chapter-details">
            <div class="detail-section">
              <h3>Overview</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Category</span>
                  <span class="detail-value">{{ selectedChapterDetails.category }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Difficulty</span>
                  <span class="detail-value">{{ selectedChapterDetails.difficulty }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Word Count</span>
                  <span class="detail-value">{{ selectedChapterDetails.estimatedWordCount.toLocaleString() }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Reading Time</span>
                  <span class="detail-value">{{ selectedChapterDetails.estimatedReadingTime }} minutes</span>
                </div>
              </div>
            </div>
            
            <div v-if="selectedChapterDetails.status !== 'not_started'" class="detail-section">
              <h3>Progress</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Completion</span>
                  <span class="detail-value">{{ selectedChapterDetails.completionPercentage }}%</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Sessions Started</span>
                  <span class="detail-value">{{ selectedChapterDetails.sessionsStarted }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Time Spent</span>
                  <span class="detail-value">{{ selectedChapterDetails.totalTimeSpent }} minutes</span>
                </div>
                <div v-if="selectedChapterDetails.firstStarted" class="detail-item">
                  <span class="detail-label">First Started</span>
                  <span class="detail-value">{{ formatDate(selectedChapterDetails.firstStarted) }}</span>
                </div>
              </div>
            </div>
            
            <div v-if="selectedChapterDetails.exercisesTotal > 0" class="detail-section">
              <h3>Exercises</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Completed</span>
                  <span class="detail-value">
                    {{ selectedChapterDetails.exercisesCompleted }}/{{ selectedChapterDetails.exercisesTotal }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Success Rate</span>
                  <span class="detail-value">
                    {{ selectedChapterDetails.exercisesTotal > 0 ? 
                        Math.round((selectedChapterDetails.exercisesCompleted / selectedChapterDetails.exercisesTotal) * 100) : 0 }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-actions">
          <button 
            @click="startReading(selectedChapterDetails)"
            class="action-button action-button--primary"
          >
            {{ selectedChapterDetails.status === 'not_started' ? 'Start Reading' : 'Continue Reading' }}
          </button>
          <a 
            :href="selectedChapterDetails.url"
            target="_blank"
            rel="noopener noreferrer"
            class="action-button action-button--secondary"
          >
            Open on MDN
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useDataManager } from '~/composables/useDataManager'
import { ChapterStatus, SessionMode } from '~/types/schema'
import type { ChapterProgress } from '~/types/schema'

// Page meta
definePageMeta({
  title: 'Chapters - DocGrind',
  description: 'Explore and track your progress through the complete MDN JavaScript documentation.'
})

// Data manager
const { chapters, startSession } = useDataManager()

// Local state
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const selectedDifficulty = ref('')
const sortBy = ref('category')
const isLoading = ref(false)
const error = ref<string | null>(null)
const isStartingSession = ref(false)
const selectedChapterDetails = ref<ChapterProgress | null>(null)

// Mock chapters data (in real app, this would come from MDN API)
const allChapters = ref<ChapterProgress[]>([
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
    exercisesTotal: 0,
    difficulty: 'beginner',
    hasCodeExamples: true,
    hasInteractiveContent: false
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
    totalTimeSpent: 18,
    firstStarted: '2024-01-15T10:00:00Z',
    lastAccessed: '2024-01-18T14:30:00Z',
    completedAt: null,
    exercisesGenerated: true,
    exercisesCompleted: 2,
    exercisesTotal: 4,
    difficulty: 'beginner',
    hasCodeExamples: true,
    hasInteractiveContent: true
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
    exercisesTotal: 3,
    difficulty: 'beginner',
    hasCodeExamples: true,
    hasInteractiveContent: false
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
    exercisesTotal: 0,
    difficulty: 'intermediate',
    hasCodeExamples: true,
    hasInteractiveContent: true
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
    exercisesTotal: 0,
    difficulty: 'advanced',
    hasCodeExamples: true,
    hasInteractiveContent: false
  },
  {
    id: 'js-modules',
    title: 'JavaScript Modules',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules',
    category: 'Advanced JavaScript',
    status: ChapterStatus.EXERCISES_PENDING,
    completionPercentage: 100,
    lastScrollPosition: 0,
    estimatedWordCount: 2100,
    estimatedReadingTime: 10,
    sessionsStarted: 2,
    sessionsCompleted: 2,
    totalTimeSpent: 22,
    firstStarted: '2024-01-20T11:00:00Z',
    lastAccessed: '2024-01-21T15:30:00Z',
    completedAt: '2024-01-21T15:30:00Z',
    exercisesGenerated: true,
    exercisesCompleted: 0,
    exercisesTotal: 3,
    difficulty: 'advanced',
    hasCodeExamples: true,
    hasInteractiveContent: true
  },
  {
    id: 'js-classes',
    title: 'Classes and Inheritance',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes',
    category: 'Object-Oriented JavaScript',
    status: ChapterStatus.NOT_STARTED,
    completionPercentage: 0,
    lastScrollPosition: 0,
    estimatedWordCount: 1900,
    estimatedReadingTime: 9,
    sessionsStarted: 0,
    sessionsCompleted: 0,
    totalTimeSpent: 0,
    firstStarted: null,
    lastAccessed: null,
    completedAt: null,
    exercisesGenerated: false,
    exercisesCompleted: 0,
    exercisesTotal: 0,
    difficulty: 'intermediate',
    hasCodeExamples: true,
    hasInteractiveContent: false
  },
  {
    id: 'js-regex',
    title: 'Regular Expressions',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions',
    category: 'Advanced JavaScript',
    status: ChapterStatus.NOT_STARTED,
    completionPercentage: 0,
    lastScrollPosition: 0,
    estimatedWordCount: 2600,
    estimatedReadingTime: 13,
    sessionsStarted: 0,
    sessionsCompleted: 0,
    totalTimeSpent: 0,
    firstStarted: null,
    lastAccessed: null,
    completedAt: null,
    exercisesGenerated: false,
    exercisesCompleted: 0,
    exercisesTotal: 0,
    difficulty: 'advanced',
    hasCodeExamples: true,
    hasInteractiveContent: true
  }
])

// Computed properties
const categories = computed(() => {
  return [...new Set(allChapters.value.map(ch => ch.category))].sort()
})

const filteredChapters = computed(() => {
  let filtered = [...allChapters.value]
  
  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(ch => 
      ch.title.toLowerCase().includes(query) ||
      ch.category.toLowerCase().includes(query)
    )
  }
  
  // Apply category filter
  if (selectedCategory.value) {
    filtered = filtered.filter(ch => ch.category === selectedCategory.value)
  }
  
  // Apply status filter
  if (selectedStatus.value) {
    filtered = filtered.filter(ch => ch.status === selectedStatus.value)
  }
  
  // Apply difficulty filter
  if (selectedDifficulty.value) {
    filtered = filtered.filter(ch => ch.difficulty === selectedDifficulty.value)
  }
  
  // Apply sorting
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'difficulty':
        const difficultyOrder = { 'beginner': 0, 'intermediate': 1, 'advanced': 2 }
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
      case 'progress':
        if (a.status !== b.status) {
          const statusOrder = { 'in_progress': 0, 'exercises_pending': 1, 'not_started': 2, 'completed': 3 }
          return statusOrder[a.status] - statusOrder[b.status]
        }
        return b.completionPercentage - a.completionPercentage
      case 'lastAccessed':
        if (!a.lastAccessed && !b.lastAccessed) return 0
        if (!a.lastAccessed) return 1
        if (!b.lastAccessed) return -1
        return new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
      case 'category':
      default:
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category)
        }
        return a.title.localeCompare(b.title)
    }
  })
  
  return filtered
})

const hasActiveFilters = computed(() => {
  return !!(searchQuery.value || selectedCategory.value || selectedStatus.value || selectedDifficulty.value)
})

const completedCount = computed(() => {
  return filteredChapters.value.filter(ch => ch.status === ChapterStatus.COMPLETED).length
})

const inProgressCount = computed(() => {
  return filteredChapters.value.filter(ch => 
    ch.status === ChapterStatus.IN_PROGRESS || ch.status === ChapterStatus.EXERCISES_PENDING
  ).length
})

const totalEstimatedTime = computed(() => {
  const totalMinutes = filteredChapters.value.reduce((sum, ch) => sum + ch.estimatedReadingTime, 0)
  return Math.round(totalMinutes / 60 * 10) / 10
})

// Methods
const loadChapters = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    // In a real app, this would fetch from MDN API
    // For now, we'll merge mock data with existing progress
    const existingChapters = chapters.value
    
    allChapters.value = allChapters.value.map(mockChapter => {
      const existing = existingChapters[mockChapter.id]
      return existing ? { ...mockChapter, ...existing } : mockChapter
    })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load chapters'
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => {
  // Search is reactive through computed property
}

const clearSearch = () => {
  searchQuery.value = ''
}

const applyFilters = () => {
  // Filters are reactive through computed property
}

const applySorting = () => {
  // Sorting is reactive through computed property
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedStatus.value = ''
  selectedDifficulty.value = ''
  sortBy.value = 'category'
}

const startReading = async (chapter: ChapterProgress) => {
  isStartingSession.value = true
  
  try {
    // Start a reading session with default mode (5-minute session)
    const sessionId = await startSession(chapter.id, SessionMode.FIVE_MIN)
    
    // Navigate to the reading page
    await navigateTo(`/read/${chapter.id}`)
  } catch (error) {
    console.error('Failed to start reading:', error)
  } finally {
    isStartingSession.value = false
  }
}

const viewExercises = async (chapter: ChapterProgress) => {
  await navigateTo(`/exercises?chapter=${chapter.id}`)
}

const viewChapterDetails = (chapter: ChapterProgress) => {
  selectedChapterDetails.value = chapter
}

const closeChapterDetails = () => {
  selectedChapterDetails.value = null
}

const getChapterCardClasses = (chapter: ChapterProgress): string[] => {
  const classes = ['chapter-card']
  
  if (chapter.status === ChapterStatus.COMPLETED) {
    classes.push('chapter-card--completed')
  } else if (chapter.status === ChapterStatus.IN_PROGRESS) {
    classes.push('chapter-card--in-progress')
  } else if (chapter.status === ChapterStatus.EXERCISES_PENDING) {
    classes.push('chapter-card--exercises-pending')
  }
  
  return classes
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
  
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  
  return date.toLocaleDateString()
}

// Lifecycle
onMounted(() => {
  loadChapters()
})

// Handle keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && selectedChapterDetails.value) {
    closeChapterDetails()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.chapters-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 1rem 0;
}

.page-description {
  font-size: 1.1rem;
  color: var(--text-color);
  opacity: 0.8;
  margin: 0;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.search-section {
  margin-bottom: 2rem;
}

.search-bar {
  margin-bottom: 1rem;
}

.search-input-wrapper {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-color);
  opacity: 0.5;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 122, 204, 0.1);
}

.clear-search-button {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-color);
  opacity: 0.5;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: opacity 0.2s ease;
}

.clear-search-button:hover {
  opacity: 1;
}

.filters-bar {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
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

.reset-filters-button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--secondary-color);
  color: var(--text-color);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-filters-button:hover:not(:disabled) {
  background: var(--border-color);
}

.reset-filters-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quick-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--secondary-color);
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-color);
  opacity: 0.7;
  margin-top: 0.25rem;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-color);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon,
.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-button,
.reset-button {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-top: 1rem;
}

.retry-button:hover,
.reset-button:hover {
  background: #005a9e;
}

.chapters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.chapter-card {
  background: var(--bg-color);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chapter-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.chapter-card--completed {
  border-color: var(--success-color);
  background: rgba(40, 167, 69, 0.02);
}

.chapter-card--in-progress {
  border-color: var(--primary-color);
  background: rgba(0, 122, 204, 0.02);
}

.chapter-card--exercises-pending {
  border-color: var(--warning-color);
  background: rgba(255, 193, 7, 0.02);
}

.chapter-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
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
  color: var(--text-color);
  opacity: 0.8;
}

.chapter-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.chapter-category {
  font-size: 0.75rem;
  color: var(--primary-color);
  font-weight: 500;
  background: rgba(0, 122, 204, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.chapter-difficulty {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  text-transform: capitalize;
}

.difficulty-beginner {
  background: rgba(40, 167, 69, 0.1);
  color: var(--success-color);
}

.difficulty-intermediate {
  background: rgba(255, 193, 7, 0.1);
  color: var(--warning-color);
}

.difficulty-advanced {
  background: rgba(220, 53, 69, 0.1);
  color: var(--error-color);
}

.chapter-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chapter-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
  line-height: 1.4;
}

.chapter-info {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--text-color);
  opacity: 0.7;
}

.info-icon {
  font-size: 0.875rem;
}

.progress-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--border-color);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
}

.progress-percentage {
  color: var(--text-color);
  font-weight: 500;
}

.progress-date {
  color: var(--text-color);
  opacity: 0.6;
}

.exercises-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.exercises-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-color);
}

.exercises-icon {
  font-size: 1rem;
}

.exercises-progress {
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
}

.exercises-bar {
  height: 100%;
  background: var(--success-color);
  transition: width 0.3s ease;
}

.chapter-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.action-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  color: inherit;
}

.action-button--primary {
  background: var(--primary-color);
  color: white;
  flex: 1;
  justify-content: center;
}

.action-button--primary:hover:not(:disabled) {
  background: #005a9e;
}

.action-button--secondary {
  background: var(--secondary-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  padding: 0.5rem;
  min-width: 40px;
  justify-content: center;
}

.action-button--secondary:hover:not(:disabled) {
  background: var(--border-color);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.secondary-actions {
  display: flex;
  gap: 0.5rem;
}

.button-icon {
  font-size: 1rem;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-content {
  background: var(--bg-color);
  border-radius: 12px;
  padding: 0;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.2s ease;
}

.close-button:hover {
  background: var(--secondary-color);
}

.modal-body {
  padding: 1.5rem;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 1rem 0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-color);
  opacity: 0.7;
}

.detail-value {
  font-size: 0.875rem;
  color: var(--text-color);
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
}

/* Responsive design */
@media (max-width: 768px) {
  .chapters-page {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .filters-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-select {
    min-width: auto;
  }
  
  .quick-stats {
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  .chapters-grid {
    grid-template-columns: 1fr;
  }
  
  .chapter-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .secondary-actions {
    justify-content: center;
  }
  
  .modal-content {
    margin: 1rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .chapter-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .chapter-meta {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  
  .chapter-info {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .modal-overlay {
    background: rgba(0, 0, 0, 0.7);
  }
  
  .modal-content {
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }
}
</style>