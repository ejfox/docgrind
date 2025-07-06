<template>
  <div class="reading-activity-example">
    <div class="container">
      <h1>Reading Activity Chart Examples</h1>
      
      <!-- Basic Example -->
      <section class="example-section">
        <h2>Basic Time-based Reading Activity</h2>
        <ReadingActivityChart 
          :activities="timeBasedData"
          title="Daily Reading Time"
          activity-unit="minutes"
          @day-click="handleDayClick"
        />
      </section>

      <!-- Pages Example -->
      <section class="example-section">
        <h2>Page-based Reading Activity</h2>
        <ReadingActivityChart 
          :activities="pageBasedData"
          title="Daily Pages Read"
          activity-unit="pages"
          :level-thresholds="[0, 5, 15, 30, 50]"
          @day-click="handleDayClick"
        />
      </section>

      <!-- Chapters Example -->
      <section class="example-section">
        <h2>Chapter-based Reading Activity</h2>
        <ReadingActivityChart 
          :activities="chapterBasedData"
          title="Daily Chapters Completed"
          activity-unit="chapters"
          :level-thresholds="[0, 1, 2, 3, 5]"
          @day-click="handleDayClick"
        />
      </section>

      <!-- Custom Colors Example -->
      <section class="example-section">
        <h2>Custom Color Scheme</h2>
        <ReadingActivityChart 
          :activities="timeBasedData"
          title="Reading Activity (Custom Colors)"
          activity-unit="minutes"
          :colors="customColors"
          @day-click="handleDayClick"
        />
      </section>

      <!-- Dark Theme Example -->
      <section class="example-section">
        <h2>Dark Theme</h2>
        <ReadingActivityChart 
          :activities="timeBasedData"
          title="Reading Activity (Dark Theme)"
          activity-unit="minutes"
          theme="dark"
          @day-click="handleDayClick"
        />
      </section>

      <!-- No Summary Example -->
      <section class="example-section">
        <h2>Compact View (No Summary)</h2>
        <ReadingActivityChart 
          :activities="timeBasedData"
          title="Reading Activity (Compact)"
          activity-unit="minutes"
          :show-summary="false"
          @day-click="handleDayClick"
        />
      </section>

      <!-- Controls -->
      <section class="controls-section">
        <h2>Data Controls</h2>
        <div class="controls">
          <button @click="generateNewData" class="btn btn-primary">
            Generate New Sample Data
          </button>
          <button @click="addTodayActivity" class="btn btn-secondary">
            Add Today's Activity
          </button>
          <button @click="clearData" class="btn btn-danger">
            Clear All Data
          </button>
        </div>
      </section>

      <!-- Day Details Modal -->
      <div v-if="selectedDay" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <h3>Reading Details</h3>
          <div class="day-details">
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">{{ formatDate(selectedDay.date) }}</span>
            </div>
            <div v-if="selectedDay.activity" class="detail-row">
              <span class="label">Total Time:</span>
              <span class="value">{{ formatActivityValue(selectedDay.activity.value) }}</span>
            </div>
            <div v-if="selectedDay.activity?.details" class="details-grid">
              <div v-for="(value, key) in selectedDay.activity.details" :key="key" class="detail-row">
                <span class="label">{{ capitalize(key) }}:</span>
                <span class="value">{{ value }}</span>
              </div>
            </div>
            <div v-if="!selectedDay.activity" class="no-activity">
              No reading activity recorded for this day.
            </div>
          </div>
          <button @click="closeModal" class="btn btn-primary">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ReadingActivityChart from './ReadingActivityChart.vue'
import type { ReadingActivity } from './ReadingActivityChart.vue'

// Sample data
const timeBasedData = ref<ReadingActivity[]>([])
const pageBasedData = ref<ReadingActivity[]>([])
const chapterBasedData = ref<ReadingActivity[]>([])
const selectedDay = ref<any>(null)

// Custom colors
const customColors = {
  level0: '#f0f0f0',
  level1: '#ffebcd',
  level2: '#ffa500',
  level3: '#ff6347',
  level4: '#dc143c'
}

// Sample books for data generation
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
  'Brave New World',
  'The Hobbit',
  'Jane Eyre',
  'Wuthering Heights',
  'The Chronicles of Narnia',
  'Foundation',
  'Neuromancer',
  'The Martian',
  'Gone Girl',
  'The Girl with the Dragon Tattoo',
  'The Kite Runner'
]

// Generate sample data
function generateTimeBasedData(): ReadingActivity[] {
  const activities: ReadingActivity[] = []
  const startDate = new Date()
  startDate.setFullYear(startDate.getFullYear() - 1)
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    // 70% chance of reading activity
    if (Math.random() < 0.7) {
      const readingTime = Math.floor(Math.random() * 120) + 15 // 15-135 minutes
      const pages = Math.floor(readingTime / 2) // Assuming 2 minutes per page
      const book = books[Math.floor(Math.random() * books.length)]
      const sessions = Math.floor(Math.random() * 3) + 1
      
      activities.push({
        date: date.toISOString().split('T')[0],
        value: readingTime,
        details: {
          pages: pages,
          book: book,
          sessions: sessions,
          genre: getRandomGenre()
        }
      })
    }
  }
  
  return activities
}

