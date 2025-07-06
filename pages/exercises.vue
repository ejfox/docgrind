<template>
  <div class="exercises-page">
    <!-- Page header -->
    <div class="page-header">
      <h1 class="page-title">Practice Exercises</h1>
      <p class="page-description">
        Test your knowledge with interactive coding exercises based on what you've read.
        Practice makes perfect!
      </p>
    </div>

    <!-- Filters and controls -->
    <div class="controls-section">
      <div class="filters-bar">
        <select 
          v-model="selectedChapter"
          class="filter-select"
          @change="loadExercises"
        >
          <option value="">All Chapters</option>
          <option v-for="chapter in chaptersWithExercises" :key="chapter.id" :value="chapter.id">
            {{ chapter.title }}
          </option>
        </select>

        <select 
          v-model="selectedType"
          class="filter-select"
          @change="applyFilters"
        >
          <option value="">All Types</option>
          <option value="multiple_choice">Multiple Choice</option>
          <option value="code_completion">Code Completion</option>
          <option value="debugging">Debugging</option>
          <option value="implementation">Implementation</option>
        </select>

        <select 
          v-model="selectedStatus"
          class="filter-select"
          @change="applyFilters"
        >
          <option value="">All Statuses</option>
          <option value="pending">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="skipped">Skipped</option>
        </select>

        <select 
          v-model="selectedDifficulty"
          class="filter-select"
          @change="applyFilters"
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <button 
          @click="resetFilters"
          class="reset-button"
          :disabled="!hasActiveFilters"
        >
          Reset Filters
        </button>
      </div>

      <div class="action-bar">
        <button 
          @click="generateNewExercises"
          class="generate-button"
          :disabled="!selectedChapter || isGenerating"
        >
          <span v-if="isGenerating">Generating...</span>
          <span v-else>Generate New Exercises</span>
        </button>
      </div>
    </div>

    <!-- Exercise stats -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-content">
          <div class="stat-value">{{ filteredExercises.length }}</div>
          <div class="stat-label">Total Exercises</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-value">{{ completedCount }}</div>
          <div class="stat-label">Completed</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-value">{{ successRate }}%</div>
          <div class="stat-label">Success Rate</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">⏱️</div>
        <div class="stat-content">
          <div class="stat-value">{{ averageTime }}m</div>
          <div class="stat-label">Avg. Time</div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading exercises...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Failed to Load Exercises</h3>
      <p>{{ error }}</p>
      <button @click="loadExercises" class="retry-button">
        Try Again
      </button>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredExercises.length === 0" class="empty-state">
      <div class="empty-icon">🎯</div>
      <h3>No Exercises Found</h3>
      <p v-if="hasActiveFilters">
        No exercises match your current filters. Try adjusting your search criteria.
      </p>
      <p v-else>
        No exercises available yet. Complete some chapters to generate exercises automatically,
        or create new ones manually.
      </p>
      <div class="empty-actions">
        <button v-if="hasActiveFilters" @click="resetFilters" class="empty-button">
          Clear Filters
        </button>
        <NuxtLink to="/chapters" class="empty-button empty-button--primary">
          Browse Chapters
        </NuxtLink>
      </div>
    </div>

    <!-- Exercises grid -->
    <div v-else class="exercises-grid">
      <div 
        v-for="exercise in filteredExercises" 
        :key="exercise.id"
        class="exercise-card"
        :class="getExerciseCardClasses(exercise)"
        @click="openExercise(exercise)"
      >
        <!-- Exercise header -->
        <div class="exercise-header">
          <div class="exercise-type">
            <span class="type-icon">{{ getTypeIcon(exercise.type) }}</span>
            <span class="type-label">{{ getTypeLabel(exercise.type) }}</span>
          </div>
          
          <div class="exercise-meta">
            <span class="exercise-difficulty" :class="`difficulty-${exercise.difficulty}`">
              {{ exercise.difficulty }}
            </span>
            <span class="exercise-status" :class="`status-${exercise.status}`">
              {{ getStatusLabel(exercise.status) }}
            </span>
          </div>
        </div>

        <!-- Exercise content -->
        <div class="exercise-content">
          <h3 class="exercise-title">{{ exercise.title }}</h3>
          <p class="exercise-description">{{ exercise.description }}</p>
          
          <div class="exercise-info">
            <div class="info-item">
              <span class="info-icon">📚</span>
              <span class="info-text">{{ getChapterTitle(exercise.chapterId) }}</span>
            </div>
            <div v-if="exercise.attempts.length > 0" class="info-item">
              <span class="info-icon">🔄</span>
              <span class="info-text">{{ exercise.attempts.length }} attempts</span>
            </div>
            <div v-if="exercise.timeSpent > 0" class="info-item">
              <span class="info-icon">⏱️</span>
              <span class="info-text">{{ exercise.timeSpent }}m spent</span>
            </div>
          </div>

          <!-- Progress for in-progress exercises -->
          <div v-if="exercise.status === 'in_progress'" class="exercise-progress">
            <div class="progress-info">
              <span class="progress-text">Last attempt: {{ getLastAttemptResult(exercise) }}</span>
              <span class="progress-date">{{ formatDate(getLastAttemptDate(exercise)) }}</span>
            </div>
          </div>
        </div>

        <!-- Exercise actions -->
        <div class="exercise-actions">
          <button 
            @click.stop="openExercise(exercise)"
            class="action-button action-button--primary"
          >
            <span v-if="exercise.status === 'pending'" class="button-text">Start Exercise</span>
            <span v-else-if="exercise.status === 'in_progress'" class="button-text">Continue</span>
            <span v-else-if="exercise.status === 'completed'" class="button-text">Review</span>
            <span v-else class="button-text">Retry</span>
          </button>
          
          <div class="secondary-actions">
            <button 
              @click.stop="showHints(exercise)"
              class="action-button action-button--secondary"
              :disabled="exercise.hints.length === 0"
              title="Show hints"
            >
              <span class="button-icon">💡</span>
            </button>
            
            <button 
              @click.stop="skipExercise(exercise)"
              class="action-button action-button--secondary"
              :disabled="exercise.status === 'completed'"
              title="Skip exercise"
            >
              <span class="button-icon">⏭️</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Exercise modal -->
    <div v-if="activeExercise" class="modal-overlay" @click="closeExercise">
      <div class="exercise-modal" @click.stop>
        <div class="modal-header">
          <div class="exercise-modal-info">
            <h2 class="modal-title">{{ activeExercise.title }}</h2>
            <div class="modal-meta">
              <span class="modal-type">{{ getTypeLabel(activeExercise.type) }}</span>
              <span class="modal-difficulty">{{ activeExercise.difficulty }}</span>
            </div>
          </div>
          
          <button @click="closeExercise" class="close-button" aria-label="Close exercise">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="exercise-prompt">
            <h3>Instructions</h3>
            <div class="prompt-content" v-html="activeExercise.prompt"></div>
          </div>
          
          <!-- Code editor for coding exercises -->
          <div v-if="isCodeExercise(activeExercise.type)" class="code-section">
            <h3>Your Solution</h3>
            <div class="code-editor">
              <textarea 
                v-model="userCode"
                class="code-textarea"
                placeholder="Write your code here..."
                spellcheck="false"
                @input="handleCodeChange"
              ></textarea>
            </div>
            
            <div class="code-actions">
              <button 
                @click="runCode"
                class="code-button code-button--run"
                :disabled="isRunning"
              >
                <span v-if="isRunning">Running...</span>
                <span v-else>Run Code</span>
              </button>
              
              <button 
                @click="submitSolution"
                class="code-button code-button--submit"
                :disabled="isSubmitting || !userCode.trim()"
              >
                <span v-if="isSubmitting">Submitting...</span>
                <span v-else>Submit Solution</span>
              </button>
            </div>
            
            <!-- Output section -->
            <div v-if="codeOutput" class="output-section">
              <h4>Output</h4>
              <pre class="output-content" :class="{ 'output-error': hasCodeError }">{{ codeOutput }}</pre>
            </div>
          </div>
          
          <!-- Multiple choice for MC exercises -->
          <div v-else-if="activeExercise.type === 'multiple_choice'" class="multiple-choice-section">
            <h3>Choose the correct answer</h3>
            <div class="choices-list">
              <label 
                v-for="(choice, index) in mockChoices" 
                :key="index"
                class="choice-item"
                :class="{ 'choice-selected': selectedChoice === index }"
              >
                <input 
                  type="radio" 
                  :value="index"
                  v-model="selectedChoice"
                  class="choice-radio"
                >
                <span class="choice-text">{{ choice }}</span>
              </label>
            </div>
            
            <div class="choice-actions">
              <button 
                @click="submitChoice"
                class="code-button code-button--submit"
                :disabled="selectedChoice === null || isSubmitting"
              >
                <span v-if="isSubmitting">Submitting...</span>
                <span v-else>Submit Answer</span>
              </button>
            </div>
          </div>
          
          <!-- Hints section -->
          <div v-if="showingHints" class="hints-section">
            <h3>Hints</h3>
            <div class="hints-list">
              <div 
                v-for="(hint, index) in visibleHints" 
                :key="index"
                class="hint-item"
              >
                <div class="hint-icon">💡</div>
                <div class="hint-text">{{ hint }}</div>
              </div>
            </div>
            
            <button 
              v-if="visibleHints.length < activeExercise.hints.length"
              @click="showMoreHints"
              class="show-more-hints-button"
            >
              Show Next Hint ({{ visibleHints.length }}/{{ activeExercise.hints.length }})
            </button>
          </div>
          
          <!-- Attempt history -->
          <div v-if="activeExercise.attempts.length > 0" class="attempts-section">
            <h3>Previous Attempts</h3>
            <div class="attempts-list">
              <div 
                v-for="(attempt, index) in activeExercise.attempts.slice().reverse()" 
                :key="attempt.id"
                class="attempt-item"
                :class="{ 'attempt-correct': attempt.isCorrect, 'attempt-incorrect': !attempt.isCorrect }"
              >
                <div class="attempt-header">
                  <span class="attempt-number">Attempt {{ activeExercise.attempts.length - index }}</span>
                  <span class="attempt-result">{{ attempt.isCorrect ? '✅ Correct' : '❌ Incorrect' }}</span>
                  <span class="attempt-date">{{ formatDate(attempt.timestamp) }}</span>
                </div>
                
                <div v-if="attempt.errorMessage" class="attempt-error">
                  {{ attempt.errorMessage }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hints modal -->
    <div v-if="hintsModalExercise" class="modal-overlay" @click="closeHintsModal">
      <div class="hints-modal" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Hints for {{ hintsModalExercise.title }}</h2>
          <button @click="closeHintsModal" class="close-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="hints-list">
            <div 
              v-for="(hint, index) in hintsModalExercise.hints" 
              :key="index"
              class="hint-item"
            >
              <div class="hint-icon">💡</div>
              <div class="hint-text">{{ hint }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDataManager } from '~/composables/useDataManager'
import { ExerciseType, ExerciseStatus } from '~/types/schema'
import type { ExerciseProgress, ChapterProgress } from '~/types/schema'

// Page meta
definePageMeta({
  title: 'Exercises - DocGrind',
  description: 'Test your knowledge with interactive coding exercises based on what you\'ve read.'
})

// Route
const route = useRoute()

// Data manager
const { 
  exercises,
  chapters,
  generateExercises,
  submitExerciseAttempt,
  useExerciseHint
} = useDataManager()

// Local state
const selectedChapter = ref(route.query.chapter as string || '')
const selectedType = ref('')
const selectedStatus = ref('')
const selectedDifficulty = ref('')
const isLoading = ref(false)
const isGenerating = ref(false)
const error = ref<string | null>(null)
const allExercises = ref<ExerciseProgress[]>([])

// Active exercise modal
const activeExercise = ref<ExerciseProgress | null>(null)
const userCode = ref('')
const selectedChoice = ref<number | null>(null)
const codeOutput = ref('')
const hasCodeError = ref(false)
const isRunning = ref(false)
const isSubmitting = ref(false)

// Hints
const hintsModalExercise = ref<ExerciseProgress | null>(null)
const showingHints = ref(false)
const visibleHints = ref<string[]>([])

// Mock data
const mockChoices = [
  'Variables declared with var are function-scoped',
  'Variables declared with let are block-scoped',
  'Variables declared with const are immutable',
  'All of the above'
]

const mockExercises: ExerciseProgress[] = [
  {
    id: 'ex-1',
    chapterId: 'js-variables',
    type: ExerciseType.MULTIPLE_CHOICE,
    title: 'Variable Declaration Quiz',
    description: 'Test your understanding of variable declaration in JavaScript',
    prompt: 'Which of the following statements about JavaScript variables is correct?',
    hints: [
      'Think about the scope of different variable declarations',
      'Consider what happens when you try to reassign a const variable',
      'Remember that let and const are block-scoped'
    ],
    difficulty: 'easy',
    status: ExerciseStatus.COMPLETED,
    attempts: [
      {
        id: 'att-1',
        timestamp: '2024-01-20T10:30:00Z',
        code: '3', // Selected choice index
        output: 'Correct! All statements are true.',
        isCorrect: true,
        timeSpent: 2
      }
    ],
    userCode: '3',
    isCorrect: true,
    createdAt: '2024-01-19T09:00:00Z',
    firstAttemptAt: '2024-01-20T10:30:00Z',
    completedAt: '2024-01-20T10:30:00Z',
    timeSpent: 2,
    hintsUsed: 0
  },
  {
    id: 'ex-2',
    chapterId: 'js-variables',
    type: ExerciseType.CODE_COMPLETION,
    title: 'Variable Assignment',
    description: 'Complete the code to properly declare and assign variables',
    prompt: `Complete the following code to declare a constant for PI and a variable for radius:

<pre><code>// Declare a constant for PI with value 3.14159
_____ PI = 3.14159;

// Declare a variable for radius that can be changed
_____ radius = 5;

// Calculate area (this is already complete)
const area = PI * radius * radius;</code></pre>`,
    hints: [
      'Use const for values that never change',
      'Use let for variables that might be reassigned',
      'const declarations must be initialized'
    ],
    difficulty: 'easy',
    status: ExerciseStatus.IN_PROGRESS,
    attempts: [
      {
        id: 'att-2',
        timestamp: '2024-01-21T14:20:00Z',
        code: 'var PI = 3.14159;\nvar radius = 5;',
        output: 'Incorrect: Use const for PI and let for radius',
        isCorrect: false,
        timeSpent: 3,
        errorMessage: 'Consider using more appropriate variable declarations'
      }
    ],
    userCode: 'var PI = 3.14159;\nvar radius = 5;',
    isCorrect: false,
    createdAt: '2024-01-19T09:00:00Z',
    firstAttemptAt: '2024-01-21T14:20:00Z',
    completedAt: null,
    timeSpent: 3,
    hintsUsed: 1
  },
  {
    id: 'ex-3',
    chapterId: 'js-functions',
    type: ExerciseType.IMPLEMENTATION,
    title: 'Create a Greeting Function',
    description: 'Write a function that creates personalized greetings',
    prompt: `Create a function called \`greet\` that takes a name parameter and returns a greeting message.

Requirements:
- Function should take one parameter: name
- Return a string in the format: "Hello, [name]! Welcome to JavaScript."
- Handle the case where no name is provided (use "Guest" as default)

Example:
- greet("Alice") should return "Hello, Alice! Welcome to JavaScript."
- greet() should return "Hello, Guest! Welcome to JavaScript."`,
    hints: [
      'You can provide default parameter values using = in the function definition',
      'Use template literals (backticks) for string interpolation',
      'Remember to use the return keyword'
    ],
    difficulty: 'medium',
    status: ExerciseStatus.PENDING,
    attempts: [],
    userCode: '',
    isCorrect: false,
    createdAt: '2024-01-21T09:00:00Z',
    firstAttemptAt: null,
    completedAt: null,
    timeSpent: 0,
    hintsUsed: 0
  },
  {
    id: 'ex-4',
    chapterId: 'js-functions',
    type: ExerciseType.DEBUGGING,
    title: 'Fix the Broken Function',
    description: 'Debug and fix the issues in this function',
    prompt: `The following function is supposed to calculate the area of a rectangle, but it has several bugs. Fix all the issues:

<pre><code>function calculateArea(length width) {
  if (length <= 0 || width <= 0) {
    return "Invalid dimensions";
  }
  
  const area = length * width
  return area;
}</code></pre>

The function should:
1. Take two parameters: length and width
2. Return an error message for invalid (non-positive) dimensions
3. Calculate and return the area for valid dimensions`,
    hints: [
      'Check the function parameter syntax',
      'Look for missing punctuation',
      'Make sure all statements end properly'
    ],
    difficulty: 'medium',
    status: ExerciseStatus.PENDING,
    attempts: [],
    userCode: '',
    isCorrect: false,
    createdAt: '2024-01-21T09:00:00Z',
    firstAttemptAt: null,
    completedAt: null,
    timeSpent: 0,
    hintsUsed: 0
  }
]

// Computed properties
const chaptersWithExercises = computed(() => {
  const chapterIds = new Set(allExercises.value.map(ex => ex.chapterId))
  return Object.values(chapters.value).filter(ch => chapterIds.has(ch.id))
})

const filteredExercises = computed(() => {
  let filtered = [...allExercises.value]
  
  if (selectedChapter.value) {
    filtered = filtered.filter(ex => ex.chapterId === selectedChapter.value)
  }
  
  if (selectedType.value) {
    filtered = filtered.filter(ex => ex.type === selectedType.value)
  }
  
  if (selectedStatus.value) {
    filtered = filtered.filter(ex => ex.status === selectedStatus.value)
  }
  
  if (selectedDifficulty.value) {
    filtered = filtered.filter(ex => ex.difficulty === selectedDifficulty.value)
  }
  
  // Sort by status (pending first, then in progress, then completed)
  filtered.sort((a, b) => {
    const statusOrder = { 'pending': 0, 'in_progress': 1, 'completed': 2, 'skipped': 3 }
    if (a.status !== b.status) {
      return statusOrder[a.status] - statusOrder[b.status]
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
  
  return filtered
})

const hasActiveFilters = computed(() => {
  return !!(selectedChapter.value || selectedType.value || selectedStatus.value || selectedDifficulty.value)
})

const completedCount = computed(() => {
  return filteredExercises.value.filter(ex => ex.status === ExerciseStatus.COMPLETED).length
})

const successRate = computed(() => {
  const completed = filteredExercises.value.filter(ex => ex.status === ExerciseStatus.COMPLETED)
  if (completed.length === 0) return 0
  
  const successful = completed.filter(ex => ex.isCorrect)
  return Math.round((successful.length / completed.length) * 100)
})

const averageTime = computed(() => {
  const withTime = filteredExercises.value.filter(ex => ex.timeSpent > 0)
  if (withTime.length === 0) return 0
  
  const totalTime = withTime.reduce((sum, ex) => sum + ex.timeSpent, 0)
  return Math.round(totalTime / withTime.length)
})

// Methods
const loadExercises = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    // In a real app, this would load from the data manager
    // For now, use mock data
    allExercises.value = mockExercises
    
    // Merge with any exercises from data manager
    const dataManagerExercises = Object.values(exercises.value)
    allExercises.value = [...allExercises.value, ...dataManagerExercises]
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load exercises'
  } finally {
    isLoading.value = false
  }
}

const applyFilters = () => {
  // Filters are reactive through computed property
}

const resetFilters = () => {
  selectedChapter.value = ''
  selectedType.value = ''
  selectedStatus.value = ''
  selectedDifficulty.value = ''
}

const generateNewExercises = async () => {
  if (!selectedChapter.value) return
  
  isGenerating.value = true
  
  try {
    await generateExercises(selectedChapter.value)
    await loadExercises()
  } catch (error) {
    console.error('Failed to generate exercises:', error)
  } finally {
    isGenerating.value = false
  }
}

const openExercise = (exercise: ExerciseProgress) => {
  activeExercise.value = exercise
  userCode.value = exercise.userCode || ''
  selectedChoice.value = null
  codeOutput.value = ''
  hasCodeError.value = false
  showingHints.value = false
  visibleHints.value = []
  
  // For multiple choice, restore previous selection
  if (exercise.type === ExerciseType.MULTIPLE_CHOICE && exercise.userCode) {
    selectedChoice.value = parseInt(exercise.userCode)
  }
}

const closeExercise = () => {
  activeExercise.value = null
  userCode.value = ''
  selectedChoice.value = null
  codeOutput.value = ''
}

const showHints = (exercise: ExerciseProgress) => {
  hintsModalExercise.value = exercise
}

const closeHintsModal = () => {
  hintsModalExercise.value = null
}

const showMoreHints = () => {
  if (activeExercise.value && visibleHints.value.length < activeExercise.value.hints.length) {
    const nextHint = activeExercise.value.hints[visibleHints.value.length]
    visibleHints.value.push(nextHint)
    
    // Track hint usage
    if (activeExercise.value) {
      useExerciseHint(activeExercise.value.id)
    }
  }
}

const skipExercise = async (exercise: ExerciseProgress) => {
  // In a real app, this would update the exercise status
  exercise.status = ExerciseStatus.SKIPPED
}

const isCodeExercise = (type: ExerciseType): boolean => {
  return [
    ExerciseType.CODE_COMPLETION,
    ExerciseType.DEBUGGING,
    ExerciseType.IMPLEMENTATION
  ].includes(type)
}

const handleCodeChange = () => {
  codeOutput.value = ''
  hasCodeError.value = false
}

const runCode = async () => {
  if (!userCode.value.trim()) return
  
  isRunning.value = true
  hasCodeError.value = false
  
  try {
    // Simulate code execution
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock code execution result
    if (userCode.value.includes('console.log')) {
      codeOutput.value = 'Code executed successfully!'
    } else if (userCode.value.includes('error')) {
      hasCodeError.value = true
      codeOutput.value = 'Error: Syntax error in your code'
    } else {
      codeOutput.value = 'Code compiled successfully. Click Submit to check your solution.'
    }
  } catch (error) {
    hasCodeError.value = true
    codeOutput.value = 'Error: Failed to run code'
  } finally {
    isRunning.value = false
  }
}

const submitSolution = async () => {
  if (!activeExercise.value) return
  
  isSubmitting.value = true
  
  try {
    // Mock solution checking
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    let isCorrect = false
    let output = ''
    let errorMessage = ''
    
    // Simple mock checking logic
    if (activeExercise.value.type === ExerciseType.CODE_COMPLETION) {
      isCorrect = userCode.value.includes('const') && userCode.value.includes('let')
      output = isCorrect ? 'Correct! Good use of const and let.' : 'Incorrect: Check your variable declarations.'
      if (!isCorrect) {
        errorMessage = 'Make sure to use const for PI and let for radius'
      }
    } else {
      isCorrect = userCode.value.trim().length > 20 // Simple check
      output = isCorrect ? 'Solution looks good!' : 'Solution needs more work.'
    }
    
    // Submit attempt
    await submitExerciseAttempt(
      activeExercise.value.id,
      userCode.value,
      isCorrect,
      output,
      errorMessage
    )
    
    // Update local state
    activeExercise.value.userCode = userCode.value
    activeExercise.value.isCorrect = isCorrect
    activeExercise.value.status = isCorrect ? ExerciseStatus.COMPLETED : ExerciseStatus.IN_PROGRESS
    
    codeOutput.value = output
    hasCodeError.value = !isCorrect
    
    if (isCorrect) {
      setTimeout(() => {
        closeExercise()
        loadExercises()
      }, 2000)
    }
    
  } catch (error) {
    console.error('Failed to submit solution:', error)
    codeOutput.value = 'Error: Failed to submit solution'
    hasCodeError.value = true
  } finally {
    isSubmitting.value = false
  }
}

const submitChoice = async () => {
  if (!activeExercise.value || selectedChoice.value === null) return
  
  isSubmitting.value = true
  
  try {
    // Mock choice checking
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const isCorrect = selectedChoice.value === 3 // "All of the above" is correct
    const output = isCorrect ? 'Correct! All statements about JavaScript variables are true.' : 'Incorrect. Try again.'
    
    // Submit attempt
    await submitExerciseAttempt(
      activeExercise.value.id,
      selectedChoice.value.toString(),
      isCorrect,
      output
    )
    
    // Update local state
    activeExercise.value.userCode = selectedChoice.value.toString()
    activeExercise.value.isCorrect = isCorrect
    activeExercise.value.status = isCorrect ? ExerciseStatus.COMPLETED : ExerciseStatus.IN_PROGRESS
    
    if (isCorrect) {
      setTimeout(() => {
        closeExercise()
        loadExercises()
      }, 2000)
    }
    
  } catch (error) {
    console.error('Failed to submit choice:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Utility functions
const getExerciseCardClasses = (exercise: ExerciseProgress): string[] => {
  const classes = []
  
  if (exercise.status === ExerciseStatus.COMPLETED) {
    classes.push('exercise-card--completed')
  } else if (exercise.status === ExerciseStatus.IN_PROGRESS) {
    classes.push('exercise-card--in-progress')
  }
  
  return classes
}

const getTypeIcon = (type: ExerciseType): string => {
  switch (type) {
    case ExerciseType.MULTIPLE_CHOICE: return '📝'
    case ExerciseType.CODE_COMPLETION: return '⌨️'
    case ExerciseType.DEBUGGING: return '🐛'
    case ExerciseType.IMPLEMENTATION: return '💻'
    default: return '❓'
  }
}

const getTypeLabel = (type: ExerciseType): string => {
  switch (type) {
    case ExerciseType.MULTIPLE_CHOICE: return 'Multiple Choice'
    case ExerciseType.CODE_COMPLETION: return 'Code Completion'
    case ExerciseType.DEBUGGING: return 'Debugging'
    case ExerciseType.IMPLEMENTATION: return 'Implementation'
    default: return 'Unknown'
  }
}

const getStatusLabel = (status: ExerciseStatus): string => {
  switch (status) {
    case ExerciseStatus.PENDING: return 'Not Started'
    case ExerciseStatus.IN_PROGRESS: return 'In Progress'
    case ExerciseStatus.COMPLETED: return 'Completed'
    case ExerciseStatus.SKIPPED: return 'Skipped'
    default: return 'Unknown'
  }
}

const getChapterTitle = (chapterId: string): string => {
  return chapters.value[chapterId]?.title || 'Unknown Chapter'
}

const getLastAttemptResult = (exercise: ExerciseProgress): string => {
  if (exercise.attempts.length === 0) return 'No attempts yet'
  
  const lastAttempt = exercise.attempts[exercise.attempts.length - 1]
  return lastAttempt.isCorrect ? 'Correct' : 'Incorrect'
}

const getLastAttemptDate = (exercise: ExerciseProgress): string => {
  if (exercise.attempts.length === 0) return ''
  
  return exercise.attempts[exercise.attempts.length - 1].timestamp
}

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString()
}

// Lifecycle
onMounted(() => {
  loadExercises()
})
</script>

<style scoped>
.exercises-page {
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

.controls-section {
  margin-bottom: 2rem;
}

.filters-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
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

.reset-button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--secondary-color);
  color: var(--text-color);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-button:hover:not(:disabled) {
  background: var(--border-color);
}

.reset-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-bar {
  display: flex;
  justify-content: center;
}

.generate-button {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.generate-button:hover:not(:disabled) {
  background: #005a9e;
}

.generate-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-color);
  opacity: 0.7;
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

.empty-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}

.empty-button {
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--secondary-color);
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.empty-button:hover {
  background: var(--border-color);
}

.empty-button--primary {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.empty-button--primary:hover {
  background: #005a9e;
}

.exercises-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.exercise-card {
  background: var(--bg-color);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.exercise-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

.exercise-card--completed {
  border-color: var(--success-color);
  background: rgba(40, 167, 69, 0.02);
}

.exercise-card--in-progress {
  border-color: var(--primary-color);
  background: rgba(0, 122, 204, 0.02);
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.exercise-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.type-icon {
  font-size: 1.25rem;
}

.type-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-color);
}

.exercise-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.exercise-difficulty,
.exercise-status {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  text-transform: capitalize;
}

.difficulty-easy {
  background: rgba(40, 167, 69, 0.1);
  color: var(--success-color);
}

.difficulty-medium {
  background: rgba(255, 193, 7, 0.1);
  color: var(--warning-color);
}

.difficulty-hard {
  background: rgba(220, 53, 69, 0.1);
  color: var(--error-color);
}

.status-pending {
  background: rgba(108, 117, 125, 0.1);
  color: #6c757d;
}

.status-in_progress {
  background: rgba(0, 122, 204, 0.1);
  color: var(--primary-color);
}

.status-completed {
  background: rgba(40, 167, 69, 0.1);
  color: var(--success-color);
}

.status-skipped {
  background: rgba(108, 117, 125, 0.1);
  color: #6c757d;
}

.exercise-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.exercise-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
  line-height: 1.4;
}

.exercise-description {
  color: var(--text-color);
  opacity: 0.8;
  margin: 0;
  line-height: 1.5;
}

.exercise-info {
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

.exercise-progress {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
}

.progress-text {
  color: var(--text-color);
  font-weight: 500;
}

.progress-date {
  color: var(--text-color);
  opacity: 0.6;
}

.exercise-actions {
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

.action-button--primary:hover {
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
  overflow-y: auto;
}

.exercise-modal,
.hints-modal {
  background: var(--bg-color);
  border-radius: 12px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  margin: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  gap: 1rem;
}

.exercise-modal-info {
  flex: 1;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 0.5rem 0;
}

.modal-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
}

.modal-type,
.modal-difficulty {
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-weight: 500;
}

.modal-type {
  background: rgba(0, 122, 204, 0.1);
  color: var(--primary-color);
}

.modal-difficulty {
  background: rgba(40, 167, 69, 0.1);
  color: var(--success-color);
}

.close-button {
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.2s ease;
  flex-shrink: 0;
}

.close-button:hover {
  background: var(--secondary-color);
}

.modal-body {
  padding: 1.5rem;
}

.modal-body h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 1rem 0;
}

.exercise-prompt {
  margin-bottom: 2rem;
}

.prompt-content {
  color: var(--text-color);
  line-height: 1.6;
}

.prompt-content pre {
  background: var(--secondary-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 1rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.code-section {
  margin-bottom: 2rem;
}

.code-editor {
  margin-bottom: 1rem;
}

.code-textarea {
  width: 100%;
  min-height: 200px;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--secondary-color);
  color: var(--text-color);
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: vertical;
}

.code-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
}

.code-actions {
  display: flex;
  gap: 1rem;
}

.code-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.code-button--run {
  background: var(--secondary-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.code-button--run:hover:not(:disabled) {
  background: var(--border-color);
}

.code-button--submit {
  background: var(--primary-color);
  color: white;
}

.code-button--submit:hover:not(:disabled) {
  background: #005a9e;
}

.code-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.output-section {
  margin-top: 1rem;
}

.output-section h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 0.5rem 0;
}

.output-content {
  background: var(--secondary-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 1rem;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.875rem;
  white-space: pre-wrap;
  margin: 0;
}

.output-error {
  border-color: var(--error-color);
  background: rgba(220, 53, 69, 0.05);
  color: var(--error-color);
}

.multiple-choice-section {
  margin-bottom: 2rem;
}

.choices-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.choice-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.choice-item:hover {
  background: var(--secondary-color);
}

.choice-selected {
  border-color: var(--primary-color);
  background: rgba(0, 122, 204, 0.05);
}

.choice-radio {
  margin: 0;
  accent-color: var(--primary-color);
}

.choice-text {
  flex: 1;
  color: var(--text-color);
}

.choice-actions {
  display: flex;
  justify-content: center;
}

.hints-section {
  margin-bottom: 2rem;
}

.hints-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.hint-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--secondary-color);
  border-radius: 6px;
}

.hint-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.hint-text {
  flex: 1;
  color: var(--text-color);
  line-height: 1.5;
}

.show-more-hints-button {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.show-more-hints-button:hover {
  background: #005a9e;
}

.attempts-section h3 {
  margin-bottom: 1rem;
}

.attempts-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.attempt-item {
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 1rem;
}

.attempt-correct {
  border-color: var(--success-color);
  background: rgba(40, 167, 69, 0.02);
}

.attempt-incorrect {
  border-color: var(--error-color);
  background: rgba(220, 53, 69, 0.02);
}

.attempt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.attempt-number {
  font-weight: 500;
  color: var(--text-color);
}

.attempt-result {
  font-size: 0.875rem;
  font-weight: 500;
}

.attempt-date {
  font-size: 0.75rem;
  color: var(--text-color);
  opacity: 0.7;
}

.attempt-error {
  font-size: 0.875rem;
  color: var(--error-color);
  font-style: italic;
}

/* Responsive design */
@media (max-width: 768px) {
  .exercises-page {
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
  
  .stats-overview {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }
  
  .exercises-grid {
    grid-template-columns: 1fr;
  }
  
  .exercise-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .secondary-actions {
    justify-content: center;
  }
  
  .exercise-modal,
  .hints-modal {
    margin: 0.5rem;
    max-height: 95vh;
  }
  
  .code-actions {
    flex-direction: column;
  }
  
  .empty-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .exercise-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .exercise-meta {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  
  .attempt-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .modal-overlay {
    background: rgba(0, 0, 0, 0.7);
  }
  
  .exercise-modal,
  .hints-modal {
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }
}
</style>