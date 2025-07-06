<template>
  <div class="reading-page">
    <!-- Reading header -->
    <div class="reading-header">
      <div class="header-left">
        <button 
          @click="goBack"
          class="back-button"
          aria-label="Go back to chapters"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Back
        </button>
        
        <div class="chapter-info">
          <h1 class="chapter-title">{{ chapter?.title || 'Loading...' }}</h1>
          <div v-if="chapter" class="chapter-meta">
            <span class="chapter-category">{{ chapter.category }}</span>
            <span class="chapter-difficulty">{{ chapter.difficulty }}</span>
            <span class="chapter-words">{{ chapter.estimatedWordCount.toLocaleString() }} words</span>
          </div>
        </div>
      </div>
      
      <div class="header-right">
        <!-- Session controls -->
        <div v-if="currentSession" class="session-controls">
          <div class="session-timer">
            <span class="timer-icon">⏱️</span>
            <span class="timer-text">{{ formatTime(sessionElapsed) }}</span>
            <span v-if="sessionTimeLeft > 0" class="timer-remaining">
              / {{ formatTime(sessionTimeLeft) }}
            </span>
          </div>
          
          <button
            v-if="!isSessionPaused"
            @click="pauseSession"
            class="session-button session-button--pause"
            :disabled="isLoading"
            title="Pause session"
          >
            ⏸️
          </button>
          <button
            v-else
            @click="resumeSession"
            class="session-button session-button--resume"
            :disabled="isLoading"
            title="Resume session"
          >
            ▶️
          </button>
          
          <button
            @click="showSessionMenu = !showSessionMenu"
            class="session-button session-button--menu"
            :aria-expanded="showSessionMenu"
            title="Session options"
          >
            ⋮
          </button>
          
          <!-- Session menu -->
          <div v-if="showSessionMenu" class="session-dropdown" @click.stop>
            <button @click="completeSessionEarly" class="dropdown-item">
              Complete Session
            </button>
            <button @click="cancelSession" class="dropdown-item dropdown-item--danger">
              Cancel Session
            </button>
          </div>
        </div>
        
        <!-- Start session if none active -->
        <div v-else class="start-session">
          <button 
            @click="showSessionSelector = true"
            class="start-session-button"
          >
            Start Session
          </button>
        </div>
      </div>
    </div>

    <!-- Progress bar -->
    <div class="progress-container">
      <div class="progress-bar">
        <div 
          class="progress-fill"
          :style="{ width: `${readingProgress}%` }"
        ></div>
      </div>
      <div class="progress-text">
        <span class="progress-percentage">{{ readingProgress }}% complete</span>
        <span class="progress-position">{{ scrollPosition }}px scrolled</span>
      </div>
    </div>

    <!-- Content loading -->
    <div v-if="isLoadingContent" class="content-loading">
      <div class="loading-spinner"></div>
      <p>Loading chapter content...</p>
    </div>

    <!-- Content error -->
    <div v-else-if="contentError" class="content-error">
      <div class="error-icon">⚠️</div>
      <h3>Failed to Load Content</h3>
      <p>{{ contentError }}</p>
      <button @click="loadContent" class="retry-button">
        Try Again
      </button>
    </div>

    <!-- Main content -->
    <div v-else class="reading-content" ref="contentContainer">
      <div class="content-wrapper">
        <!-- Table of contents -->
        <aside 
          v-if="tableOfContents.length > 0"
          class="table-of-contents"
          :class="{ 'toc-collapsed': tocCollapsed }"
        >
          <div class="toc-header">
            <h3 class="toc-title">Contents</h3>
            <button 
              @click="tocCollapsed = !tocCollapsed"
              class="toc-toggle"
              :aria-expanded="!tocCollapsed"
            >
              <svg class="chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          
          <nav v-if="!tocCollapsed" class="toc-nav">
            <ul class="toc-list">
              <li 
                v-for="item in tableOfContents" 
                :key="item.id"
                class="toc-item"
                :class="`toc-level-${item.level}`"
              >
                <a 
                  :href="`#${item.id}`"
                  class="toc-link"
                  :class="{ 'toc-link--active': item.id === activeSection }"
                  @click.prevent="scrollToSection(item.id)"
                >
                  {{ item.text }}
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        <!-- Article content -->
        <article class="article-content" ref="articleContent">
          <div v-html="contentHtml" class="content-html"></div>
          
          <!-- Chapter completion -->
          <div v-if="readingProgress >= 100" class="completion-section">
            <div class="completion-card">
              <div class="completion-icon">🎉</div>
              <h3 class="completion-title">Chapter Complete!</h3>
              <p class="completion-text">
                Great job! You've finished reading "{{ chapter?.title }}".
              </p>
              
              <div class="completion-actions">
                <button 
                  @click="generateExercises"
                  class="completion-button completion-button--primary"
                  :disabled="isGeneratingExercises"
                >
                  <span v-if="isGeneratingExercises">Generating...</span>
                  <span v-else>Practice Exercises</span>
                </button>
                
                <button 
                  @click="goToNextChapter"
                  class="completion-button completion-button--secondary"
                >
                  Next Chapter
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- Reading tools -->
    <div class="reading-tools">
      <div class="tools-container">
        <!-- Bookmark button -->
        <button 
          @click="toggleBookmark"
          class="tool-button"
          :class="{ 'tool-button--active': isBookmarked }"
          title="Bookmark this position"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 3V17L10 13L15 17V3H5Z" stroke="currentColor" stroke-width="1.5" :fill="isBookmarked ? 'currentColor' : 'none'"/>
          </svg>
        </button>
        
        <!-- Font size controls -->
        <div class="font-controls">
          <button 
            @click="decreaseFontSize"
            class="tool-button"
            :disabled="fontSize <= 14"
            title="Decrease font size"
          >
            A-
          </button>
          <span class="font-size-display">{{ fontSize }}px</span>
          <button 
            @click="increaseFontSize"
            class="tool-button"
            :disabled="fontSize >= 24"
            title="Increase font size"
          >
            A+
          </button>
        </div>
        
        <!-- Reading speed -->
        <div class="reading-speed">
          <span class="speed-icon">📖</span>
          <span class="speed-text">{{ currentReadingSpeed }} WPM</span>
        </div>
        
        <!-- Scroll to top -->
        <button 
          @click="scrollToTop"
          class="tool-button"
          title="Scroll to top"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 12.5L10 7.5L5 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Session selector modal -->
    <div v-if="showSessionSelector" class="modal-overlay" @click="showSessionSelector = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Start Reading Session</h2>
          <button @click="showSessionSelector = false" class="close-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <SessionSelector 
            :chapterId="slug"
            @sessionStarted="handleSessionStarted"
            @modeSelected="handleModeSelected"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDataManager } from '~/composables/useDataManager'
