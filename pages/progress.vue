<template>
  <div class="progress-page">
    <!-- Page header -->
    <div class="page-header">
      <h1 class="page-title">Your Progress</h1>
      <p class="page-description">
        Track your reading journey, see your streak, and celebrate your achievements.
      </p>
    </div>

    <!-- Stats overview -->
    <div class="stats-overview">
      <div class="stat-card stat-card--primary">
        <div class="stat-icon">🔥</div>
        <div class="stat-content">
          <div class="stat-value">{{ currentStreak }}</div>
          <div class="stat-label">Day Streak</div>
          <div class="stat-sublabel">Keep it going!</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-content">
          <div class="stat-value">{{ totalChaptersCompleted }}</div>
          <div class="stat-label">Chapters Completed</div>
          <div class="stat-sublabel">of {{ stats?.totalChaptersAvailable || 0 }} available</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">⏰</div>
        <div class="stat-content">
          <div class="stat-value">{{ formatHours(totalReadingTime) }}</div>
          <div class="stat-label">Hours Read</div>
          <div class="stat-sublabel">{{ Math.round(totalReadingTime / 60 * 100) / 100 }}h total</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats?.exerciseSuccessRate.toFixed(0) || 0 }}%</div>
          <div class="stat-label">Exercise Success</div>
          <div class="stat-sublabel">{{ stats?.totalExercisesCompleted || 0 }} completed</div>
        </div>
      </div>
    </div>

    <!-- Reading activity chart -->
    <div class="chart-section">
      <div class="chart-header">
        <h2 class="chart-title">Reading Activity</h2>
        <div class="chart-controls">
          <select 
            v-model="selectedTimeRange"
            class="time-range-select"
            @change="updateChartData"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="year">Last year</option>
          </select>
        </div>
      </div>
      
      <div class="activity-chart" ref="chartContainer">
        <div v-if="isLoadingChart" class="chart-loading">
          <div class="loading-spinner"></div>
          <p>Loading chart...</p>
        </div>
        
        <div v-else-if="chartData.length === 0" class="chart-empty">
          <p>No activity data yet. Start reading to see your progress!</p>
        </div>
        
        <div v-else class="activity-grid">
          <!-- Chart legend -->
          <div class="chart-legend">
            <span class="legend-label">Less</span>
            <div class="legend-colors">
              <div class="legend-color" data-level="0"></div>
              <div class="legend-color" data-level="1"></div>
              <div class="legend-color" data-level="2"></div>
              <div class="legend-color" data-level="3"></div>
              <div class="legend-color" data-level="4"></div>
            </div>
            <span class="legend-label">More</span>
          </div>
          
          <!-- Activity grid -->
          <div class="activity-container">
            <div class="month-labels">
              <span v-for="month in monthLabels" :key="month" class="month-label">
                {{ month }}
              </span>
            </div>
            
            <div class="chart-grid">
              <div class="day-labels">
                <span class="day-label">Mon</span>
                <span class="day-label">Wed</span>
                <span class="day-label">Fri</span>
              </div>
              
              <div class="activity-weeks">
                <div 
                  v-for="(week, weekIndex) in activityWeeks" 
                  :key="weekIndex"
                  class="activity-week"
                >
                  <div 
                    v-for="day in week" 
                    :key="day.date"
                    class="activity-day"
                    :class="`activity-level-${day.value}`"
                    :title="getActivityTooltip(day)"
                    @mouseenter="showTooltip($event, day)"
                    @mouseleave="hideTooltip"
                  >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent achievements -->
    <div class="achievements-section">
      <h2 class="section-title">Recent Achievements</h2>
      
      <div v-if="achievements.length === 0" class="empty-state">
        <p>No achievements yet. Keep reading to unlock your first achievement!</p>
      </div>
      
      <div v-else class="achievements-grid">
        <div 
          v-for="achievement in achievements" 
          :key="achievement.id"
          class="achievement-card"
          :class="{ 'achievement-card--new': achievement.isNew }"
        >
          <div class="achievement-icon">{{ achievement.icon }}</div>
          <div class="achievement-content">
            <h3 class="achievement-title">{{ achievement.title }}</h3>
            <p class="achievement-description">{{ achievement.description }}</p>
            <time class="achievement-date">{{ formatDate(achievement.unlockedAt) }}</time>
          </div>
        </div>
      </div>
    </div>

    <!-- Session history -->
    <div class="history-section">
      <div class="section-header">
        <h2 class="section-title">Recent Sessions</h2>
        <NuxtLink to="/session" class="start-session-button">
          Start New Session
        </NuxtLink>
      </div>
      
      <div v-if="recentSessions.length === 0" class="empty-state">
        <p>No sessions yet. <NuxtLink to="/session">Start your first session</NuxtLink> to begin tracking your progress!</p>
      </div>
      
      <div v-else class="sessions-list">
        <div 
          v-for="session in recentSessions" 
          :key="session.id"
          class="session-item"
        >
          <div class="session-info">
            <h3 class="session-chapter">{{ session.chapterTitle }}</h3>
            <div class="session-meta">
              <span class="session-mode">{{ getSessionModeLabel(session.mode) }}</span>
              <span class="session-date">{{ formatDate(session.timestamp) }}</span>
            </div>
          </div>
          
          <div class="session-stats">
            <div class="session-stat">
              <span class="stat-icon">⏱️</span>
              <span class="stat-text">{{ session.actualDuration }}m</span>
            </div>
            <div class="session-stat">
              <span class="stat-icon">📖</span>
              <span class="stat-text">{{ session.wordsRead }} words</span>
            </div>
            <div class="session-stat">
              <span class="stat-icon">📈</span>
              <span class="stat-text">+{{ session.progressMade }}%</span>
            </div>
          </div>
          
          <div class="session-status">
            <span 
              class="status-badge"
              :class="session.completed ? 'status-badge--completed' : 'status-badge--interrupted'"
            >
              {{ session.completed ? 'Completed' : 'Interrupted' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress breakdown -->
    <div class="breakdown-section">
      <h2 class="section-title">Progress Breakdown</h2>
      
      <div class="breakdown-grid">
        <div class="breakdown-card">
          <h3 class="breakdown-title">By Category</h3>
          <div class="progress-list">
            <div 
              v-for="category in categoryProgress" 
              :key="category.name"
              class="progress-item"
            >
              <div class="progress-info">
                <span class="progress-name">{{ category.name }}</span>
                <span class="progress-fraction">{{ category.completed }}/{{ category.total }}</span>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  :style="{ width: `${category.percentage}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="breakdown-card">
          <h3 class="breakdown-title">Session Modes</h3>
          <div class="mode-stats">
            <div 
              v-for="mode in sessionModeStats" 
              :key="mode.mode"
              class="mode-stat"
            >
              <div class="mode-info">
                <span class="mode-icon">{{ mode.icon }}</span>
                <span class="mode-name">{{ mode.name }}</span>
              </div>
              <div class="mode-data">
                <span class="mode-count">{{ mode.count }} sessions</span>
                <span class="mode-time">{{ mode.totalTime }}h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tooltip -->
    <div 
      v-if="tooltip.show"
      class="activity-tooltip"
      :style="tooltip.style"
    >
      {{ tooltip.content }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useDataManager } from '~/composables/useDataManager'
import { SessionMode } from '~/types/schema'
import type { SessionHistory, DailyActivity } from '~/types/schema'

// Page meta
definePageMeta({
  title: 'Progress - DocGrind',
  description: 'Track your reading journey, see your streak, and celebrate your achievements.'
})

// Data manager
const { 
  stats,
  currentStreak,
  totalChaptersCompleted,
  totalReadingTime,
  chapters,
  userProgress,
  getActivityChartData
} = useDataManager()

// Local state
const selectedTimeRange = ref<'week' | 'month' | 'year'>('month')
const isLoadingChart = ref(false)
const chartContainer = ref<HTMLElement>()
const chartData = ref<Array<{date: string, value: number}>>([])
const tooltip = reactive({
  show: false,
  content: '',
  style: {}
})

// Mock achievements data
const achievements = ref([
  {
    id: 'first-session',
    title: 'First Steps',
    description: 'Completed your first reading session',
    icon: '🎉',
    unlockedAt: '2024-01-15T10:30:00Z',
    isNew: false
  },
  {
    id: 'week-streak',
    title: 'Week Warrior',
    description: 'Maintained a 7-day reading streak',
    icon: '⚡',
    unlockedAt: '2024-01-22T09:15:00Z',
    isNew: true
  }
])

// Mock recent sessions
const recentSessions = ref<SessionHistory[]>([
  {
    id: 'session-1',
    date: '2024-01-24',
    mode: SessionMode.FIFTEEN_MIN,
    chapterId: 'js-functions',
    chapterTitle: 'JavaScript Functions',
    plannedDuration: 15,
    actualDuration: 18,
    wordsRead: 720,
    progressMade: 25,
    completed: true,
    interrupted: false,
    timestamp: '2024-01-24T14:30:00Z'
  },
  {
    id: 'session-2',
    date: '2024-01-23',
    mode: SessionMode.FIVE_MIN,
    chapterId: 'js-variables',
    chapterTitle: 'Variables and Constants',
    plannedDuration: 5,
    actualDuration: 7,
    wordsRead: 280,
    progressMade: 15,
    completed: true,
    interrupted: false,
    timestamp: '2024-01-23T09:45:00Z'
  },
  {
    id: 'session-3',
    date: '2024-01-22',
    mode: SessionMode.JOY,
    chapterId: 'js-objects',
    chapterTitle: 'Objects and Properties',
    plannedDuration: 60,
    actualDuration: 45,
    wordsRead: 1800,
    progressMade: 40,
    completed: false,
    interrupted: true,
    timestamp: '2024-01-22T16:20:00Z'
  }
])

// Computed properties
const categoryProgress = computed(() => {
  const categories: Record<string, {completed: number, total: number}> = {}
  
  Object.values(chapters).forEach(chapter => {
    if (!categories[chapter.category]) {
      categories[chapter.category] = { completed: 0, total: 0 }
    }
    
    categories[chapter.category].total++
    if (chapter.status === 'completed') {
      categories[chapter.category].completed++
    }
  })
  
  return Object.entries(categories).map(([name, data]) => ({
    name,
    completed: data.completed,
    total: data.total,
    percentage: data.total > 0 ? (data.completed / data.total) * 100 : 0
  }))
})

const sessionModeStats = computed(() => {
  const modes = {
    [SessionMode.FIVE_MIN]: { icon: '⚡', name: '5 Minute', count: 0, totalTime: 0 },
    [SessionMode.FIFTEEN_MIN]: { icon: '🎯', name: '15 Minute', count: 0, totalTime: 0 },
    [SessionMode.JOY]: { icon: '🌟', name: 'Joy Mode', count: 0, totalTime: 0 },
    [SessionMode.ZEN]: { icon: '🧘', name: 'Zen Mode', count: 0, totalTime: 0 }
  }
  
  recentSessions.value.forEach(session => {
    modes[session.mode].count++
    modes[session.mode].totalTime += session.actualDuration
  })
  
  return Object.entries(modes).map(([mode, data]) => ({
    mode,
    ...data,
    totalTime: Math.round(data.totalTime / 60 * 10) / 10 // Convert to hours
  }))
})

const activityWeeks = computed(() => {
  const weeks: Array<Array<{date: string, value: number}>> = []
  let currentWeek: Array<{date: string, value: number}> = []
  
  const now = new Date()
  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() - getDaysForRange())
  
  // Start from the Monday of the week containing startDate
  const startMonday = new Date(startDate)
  const dayOfWeek = startDate.getDay()
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  startMonday.setDate(startDate.getDate() - daysFromMonday)
  
  const current = new Date(startMonday)
  
  while (current <= now) {
    const dateStr = current.toISOString().split('T')[0]
    const activityData = chartData.value.find(d => d.date === dateStr)
    
    currentWeek.push({
      date: dateStr,
      value: activityData?.value || 0
    })
    
    if (currentWeek.length === 7) {
      weeks.push([...currentWeek])
      currentWeek = []
    }
    
    current.setDate(current.getDate() + 1)
  }
  
  // Add remaining days if any
  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }
  
  return weeks
})

