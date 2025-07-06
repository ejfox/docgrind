<template>
  <div class="session-selector" role="group" aria-labelledby="session-selector-title">
    <div class="selector-header">
      <h2 id="session-selector-title" class="selector-title">
        Choose Your Session Mode
      </h2>
      <p class="selector-description">
        Select how long you want to read. Each mode is designed for different focus levels and time commitments.
      </p>
    </div>

    <div class="session-modes">
      <div 
        v-for="mode in sessionModes" 
        :key="mode.id"
        class="session-mode"
        :class="{ 
          'session-mode--selected': selectedMode === mode.id,
          'session-mode--recommended': mode.recommended
        }"
        @click="selectMode(mode.id)"
        @keydown.enter="selectMode(mode.id)"
        @keydown.space.prevent="selectMode(mode.id)"
        tabindex="0"
        role="button"
        :aria-pressed="selectedMode === mode.id"
        :aria-describedby="`${mode.id}-description`"
      >
        <div class="mode-header">
          <div class="mode-icon">{{ mode.icon }}</div>
          <div class="mode-info">
            <h3 class="mode-title">
              {{ mode.title }}
              <span v-if="mode.recommended" class="recommended-badge">Recommended</span>
            </h3>
            <p class="mode-duration">{{ mode.duration }}</p>
          </div>
        </div>
        
        <p :id="`${mode.id}-description`" class="mode-description">
          {{ mode.description }}
        </p>
        
        <div class="mode-stats">
          <div class="stat">
            <span class="stat-label">Avg. words:</span>
            <span class="stat-value">{{ mode.avgWords }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Focus level:</span>
            <div class="focus-indicator">
              <div 
                v-for="i in 5" 
                :key="i"
                class="focus-dot"
                :class="{ 'focus-dot--active': i <= mode.focusLevel }"
              ></div>
            </div>
          </div>
        </div>
        
        <div class="mode-benefits">
          <h4 class="benefits-title">Perfect for:</h4>
          <ul class="benefits-list">
            <li v-for="benefit in mode.benefits" :key="benefit">{{ benefit }}</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="selector-actions">
      <button 
        @click="startSession"
        :disabled="!selectedMode || isLoading"
        class="start-button"
        :class="{ 'start-button--loading': isLoading }"
        aria-describedby="start-session-help"
      >
        <span v-if="isLoading" class="loading-spinner"></span>
        <span class="button-text">
          {{ isLoading ? 'Starting...' : 'Start Session' }}
        </span>
        <span class="button-icon">🚀</span>
      </button>
      
      <p id="start-session-help" class="help-text">
        {{ selectedMode ? `Ready to start a ${getSelectedModeTitle()} session!` : 'Select a session mode to continue' }}
      </p>
    </div>

    <!-- Session mode preferences -->
    <div class="preferences-section">
      <details class="preferences-toggle">
        <summary class="preferences-summary">
          <span>Advanced Options</span>
          <svg class="chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </summary>
        
        <div class="preferences-content">
          <div class="preference-item">
            <label class="preference-label">
              <input 
                type="checkbox" 
                v-model="preferences.autoAdvance"
                class="preference-checkbox"
              >
              <span class="preference-text">Auto-advance to next chapter when current is complete</span>
            </label>
          </div>
          
          <div class="preference-item">
            <label class="preference-label">
              <input 
                type="checkbox" 
                v-model="preferences.pauseOnBlur"
                class="preference-checkbox"
              >
              <span class="preference-text">Auto-pause when window loses focus</span>
            </label>
          </div>
          
          <div class="preference-item">
            <label class="preference-label">
              <input 
                type="checkbox" 
                v-model="preferences.generateExercises"
                class="preference-checkbox"
              >
              <span class="preference-text">Generate exercises after completing chapters</span>
            </label>
          </div>
          
          <div class="preference-item">
            <label class="preference-label" for="reading-speed">
              Reading speed (words per minute)
            </label>
            <input 
              id="reading-speed"
              type="range" 
              v-model="preferences.readingSpeed"
              min="100"
              max="400"
              step="25"
              class="preference-slider"
            >
            <span class="preference-value">{{ preferences.readingSpeed }} WPM</span>
          </div>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { SessionMode } from '~/types/schema'
import { useDataManager } from '~/composables/useDataManager'

// Props
interface Props {
  chapterId?: string
  autoStart?: boolean
  showPreferences?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoStart: false,
  showPreferences: true
})

