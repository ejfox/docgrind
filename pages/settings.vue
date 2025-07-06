<template>
  <div class="settings-page">
    <!-- Page header -->
    <div class="page-header">
      <h1 class="page-title">Settings</h1>
      <p class="page-description">
        Customize your reading experience and manage your data preferences.
      </p>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading settings...</p>
    </div>

    <!-- Settings content -->
    <div v-else class="settings-content">
      <!-- Reading Preferences -->
      <div class="settings-section">
        <div class="section-header">
          <h2 class="section-title">Reading Preferences</h2>
          <p class="section-description">
            Configure your default reading behavior and session settings.
          </p>
        </div>
        
        <div class="settings-grid">
          <div class="setting-item">
            <label class="setting-label" for="default-session-mode">
              Default Session Mode
            </label>
            <select 
              id="default-session-mode"
              v-model="localSettings.reading.defaultSessionMode"
              class="setting-select"
              @change="markChanged"
            >
              <option value="5min">5 Minute Sprint</option>
              <option value="15min">15 Minute Focus</option>
              <option value="joy">Joy Mode (1 hour)</option>
              <option value="zen">Zen Mode (unlimited)</option>
            </select>
            <p class="setting-help">
              The session mode that will be pre-selected when starting new reading sessions.
            </p>
          </div>
          
          <div class="setting-item">
            <label class="setting-label" for="reading-speed">
              Reading Speed (WPM)
            </label>
            <div class="slider-container">
              <input 
                id="reading-speed"
                type="range" 
                v-model="localSettings.reading.estimatedWPM"
                min="100"
                max="400"
                step="25"
                class="setting-slider"
                @input="markChanged"
              >
              <span class="slider-value">{{ localSettings.reading.estimatedWPM }} WPM</span>
            </div>
            <p class="setting-help">
              Your reading speed helps calculate estimated reading times for chapters.
            </p>
          </div>
          
          <div class="setting-item">
            <label class="setting-checkbox">
              <input 
                type="checkbox" 
                v-model="localSettings.reading.autoAdvanceChapters"
                @change="markChanged"
              >
              <span class="checkbox-text">Auto-advance to next chapter</span>
            </label>
            <p class="setting-help">
              Automatically suggest the next chapter when you complete one.
            </p>
          </div>
          
          <div class="setting-item">
            <label class="setting-checkbox">
              <input 
                type="checkbox" 
                v-model="localSettings.reading.showReadingProgress"
                @change="markChanged"
              >
              <span class="checkbox-text">Show reading progress</span>
            </label>
            <p class="setting-help">
              Display progress bars and completion percentages while reading.
            </p>
          </div>
          
          <div class="setting-item">
            <label class="setting-checkbox">
              <input 
                type="checkbox" 
                v-model="localSettings.reading.pauseOnFocusLoss"
                @change="markChanged"
              >
              <span class="checkbox-text">Auto-pause when window loses focus</span>
            </label>
            <p class="setting-help">
              Automatically pause reading sessions when you switch to another window or app.
            </p>
          </div>
        </div>
      </div>

      <!-- Exercise Preferences -->
      <div class="settings-section">
        <div class="section-header">
          <h2 class="section-title">Exercise Preferences</h2>
          <p class="section-description">
            Control how exercises are generated and presented.
          </p>
        </div>
        
        <div class="settings-grid">
          <div class="setting-item">
            <label class="setting-checkbox">
              <input 
                type="checkbox" 
                v-model="localSettings.exercises.autoGenerateOnComplete"
                @change="markChanged"
              >
              <span class="checkbox-text">Auto-generate exercises</span>
            </label>
            <p class="setting-help">
              Automatically create practice exercises when you complete a chapter.
            </p>
          </div>
          
          <div class="setting-item">
            <label class="setting-checkbox">
              <input 
                type="checkbox" 
                v-model="localSettings.exercises.showHints"
                @change="markChanged"
              >
              <span class="checkbox-text">Show hints</span>
            </label>
            <p class="setting-help">
              Allow hints to be displayed for exercises when you need help.
            </p>
          </div>
          
          <div class="setting-item">
            <label class="setting-checkbox">
              <input 
                type="checkbox" 
                v-model="localSettings.exercises.skipExercises"
                @change="markChanged"
              >
              <span class="checkbox-text">Allow skipping exercises</span>
            </label>
            <p class="setting-help">
              Enable the option to skip exercises if you want to focus on reading.
            </p>
          </div>
          
          <div class="setting-item">
            <label class="setting-label" for="max-attempts">
              Maximum Attempts per Exercise
            </label>
            <select 
              id="max-attempts"
              v-model="localSettings.exercises.maxAttempts"
              class="setting-select"
              @change="markChanged"
            >
              <option :value="1">1 attempt</option>
              <option :value="2">2 attempts</option>
              <option :value="3">3 attempts</option>
              <option :value="5">5 attempts</option>
              <option :value="0">Unlimited</option>
            </select>
            <p class="setting-help">
              Limit the number of attempts allowed for each exercise.
            </p>
          </div>
        </div>
      </div>

      <!-- Dashboard Preferences -->
      <div class="settings-section">
        <div class="section-header">
          <h2 class="section-title">Dashboard Preferences</h2>
          <p class="section-description">
            Customize what information is displayed on your progress dashboard.
          </p>
        </div>
        
        <div class="settings-grid">
          <div class="setting-item">
            <label class="setting-checkbox">
              <input 
                type="checkbox" 
                v-model="localSettings.dashboard.showStats"
                @change="markChanged"
              >
              <span class="checkbox-text">Show statistics</span>
            </label>
            <p class="setting-help">
              Display reading statistics and achievement metrics.
            </p>
          </div>
          
          <div class="setting-item">
            <label class="setting-checkbox">
              <input 
                type="checkbox" 
                v-model="localSettings.dashboard.showStreak"
                @change="markChanged"
              >
              <span class="checkbox-text">Show reading streak</span>
            </label>
            <p class="setting-help">
              Highlight your current and longest reading streaks.
            </p>
          </div>
          
          <div class="setting-item">
            <label class="setting-checkbox">
              <input 
                type="checkbox" 
                v-model="localSettings.dashboard.showChart"
                @change="markChanged"
              >
              <span class="checkbox-text">Show activity chart</span>
            </label>
            <p class="setting-help">
              Display the GitHub-style activity chart showing your reading patterns.
            </p>
          </div>
          
          <div class="setting-item">
            <label class="setting-label" for="chart-time-range">
              Chart Time Range
            </label>
            <select 
              id="chart-time-range"
              v-model="localSettings.dashboard.chartTimeRange"
              class="setting-select"
              @change="markChanged"
            >
              <option value="week">Last week</option>
              <option value="month">Last month</option>
              <option value="year">Last year</option>
            </select>
            <p class="setting-help">
              Default time range for the activity chart on the dashboard.
            </p>
          </div>
        </div>
      </div>

      <!-- Email Notifications -->
      <div class="settings-section">
        <div class="section-header">
          <h2 class="section-title">Email Notifications</h2>
          <p class="section-description">
            Set up email reminders to help maintain your reading habit.
          </p>
        </div>
        
        <div class="settings-grid">
          <div class="setting-item">
            <label class="setting-checkbox">
              <input 
                type="checkbox" 
                v-model="localSettings.emailReminders.enabled"
                @change="markChanged"
              >
              <span class="checkbox-text">Enable email reminders</span>
            </label>
            <p class="setting-help">
              Receive email reminders to help maintain your reading habit.
            </p>
          </div>
          
          <div v-if="localSettings.emailReminders.enabled" class="setting-item">
            <label class="setting-label" for="email-address">
              Email Address
            </label>
            <input 
              id="email-address"
              type="email" 
              v-model="localSettings.emailReminders.email"
              class="setting-input"
              placeholder="your@email.com"
              @input="markChanged"
            >
            <p class="setting-help">
              We'll send reading reminders to this email address.
            </p>
          </div>
          
          <div v-if="localSettings.emailReminders.enabled" class="setting-item">
            <label class="setting-label">Reminder Times</label>
            <div class="checkbox-group">
              <label class="setting-checkbox">
                <input 
                  type="checkbox" 
                  :checked="localSettings.emailReminders.times.includes('12:00')"
                  @change="toggleReminderTime('12:00')"
                >
                <span class="checkbox-text">Noon (12:00 PM)</span>
              </label>
              <label class="setting-checkbox">
                <input 
                  type="checkbox" 
                  :checked="localSettings.emailReminders.times.includes('15:00')"
                  @change="toggleReminderTime('15:00')"
                >
                <span class="checkbox-text">Afternoon (3:00 PM)</span>
              </label>
              <label class="setting-checkbox">
                <input 
                  type="checkbox" 
                  :checked="localSettings.emailReminders.times.includes('18:00')"
                  @change="toggleReminderTime('18:00')"
                >
                <span class="checkbox-text">Evening (6:00 PM)</span>
              </label>
            </div>
            <p class="setting-help">
              Choose when you'd like to receive reading reminders.
            </p>
          </div>
          
          <div v-if="localSettings.emailReminders.enabled" class="setting-item">
            <label class="setting-checkbox">
              <input 
                type="checkbox" 
                v-model="localSettings.emailReminders.streakWarning"
                @change="markChanged"
              >
              <span class="checkbox-text">Streak warning notifications</span>
            </label>
            <p class="setting-help">
              Get notified when your reading streak is at risk of being broken.
            </p>
          </div>
        </div>
      </div>

      <!-- Data Management -->
      <div class="settings-section">
        <div class="section-header">
          <h2 class="section-title">Data Management</h2>
          <p class="section-description">
            Manage your reading data, backups, and privacy settings.
          </p>
        </div>
        
        <div class="settings-grid">
          <div class="setting-item">
            <label class="setting-checkbox">
              <input 
                type="checkbox" 
                v-model="localSettings.data.autoBackup"
                @change="markChanged"
              >
              <span class="checkbox-text">Automatic backups</span>
            </label>
            <p class="setting-help">
              Automatically create backups of your reading progress.
            </p>
          </div>
          
          <div class="setting-item">
            <label class="setting-label" for="retention-days">
              Data Retention Period
            </label>
            <select 
              id="retention-days"
              v-model="localSettings.data.retentionDays"
              class="setting-select"
              @change="markChanged"
            >
              <option :value="30">30 days</option>
              <option :value="60">60 days</option>
              <option :value="90">90 days</option>
              <option :value="180">6 months</option>
              <option :value="365">1 year</option>
              <option :value="0">Forever</option>
            </select>
            <p class="setting-help">
              How long to keep old session data and activity history.
            </p>
          </div>
          
          <div class="setting-item">
            <div class="data-actions">
              <button 
                @click="exportData"
                class="action-button action-button--secondary"
                :disabled="isExporting"
              >
                <span v-if="isExporting">Exporting...</span>
                <span v-else>Export Data</span>
              </button>
              
              <label class="action-button action-button--secondary">
                Import Data
                <input 
                  type="file" 
                  @change="importData"
                  accept=".json"
                  class="file-input"
                >
              </label>
              
              <button 
                @click="showClearDataModal = true"
                class="action-button action-button--danger"
              >
                Clear All Data
              </button>
            </div>
            <p class="setting-help">
              Export your data for backup or import previously exported data.
            </p>
          </div>
          
          <div class="setting-item">
            <div class="data-info">
              <h3 class="data-info-title">Storage Information</h3>
              <div class="data-stats">
                <div class="data-stat">
                  <span class="stat-label">Data Size:</span>
                  <span class="stat-value">{{ formatDataSize(dataSize) }}</span>
                </div>
                <div class="data-stat">
                  <span class="stat-label">Sessions:</span>
                  <span class="stat-value">{{ stats?.sessionsCompleted || 0 }}</span>
                </div>
                <div class="data-stat">
                  <span class="stat-label">Chapters:</span>
                  <span class="stat-value">{{ stats?.totalChaptersStarted || 0 }}</span>
                </div>
                <div class="data-stat">
                  <span class="stat-label">Exercises:</span>
                  <span class="stat-value">{{ stats?.totalExercisesCompleted || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Save button -->
      <div class="save-section">
        <div class="save-actions">
          <button 
            @click="saveSettings"
            class="save-button"
            :class="{ 'save-button--changed': hasChanges }"
            :disabled="isSaving || !hasChanges"
          >
            <span v-if="isSaving">Saving...</span>
            <span v-else-if="hasChanges">Save Changes</span>
            <span v-else>Saved</span>
          </button>
          
          <button 
            v-if="hasChanges"
            @click="resetSettings"
            class="reset-button"
          >
            Reset Changes
          </button>
        </div>
        
        <p v-if="saveMessage" class="save-message" :class="saveMessageType">
          {{ saveMessage }}
        </p>
      </div>
    </div>

    <!-- Clear data confirmation modal -->
    <div v-if="showClearDataModal" class="modal-overlay" @click="showClearDataModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Clear All Data</h2>
          <button @click="showClearDataModal = false" class="close-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="warning-content">
            <div class="warning-icon">⚠️</div>
            <div class="warning-text">
              <p>
                <strong>This action cannot be undone!</strong>
              </p>
              <p>
                This will permanently delete all your reading progress, including:
              </p>
              <ul>
                <li>Reading sessions and time tracking</li>
                <li>Chapter progress and bookmarks</li>
                <li>Exercise attempts and solutions</li>
                <li>Activity history and streaks</li>
                <li>All settings and preferences</li>
              </ul>
              <p>
                Consider exporting your data first if you want to keep a backup.
              </p>
            </div>
          </div>
        </div>
        
        <div class="modal-actions">
          <button 
            @click="clearAllData"
            class="action-button action-button--danger"
            :disabled="isClearing"
          >
            <span v-if="isClearing">Clearing...</span>
            <span v-else>Clear All Data</span>
          </button>
          <button 
            @click="showClearDataModal = false"
            class="action-button action-button--secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useDataManager } from '~/composables/useDataManager'
import type { UserProgress } from '~/types/schema'

// Page meta
definePageMeta({
  title: 'Settings - DocGrind',
  description: 'Customize your reading experience and manage your data preferences.'
})

// Data manager
const { 
  settings,
  stats,
  updateSettings,
  exportData: exportUserData,
  importData: importUserData,
  clearAllData: clearUserData,
  getDataSize
} = useDataManager()

// Local state
const isLoading = ref(false)
const isSaving = ref(false)
const isExporting = ref(false)
const isClearing = ref(false)
const hasChanges = ref(false)
const saveMessage = ref('')
const saveMessageType = ref<'success' | 'error'>('success')
const showClearDataModal = ref(false)
const dataSize = ref(0)

// Local copy of settings for editing
const localSettings = ref<UserProgress['settings']>({
  emailReminders: {
    enabled: false,
    email: '',
    times: [],
    streakWarning: true
  },
  reading: {
    defaultSessionMode: '15min' as any,
    autoAdvanceChapters: true,
    showReadingProgress: true,
    pauseOnFocusLoss: true,
    estimatedWPM: 200
  },
  exercises: {
    autoGenerateOnComplete: true,
    showHints: true,
    skipExercises: false,
    maxAttempts: 3
  },
  dashboard: {
    showStats: true,
    showStreak: true,
    showChart: true,
    chartTimeRange: 'month' as any
  },
  data: {
    autoBackup: true,
    retentionDays: 90
  }
})

// Methods
const loadSettings = () => {
  if (settings.value) {
    localSettings.value = JSON.parse(JSON.stringify(settings.value))
  }
  hasChanges.value = false
}

const markChanged = () => {
  hasChanges.value = true
  saveMessage.value = ''
}

const toggleReminderTime = (time: string) => {
  const times = localSettings.value.emailReminders.times
  const index = times.indexOf(time as any)
  
  if (index > -1) {
    times.splice(index, 1)
  } else {
    times.push(time as any)
  }
  
  markChanged()
}

const saveSettings = async () => {
  isSaving.value = true
  saveMessage.value = ''
  
  try {
    await updateSettings(localSettings.value)
    hasChanges.value = false
    saveMessage.value = 'Settings saved successfully!'
    saveMessageType.value = 'success'
    
    // Clear message after 3 seconds
    setTimeout(() => {
      saveMessage.value = ''
    }, 3000)
    
  } catch (error) {
    console.error('Failed to save settings:', error)
    saveMessage.value = 'Failed to save settings. Please try again.'
    saveMessageType.value = 'error'
  } finally {
    isSaving.value = false
  }
}

const resetSettings = () => {
  loadSettings()
  saveMessage.value = ''
}

const exportData = async () => {
  isExporting.value = true
  
  try {
    const data = exportUserData()
    if (!data) {
      throw new Error('No data to export')
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `docgrind-settings-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    
    URL.revokeObjectURL(url)
    
    saveMessage.value = 'Data exported successfully!'
    saveMessageType.value = 'success'
    
  } catch (error) {
    console.error('Export failed:', error)
    saveMessage.value = 'Failed to export data'
    saveMessageType.value = 'error'
  } finally {
    isExporting.value = false
    
    setTimeout(() => {
      saveMessage.value = ''
    }, 3000)
  }
}

const importData = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (!file) return
  
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    
    const success = await importUserData(data)
    
    if (success) {
      loadSettings()
      updateDataSize()
      saveMessage.value = 'Data imported successfully!'
      saveMessageType.value = 'success'
    } else {
      saveMessage.value = 'Failed to import data'
      saveMessageType.value = 'error'
    }
  } catch (error) {
    console.error('Import failed:', error)
    saveMessage.value = 'Invalid data file'
    saveMessageType.value = 'error'
  } finally {
    // Clear the input
    input.value = ''
    
    setTimeout(() => {
      saveMessage.value = ''
    }, 3000)
  }
}

const clearAllData = async () => {
  isClearing.value = true
  
  try {
    const success = await clearUserData()
    
    if (success) {
      showClearDataModal.value = false
      loadSettings()
      updateDataSize()
      saveMessage.value = 'All data cleared successfully!'
      saveMessageType.value = 'success'
    } else {
      saveMessage.value = 'Failed to clear data'
      saveMessageType.value = 'error'
    }
  } catch (error) {
    console.error('Clear data failed:', error)
    saveMessage.value = 'Failed to clear data'
    saveMessageType.value = 'error'
  } finally {
    isClearing.value = false
    
    setTimeout(() => {
      saveMessage.value = ''
    }, 3000)
  }
}

const updateDataSize = () => {
  dataSize.value = getDataSize()
}

const formatDataSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// Lifecycle
onMounted(() => {
  loadSettings()
  updateDataSize()
  
  // Update data size periodically
  const interval = setInterval(updateDataSize, 30000)
  
  onUnmounted(() => {
    clearInterval(interval)
  })
})

// Watch for settings changes from data manager
watch(settings, (newSettings) => {
  if (newSettings && !hasChanges.value) {
    loadSettings()
  }
}, { deep: true })

// Warn about unsaved changes
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (hasChanges.value) {
    event.preventDefault()
    event.returnValue = ''
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style scoped>
.settings-page {
  max-width: 800px;
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
}

.loading-state {
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

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.settings-section {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 2rem;
}

.section-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 0.5rem 0;
}

.section-description {
  color: var(--text-color);
  opacity: 0.8;
  margin: 0;
  line-height: 1.5;
}

.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.setting-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.setting-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--primary-color);
  margin: 0;
}

.checkbox-text {
  color: var(--text-color);
  font-weight: 500;
}

.setting-select,
.setting-input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 0.875rem;
  max-width: 300px;
}

.setting-select:focus,
.setting-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 400px;
}

.setting-slider {
  flex: 1;
  height: 6px;
  background: var(--border-color);
  border-radius: 3px;
  outline: none;
  accent-color: var(--primary-color);
}

.slider-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-color);
  min-width: 70px;
  text-align: right;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.setting-help {
  font-size: 0.8rem;
  color: var(--text-color);
  opacity: 0.7;
  margin: 0;
  line-height: 1.4;
}

.data-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-button {
  padding: 0.75rem 1.5rem;
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
  position: relative;
}

.action-button--secondary {
  background: var(--secondary-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.action-button--secondary:hover:not(:disabled) {
  background: var(--border-color);
}

.action-button--danger {
  background: var(--error-color);
  color: white;
}

.action-button--danger:hover:not(:disabled) {
  background: #c82333;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

.data-info {
  background: var(--secondary-color);
  border-radius: 8px;
  padding: 1.5rem;
}

.data-info-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 1rem 0;
}

.data-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.data-stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-color);
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}

.save-section {
  position: sticky;
  bottom: 0;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
}

.save-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.save-button {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
}

.save-button:hover:not(:disabled) {
  background: #005a9e;
  transform: translateY(-1px);
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.save-button--changed {
  background: var(--success-color);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.reset-button {
  background: var(--secondary-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-button:hover {
  background: var(--border-color);
}

.save-message {
  font-size: 0.875rem;
  margin: 0;
  font-weight: 500;
}

.save-message.success {
  color: var(--success-color);
}

.save-message.error {
  color: var(--error-color);
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
  max-width: 500px;
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

.warning-content {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.warning-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.warning-text {
  flex: 1;
  color: var(--text-color);
  line-height: 1.5;
}

.warning-text ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.warning-text li {
  margin-bottom: 0.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  justify-content: flex-end;
}

/* Responsive design */
@media (max-width: 768px) {
  .settings-page {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .settings-section {
    padding: 1.5rem;
  }
  
  .data-actions {
    flex-direction: column;
  }
  
  .save-actions {
    flex-direction: column;
  }
  
  .modal-actions {
    flex-direction: column-reverse;
  }
}

@media (max-width: 480px) {
  .slider-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .data-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .save-section {
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3);
  }
  
  .modal-overlay {
    background: rgba(0, 0, 0, 0.7);
  }
  
  .modal-content {
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }
}
</style>