const monthLabels = computed(() => {
  const labels: string[] = []
  const now = new Date()
  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() - getDaysForRange())
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  let currentMonth = startDate.getMonth()
  let currentYear = startDate.getFullYear()
  
  while (currentYear < now.getFullYear() || 
         (currentYear === now.getFullYear() && currentMonth <= now.getMonth())) {
    labels.push(months[currentMonth])
    currentMonth++
    if (currentMonth > 11) {
      currentMonth = 0
      currentYear++
    }
  }
  
  return labels
})

// Methods
const getDaysForRange = (): number => {
  switch (selectedTimeRange.value) {
    case 'week': return 7
    case 'month': return 30
    case 'year': return 365
    default: return 30
  }
}

const updateChartData = async () => {
  isLoadingChart.value = true
  
  try {
    const days = getDaysForRange()
    chartData.value = getActivityChartData(days)
  } catch (error) {
    console.error('Failed to load chart data:', error)
  } finally {
    isLoadingChart.value = false
  }
}

const formatHours = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

const getSessionModeLabel = (mode: SessionMode): string => {
  switch (mode) {
    case SessionMode.FIVE_MIN: return '5-minute'
    case SessionMode.FIFTEEN_MIN: return '15-minute'
    case SessionMode.JOY: return 'Joy mode'
    case SessionMode.ZEN: return 'Zen mode'
    default: return 'Unknown'
  }
}

