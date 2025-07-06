# DocGrind Data Schema Documentation

## Overview

This document outlines the comprehensive data schema for the DocGrind application, designed to track reading progress through MDN JavaScript documentation with session-based reading, exercise completion, and GitHub-style contribution tracking.

## Schema Design Principles

### 1. **localStorage Optimization**
- Flat structure where possible to minimize JSON parsing overhead
- Efficient indexing using Record<string, T> for quick lookups
- Computed values cached to avoid recalculation
- Automatic cleanup of old data to prevent storage bloat

### 2. **Extensibility**
- Version field for schema migrations
- Flexible exercise types and session modes
- Pluggable statistics computation
- Export/import capabilities for data portability

### 3. **Data Integrity**
- TypeScript interfaces for compile-time validation
- Runtime validation functions
- Automatic data migration between schema versions
- Fallback to defaults for missing or corrupted data

### 4. **Performance**
- Computed statistics cached and updated incrementally
- Auto-save mechanism to prevent data loss
- Efficient chart data generation
- Minimal data processing in critical paths

## Core Data Structures

### 1. UserProgress (Root Object)
```typescript
interface UserProgress {
  version: string;           // Schema version for migrations
  userId: string;            // Generated UUID for user identification
  createdAt: string;         // Account creation timestamp
  lastActiveAt: string;      // Last activity timestamp
  
  currentSession: SessionData | null;  // Active reading session
  chapters: Record<string, ChapterProgress>;  // Chapter progress by ID
  exercises: Record<string, ExerciseProgress>; // Exercise progress by ID
  dailyActivity: Record<string, DailyActivity>; // Daily metrics by date
  sessions: SessionHistory[];  // Recent session history
  
  settings: UserSettings;    // User preferences
  stats: ComputedStats;      // Cached statistics
}
```

**Storage Key**: `docgrind_user_progress`

**Design Decisions**:
- Single root object minimizes localStorage operations
- Record<string, T> provides O(1) lookups for chapters and exercises
- Separate current session for easy access and updates
- Limited session history (last 100) to prevent unbounded growth

### 2. SessionData (Current Reading Session)
```typescript
interface SessionData {
  id: string;                // Unique session identifier
  mode: SessionMode;         // 5min, 15min, joy, zen
  startTime: string;         // ISO timestamp
  endTime: string | null;    // ISO timestamp when completed
  targetDuration: number;    // Planned duration in minutes
  
  chapterId: string;         // Chapter being read
  scrollPosition: number;    // Current scroll position
  readingProgress: number;   // Percentage complete (0-100)
  
  timeSpent: number;         // Actual reading time
  wordsRead: number;         // Estimated words read
  pausedDuration: number;    // Time spent paused
  
  isActive: boolean;         // Currently reading
  isPaused: boolean;         // Session paused
  isCompleted: boolean;      // Session finished successfully
  wasInterrupted: boolean;   // Session ended early
}
```

**Design Decisions**:
- Separate active state tracking for UI responsiveness
- Granular time tracking for accurate statistics
- Progress percentage stored for quick resume capability
- Interruption tracking for completion rate analysis

### 3. ChapterProgress (Reading Progress)
```typescript
interface ChapterProgress {
  id: string;                // MDN chapter identifier
  title: string;             // Chapter title
  url: string;               // MDN URL
  category: string;          // Content category
  
  status: ChapterStatus;     // not_started, in_progress, completed, exercises_pending
  completionPercentage: number;  // Reading progress (0-100)
  lastScrollPosition: number;    // Resume position
  
  estimatedWordCount: number;    // Chapter length
  estimatedReadingTime: number;  // Expected reading time
  
  sessionsStarted: number;       // Total sessions for this chapter
  sessionsCompleted: number;     // Completed sessions
  totalTimeSpent: number;        // Total reading time
  
  firstStarted: string | null;   // First read timestamp
  lastAccessed: string | null;   // Last read timestamp
  completedAt: string | null;    // Completion timestamp
  
  exercisesGenerated: boolean;   // Exercises created
  exercisesCompleted: number;    // Completed exercises
  exercisesTotal: number;        // Total exercises
}
```

