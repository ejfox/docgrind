import { ref, computed } from 'vue'
import type { Exercise, ExerciseProgress, ExerciseDifficulty } from '~/types/schema'
import { ExerciseGenerator } from '~/utils/exercise-generator'

export const useExercises = () => {
  const exercises = useLocalStorage<Record<string, Exercise>>('docgrind-exercises', {})
  const currentExercise = ref<Exercise | null>(null)
  const isGenerating = ref(false)
  const generationError = ref<string | null>(null)

  // Get exercises for a specific chapter
  const getChapterExercises = (chapterId: string): Exercise[] => {
    return Object.values(exercises.value).filter(exercise => 
      exercise.chapterId === chapterId
    )
  }

  // Generate exercises for a chapter
  const generateExercises = async (
    chapterId: string,
    chapterTitle: string,
    chapterContent: string,
    difficulty: ExerciseDifficulty = 'beginner',
    count: number = 3
  ): Promise<Exercise[]> => {
    isGenerating.value = true
    generationError.value = null

    try {
      const config = useRuntimeConfig()
      const apiKey = config.public.openRouterApiKey

      if (!apiKey) {
        throw new Error('OpenRouter API key not configured')
      }

      const generator = new ExerciseGenerator(apiKey)
      const newExercises = await generator.generateExercises({
        chapterTitle,
        chapterContent,
        difficulty,
        count,
        apiKey
      })

      // Store exercises (VueUse automatically persists to localStorage)
      newExercises.forEach(exercise => {
        exercises.value[exercise.id] = exercise
      })

      return newExercises
    } catch (error) {
      console.error('Error generating exercises:', error)
      generationError.value = error instanceof Error ? error.message : 'Failed to generate exercises'
      return []
    } finally {
      isGenerating.value = false
    }
  }

  // Submit an exercise attempt
  const submitExercise = async (
    exerciseId: string,
    answer: string,
    hintsUsed: number = 0
  ): Promise<boolean> => {
    const exercise = exercises.value[exerciseId]
    if (!exercise) return false

    exercise.attempts += 1
    exercise.lastAttempt = {
      answer,
      timestamp: new Date().toISOString(),
      hintsUsed
    }
    exercise.hintsUsed = Math.max(exercise.hintsUsed, hintsUsed)

    // Simple answer checking (could be enhanced with fuzzy matching)
    const isCorrect = answer.trim().toLowerCase() === exercise.correctAnswer.trim().toLowerCase()
    
    if (isCorrect) {
      exercise.completed = true
      exercise.completedAt = new Date().toISOString()
    }

    // VueUse automatically saves to localStorage
    return isCorrect
  }

  // Get hint for an exercise
  const getHint = (exerciseId: string, hintIndex: number): string | null => {
    const exercise = exercises.value[exerciseId]
    if (!exercise || !exercise.hints || hintIndex >= exercise.hints.length) {
      return null
    }
    return exercise.hints[hintIndex]
  }

  // Reset exercise progress
  const resetExercise = async (exerciseId: string): Promise<void> => {
    const exercise = exercises.value[exerciseId]
    if (!exercise) return

    exercise.attempts = 0
    exercise.completed = false
    exercise.lastAttempt = undefined
    exercise.hintsUsed = 0
    exercise.completedAt = undefined

    // VueUse automatically saves to localStorage
  }

  // Get exercise statistics
  const getExerciseStats = computed(() => {
    const allExercises = Object.values(exercises.value)
    const completed = allExercises.filter(e => e.completed).length
    const total = allExercises.length
    const avgAttempts = total > 0 ? 
      allExercises.reduce((sum, e) => sum + e.attempts, 0) / total : 0

    return {
      total,
      completed,
      completionRate: total > 0 ? completed / total : 0,
      avgAttempts: Math.round(avgAttempts * 10) / 10
    }
  })

  // Clear all exercises
  const clearExercises = async (): Promise<void> => {
    exercises.value = {}
    // VueUse automatically saves to localStorage
  }

  // Export exercises data
  const exportExercises = (): string => {
    return JSON.stringify(exercises.value, null, 2)
  }

  // Import exercises data
  const importExercises = async (data: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(data)
      exercises.value = parsed
      // VueUse automatically saves to localStorage
      return true
    } catch (error) {
      console.error('Error importing exercises:', error)
      return false
    }
  }

  return {
    // State
    exercises: readonly(exercises),
    currentExercise: readonly(currentExercise),
    isGenerating: readonly(isGenerating),
    generationError: readonly(generationError),
    
    // Computed
    exerciseStats: getExerciseStats,
    
    // Methods
    getChapterExercises,
    generateExercises,
    submitExercise,
    getHint,
    resetExercise,
    clearExercises,
    exportExercises,
    importExercises
  }
}