const getActivityTooltip = (day: {date: string, value: number}): string => {
  const date = new Date(day.date)
  const dateStr = date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric'
  })
  
  if (day.value === 0) {
    return `${dateStr}: No activity`
  }
  
  const activities = ['Low', 'Light', 'Moderate', 'High', 'Very high']
  return `${dateStr}: ${activities[day.value - 1]} activity`
}

const showTooltip = (event: MouseEvent, day: {date: string, value: number}) => {
  tooltip.content = getActivityTooltip(day)
  tooltip.style = {
    left: `${event.pageX + 10}px`,
    top: `${event.pageY - 30}px`
  }
  tooltip.show = true
}

const hideTooltip = () => {
  tooltip.show = false
}

// Lifecycle
onMounted(() => {
  updateChartData()
})
</script>

<style scoped>
.progress-page {
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
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
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

.stat-card--primary {
  background: linear-gradient(135deg, var(--primary-color), #0066cc);
  color: white;
  border: none;
}

.stat-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.125rem;
}

.stat-sublabel {
  font-size: 0.75rem;
  opacity: 0.8;
}

.chart-section {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 3rem;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.chart-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.time-range-select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--secondary-color);
  color: var(--text-color);
  font-size: 0.875rem;
}

.activity-chart {
  min-height: 200px;
}