**Design Decisions**:
- Status enum for clear state management
- Both percentage and scroll position for flexible resumption
- Time tracking for reading speed analysis
- Exercise integration for completion flow

### 4. ExerciseProgress (Practice Exercises)
```typescript
interface ExerciseProgress {
  id: string;                // Generated UUID
  chapterId: string;         // Parent chapter
  type: ExerciseType;        // multiple_choice, code_completion, debugging, implementation
  title: string;             // Exercise title
  description: string;       // Exercise description
  
  prompt: string;            // Exercise prompt
  expectedOutput?: string;   // Expected result
  hints: string[];           // Available hints
  difficulty: 'easy' | 'medium' | 'hard';
  
  status: ExerciseStatus;    // pending, in_progress, completed, skipped
  attempts: ExerciseAttempt[]; // All attempts
  
  userCode: string;          // Current/final solution
  isCorrect: boolean;        // Success status
  
  createdAt: string;         // Exercise creation time
  firstAttemptAt: string | null;  // First attempt time
  completedAt: string | null;     // Completion time
  
  timeSpent: number;         // Total time on exercise
  hintsUsed: number;         // Hints revealed
}
```

**Design Decisions**:
- Flexible exercise types for different learning styles
- Complete attempt history for learning analysis
- Hint system with usage tracking
- Time tracking for performance metrics

### 5. DailyActivity (Contribution Chart Data)
```typescript
interface DailyActivity {
  date: string;              // YYYY-MM-DD format
  
  chaptersRead: number;      // Unique chapters accessed
  chaptersCompleted: number; // Chapters finished
  sessionsCompleted: number; // Sessions completed
  totalReadingTime: number;  // Minutes reading
  
  exercisesAttempted: number; // Exercises tried
  exercisesCompleted: number; // Exercises completed
  exerciseTime: number;       // Minutes on exercises
  
  totalActiveTime: number;    // Total active minutes
  streak: number;             // Current streak (computed)
  intensity: number;          // 0-4 for chart display
  
  sessionModes: SessionMode[]; // Modes used today
}
```

**Design Decisions**:
- Date as key for efficient chart generation
- Separate reading and exercise metrics
- Intensity calculation for GitHub-style visualization
- Session mode tracking for usage pattern analysis

## Data Storage Strategy

### Computed vs Stored Data

#### Stored Data (Persistent)
- Raw session timestamps and durations
- Chapter completion percentages
- Exercise attempts and solutions
- User settings and preferences
- Daily activity snapshots

#### Computed Data (Calculated)
- Current streaks (from daily activity)
- Overall progress percentages
- Average session durations
- Reading speed estimates
- Chart visualization data

### Performance Optimizations

#### Caching Strategy
```typescript
interface ComputedStats {
  lastUpdated: string;       // Cache timestamp
  
  // Cached expensive calculations
  currentStreak: number;
  overallProgressPercentage: number;
  averageSessionDuration: number;
  // ... other computed values
}
```

#### Auto-save Mechanism
- 30-second auto-save interval
- Immediate save on critical operations
- Graceful handling of storage failures
- Background save without blocking UI

#### Data Cleanup
- Session history limited to last 100 entries
- Daily activity retention based on user settings
- Automatic pruning of old exercise attempts
- Configurable data retention policies

## Migration Strategy

### Schema Versioning
```typescript
interface MigrationScript {
  from: string;              // Source version
  to: string;                // Target version
  migrate: (oldData: any) => UserProgress;
  rollback?: (newData: UserProgress) => any;
}
```

### Migration Process
1. **Version Detection**: Check stored data version
2. **Script Selection**: Find applicable migration scripts
3. **Sequential Migration**: Apply migrations in order
4. **Validation**: Verify migrated data integrity
5. **Fallback**: Use default values for missing data

