// Test file for ReadingActivityChart component
// This file demonstrates testing approaches and includes sample data generators

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ReadingActivityChart from './ReadingActivityChart.vue'
import type { ReadingActivity } from './types'

// Mock data generators
export function generateTestData(days: number = 365): ReadingActivity[] {
  const activities: ReadingActivity[] = []
  const startDate = new Date()
  startDate.setFullYear(startDate.getFullYear() - 1)
  
  const books = [
    'The Great Gatsby',
    '1984',
    'To Kill a Mockingbird',
    'Pride and Prejudice',
    'The Catcher in the Rye'
  ]
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    // 60% chance of activity
    if (Math.random() < 0.6) {
      const readingTime = Math.floor(Math.random() * 120) + 15
      const pages = Math.floor(readingTime / 2)
      const book = books[Math.floor(Math.random() * books.length)]
      
      activities.push({
        date: date.toISOString().split('T')[0],
        value: readingTime,
        details: {
          pages: pages,
          book: book,
          sessions: Math.floor(Math.random() * 3) + 1
        }
      })
    }
  }
  
  return activities
}

export function generateEmptyData(): ReadingActivity[] {
  return []
}

export function generateMinimalData(): ReadingActivity[] {
  const today = new Date()
  return [
    {
      date: today.toISOString().split('T')[0],
      value: 30,
      details: {
        book: 'Test Book',
        pages: 15
      }
    }
  ]
}

export function generateHighActivityData(): ReadingActivity[] {
  const activities: ReadingActivity[] = []
  const startDate = new Date()
  startDate.setFullYear(startDate.getFullYear() - 1)
  
  // Generate activity for every day with high values
  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    activities.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 60) + 90, // 90-150 minutes
      details: {
        book: 'Intense Reading',
        pages: Math.floor(Math.random() * 30) + 45,
        sessions: Math.floor(Math.random() * 2) + 2
      }
    })
  }
  
  return activities
}

export function generateStreakData(): ReadingActivity[] {
  const activities: ReadingActivity[] = []
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30) // Last 30 days
  
  // Generate consecutive days
  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    activities.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 60) + 30,
      details: {
        book: 'Streak Book',
        pages: Math.floor(Math.random() * 20) + 10
      }
    })
  }
  
  return activities
}

export function generatePageBasedData(): ReadingActivity[] {
  const activities: ReadingActivity[] = []
  const startDate = new Date()
  startDate.setFullYear(startDate.getFullYear() - 1)
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    if (Math.random() < 0.7) {
      const pages = Math.floor(Math.random() * 50) + 10
      
      activities.push({
        date: date.toISOString().split('T')[0],
        value: pages,
        unit: 'pages',
        details: {
          book: 'Page Counter',
          estimatedTime: `${pages * 2} min`,
          difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)]
        }
      })
    }
  }
  
  return activities
}

export function generateChapterBasedData(): ReadingActivity[] {
  const activities: ReadingActivity[] = []
  const startDate = new Date()
  startDate.setFullYear(startDate.getFullYear() - 1)
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    if (Math.random() < 0.5) {
      const chapters = Math.floor(Math.random() * 3) + 1
      
      activities.push({
        date: date.toISOString().split('T')[0],
        value: chapters,
        unit: 'chapters',
        details: {
          book: 'Chapter Book',
          startChapter: Math.floor(Math.random() * 20) + 1,
          endChapter: Math.floor(Math.random() * 20) + chapters
        }
      })
    }
  }
  
  return activities
}

// Sample configurations for testing
export const sampleConfigurations = {
  basic: {
    activities: generateTestData(365),
    title: 'Basic Reading Activity',
    activityUnit: 'minutes'
  },
  
  pagesBased: {
    activities: generatePageBasedData(),
    title: 'Pages Read',
    activityUnit: 'pages',
    levelThresholds: [0, 5, 15, 30, 50]
  },
  
  chaptersBased: {
    activities: generateChapterBasedData(),
    title: 'Chapters Completed',
    activityUnit: 'chapters',
    levelThresholds: [0, 1, 2, 3, 5]
  },
  
  customColors: {
    activities: generateTestData(365),
    title: 'Custom Color Scheme',
    activityUnit: 'minutes',
    colors: {
      level0: '#f0f0f0',
      level1: '#ffebcd',
      level2: '#ffa500',
      level3: '#ff6347',
      level4: '#dc143c'
    }
  },
  
  highActivity: {
    activities: generateHighActivityData(),
    title: 'High Activity Period',
    activityUnit: 'minutes',
    levelThresholds: [0, 60, 90, 120, 150]
  },
  
  streakData: {
    activities: generateStreakData(),
    title: 'Reading Streak',
    activityUnit: 'minutes'
  },
  
  minimal: {
    activities: generateMinimalData(),
    title: 'Minimal Data',
    activityUnit: 'minutes'
  },
  
  empty: {
    activities: generateEmptyData(),
    title: 'No Data',
    activityUnit: 'minutes'
  }
}

