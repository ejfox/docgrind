<template>
  <div class="reading-activity-chart" :class="themeClass">
    <div class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
      <div class="chart-legend">
        <span class="legend-label">Less</span>
        <div class="legend-scale">
          <div
            v-for="level in 5"
            :key="level"
            class="legend-block"
            :data-level="level - 1"
            :title="getLevelDescription(level - 1)"
          ></div>
        </div>
        <span class="legend-label">More</span>
      </div>
    </div>

    <div class="chart-wrapper">
      <div class="month-labels">
        <div
          v-for="(month, index) in monthLabels"
          :key="index"
          class="month-label"
          :style="{ left: `${month.position}px` }"
        >
          {{ month.label }}
        </div>
      </div>

      <div class="chart-container">
        <div class="weekday-labels">
          <div class="weekday-label">Mon</div>
          <div class="weekday-label"></div>
          <div class="weekday-label">Wed</div>
          <div class="weekday-label"></div>
          <div class="weekday-label">Fri</div>
          <div class="weekday-label"></div>
          <div class="weekday-label"></div>
        </div>

        <div class="activity-grid" ref="gridRef">
          <div
            v-for="(week, weekIndex) in weeks"
            :key="weekIndex"
            class="week-column"
          >
            <div
              v-for="(day, dayIndex) in week"
              :key="`${weekIndex}-${dayIndex}`"
              class="day-cell"
              :class="{
                'is-future': day.isFuture,
                'is-today': day.isToday,
                'has-activity': day.activity
              }"
              :data-level="day.level"
              :aria-label="day.ariaLabel"
              @click="handleDayClick(day)"
              @mouseenter="handleMouseEnter(day, $event)"
              @mouseleave="handleMouseLeave"
            >
              <div class="day-inner"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showSummary" class="chart-summary">
      <div class="summary-item">
        <span class="summary-value">{{ totalDaysActive }}</span>
        <span class="summary-label">days active</span>
      </div>
      <div class="summary-item">
        <span class="summary-value">{{ totalReadingTime }}</span>
        <span class="summary-label">total {{ activityUnit }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-value">{{ currentStreak }}</span>
        <span class="summary-label">day streak</span>
      </div>
      <div class="summary-item">
        <span class="summary-value">{{ longestStreak }}</span>
        <span class="summary-label">longest streak</span>
      </div>
    </div>

    <!-- Tooltip -->
    <Teleport to="body">
      <Transition name="tooltip">
        <div
          v-if="tooltipData"
          class="activity-tooltip"
          :class="themeClass"
          :style="tooltipStyle"
          role="tooltip"
        >
          <div class="tooltip-date">{{ tooltipData.formattedDate }}</div>
          <div v-if="tooltipData.activity" class="tooltip-content">
            <div class="tooltip-stat">
              <span class="tooltip-value">{{ tooltipData.activity.value }}</span>
              <span class="tooltip-unit">{{ tooltipData.activity.unit || activityUnit }}</span>
            </div>
            <div v-if="tooltipData.activity.details" class="tooltip-details">
              <div v-for="(detail, key) in tooltipData.activity.details" :key="key" class="tooltip-detail">
                <span class="detail-label">{{ key }}:</span>
                <span class="detail-value">{{ detail }}</span>
              </div>
            </div>
          </div>
          <div v-else class="tooltip-empty">No reading activity</div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

export interface ReadingActivity {
  date: string // YYYY-MM-DD format
  value: number // Reading time in minutes, chapters, or pages
  unit?: string // Optional unit override
  details?: Record<string, any> // Additional details for tooltip
}

export interface ReadingActivityChartProps {
  activities?: ReadingActivity[]
  startDate?: Date
  endDate?: Date
  title?: string
  theme?: 'light' | 'dark' | 'auto'
  showSummary?: boolean
  activityUnit?: string
  levelThresholds?: number[]
  colors?: {
    level0?: string
    level1?: string
    level2?: string
    level3?: string
    level4?: string
  }
}

interface DayData {
  date: Date
  dateString: string
  activity?: ReadingActivity
  level: number
  isFuture: boolean
  isToday: boolean
  ariaLabel: string
}

interface TooltipData {
  formattedDate: string
  activity?: ReadingActivity
}

const props = withDefaults(defineProps<ReadingActivityChartProps>(), {
  activities: () => [],
  startDate: () => {
    const date = new Date()
    date.setFullYear(date.getFullYear() - 1)
    return date
  },
  endDate: () => new Date(),
  title: 'Reading Activity',
  theme: 'auto',
  showSummary: true,
  activityUnit: 'minutes',
  levelThresholds: () => [0, 15, 30, 60, 120], // 0, 15min, 30min, 1hr, 2hr+
  colors: () => ({})
})

const emit = defineEmits<{
  dayClick: [day: DayData]
}>()

// Refs
const gridRef = ref<HTMLElement>()
const tooltipData = ref<TooltipData | null>(null)
const tooltipStyle = ref<Record<string, string>>({})

// Computed
const themeClass = computed(() => {
  if (props.theme === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'theme-dark' : 'theme-light'
  }
  return `theme-${props.theme}`
})

const activityMap = computed(() => {
  const map = new Map<string, ReadingActivity>()
  props.activities.forEach(activity => {
    map.set(activity.date, activity)
  })
  return map
})

const weeks = computed(() => {
  const weeks: DayData[][] = []
  const startDate = new Date(props.startDate)
  const endDate = new Date(props.endDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Adjust start date to the beginning of the week (Sunday)
  const currentDate = new Date(startDate)
  currentDate.setDate(currentDate.getDate() - currentDate.getDay())

  let currentWeek: DayData[] = []

  while (currentDate <= endDate) {
    const dateString = formatDateString(currentDate)
    const activity = activityMap.value.get(dateString)
    const isFuture = currentDate > today
    const isToday = currentDate.getTime() === today.getTime()

    const dayData: DayData = {
      date: new Date(currentDate),
      dateString,
      activity,
      level: activity ? getActivityLevel(activity.value) : 0,
      isFuture,
      isToday,
      ariaLabel: getAriaLabel(currentDate, activity)
    }

    currentWeek.push(dayData)

    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  return weeks
})

const monthLabels = computed(() => {
  const labels: { label: string; position: number }[] = []
  const cellSize = 12
  const cellGap = 3
  const cellWithGap = cellSize + cellGap

  weeks.value.forEach((week, weekIndex) => {
    const firstDay = week[0]
    if (firstDay && firstDay.date.getDate() <= 7) {
      labels.push({
        label: firstDay.date.toLocaleDateString('en-US', { month: 'short' }),
        position: weekIndex * cellWithGap
      })
    }
  })

  return labels
})

const totalDaysActive = computed(() => {
  return props.activities.filter(a => a.value > 0).length
})

const totalReadingTime = computed(() => {
  const total = props.activities.reduce((sum, a) => sum + a.value, 0)
  return formatActivityValue(total)
})

const currentStreak = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let streak = 0
  let currentDate = new Date(today)

  while (true) {
    const dateString = formatDateString(currentDate)
    const activity = activityMap.value.get(dateString)
    
    if (activity && activity.value > 0) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
})

const longestStreak = computed(() => {
  let maxStreak = 0
  let currentStreak = 0
  const sortedActivities = [...props.activities].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  let lastDate: Date | null = null

  sortedActivities.forEach(activity => {
    if (activity.value > 0) {
      const activityDate = new Date(activity.date)
      
      if (lastDate) {
        const daysDiff = Math.floor((activityDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff === 1) {
          currentStreak++
        } else {
          currentStreak = 1
        }
      } else {
        currentStreak = 1
      }

      maxStreak = Math.max(maxStreak, currentStreak)
      lastDate = activityDate
    }
  })

  return maxStreak
})

// Methods
function formatDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getActivityLevel(value: number): number {
  const thresholds = props.levelThresholds
  if (value <= thresholds[0]) return 0
  if (value <= thresholds[1]) return 1
  if (value <= thresholds[2]) return 2
  if (value <= thresholds[3]) return 3
  return 4
}

function getLevelDescription(level: number): string {
  const thresholds = props.levelThresholds
  const unit = props.activityUnit

  switch (level) {
    case 0:
      return `No ${unit}`
    case 1:
      return `${thresholds[1]} ${unit} or less`
    case 2:
      return `${thresholds[1]}-${thresholds[2]} ${unit}`
    case 3:
      return `${thresholds[2]}-${thresholds[3]} ${unit}`
    case 4:
      return `${thresholds[3]}+ ${unit}`
    default:
      return ''
  }
}

function formatActivityValue(value: number): string {
  if (props.activityUnit === 'minutes') {
    if (value >= 60) {
      const hours = Math.floor(value / 60)
      const minutes = value % 60
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    }
    return `${value}m`
  }
  return value.toString()
}

function getAriaLabel(date: Date, activity?: ReadingActivity): string {
  const dateStr = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  
  if (!activity) {
    return `${dateStr}: No reading activity`
  }

  const value = formatActivityValue(activity.value)
  const unit = activity.unit || props.activityUnit
  return `${dateStr}: ${value} ${unit} of reading`
}

function handleDayClick(day: DayData) {
  if (!day.isFuture) {
    emit('dayClick', day)
  }
}

function handleMouseEnter(day: DayData, event: MouseEvent) {
  if (day.isFuture) return

  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  
  tooltipData.value = {
    formattedDate: day.date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    activity: day.activity
  }

  // Position tooltip above the cell
  tooltipStyle.value = {
    left: `${rect.left + rect.width / 2}px`,
    top: `${rect.top - 8}px`
  }
}

function handleMouseLeave() {
  tooltipData.value = null
}

// Theme watcher
let mediaQuery: MediaQueryList | null = null

onMounted(() => {
  if (props.theme === 'auto') {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', handleThemeChange)
  }
})

onBeforeUnmount(() => {
  if (mediaQuery) {
    mediaQuery.removeEventListener('change', handleThemeChange)
  }
})

function handleThemeChange() {
  // Force re-render by touching a reactive property
  tooltipData.value = tooltipData.value
}

// Custom CSS properties for colors
const cssVars = computed(() => {
  const vars: Record<string, string> = {}
  if (props.colors.level0) vars['--color-level-0'] = props.colors.level0
  if (props.colors.level1) vars['--color-level-1'] = props.colors.level1
  if (props.colors.level2) vars['--color-level-2'] = props.colors.level2
  if (props.colors.level3) vars['--color-level-3'] = props.colors.level3
  if (props.colors.level4) vars['--color-level-4'] = props.colors.level4
  return vars
})
</script>

<style scoped>
.reading-activity-chart {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  v-bind(cssVars);
}

/* Theme Variables */
.theme-light {
  --bg-primary: #ffffff;
  --bg-secondary: #f6f8fa;
  --text-primary: #24292f;
  --text-secondary: #57606a;
  --text-tertiary: #6e7781;
  --border-color: #d0d7de;
  --color-level-0: #ebedf0;
  --color-level-1: #9be9a8;
  --color-level-2: #40c463;
  --color-level-3: #30a14e;
  --color-level-4: #216e39;
  --tooltip-bg: #24292f;
  --tooltip-text: #ffffff;
  --today-border: #1f2328;
}

.theme-dark {
  --bg-primary: #0d1117;
  --bg-secondary: #161b22;
  --text-primary: #c9d1d9;
  --text-secondary: #8b949e;
  --text-tertiary: #6e7681;
  --border-color: #30363d;
  --color-level-0: #161b22;
  --color-level-1: #0e4429;
  --color-level-2: #006d32;
  --color-level-3: #26a641;
  --color-level-4: #39d353;
  --tooltip-bg: #161b22;
  --tooltip-text: #c9d1d9;
  --today-border: #c9d1d9;
}

/* Chart Header */
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.chart-legend {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary);
}

.legend-label {
  font-size: 11px;
}

.legend-scale {
  display: flex;
  gap: 3px;
}

.legend-block {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background-color: var(--color-level-0);
}

.legend-block[data-level="0"] {
  background-color: var(--color-level-0);
}

.legend-block[data-level="1"] {
  background-color: var(--color-level-1);
}

.legend-block[data-level="2"] {
  background-color: var(--color-level-2);
}

.legend-block[data-level="3"] {
  background-color: var(--color-level-3);
}

.legend-block[data-level="4"] {
  background-color: var(--color-level-4);
}

/* Chart Wrapper */
.chart-wrapper {
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  padding-top: 20px;
}

.month-labels {
  position: absolute;
  top: 0;
  left: 28px;
  height: 20px;
  display: flex;
  font-size: 10px;
  color: var(--text-secondary);
}

.month-label {
  position: absolute;
  white-space: nowrap;
}

/* Chart Container */
.chart-container {
  display: flex;
  gap: 4px;
}

.weekday-labels {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-right: 4px;
  font-size: 10px;
  color: var(--text-secondary);
  width: 24px;
  flex-shrink: 0;
}

.weekday-label {
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

/* Activity Grid */
.activity-grid {
  display: flex;
  gap: 3px;
}

.week-column {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.day-cell {
  position: relative;
  width: 12px;
  height: 12px;
  cursor: pointer;
  border-radius: 2px;
  background-color: var(--color-level-0);
  transition: all 0.1s ease;
}

.day-cell:not(.is-future):hover {
  outline: 1px solid var(--text-primary);
  outline-offset: 1px;
}

.day-cell[data-level="0"] {
  background-color: var(--color-level-0);
}

.day-cell[data-level="1"] {
  background-color: var(--color-level-1);
}

.day-cell[data-level="2"] {
  background-color: var(--color-level-2);
}

.day-cell[data-level="3"] {
  background-color: var(--color-level-3);
}

.day-cell[data-level="4"] {
  background-color: var(--color-level-4);
}

.day-cell.is-today {
  outline: 1px solid var(--today-border);
  outline-offset: 1px;
}

.day-cell.is-future {
  cursor: default;
  opacity: 0.5;
}

/* Summary */
.chart-summary {
  display: flex;
  gap: 24px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-value {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.summary-label {
  font-size: 12px;
  color: var(--text-secondary);
}

/* Tooltip */
.activity-tooltip {
  position: fixed;
  z-index: 9999;
  padding: 8px 12px;
  background-color: var(--tooltip-bg);
  color: var(--tooltip-text);
  border-radius: 6px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  transform: translateX(-50%) translateY(-100%);
  white-space: nowrap;
  font-size: 12px;
}

.activity-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: var(--tooltip-bg);
}

.tooltip-date {
  font-weight: 600;
  margin-bottom: 4px;
}

.tooltip-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tooltip-stat {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.tooltip-value {
  font-size: 16px;
  font-weight: 600;
}

.tooltip-unit {
  font-size: 12px;
  opacity: 0.8;
}

.tooltip-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.tooltip-detail {
  display: flex;
  gap: 4px;
  font-size: 11px;
}

.detail-label {
  opacity: 0.7;
  text-transform: capitalize;
}

.detail-value {
  font-weight: 500;
}

.tooltip-empty {
  opacity: 0.7;
}

/* Tooltip Transitions */
.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 0.15s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .reading-activity-chart {
    padding: 12px;
  }

  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .chart-summary {
    flex-wrap: wrap;
    gap: 16px;
  }

  .summary-item {
    flex: 1 1 calc(50% - 8px);
    min-width: 100px;
  }
}

/* Accessibility */
.day-cell:focus-visible {
  outline: 2px solid var(--text-primary);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .day-cell,
  .tooltip-enter-active,
  .tooltip-leave-active {
    transition: none;
  }
}
</style>