// Emits
const emit = defineEmits<{
  sessionStarted: [sessionId: string, mode: SessionMode]
  modeSelected: [mode: SessionMode]
}>()

// Data manager
const { startSession: startDataSession, updateSettings, settings } = useDataManager()

// Local state
const selectedMode = ref<SessionMode | null>(null)
const isLoading = ref(false)
const preferences = ref({
  autoAdvance: true,
  pauseOnBlur: true,
  generateExercises: true,
  readingSpeed: 200
})

// Session modes configuration
const sessionModes = ref([
  {
    id: SessionMode.FIVE_MIN,
    title: '5 Minute Sprint',
    duration: '5 minutes',
    icon: '⚡',
    description: 'Quick focused reading session. Perfect for busy schedules and building consistency.',
    avgWords: '400-600',
    focusLevel: 5,
    recommended: false,
    benefits: [
      'Building daily reading habits',
      'Quick knowledge refreshers',
      'Fitting learning into busy schedules',
      'High-intensity focused reading'
    ]
  },
  {
    id: SessionMode.FIFTEEN_MIN,
    title: '15 Minute Focus',
    duration: '15 minutes',
    icon: '🎯',
    description: 'Balanced session for steady progress. Ideal for most learners to maintain engagement.',
    avgWords: '1,200-1,800',
    focusLevel: 4,
    recommended: true,
    benefits: [
      'Steady consistent progress',
      'Balanced depth and breadth',
      'Sustainable daily practice',
      'Optimal retention window'
    ]
  },
  {
    id: SessionMode.JOY,
    title: 'Joy Mode',
    duration: '1 hour',
    icon: '🌟',
    description: 'Extended deep-dive session. For when you\'re in the zone and want to really understand.',
    avgWords: '4,800-7,200',
    focusLevel: 3,
    recommended: false,
    benefits: [
      'Deep understanding of topics',
      'Connecting complex concepts',
      'Immersive learning experience',
      'Comprehensive chapter coverage'
    ]
  },
  {
    id: SessionMode.ZEN,
    title: 'Zen Mode',
    duration: 'Unlimited',
    icon: '🧘',
    description: 'No time pressure. Read at your own pace until you naturally want to stop.',
    avgWords: 'Unlimited',
    focusLevel: 2,
    recommended: false,
    benefits: [
      'No time pressure or stress',
      'Natural reading rhythm',
      'Exploration and discovery',
      'Flexible learning pace'
    ]
  }
])

// Computed
const getSelectedModeTitle = () => {
  return sessionModes.value.find(mode => mode.id === selectedMode.value)?.title || ''
}

// Methods
const selectMode = (mode: SessionMode) => {
  selectedMode.value = mode
  emit('modeSelected', mode)
}

const startSession = async () => {
  if (!selectedMode.value || !props.chapterId) return
  
  isLoading.value = true
  
  try {
    // Update preferences if they changed
    await updateUserPreferences()
    
    // Start the session
    const session = await startDataSession(props.chapterId, selectedMode.value)
    
    emit('sessionStarted', session.id, selectedMode.value)
    
    // Navigate to reading page
    await navigateTo(`/read/${props.chapterId}`)
    
  } catch (error) {
    console.error('Failed to start session:', error)
    // You might want to show an error message here
  } finally {
    isLoading.value = false
  }
}

const updateUserPreferences = async () => {
  if (!settings.value) return
  
  const newSettings = {
    reading: {
      ...settings.value.reading,
      autoAdvanceChapters: preferences.value.autoAdvance,
      pauseOnFocusLoss: preferences.value.pauseOnBlur,
      estimatedWPM: preferences.value.readingSpeed
    },
    exercises: {
      ...settings.value.exercises,
      autoGenerateOnComplete: preferences.value.generateExercises
    }
  }
  
  await updateSettings(newSettings)
}

// Initialize preferences from settings
const initializePreferences = () => {
  if (settings.value) {
    preferences.value = {
      autoAdvance: settings.value.reading.autoAdvanceChapters,
      pauseOnBlur: settings.value.reading.pauseOnFocusLoss,
      generateExercises: settings.value.exercises.autoGenerateOnComplete,
      readingSpeed: settings.value.reading.estimatedWPM
    }
  }
}