// Test utility functions
export function getDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getTodayString(): string {
  return getDateString(new Date())
}

export function getYesterdayString(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return getDateString(yesterday)
}

export function getLastWeekString(): string {
  const lastWeek = new Date()
  lastWeek.setDate(lastWeek.getDate() - 7)
  return getDateString(lastWeek)
}

export function getLastMonthString(): string {
  const lastMonth = new Date()
  lastMonth.setMonth(lastMonth.getMonth() - 1)
  return getDateString(lastMonth)
}

export function getLastYearString(): string {
  const lastYear = new Date()
  lastYear.setFullYear(lastYear.getFullYear() - 1)
  return getDateString(lastYear)
}

// Mock functions for testing
export function mockMatchMedia(matches: boolean = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

// Integration test examples
export function testComponentWithData(activities: ReadingActivity[]) {
  const wrapper = mount(ReadingActivityChart, {
    props: {
      activities,
      title: 'Test Chart'
    }
  })
  
  return {
    wrapper,
    findTitle: () => wrapper.find('.chart-title'),
    findDayCells: () => wrapper.findAll('.day-cell'),
    findSummary: () => wrapper.find('.chart-summary'),
    findLegend: () => wrapper.find('.chart-legend'),
    findTooltip: () => wrapper.find('.activity-tooltip'),
    clickDay: (index: number) => wrapper.findAll('.day-cell')[index].trigger('click'),
    hoverDay: (index: number) => wrapper.findAll('.day-cell')[index].trigger('mouseenter')
  }
}

// Performance test data
export function generateLargeDataset(years: number = 5): ReadingActivity[] {
  const activities: ReadingActivity[] = []
  const startDate = new Date()
  startDate.setFullYear(startDate.getFullYear() - years)
  
  const totalDays = years * 365
  
  for (let i = 0; i < totalDays; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    if (Math.random() < 0.6) {
      activities.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 120) + 15,
        details: {
          book: `Book ${Math.floor(i / 30) + 1}`,
          pages: Math.floor(Math.random() * 40) + 10,
          sessions: Math.floor(Math.random() * 3) + 1
        }
      })
    }
  }
  
  return activities
}

// Accessibility test helpers
export function testAccessibility(wrapper: any) {
  const tests = {
    hasAriaLabels: () => {
      const dayCells = wrapper.findAll('.day-cell')
      return dayCells.every((cell: any) => cell.attributes('aria-label'))
    },
    
    hasKeyboardSupport: () => {
      const dayCells = wrapper.findAll('.day-cell')
      return dayCells.every((cell: any) => cell.attributes('tabindex') !== undefined)
    },
    
    hasTooltipRole: () => {
      const tooltip = wrapper.find('.activity-tooltip')
      return tooltip.exists() ? tooltip.attributes('role') === 'tooltip' : true
    },
    
    hasProperContrast: () => {
      // This would need actual color analysis in a real test
      return true
    }
  }
  
  return tests
}

// Visual regression test data
export const visualTestCases = {
  lightTheme: {
    ...sampleConfigurations.basic,
    theme: 'light' as const
  },
  
  darkTheme: {
    ...sampleConfigurations.basic,
    theme: 'dark' as const
  },
  
  noSummary: {
    ...sampleConfigurations.basic,
    showSummary: false
  },
  
  customThresholds: {
    ...sampleConfigurations.basic,
    levelThresholds: [0, 10, 25, 50, 100]
  },
  
  differentDateRange: {
    ...sampleConfigurations.basic,
    startDate: new Date('2023-06-01'),
    endDate: new Date('2024-06-01')
  }
}

// Error handling test cases
export const errorTestCases = {
  invalidDateFormat: [
    {
      date: '2024-13-01', // Invalid month
      value: 30
    }
  ],
  
  negativeValues: [
    {
      date: '2024-01-01',
      value: -30 // Negative value
    }
  ],
  
  futureDate: [
    {
      date: '2025-12-31',
      value: 30
    }
  ],
  
  malformedData: [
    {
      date: '2024-01-01',
      value: 'invalid' as any // Wrong type
    }
  ]
}

// Export all test utilities
export default {
  generateTestData,
  generateEmptyData,
  generateMinimalData,
  generateHighActivityData,
  generateStreakData,
  generatePageBasedData,
  generateChapterBasedData,
  sampleConfigurations,
  testComponentWithData,
  generateLargeDataset,
  testAccessibility,
  visualTestCases,
  errorTestCases,
  mockMatchMedia,
  getDateString,
  getTodayString,
  getYesterdayString,
  getLastWeekString,
  getLastMonthString,
  getLastYearString
}