.chart-loading,
.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-color);
  opacity: 0.7;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.activity-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chart-legend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-color);
  opacity: 0.7;
  justify-content: flex-end;
}

.legend-colors {
  display: flex;
  gap: 2px;
}

.legend-color {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: var(--border-color);
}

.legend-color[data-level="0"] { background: var(--border-color); }
.legend-color[data-level="1"] { background: rgba(0, 122, 204, 0.2); }
.legend-color[data-level="2"] { background: rgba(0, 122, 204, 0.4); }
.legend-color[data-level="3"] { background: rgba(0, 122, 204, 0.6); }
.legend-color[data-level="4"] { background: var(--primary-color); }

.activity-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.month-labels {
  display: flex;
  gap: 14px;
  margin-left: 30px;
  font-size: 0.75rem;
  color: var(--text-color);
  opacity: 0.7;
}

.chart-grid {
  display: flex;
  gap: 0.5rem;
}

.day-labels {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.75rem;
  color: var(--text-color);
  opacity: 0.7;
  width: 25px;
}

.day-label {
  height: 12px;
  line-height: 12px;
}

.activity-weeks {
  display: flex;
  gap: 2px;
  flex: 1;
}

.activity-week {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.activity-day {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
}

.activity-day:hover {
  transform: scale(1.1);
  border: 1px solid var(--text-color);
}

.activity-level-0 { background: var(--border-color); }
.activity-level-1 { background: rgba(0, 122, 204, 0.2); }
.activity-level-2 { background: rgba(0, 122, 204, 0.4); }
.activity-level-3 { background: rgba(0, 122, 204, 0.6); }
.activity-level-4 { background: var(--primary-color); }

.activity-tooltip {
  position: absolute;
  background: var(--text-color);
  color: var(--bg-color);
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 1000;
  pointer-events: none;
}

.achievements-section,
.history-section,
.breakdown-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 1.5rem 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.start-session-button {
  background: var(--primary-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s ease;
}

.start-session-button:hover {
  background: #005a9e;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.achievement-card {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.achievement-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.achievement-card--new {
  border-color: var(--success-color);
  background: rgba(40, 167, 69, 0.05);
}

.achievement-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.achievement-content {
  flex: 1;
}

.achievement-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 0.25rem 0;
}

.achievement-description {
  font-size: 0.875rem;
  color: var(--text-color);
  opacity: 0.8;
  margin: 0 0 0.5rem 0;
}

.achievement-date {
  font-size: 0.75rem;
  color: var(--text-color);
  opacity: 0.6;
}

.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.session-item {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.session-info {
  flex: 1;
}

.session-chapter {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 0.5rem 0;
}

.session-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-color);
  opacity: 0.7;
}

