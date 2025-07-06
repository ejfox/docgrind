# Reading Activity Chart Component

A GitHub-style contribution chart Vue component specifically designed for tracking daily reading activity. This component provides a visual representation of reading habits over time with customizable themes, tooltips, and statistics.

## Features

- **Year-long Activity Grid**: Displays daily reading activity in a familiar GitHub-style contribution chart
- **Intensity Levels**: Shows 5 different activity levels (0-4) based on configurable thresholds
- **Interactive Tooltips**: Hover over days to see detailed reading statistics
- **Theme Support**: Built-in light/dark themes with automatic system preference detection
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Accessibility**: Full keyboard navigation and screen reader support
- **Statistics Summary**: Shows total active days, reading time, current streak, and longest streak
- **Configurable**: Highly customizable colors, thresholds, and activity units

## Installation

Simply copy the `ReadingActivityChart.vue` file to your Vue project.

## Basic Usage

```vue
<template>
  <ReadingActivityChart 
    :activities="readingData"
    title="My Reading Journey"
    activity-unit="minutes"
    @day-click="handleDayClick"
  />
</template>

<script setup>
import ReadingActivityChart from './ReadingActivityChart.vue'

const readingData = [
  {
    date: '2024-01-15',
    value: 45,
    details: {
      pages: 23,
      book: 'The Great Gatsby'
    }
  },
  {
    date: '2024-01-16',
    value: 30,
    details: {
      pages: 15,
      book: 'To Kill a Mockingbird'
    }
  }
  // ... more data
]

function handleDayClick(day) {
  console.log('Clicked day:', day.date, 'Activity:', day.activity)
}
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `activities` | `ReadingActivity[]` | `[]` | Array of reading activity data |
| `startDate` | `Date` | 1 year ago | Start date for the chart |
| `endDate` | `Date` | Today | End date for the chart |
| `title` | `string` | `'Reading Activity'` | Chart title |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Color theme |
| `showSummary` | `boolean` | `true` | Show summary statistics |
| `activityUnit` | `string` | `'minutes'` | Unit for activity values |
| `levelThresholds` | `number[]` | `[0, 15, 30, 60, 120]` | Thresholds for intensity levels |
| `colors` | `ColorOverrides` | `{}` | Custom color overrides |

## Types

### ReadingActivity

```typescript
interface ReadingActivity {
  date: string          // YYYY-MM-DD format
  value: number         // Reading time in minutes, chapters, or pages
  unit?: string         // Optional unit override
  details?: Record<string, any>  // Additional details for tooltip
}
```

### ColorOverrides

```typescript
interface ColorOverrides {
  level0?: string  // No activity color
  level1?: string  // Low activity color
  level2?: string  // Medium-low activity color
  level3?: string  // Medium-high activity color
  level4?: string  // High activity color
}
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `dayClick` | `DayData` | Emitted when a day cell is clicked |

## Advanced Usage

### Custom Activity Units

```vue
<ReadingActivityChart 
  :activities="chaptersData"
  activity-unit="chapters"
  :level-thresholds="[0, 1, 2, 3, 5]"
/>
```

### Custom Colors

```vue
<ReadingActivityChart 
  :activities="readingData"
  :colors="{
    level0: '#f0f0f0',
    level1: '#c6e48b',
    level2: '#7bc96f',
    level3: '#239a3b',
    level4: '#196127'
  }"
/>
```

### Pages-based Tracking

```vue
<ReadingActivityChart 
  :activities="pagesData"
  activity-unit="pages"
  :level-thresholds="[0, 10, 25, 50, 100]"
/>
```

## Example Data Generation

Here's a helper function to generate sample reading data:

```javascript
function generateSampleReadingData() {
  const activities = []
  const startDate = new Date()
  startDate.setFullYear(startDate.getFullYear() - 1)
  
  const books = [
    'The Great Gatsby',
    'To Kill a Mockingbird',
    '1984',
    'Pride and Prejudice',
    'The Catcher in the Rye',
    'Harry Potter and the Sorcerer\'s Stone',
    'The Lord of the Rings',
    'Dune',
    'The Handmaid\'s Tale',
    'Brave New World'
  ]
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    // Random chance of reading activity (70% chance)
    if (Math.random() < 0.7) {
      const readingTime = Math.floor(Math.random() * 120) + 15 // 15-135 minutes
      const pages = Math.floor(readingTime / 2) // Assuming 2 minutes per page
      const book = books[Math.floor(Math.random() * books.length)]
      
      activities.push({
        date: date.toISOString().split('T')[0],
        value: readingTime,
        details: {
          pages: pages,
          book: book,
          session: Math.floor(Math.random() * 3) + 1 // 1-3 sessions
        }
      })
    }
  }
  
  return activities
}
```

## Styling and Theming

The component includes comprehensive CSS custom properties for theming:

```css
/* Light theme variables */
.theme-light {
  --bg-primary: #ffffff;
  --text-primary: #24292f;
  --color-level-0: #ebedf0;
  --color-level-1: #9be9a8;
  --color-level-2: #40c463;
  --color-level-3: #30a14e;
  --color-level-4: #216e39;
}

/* Dark theme variables */
.theme-dark {
  --bg-primary: #0d1117;
  --text-primary: #c9d1d9;
  --color-level-0: #161b22;
  --color-level-1: #0e4429;
  --color-level-2: #006d32;
  --color-level-3: #26a641;
  --color-level-4: #39d353;
}
```

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support with proper focus management
- **Screen Reader Support**: ARIA labels and semantic HTML structure
- **High Contrast**: Proper contrast ratios for all theme variants
- **Reduced Motion**: Respects user's motion preferences
- **Tooltips**: Accessible tooltips with proper ARIA attributes

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- iOS Safari 14+
- Android Chrome 88+

## Performance Considerations

- **Virtualization**: Not implemented for year-long views (365 days), but could be added for multi-year views
- **Memoization**: Day calculations are memoized for performance
- **Efficient Updates**: Only re-renders affected components when data changes

## Examples of Different Reading Metrics

### Time-based Reading

```javascript
const timeBasedData = [
  {
    date: '2024-01-15',
    value: 45, // 45 minutes
    details: {
      sessions: 1,
      book: 'Dune',
      chapter: 'Chapter 3'
    }
  }
]
```

### Page-based Reading

```javascript
const pageBasedData = [
  {
    date: '2024-01-15',
    value: 23, // 23 pages
    unit: 'pages',
    details: {
      book: 'The Great Gatsby',
      startPage: 45,
      endPage: 68
    }
  }
]
```

### Chapter-based Reading

```javascript
const chapterBasedData = [
  {
    date: '2024-01-15',
    value: 2, // 2 chapters
    unit: 'chapters',
    details: {
      book: 'Harry Potter',
      chapters: ['Chapter 5', 'Chapter 6']
    }
  }
]
```

## Contributing

Feel free to submit issues and enhancement requests. The component is designed to be extensible and customizable.

## License

MIT License - feel free to use in your projects!