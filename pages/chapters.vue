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
        <span class="stat-value">{{ completedChapters.length }}</span>
        <span class="stat-label">completed</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ inProgressChapters.length }}</span>
        <span class="stat-label">in progress</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ Math.round((completedChapters.length / allChapters.length) * 100) }}%</span>
        <span class="stat-label">progress</span>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoadingChapters" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading chapters...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadChapters" class="button button--secondary">
        Try Again
      </button>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredChapters.length === 0" class="empty-state">
      <p>No chapters found matching your filters.</p>
      <button @click="resetFilters" class="button button--secondary">
        Clear Filters
      </button>
    </div>

    <!-- Chapters grid -->
    <div v-else class="chapters-grid">
      <NuxtLink 
        v-for="chapter in filteredChapters" 
        :key="chapter.id"
        :to="`/read/${chapter.id}`"
        class="chapter-card"
      >
        <!-- Chapter status indicator -->
        <div class="chapter-status">
          <span class="status-indicator" :class="`status-${chapter.status}`">
            {{ getStatusIcon(chapter.status) }}
          </span>
          <span class="status-label">{{ getStatusLabel(chapter.status) }}</span>
        </div>

        <!-- Chapter category -->
        <div class="chapter-category">{{ chapter.category }}</div>

        <!-- Chapter title -->
        <h3 class="chapter-title">{{ chapter.title }}</h3>

        <!-- Chapter meta information -->
        <div class="chapter-meta">
          <div class="meta-item">
            <span class="meta-icon">📄</span>
            <span class="meta-text">{{ chapter.estimatedWordCount }} words</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">⏱️</span>
            <span class="meta-text">{{ chapter.estimatedReadingTime }}m read</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">🎯</span>
            <span class="meta-text">{{ chapter.difficulty }}</span>
          </div>
        </div>

        <!-- Progress bar for started chapters -->
        <div v-if="chapter.status !== 'not_started'" class="chapter-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: `${chapter.completionPercentage}%` }"
            ></div>
          </div>
          <span class="progress-text">{{ chapter.completionPercentage }}% complete</span>
        </div>

        <!-- Last read information -->
        <div v-if="chapter.lastAccessed" class="chapter-last-read">
          Last read: {{ formatDate(chapter.lastAccessed) }}
        </div>

        <!-- Action buttons -->
        <div class="chapter-actions">
          <span class="button button--primary">
            {{ chapter.status === 'not_started' ? 'Start Reading' : 'Continue Reading' }}
          </span>
          
          <button 
            v-if="chapter.status === 'completed'"
            @click.stop="generateExercises(chapter.id)"
            class="button button--secondary"
            :disabled="chapter.exercisesGenerated"
          >
            {{ chapter.exercisesGenerated ? 'Exercises Ready' : 'Generate Exercises' }}
          </button>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDataManager } from '~/composables/useDataManager'
import { ChapterStatus } from '~/types/schema'
import type { ChapterProgress } from '~/types/schema'

// Page meta
definePageMeta({
  title: 'Chapters - DocGrind',
  description: 'Browse and track your progress through JavaScript documentation chapters.'
})

// Data manager
const { 
  chapters,
  updateChapterProgress,
  generateExercises: generateChapterExercises
} = useDataManager()

// Search functionality (using the debounce function from useMDNSearch)
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout
  return ((...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }) as T
}

// Local state
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const selectedDifficulty = ref('')
const sortBy = ref('category')
const isLoadingChapters = ref(false)
const error = ref<string | null>(null)
const allChapters = ref<ChapterProgress[]>([])