.session-mode {
  color: var(--primary-color);
  font-weight: 500;
}

.session-stats {
  display: flex;
  gap: 1rem;
}

.session-stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--text-color);
}

.session-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge--completed {
  background: var(--success-color);
  color: white;
}

.status-badge--interrupted {
  background: var(--warning-color);
  color: white;
}

.breakdown-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.breakdown-card {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
}

.breakdown-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 1rem 0;
}

.progress-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.progress-name {
  font-weight: 500;
  color: var(--text-color);
}

.progress-fraction {
  color: var(--text-color);
  opacity: 0.7;
}

.progress-bar {
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

.mode-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mode-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mode-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mode-icon {
  font-size: 1.25rem;
}

.mode-name {
  font-weight: 500;
  color: var(--text-color);
}

.mode-data {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.mode-count {
  color: var(--text-color);
  opacity: 0.8;
}

.mode-time {
  color: var(--primary-color);
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-color);
  opacity: 0.7;
}

.empty-state a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.empty-state a:hover {
  text-decoration: underline;
}

/* Responsive design */
@media (max-width: 768px) {
  .progress-page {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .stats-overview {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  .stat-card {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
  }
  
  .chart-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .session-item {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .session-stats {
    justify-content: space-between;
  }
  
  .breakdown-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .chart-section {
    padding: 1rem;
  }
  
  .activity-container {
    overflow-x: auto;
  }
  
  .achievements-grid {
    grid-template-columns: 1fr;
  }
  
  .achievement-card {
    padding: 1rem;
  }
}
</style>