### Example Migration
```typescript
// v1.0.0 to v1.1.0 - Add exercise difficulty
{
  from: '1.0.0',
  to: '1.1.0',
  migrate: (oldData) => ({
    ...oldData,
    version: '1.1.0',
    exercises: Object.fromEntries(
      Object.entries(oldData.exercises).map(([id, exercise]) => [
        id,
        { ...exercise, difficulty: 'medium' } // Default difficulty
      ])
    )
  })
}
```

## API Usage Examples

### Starting a Reading Session
```typescript
import { getDataManager } from './types/data-manager';

const dataManager = getDataManager();

// Start a 15-minute session
const session = dataManager.startSession('mdn-js-variables', SessionMode.FIFTEEN_MIN);

// Update progress during reading
dataManager.updateSession({
  scrollPosition: 1200,
  readingProgress: 45,
  timeSpent: 8,
  wordsRead: 340
});

// Complete the session
dataManager.completeSession();
```

### Exercise Management
```typescript
// Generate exercises after chapter completion
const exercises = dataManager.generateExercises('mdn-js-variables');

// Submit an exercise attempt
dataManager.submitExerciseAttempt(
  exercises[0].id,
  'const x = 5;',
  true,
  'Variable declared successfully'
);
```

### Progress Tracking
```typescript
// Get current statistics
const stats = dataManager.getStats();
console.log(`Current streak: ${stats.currentStreak} days`);

// Get chart data for visualization
const chartData = dataManager.getDailyActivityForChart(365);

// Create shareable progress snapshot
const shareableData = dataManager.createShareableSnapshot();
```

### Data Export/Import
```typescript
// Export user data for backup
const exportData = dataManager.exportData();

// Import data from backup
const success = dataManager.importData(exportData);
```

## Integration Points

### UI Components
- **Session Timer**: Binds to `currentSession.timeSpent`
- **Progress Bar**: Uses `chapterProgress.completionPercentage`
- **Streak Counter**: Displays `stats.currentStreak`
- **Activity Chart**: Renders `dailyActivity` with intensity values

### Email Reminders
- **Trigger**: No daily activity detected
- **Data**: `settings.emailReminders` configuration
- **Context**: Current streak for motivation

### Exercise Generation
- **Trigger**: Chapter completion or manual request
- **Input**: Chapter content and metadata
- **Output**: 3 exercises with varying difficulty

### Local Storage
- **Primary**: `docgrind_user_progress` (main data)
- **Secondary**: `docgrind_chapter_metadata` (content structure)
- **Settings**: `docgrind_user_settings` (preferences)
- **Version**: `docgrind_schema_version` (migration tracking)

## Testing Strategy

### Mock Data
```typescript
// Example test data available in schema.ts
const testProgress = EXAMPLE_USER_PROGRESS;
```

### Data Validation
```typescript
// Validate data structure
const isValid = validateUserProgress(userData);

// Validate specific components
const chapterValid = validateChapterMetadata(chapterData);
```

### Migration Testing
```typescript
// Test migration from v1.0.0 to v1.1.0
const migratedData = migrateUserData(oldData);
```

## Security Considerations

### Data Privacy
- No personally identifiable information stored
- Generated UUIDs for user identification
- Email addresses only for reminders (optional)
- No data transmission to external servers

### Data Integrity
- TypeScript interfaces prevent invalid data
- Runtime validation for critical operations
- Error handling for localStorage failures
- Backup and restore capabilities

### Storage Limits
- Monitor localStorage usage
- Implement data cleanup policies
- Provide export functionality before limits
- Graceful degradation when storage full

## Future Extensibility

### Planned Features
- **Achievements System**: Badge tracking for milestones
- **Social Features**: Progress sharing and comparison
- **Advanced Analytics**: Learning pattern analysis
- **Content Customization**: Personal reading preferences

### Schema Extensions
- **Achievement Data**: New root-level object
- **Social Data**: Friend connections and shared progress
- **Analytics Data**: Detailed behavior tracking
- **Content Data**: User-generated notes and bookmarks

### Integration Points
- **API Endpoints**: Future server-side synchronization
- **Third-party Services**: Calendar integration, productivity tools
- **Export Formats**: PDF reports, CSV data, JSON backups
- **Import Sources**: Other learning platforms, reading apps