import { useReadingProgress } from '~/composables/useReadingProgress'
import { SessionMode } from '~/types/schema'
import type { ChapterProgress } from '~/types/schema'

// Route and router
const route = useRoute()
const router = useRouter()
const slug = computed(() => route.params.slug as string)

// Page meta
definePageMeta({
  title: 'Reading - DocGrind',
  description: 'Read JavaScript documentation with focused sessions and progress tracking.'
})

// Data manager
const { 
  currentSession,
  chapters,
  isSessionActive,
  isSessionPaused,
  sessionElapsed,
  sessionTimeLeft,
  startSession,
  pauseSession: pauseCurrentSession,
  resumeSession: resumeCurrentSession,
  completeSession,
  interruptSession,
  updateSessionProgress,
  updateChapterProgress,
  generateExercises
} = useDataManager()

// Local state
const isLoading = ref(false)
const isLoadingContent = ref(false)
const contentError = ref<string | null>(null)
const chapter = ref<ChapterProgress | null>(null)
const contentHtml = ref('')
const showSessionSelector = ref(false)
const showSessionMenu = ref(false)
const isGeneratingExercises = ref(false)

// Reading state
const contentContainer = ref<HTMLElement>()
const articleContent = ref<HTMLElement>()
const scrollPosition = ref(0)
const readingProgress = ref(0)
const fontSize = ref(16)
const isBookmarked = ref(false)
const currentReadingSpeed = ref(200)

// Table of contents
const tableOfContents = ref<Array<{id: string, text: string, level: number}>>([])
const tocCollapsed = ref(false)
const activeSection = ref('')

// Reading progress tracker
const readingProgressTracker = ref<any>(null)

