import type { Exercise, ExerciseType, ExerciseDifficulty } from '~/types/schema'

export interface ExerciseGeneratorOptions {
  chapterTitle: string
  chapterContent: string
  difficulty: ExerciseDifficulty
  count: number
  apiKey: string
}

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export class ExerciseGenerator {
  private apiKey: string
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions'
  private model = 'anthropic/claude-3-haiku:beta'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateExercises(options: ExerciseGeneratorOptions): Promise<Exercise[]> {
    const prompt = this.buildPrompt(options)
    
    try {
      const response = await this.callOpenRouter(prompt)
      const exercises = this.parseResponse(response)
      return exercises.map(exercise => ({
        ...exercise,
        chapterId: this.generateChapterId(options.chapterTitle),
        createdAt: new Date().toISOString(),
        difficulty: options.difficulty
      }))
    } catch (error) {
      console.error('Failed to generate exercises:', error)
      return this.getFallbackExercises(options)
    }
  }

  private buildPrompt(options: ExerciseGeneratorOptions): string {
    return `You are an expert JavaScript instructor creating practice exercises for MDN documentation.

Chapter: ${options.chapterTitle}
Content Summary: ${options.chapterContent.substring(0, 1000)}...
Difficulty: ${options.difficulty}
Number of exercises: ${options.count}

Generate ${options.count} JavaScript exercises that test understanding of this chapter content. Each exercise should:
1. Be practical and relevant to the chapter topic
2. Include clear instructions
3. Provide starter code when needed
4. Have a specific correct answer
5. Include helpful hints
6. Be appropriate for ${options.difficulty} difficulty level

Return ONLY a JSON array of exercises with this exact format:
[
  {
    "id": "unique-id",
    "type": "coding|multiple-choice|fill-blank",
    "title": "Exercise Title",
    "description": "Clear description of what to do",
    "starterCode": "// Starting code (for coding exercises)",
    "correctAnswer": "Expected answer or code",
    "hints": ["Hint 1", "Hint 2", "Hint 3"],
    "explanation": "Why this is the correct answer"
  }
]

Make the exercises engaging and educational. Focus on practical application rather than memorization.`
  }

  private async callOpenRouter(prompt: string): Promise<OpenRouterResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://docgrind.com',
        'X-Title': 'DocGrind Exercise Generator'
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  }

  private parseResponse(response: OpenRouterResponse): Exercise[] {
    try {
      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content in OpenRouter response')
      }

      // Extract JSON from the response (might be wrapped in markdown)
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('No JSON array found in response')
      }

      const exercises = JSON.parse(jsonMatch[0])
      return exercises.map((exercise: any) => ({
        id: exercise.id || this.generateId(),
        type: exercise.type || 'coding',
        title: exercise.title || 'Untitled Exercise',
        description: exercise.description || '',
        starterCode: exercise.starterCode || '',
        correctAnswer: exercise.correctAnswer || '',
        hints: exercise.hints || [],
        explanation: exercise.explanation || '',
        attempts: 0,
        completed: false,
        lastAttempt: undefined,
        hintsUsed: 0
      }))
    } catch (error) {
      console.error('Failed to parse OpenRouter response:', error)
      throw error
    }
  }

  private getFallbackExercises(options: ExerciseGeneratorOptions): Exercise[] {
    // Fallback exercises when API fails
    return [
      {
        id: this.generateId(),
        chapterId: this.generateChapterId(options.chapterTitle),
        type: 'coding' as ExerciseType,
        title: `Practice: ${options.chapterTitle}`,
        description: `Create a simple example demonstrating the concepts from the ${options.chapterTitle} chapter.`,
        starterCode: '// Write your code here\n',
        correctAnswer: '// Example solution would go here',
        hints: [
          'Review the chapter content for key concepts',
          'Start with a simple example',
          'Test your code step by step'
        ],
        explanation: 'This exercise helps reinforce the concepts covered in the chapter.',
        attempts: 0,
        completed: false,
        lastAttempt: undefined,
        hintsUsed: 0,
        difficulty: options.difficulty,
        createdAt: new Date().toISOString()
      }
    ]
  }

  private generateId(): string {
    return `exercise-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private generateChapterId(title: string): string {
    return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }
}

// Utility function for easy use in composables
export function createExerciseGenerator(apiKey: string): ExerciseGenerator {
  return new ExerciseGenerator(apiKey)
}