function generatePageBasedData(): ReadingActivity[] {
  const activities: ReadingActivity[] = []
  const startDate = new Date()
  startDate.setFullYear(startDate.getFullYear() - 1)
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    // 65% chance of reading activity
    if (Math.random() < 0.65) {
      const pages = Math.floor(Math.random() * 60) + 5 // 5-65 pages
      const book = books[Math.floor(Math.random() * books.length)]
      const estimatedTime = pages * 2 // 2 minutes per page
      
      activities.push({
        date: date.toISOString().split('T')[0],
        value: pages,
        unit: 'pages',
        details: {
          book: book,
          estimatedTime: `${estimatedTime} min`,
          difficulty: getRandomDifficulty(),
          genre: getRandomGenre()
        }
      })
    }
  }
  
  return activities
}

function generateChapterBasedData(): ReadingActivity[] {
  const activities: ReadingActivity[] = []
  const startDate = new Date()
  startDate.setFullYear(startDate.getFullYear() - 1)
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    // 60% chance of reading activity
    if (Math.random() < 0.6) {
      const chapters = Math.floor(Math.random() * 4) + 1 // 1-4 chapters
      const book = books[Math.floor(Math.random() * books.length)]
      const startChapter = Math.floor(Math.random() * 20) + 1
      
      activities.push({
        date: date.toISOString().split('T')[0],
        value: chapters,
        unit: 'chapters',
        details: {
          book: book,
          startChapter: startChapter,
          endChapter: startChapter + chapters - 1,
          genre: getRandomGenre()
        }
      })
    }
  }
  
  return activities
}

function getRandomGenre(): string {
  const genres = ['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy', 'Biography', 'History']
  return genres[Math.floor(Math.random() * genres.length)]
}

function getRandomDifficulty(): string {
  const difficulties = ['Easy', 'Medium', 'Hard', 'Very Hard']
  return difficulties[Math.floor(Math.random() * difficulties.length)]
}

// Event handlers
function handleDayClick(day: any) {
  selectedDay.value = day
}

function closeModal() {
  selectedDay.value = null
}

function generateNewData() {
  timeBasedData.value = generateTimeBasedData()
  pageBasedData.value = generatePageBasedData()
  chapterBasedData.value = generateChapterBasedData()
}

function addTodayActivity() {
  const today = new Date().toISOString().split('T')[0]
  const readingTime = Math.floor(Math.random() * 90) + 30 // 30-120 minutes
  const pages = Math.floor(readingTime / 2)
  const book = books[Math.floor(Math.random() * books.length)]
  
  // Remove existing activity for today if any
  timeBasedData.value = timeBasedData.value.filter(a => a.date !== today)
  pageBasedData.value = pageBasedData.value.filter(a => a.date !== today)
  chapterBasedData.value = chapterBasedData.value.filter(a => a.date !== today)
  
  // Add new activity
  timeBasedData.value.push({
    date: today,
    value: readingTime,
    details: {
      pages: pages,
      book: book,
      sessions: 1,
      genre: getRandomGenre()
    }
  })
  
  pageBasedData.value.push({
    date: today,
    value: pages,
    unit: 'pages',
    details: {
      book: book,
      estimatedTime: `${readingTime} min`,
      difficulty: getRandomDifficulty(),
      genre: getRandomGenre()
    }
  })
  
  chapterBasedData.value.push({
    date: today,
    value: Math.floor(Math.random() * 3) + 1,
    unit: 'chapters',
    details: {
      book: book,
      genre: getRandomGenre()
    }
  })
}

function clearData() {
  timeBasedData.value = []
  pageBasedData.value = []
  chapterBasedData.value = []
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatActivityValue(value: number): string {
  if (value >= 60) {
    const hours = Math.floor(value / 60)
    const minutes = value % 60
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }
  return `${value}m`
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Initialize data on mount
onMounted(() => {
  generateNewData()
})
</script>

<style scoped>
.reading-activity-example {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 40px;
  font-size: 2.5rem;
  font-weight: 700;
}

.example-section {
  margin-bottom: 40px;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.example-section h2 {
  color: #34495e;
  margin-bottom: 20px;
  font-size: 1.5rem;
  font-weight: 600;
}

.controls-section {
  margin-top: 40px;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.controls {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 1.5rem;
}

.day-details {
  margin-bottom: 30px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #ecf0f1;
}

.detail-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #34495e;
}

.value {
  color: #2c3e50;
  text-align: right;
}

.details-grid {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ecf0f1;
}

.no-activity {
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
  padding: 20px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }

  h1 {
    font-size: 2rem;
  }

  .example-section {
    padding: 20px;
  }

  .controls {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .modal-content {
    margin: 20px;
    width: calc(100% - 40px);
  }
}
</style>