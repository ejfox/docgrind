// TypeScript type definitions for Reading Activity Chart Component

export interface ReadingActivity {
  /** Date in YYYY-MM-DD format */
  date: string
  /** Activity value (reading time in minutes, pages read, chapters completed, etc.) */
  value: number
  /** Optional unit override for this specific activity */
  unit?: string
  /** Additional details to show in tooltips */
  details?: Record<string, any>
}

export interface ReadingActivityChartProps {
  /** Array of reading activities */
  activities?: ReadingActivity[]
  /** Start date for the chart (defaults to 1 year ago) */
  startDate?: Date
  /** End date for the chart (defaults to today) */
  endDate?: Date
  /** Title displayed at the top of the chart */
  title?: string
  /** Color theme: 'light', 'dark', or 'auto' */
  theme?: 'light' | 'dark' | 'auto'
  /** Whether to show the summary statistics */
  showSummary?: boolean
  /** Unit of measurement for activities */
  activityUnit?: string
  /** Thresholds for different activity levels [level0, level1, level2, level3, level4] */
  levelThresholds?: number[]
  /** Custom color overrides */
  colors?: ColorOverrides
}

export interface ColorOverrides {
  /** Color for level 0 (no activity) */
  level0?: string
  /** Color for level 1 (low activity) */
  level1?: string
  /** Color for level 2 (medium-low activity) */
  level2?: string
  /** Color for level 3 (medium-high activity) */
  level3?: string
  /** Color for level 4 (high activity) */
  level4?: string
}

export interface DayData {
  /** Date object for this day */
  date: Date
  /** Date string in YYYY-MM-DD format */
  dateString: string
  /** Activity data for this day (if any) */
  activity?: ReadingActivity
  /** Activity level (0-4) */
  level: number
  /** Whether this day is in the future */
  isFuture: boolean
  /** Whether this day is today */
  isToday: boolean
  /** Accessibility label for screen readers */
  ariaLabel: string
}

export interface TooltipData {
  /** Formatted date string for display */
  formattedDate: string
  /** Activity data for this day (if any) */
  activity?: ReadingActivity
}

export interface MonthLabel {
  /** Month name (abbreviated) */
  label: string
  /** Horizontal position in pixels */
  position: number
}

export interface ReadingStats {
  /** Total number of days with activity */
  totalDaysActive: number
  /** Total activity value across all days */
  totalActivityValue: number
  /** Current consecutive day streak */
  currentStreak: number
  /** Longest consecutive day streak */
  longestStreak: number
  /** Average activity per active day */
  averagePerDay: number
  /** Most active day data */
  mostActiveDay?: DayData
  /** Activity breakdown by level */
  levelBreakdown: Record<number, number>
}

export interface ReadingActivityChartEvents {
  /** Emitted when a day cell is clicked */
  dayClick: (day: DayData) => void
}

// Utility types for common reading metrics
export interface TimeBasedActivity extends ReadingActivity {
  /** Reading time in minutes */
  value: number
  details?: {
    /** Number of pages read */
    pages?: number
    /** Book being read */
    book?: string
    /** Chapter or section */
    chapter?: string
    /** Number of reading sessions */
    sessions?: number
    /** Genre of the book */
    genre?: string
    /** Reading location */
    location?: string
    /** Notes about the reading session */
    notes?: string
  }
}

export interface PageBasedActivity extends ReadingActivity {
  /** Number of pages read */
  value: number
  unit: 'pages'
  details?: {
    /** Book being read */
    book?: string
    /** Starting page number */
    startPage?: number
    /** Ending page number */
    endPage?: number
    /** Estimated reading time */
    estimatedTime?: string
    /** Difficulty level */
    difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Very Hard'
    /** Genre of the book */
    genre?: string
    /** Reading speed (pages per minute) */
    readingSpeed?: number
  }
}

export interface ChapterBasedActivity extends ReadingActivity {
  /** Number of chapters completed */
  value: number
  unit: 'chapters'
  details?: {
    /** Book being read */
    book?: string
    /** Starting chapter number */
    startChapter?: number
    /** Ending chapter number */
    endChapter?: number
    /** Chapter titles */
    chapters?: string[]
    /** Genre of the book */
    genre?: string
    /** Total pages in chapters */
    totalPages?: number
    /** Estimated reading time */
    estimatedTime?: string
  }
}

// Configuration types
export interface ChartConfiguration {
  /** Chart dimensions */
  dimensions: {
    /** Width of each day cell */
    cellSize: number
    /** Gap between day cells */
    cellGap: number
    /** Height of month labels */
    monthLabelHeight: number
    /** Width of weekday labels */
    weekdayLabelWidth: number
  }
  /** Animation settings */
  animations: {
    /** Whether to enable animations */
    enabled: boolean
    /** Duration of hover animations */
    hoverDuration: number
    /** Duration of tooltip animations */
    tooltipDuration: number
  }
  /** Accessibility settings */
  accessibility: {
    /** Enable keyboard navigation */
    keyboardNavigation: boolean
    /** Enable screen reader support */
    screenReader: boolean
    /** High contrast mode */
    highContrast: boolean
  }
}

// Export default configuration
export const DEFAULT_CONFIG: ChartConfiguration = {
  dimensions: {
    cellSize: 12,
    cellGap: 3,
    monthLabelHeight: 20,
    weekdayLabelWidth: 24
  },
  animations: {
    enabled: true,
    hoverDuration: 150,
    tooltipDuration: 200
  },
  accessibility: {
    keyboardNavigation: true,
    screenReader: true,
    highContrast: false
  }
}

// Utility functions type definitions
export type DateFormatter = (date: Date) => string
export type ActivityFormatter = (value: number, unit: string) => string
export type LevelCalculator = (value: number, thresholds: number[]) => number
export type StreakCalculator = (activities: ReadingActivity[]) => number

// Theme type definitions
export interface ThemeColors {
  background: {
    primary: string
    secondary: string
  }
  text: {
    primary: string
    secondary: string
    tertiary: string
  }
  border: {
    primary: string
    secondary: string
  }
  activity: {
    level0: string
    level1: string
    level2: string
    level3: string
    level4: string
  }
  tooltip: {
    background: string
    text: string
    border: string
  }
  today: {
    border: string
  }
}

export const LIGHT_THEME: ThemeColors = {
  background: {
    primary: '#ffffff',
    secondary: '#f6f8fa'
  },
  text: {
    primary: '#24292f',
    secondary: '#57606a',
    tertiary: '#6e7781'
  },
  border: {
    primary: '#d0d7de',
    secondary: '#21262d'
  },
  activity: {
    level0: '#ebedf0',
    level1: '#9be9a8',
    level2: '#40c463',
    level3: '#30a14e',
    level4: '#216e39'
  },
  tooltip: {
    background: '#24292f',
    text: '#ffffff',
    border: '#30363d'
  },
  today: {
    border: '#1f2328'
  }
}

export const DARK_THEME: ThemeColors = {
  background: {
    primary: '#0d1117',
    secondary: '#161b22'
  },
  text: {
    primary: '#c9d1d9',
    secondary: '#8b949e',
    tertiary: '#6e7681'
  },
  border: {
    primary: '#30363d',
    secondary: '#f0f6fc'
  },
  activity: {
    level0: '#161b22',
    level1: '#0e4429',
    level2: '#006d32',
    level3: '#26a641',
    level4: '#39d353'
  },
  tooltip: {
    background: '#161b22',
    text: '#c9d1d9',
    border: '#30363d'
  },
  today: {
    border: '#c9d1d9'
  }
}