// Mock content (in real app, this would come from MDN API)
const mockContent = `
<h2 id="introduction">Introduction to Variables</h2>
<p>Variables are containers for storing data values. In JavaScript, you can declare variables using <code>var</code>, <code>let</code>, or <code>const</code>.</p>

<h3 id="variable-declaration">Variable Declaration</h3>
<p>There are three ways to declare variables in JavaScript:</p>
<ul>
  <li><strong>var</strong> - Function-scoped or globally-scoped</li>
  <li><strong>let</strong> - Block-scoped</li>
  <li><strong>const</strong> - Block-scoped and immutable</li>
</ul>

<h3 id="var-keyword">The var Keyword</h3>
<p>The <code>var</code> statement declares a variable, optionally initializing it to a value.</p>
<pre><code>var name = "John";
var age = 30;
var isStudent = false;</code></pre>

<h3 id="let-keyword">The let Keyword</h3>
<p>The <code>let</code> statement declares a block-scoped local variable, optionally initializing it to a value.</p>
<pre><code>let count = 0;
let message = "Hello World";
let items = [];</code></pre>

<h3 id="const-keyword">The const Keyword</h3>
<p>The <code>const</code> declaration creates a read-only reference to a value.</p>
<pre><code>const PI = 3.14159;
const API_URL = "https://api.example.com";
const CONFIG = { debug: true };</code></pre>

<h2 id="variable-naming">Variable Naming Rules</h2>
<p>JavaScript variable names must follow these rules:</p>
<ul>
  <li>Must begin with a letter, underscore (_), or dollar sign ($)</li>
  <li>Subsequent characters can be letters, digits, underscores, or dollar signs</li>
  <li>Names are case-sensitive</li>
  <li>Cannot use reserved keywords</li>
</ul>

<h2 id="best-practices">Best Practices</h2>
<p>Follow these best practices when working with variables:</p>
<ol>
  <li>Use descriptive names</li>
  <li>Use camelCase for variable names</li>
  <li>Declare variables at the top of their scope</li>
  <li>Initialize variables when declaring them</li>
  <li>Use const by default, let when you need to reassign, avoid var</li>
</ol>

<h2 id="conclusion">Conclusion</h2>
<p>Understanding variables is fundamental to JavaScript programming. Choose the right declaration keyword based on your needs, follow naming conventions, and write clean, readable code.</p>
`

// Computed properties
const currentReadingSpeedComputed = computed(() => {
  // Calculate based on scrolling behavior and time
  return currentReadingSpeed.value
})

// Methods
const loadChapter = async () => {
  isLoading.value = true
  
  try {
    // Get chapter data from data manager
    const chapterData = chapters.value[slug.value]
    if (chapterData) {
      chapter.value = chapterData
    } else {
      // Mock chapter data if not found
      chapter.value = {
        id: slug.value,
        title: 'JavaScript Variables and Constants',
        url: `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_Types#Variables`,
        category: 'JavaScript Basics',
        status: 'not_started',
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
      } as any
    }
  } catch (error) {
    console.error('Failed to load chapter:', error)
  } finally {
    isLoading.value = false
  }
}

const loadContent = async () => {
  isLoadingContent.value = true
  contentError.value = null
  
  try {
    // In a real app, this would fetch from MDN API
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate loading
    
    contentHtml.value = mockContent
    
    // Extract table of contents
    await nextTick()
    extractTableOfContents()
    
  } catch (error) {
    contentError.value = error instanceof Error ? error.message : 'Failed to load content'
  } finally {
    isLoadingContent.value = false
  }
}

const extractTableOfContents = () => {
  if (!articleContent.value) return
  
  const headings = articleContent.value.querySelectorAll('h1, h2, h3, h4, h5, h6')
  tableOfContents.value = Array.from(headings).map(heading => ({
    id: heading.id,
    text: heading.textContent || '',
    level: parseInt(heading.tagName.substring(1))
  }))
}

const setupScrollTracking = () => {
  const handleScroll = () => {
    if (!contentContainer.value || !articleContent.value) return
    
    const containerRect = contentContainer.value.getBoundingClientRect()
    const contentRect = articleContent.value.getBoundingClientRect()
    
    // Calculate scroll position
    scrollPosition.value = Math.max(0, -contentRect.top)
    
    // Calculate reading progress
    const contentHeight = articleContent.value.scrollHeight
    const visibleHeight = containerRect.height
    const scrollableHeight = contentHeight - visibleHeight
    
    if (scrollableHeight > 0) {
      readingProgress.value = Math.min(100, Math.max(0, (scrollPosition.value / scrollableHeight) * 100))
    }
    
    // Update active section
    updateActiveSection()
    
    // Update session progress
    if (currentSession.value) {
      updateSessionProgress({
        scrollPosition: scrollPosition.value,
        readingProgress: readingProgress.value
      })
      
      updateChapterProgress(slug.value, readingProgress.value)
    }
  }
  
  window.addEventListener('scroll', handleScroll, { passive: true })
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
}