// Load chapters from real MDN content
const loadChapters = async () => {
  isLoadingChapters.value = true
  error.value = null
  
  try {
    // Load real MDN chapters from the scraped content
    const { data: mdnIndex } = await $fetch('/api/chapters')
    const existingChapters = chapters.value
    
    // Convert MDN chapters to ChapterProgress format
    allChapters.value = mdnIndex.chapters.map((mdnChapter: any) => {
      const existing = existingChapters[mdnChapter.slug]
      
      // If we have existing progress, use it; otherwise create new progress entry
      if (existing) {
        return existing
      }
      
      // Create new ChapterProgress from MDN data
      const chapterProgress: ChapterProgress = {
        id: mdnChapter.slug,
        title: mdnChapter.title.replace(/^(Guide|Reference)\s+/, '').replace(/_/g, ' '),
        url: `https://developer.mozilla.org/en-US/docs/Web/JavaScript/${mdnChapter.path}`,
        category: mdnChapter.category,
        status: ChapterStatus.NOT_STARTED,
        completionPercentage: 0,
        lastScrollPosition: 0,
        readingProgress: 0,
        estimatedWordCount: parseInt(mdnChapter.wordCount),
        estimatedReadingTime: parseInt(mdnChapter.readingTime),
        sessionsStarted: 0,
        sessionsCompleted: 0,
        totalTimeSpent: 0,
        timeSpent: 0,
        sessionsCount: 0,
        firstStarted: null,
        lastAccessed: null,
        lastReadAt: new Date().toISOString(),
        completedAt: null,
        exercisesGenerated: false,
        exercisesCompleted: 0,
        exercisesTotal: 0,
        totalExercises: 0,
        bookmarks: [],
        notes: [],
        difficulty: mdnChapter.difficulty || 'intermediate'
      }
      
      return chapterProgress
    })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load chapters'
    console.error('Failed to load MDN chapters:', err)
  } finally {
    isLoadingChapters.value = false
  }
}

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
  switch (sortBy.value) {
    case 'title':
      filtered.sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'difficulty':
      const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 }
      filtered.sort((a, b) => (difficultyOrder[a.difficulty] || 2) - (difficultyOrder[b.difficulty] || 2))
      break
    case 'progress':
      filtered.sort((a, b) => b.completionPercentage - a.completionPercentage)
      break
    case 'lastAccessed':
      filtered.sort((a, b) => {
        if (!a.lastAccessed && !b.lastAccessed) return 0
        if (!a.lastAccessed) return 1
        if (!b.lastAccessed) return -1
        return new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
      })
      break
    default: // category
      filtered.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category)
        }
        return a.title.localeCompare(b.title)
      })
  }
  
  return filtered
})

const completedChapters = computed(() => {
  return allChapters.value.filter(ch => ch.status === ChapterStatus.COMPLETED)
})

const inProgressChapters = computed(() => {
  return allChapters.value.filter(ch => ch.status === ChapterStatus.IN_PROGRESS)
})

const hasActiveFilters = computed(() => {
  return !!(searchQuery.value || selectedCategory.value || selectedStatus.value || selectedDifficulty.value)
})

// Methods
const handleSearch = debounce(() => {
  // Search is handled reactively by the computed property
}, 300)

const clearSearch = () => {
  searchQuery.value = ''
}

const applyFilters = () => {
  // Filters are applied reactively by the computed property
}

const applySorting = () => {
  // Sorting is applied reactively by the computed property
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedStatus.value = ''
  selectedDifficulty.value = ''
  sortBy.value = 'category'
}


const generateExercises = async (chapterId: string) => {
  try {
    await generateChapterExercises(chapterId)
  } catch (err) {
    console.error('Failed to generate exercises:', err)
  }
}

// Utility functions
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
.chapters-page {
  max-width: 1400px;
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

.search-section {
  margin-bottom: 3rem;
}

.search-bar {
  margin-bottom: 1.5rem;
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
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 122, 204, 0.1);
}

.clear-search-button {
  position: absolute;
  right: 1rem;
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
  justify-content: center;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 0.875rem;
  min-width: 150px;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
}

.reset-filters-button {
  padding: 0.75rem 1.5rem;
  background: var(--secondary-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
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
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
}

.stat-label {
  display: block;
  font-size: 0.875rem;
  color: var(--text-color);
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.chapter-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.chapter-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.status-indicator {
  font-size: 0.875rem;
}

.status-label {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.8;
}

.chapter-category {
  position: absolute;
  top: 1rem;
  right: 1rem;
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
  padding-right: 2rem;
}

.chapter-meta {
  display: flex;
  flex-wrap: wrap;
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
  margin-bottom: 1rem;
}

.chapter-actions {
  display: flex;
  gap: 0.5rem;
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
  flex: 1;
  justify-content: center;
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
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .chapters-grid {
    grid-template-columns: 1fr;
  }
  
  .chapter-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .chapter-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .chapter-title {
    padding-right: 1rem;
  }
  
  .chapter-category {
    position: static;
    margin-bottom: 0.5rem;
    width: fit-content;
  }
}
</style>