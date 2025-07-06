<template>
  <div class="exercise-card">
    <div class="exercise-header">
      <h3 class="exercise-title">{{ exercise.title }}</h3>
      <div class="exercise-meta">
        <span class="exercise-type">{{ exercise.type }}</span>
        <span class="exercise-difficulty">{{ exercise.difficulty }}</span>
        <span v-if="exercise.completed" class="exercise-completed">✓</span>
      </div>
    </div>

    <div class="exercise-description">
      {{ exercise.description }}
    </div>

    <div class="exercise-content">
      <!-- Coding Exercise -->
      <div v-if="exercise.type === 'coding'" class="coding-exercise">
        <div class="code-editor">
          <textarea
            v-model="userAnswer"
            :placeholder="exercise.starterCode || 'Write your code here...'"
            class="code-input"
            rows="10"
            :disabled="exercise.completed"
          />
        </div>
      </div>

      <!-- Multiple Choice Exercise -->
      <div v-else-if="exercise.type === 'multiple-choice'" class="multiple-choice">
        <div class="choices">
          <label v-for="(choice, index) in parseChoices(exercise.correctAnswer)" :key="index" class="choice">
            <input
              type="radio"
              :value="choice"
              v-model="userAnswer"
              :disabled="exercise.completed"
            />
            <span>{{ choice }}</span>
          </label>
        </div>
      </div>

      <!-- Fill in the Blank Exercise -->
      <div v-else-if="exercise.type === 'fill-blank'" class="fill-blank">
        <div class="blank-container">
          <input
            type="text"
            v-model="userAnswer"
            placeholder="Fill in the blank..."
            class="blank-input"
            :disabled="exercise.completed"
          />
        </div>
      </div>
    </div>

    <div class="exercise-actions">
      <button 
        @click="submitAnswer" 
        :disabled="!userAnswer || isSubmitting || exercise.completed"
        class="btn btn-primary"
      >
        {{ isSubmitting ? '[submitting...]' : (exercise.completed ? '[completed]' : '[submit]') }}
      </button>

      <button 
        @click="showHint" 
        :disabled="currentHintIndex >= exercise.hints.length"
        class="btn btn-secondary"
      >
        [hint {{ currentHintIndex + 1 }}/{{ exercise.hints.length }}]
      </button>

      <button 
        v-if="exercise.completed"
        @click="resetExercise"
        class="btn btn-secondary"
      >
        [reset]
      </button>
    </div>

    <div v-if="currentHint" class="exercise-hint">
      <strong>Hint:</strong> {{ currentHint }}
    </div>

    <div v-if="showResult" class="exercise-result">
      <div v-if="isCorrect" class="result-correct">
        <strong>Correct!</strong> {{ exercise.explanation }}
      </div>
      <div v-else class="result-incorrect">
        <strong>Incorrect.</strong> Try again or use a hint.
      </div>
    </div>

    <div v-if="exercise.attempts > 0" class="exercise-stats">
      Attempts: {{ exercise.attempts }}
      <span v-if="exercise.hintsUsed > 0"> | Hints used: {{ exercise.hintsUsed }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Exercise } from '~/types/schema'

interface Props {
  exercise: Exercise
}

const props = defineProps<Props>()
const emit = defineEmits<{
  submit: [exerciseId: string, answer: string, hintsUsed: number]
  reset: [exerciseId: string]
}>()

const { submitExercise, getHint, resetExercise: resetExerciseData } = useExercises()

const userAnswer = ref('')
const currentHint = ref('')
const currentHintIndex = ref(0)
const isSubmitting = ref(false)
const showResult = ref(false)
const isCorrect = ref(false)

// Initialize user answer for completed exercises
if (props.exercise.completed && props.exercise.lastAttempt) {
  userAnswer.value = props.exercise.lastAttempt.answer
}

const parseChoices = (choices: string): string[] => {
  // Parse choices from string format like "A) Option 1\nB) Option 2"
  return choices.split('\n').filter(c => c.trim().length > 0)
}

const showHint = () => {
  if (currentHintIndex.value < props.exercise.hints.length) {
    currentHint.value = props.exercise.hints[currentHintIndex.value]
    currentHintIndex.value++
  }
}

const submitAnswer = async () => {
  if (!userAnswer.value || isSubmitting.value) return

  isSubmitting.value = true
  showResult.value = false

  try {
    isCorrect.value = await submitExercise(
      props.exercise.id,
      userAnswer.value,
      currentHintIndex.value
    )
    
    showResult.value = true
    emit('submit', props.exercise.id, userAnswer.value, currentHintIndex.value)
  } catch (error) {
    console.error('Error submitting exercise:', error)
  } finally {
    isSubmitting.value = false
  }
}

const resetExercise = async () => {
  await resetExerciseData(props.exercise.id)
  userAnswer.value = ''
  currentHint.value = ''
  currentHintIndex.value = 0
  showResult.value = false
  isCorrect.value = false
  emit('reset', props.exercise.id)
}
</script>

<style scoped>
.exercise-card {
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.exercise-title {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 1rem;
  margin: 0;
  color: var(--text-color);
}

.exercise-meta {
  display: flex;
  gap: 0.5rem;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;
  color: var(--text-color);
  opacity: 0.7;
}

.exercise-completed {
  color: var(--success-color);
}

.exercise-description {
  margin-bottom: 1rem;
  font-size: 0.875rem;
  line-height: 1.4;
}

.exercise-content {
  margin-bottom: 1rem;
}

.code-input {
  width: 100%;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.875rem;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  color: var(--text-color);
  resize: vertical;
}

.code-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.choices {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.choice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.choice input[type="radio"] {
  margin: 0;
}

.blank-input {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  color: var(--text-color);
}

.blank-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.exercise-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.btn {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover:not(:disabled) {
  background: var(--border-color);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--text-color);
  color: var(--bg-color);
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.8;
}

.exercise-hint {
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: var(--secondary-color);
  border-left: 3px solid var(--primary-color);
  font-size: 0.875rem;
}

.exercise-result {
  margin-bottom: 1rem;
  padding: 0.5rem;
  font-size: 0.875rem;
}

.result-correct {
  color: var(--success-color);
  background: rgba(40, 167, 69, 0.1);
  border-left: 3px solid var(--success-color);
}

.result-incorrect {
  color: var(--error-color);
  background: rgba(220, 53, 69, 0.1);
  border-left: 3px solid var(--error-color);
}

.exercise-stats {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;
  color: var(--text-color);
  opacity: 0.7;
}
</style>