const updateActiveSection = () => {
  if (!articleContent.value) return
  
  const headings = articleContent.value.querySelectorAll('h1, h2, h3, h4, h5, h6')
  let current = ''
  
  for (const heading of headings) {
    const rect = heading.getBoundingClientRect()
    if (rect.top <= 100) {
      current = heading.id
    } else {
      break
    }
  }
  
  activeSection.value = current
}

const initializeReadingProgress = () => {
  if (!chapter.value) return
  
  // Set initial scroll position if resuming
  if (chapter.value.lastScrollPosition > 0) {
    nextTick(() => {
      window.scrollTo({ top: chapter.value!.lastScrollPosition, behavior: 'smooth' })
    })
  }
  
  readingProgress.value = chapter.value.completionPercentage
}

// Session management
const pauseSession = async () => {
  await pauseCurrentSession()
}

const resumeSession = async () => {
  await resumeCurrentSession()
}

const completeSessionEarly = async () => {
  showSessionMenu.value = false
  await completeSession()
  router.push('/progress')
}

const cancelSession = async () => {
  showSessionMenu.value = false
  await interruptSession()
  router.push('/chapters')
}

const handleSessionStarted = (sessionId: string, mode: SessionMode) => {
  showSessionSelector.value = false
}

const handleModeSelected = (mode: SessionMode) => {
  // Optional: track mode selection
}

// Navigation
const goBack = () => {
  router.push('/chapters')
}

const goToNextChapter = () => {
  // In a real app, this would navigate to the next logical chapter
  router.push('/chapters')
}

// Content actions
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const toggleBookmark = () => {
  isBookmarked.value = !isBookmarked.value
  // In a real app, this would save the bookmark
}

const increaseFontSize = () => {
  if (fontSize.value < 24) {
    fontSize.value += 2
    updateFontSize()
  }
}

const decreaseFontSize = () => {
  if (fontSize.value > 14) {
    fontSize.value -= 2
    updateFontSize()
  }
}

const updateFontSize = () => {
  if (articleContent.value) {
    articleContent.value.style.fontSize = `${fontSize.value}px`
  }
}

const generateExercisesForChapter = async () => {
  if (!chapter.value) return
  
  isGeneratingExercises.value = true
  
  try {
    await generateExercises(chapter.value.id)
    router.push(`/exercises?chapter=${chapter.value.id}`)
  } catch (error) {
    console.error('Failed to generate exercises:', error)
  } finally {
    isGeneratingExercises.value = false
  }
}

// Utility functions
const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

// Lifecycle
onMounted(async () => {
  await loadChapter()
  await loadContent()
  
  nextTick(() => {
    setupScrollTracking()
    initializeReadingProgress()
    updateFontSize()
  })
})

// Watch for chapter changes
watch(() => slug.value, async () => {
  await loadChapter()
  await loadContent()
  
  nextTick(() => {
    initializeReadingProgress()
  })
})

// Close menus on outside click
const handleClickOutside = (event: MouseEvent) => {
  if (showSessionMenu.value && !(event.target as Element).closest('.session-controls')) {
    showSessionMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.reading-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.reading-header {
  background: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--secondary-color);
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.back-button:hover {
  background: var(--border-color);
}

.chapter-info {
  flex: 1;
  min-width: 0;
}

.chapter-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chapter-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-color);
  opacity: 0.7;
}

.chapter-category,
.chapter-difficulty {
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-weight: 500;
}

.chapter-category {
  background: rgba(0, 122, 204, 0.1);
  color: var(--primary-color);
}