// Set default mode
const setDefaultMode = () => {
  if (settings.value?.reading.defaultSessionMode) {
    selectedMode.value = settings.value.reading.defaultSessionMode
  } else {
    selectedMode.value = SessionMode.FIFTEEN_MIN // Default to recommended mode
  }
}

// Auto-start session if enabled
const handleAutoStart = async () => {
  if (props.autoStart && selectedMode.value && props.chapterId) {
    await startSession()
  }
}

// Lifecycle
onMounted(() => {
  initializePreferences()
  setDefaultMode()
  handleAutoStart()
})

// Watch for settings changes
watch(settings, (newSettings) => {
  if (newSettings) {
    initializePreferences()
  }
}, { deep: true })
</script>

<style scoped>
.session-selector {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.selector-header {
  text-align: center;
  margin-bottom: 2rem;
}

.selector-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 1rem 0;
}

.selector-description {
  font-size: 1.1rem;
  color: var(--text-color);
  opacity: 0.8;
  margin: 0;
  line-height: 1.5;
}

.session-modes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.session-mode {
  background: var(--bg-color);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.session-mode:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.session-mode:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 122, 204, 0.2);
}

.session-mode--selected {
  border-color: var(--primary-color);
  background: rgba(0, 122, 204, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 122, 204, 0.15);
}

.session-mode--recommended::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), var(--success-color));
}

.mode-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.mode-icon {
  font-size: 2rem;
  line-height: 1;
  flex-shrink: 0;
}

.mode-info {
  flex: 1;
}

.mode-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.recommended-badge {
  background: var(--success-color);
  color: white;
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mode-duration {
  font-size: 0.875rem;
  color: var(--primary-color);
  font-weight: 500;
  margin: 0;
}

.mode-description {
  color: var(--text-color);
  opacity: 0.8;
  line-height: 1.5;
  margin: 0 0 1rem 0;
}

.mode-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--secondary-color);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-color);
  opacity: 0.7;
}

.stat-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color);
}

.focus-indicator {
  display: flex;
  gap: 0.25rem;
}

.focus-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border-color);
  transition: background 0.2s ease;
}

.focus-dot--active {
  background: var(--primary-color);
}

.mode-benefits {
  margin-top: 1rem;
}

.benefits-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 0.5rem 0;
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.benefits-list li {
  font-size: 0.875rem;
  color: var(--text-color);
  opacity: 0.8;
  margin-bottom: 0.25rem;
  padding-left: 1rem;
  position: relative;
}

.benefits-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--success-color);
  font-weight: 600;
}

.selector-actions {
  text-align: center;
  margin-bottom: 2rem;
}

.start-button {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 160px;
  justify-content: center;
}

.start-button:hover:not(:disabled) {
  background: #005a9e;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 204, 0.3);
}

.start-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.start-button--loading {
  pointer-events: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.button-text {
  flex: 1;
  text-align: center;
}

.button-icon {
  font-size: 1.2rem;
}

.help-text {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--text-color);
  opacity: 0.7;
}

.preferences-section {
  border-top: 1px solid var(--border-color);
  padding-top: 2rem;
}

.preferences-toggle {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.preferences-summary {
  background: var(--secondary-color);
  padding: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
  list-style: none;
  user-select: none;
}

.preferences-summary:hover {
  background: var(--border-color);
}

.chevron {
  transition: transform 0.2s ease;
}

.preferences-toggle[open] .chevron {
  transform: rotate(180deg);
}

.preferences-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preference-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preference-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.preference-checkbox {
  width: 18px;
  height: 18px;
  accent-color: var(--primary-color);
}

.preference-text {
  font-size: 0.875rem;
  color: var(--text-color);
}

.preference-slider {
  width: 100%;
  margin: 0.5rem 0;
  accent-color: var(--primary-color);
}

.preference-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-color);
}

/* Responsive design */
@media (max-width: 768px) {
  .session-selector {
    padding: 1rem;
  }
  
  .selector-title {
    font-size: 1.5rem;
  }
  
  .session-modes {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .session-mode {
    padding: 1rem;
  }
  
  .mode-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .mode-icon {
    font-size: 1.5rem;
  }
  
  .mode-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .session-mode {
    background: rgba(255, 255, 255, 0.02);
  }
  
  .session-mode--selected {
    background: rgba(0, 122, 204, 0.1);
  }
  
  .session-mode:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }
  
  .start-button {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
  
  .session-mode:hover {
    transform: none;
  }
}
</style>