.chapter-difficulty {
  background: rgba(40, 167, 69, 0.1);
  color: var(--success-color);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.session-controls {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--secondary-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.session-timer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.timer-icon {
  font-size: 1rem;
}

.timer-remaining {
  opacity: 0.7;
  font-weight: 400;
}

.session-button {
  padding: 0.25rem;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s ease;
  font-size: 0.875rem;
}

.session-button:hover {
  background: var(--border-color);
}

.session-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.session-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 110;
  min-width: 140px;
}

.dropdown-item {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s ease;
  color: var(--text-color);
}

.dropdown-item:hover {
  background: var(--secondary-color);
}

.dropdown-item--danger {
  color: var(--error-color);
}

.dropdown-item--danger:hover {
  background: var(--error-color);
  color: white;
}

.start-session-button {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.start-session-button:hover {
  background: #005a9e;
}

.progress-container {
  background: var(--secondary-color);
  padding: 0.75rem 2rem;
  border-bottom: 1px solid var(--border-color);
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: var(--text-color);
  opacity: 0.8;
}

.content-loading,
.content-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--text-color);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-button {
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

.retry-button:hover {
  background: #005a9e;
}

.reading-content {
  flex: 1;
  display: flex;
  max-width: 100%;
}

.content-wrapper {
  display: flex;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  gap: 2rem;
  padding: 2rem;
}

.table-of-contents {
  width: 250px;
  flex-shrink: 0;
  background: var(--secondary-color);
  border-radius: 8px;
  padding: 1rem;
  height: fit-content;
  position: sticky;
  top: 120px;
  transition: all 0.3s ease;
}

.toc-collapsed {
  width: auto;
}

.toc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.toc-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.toc-toggle {
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.toc-toggle:hover {
  background: var(--border-color);
}

.chevron {
  transition: transform 0.2s ease;
}

.toc-collapsed .chevron {
  transform: rotate(-90deg);
}

.toc-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.toc-item {
  margin-bottom: 0.25rem;
}

.toc-level-3 {
  margin-left: 1rem;
}

.toc-level-4 {
  margin-left: 2rem;
}

.toc-link {
  display: block;
  padding: 0.375rem 0.5rem;
  color: var(--text-color);
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  opacity: 0.8;
}

.toc-link:hover {
  background: var(--border-color);
  opacity: 1;
}

.toc-link--active {
  background: var(--primary-color);
  color: white;
  opacity: 1;
}

.article-content {
  flex: 1;
  min-width: 0;
  line-height: 1.7;
  color: var(--text-color);
}

.content-html {
  font-size: 16px;
  max-width: none;
}

.content-html h1,
.content-html h2,
.content-html h3,
.content-html h4,
.content-html h5,
.content-html h6 {
  font-weight: 600;
  margin: 2rem 0 1rem 0;
  color: var(--text-color);
}

.content-html h1 { font-size: 2rem; }
.content-html h2 { font-size: 1.5rem; }
.content-html h3 { font-size: 1.25rem; }

.content-html p {
  margin: 1rem 0;
}

.content-html ul,
.content-html ol {
  margin: 1rem 0;
  padding-left: 2rem;
}

.content-html li {
  margin: 0.5rem 0;
}

.content-html code {
  background: var(--secondary-color);
  padding: 0.125rem 0.25rem;
  border-radius: 3px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.875em;
}

.content-html pre {
  background: var(--secondary-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.content-html pre code {
  background: none;
  padding: 0;
}

.completion-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.completion-card {
  background: var(--secondary-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
}

.completion-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.completion-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 1rem 0;
}

.completion-text {
  color: var(--text-color);
  opacity: 0.8;
  margin: 0 0 2rem 0;
}

.completion-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.completion-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.completion-button--primary {
  background: var(--primary-color);
  color: white;
}

.completion-button--primary:hover:not(:disabled) {
  background: #005a9e;
}

.completion-button--secondary {
  background: var(--secondary-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.completion-button--secondary:hover {
  background: var(--border-color);
}

.completion-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reading-tools {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 50;
}

.tools-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.tool-button {
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--secondary-color);
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
}

.tool-button:hover:not(:disabled) {
  background: var(--border-color);
}

.tool-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tool-button--active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.font-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.font-size-display {
  font-size: 0.75rem;
  color: var(--text-color);
  opacity: 0.7;
}

.reading-speed {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-color);
  opacity: 0.7;
}

.speed-icon {
  font-size: 1rem;
}

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
  max-width: 800px;
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

/* Responsive design */
@media (max-width: 768px) {
  .reading-header {
    padding: 0.75rem 1rem;
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-left {
    width: 100%;
  }
  
  .chapter-title {
    font-size: 1.1rem;
    white-space: normal;
  }
  
  .chapter-meta {
    flex-wrap: wrap;
  }
  
  .progress-container {
    padding: 0.5rem 1rem;
  }
  
  .content-wrapper {
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
  }
  
  .table-of-contents {
    width: 100%;
    position: static;
  }
  
  .reading-tools {
    bottom: 1rem;
    right: 1rem;
    padding: 0.75rem;
  }
  
  .tools-container {
    flex-direction: row;
    gap: 0.5rem;
  }
  
  .font-controls {
    flex-direction: row;
  }
  
  .reading-speed {
    display: none;
  }
}

@media (max-width: 480px) {
  .completion-actions {
    flex-direction: column;
  }
  
  .tool-button {
    width: 36px;
    height: 36px;
  }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .reading-header {
    background: rgba(26, 26, 26, 0.95);
    backdrop-filter: blur(10px);
  }
  
  .reading-tools {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  .modal-overlay {
    background: rgba(0, 0, 0, 0.7);
  }
  
  .modal-content {
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }
}
</style>