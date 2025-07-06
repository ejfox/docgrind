import type { 
  ContentElement, 
  ReadingSession, 
  ReadingPosition,
  ReadingAnalytics 
} from '~/types/reading-progress'

export interface ReadingEstimate {
  totalReadingTime: number // milliseconds
  remainingTime: number // milliseconds
  completionTime: Date // estimated completion date
  confidence: number // 0-1 confidence score
  breakdown: {
    text: number
    code: number
    images: number
    other: number
  }
}

export interface ReadingSpeedMetrics {
  current: number // words per minute
  average: number // words per minute
  trend: 'increasing' | 'decreasing' | 'stable'
  consistency: number // 0-1 score
  efficiency: number // 0-1 score
}

export class ReadingEstimator {
  private readonly baseReadingSpeeds: Record<string, number> = {
    'heading': 300, // Faster for headings
    'paragraph': 200, // Standard reading speed
    'code': 100, // Slower for code
    'image': 60, // Time to process images (seconds per image)
    'list': 250, // Slightly faster for lists
    'table': 150, // Slower for tables
    'other': 200 // Default
  }

  private readonly difficultyMultipliers: Record<string, number> = {
    'technical': 0.7, // Technical content is 30% slower
    'academic': 0.8, // Academic content is 20% slower
    'narrative': 1.2, // Stories read 20% faster
    'casual': 1.1, // Casual content read 10% faster
    'default': 1.0
  }

  private readonly complexityFactors = {
    shortSentences: 1.1, // Easier to read
    longSentences: 0.9, // Harder to read
    simplvocabulary: 1.1, // Easier to read
    complexVocabulary: 0.8, // Harder to read
    codeBlocks: 0.6, // Much slower
    mathFormulas: 0.7, // Slower
    lists: 1.2, // Faster
    tables: 0.8 // Slower
  }

  constructor(private debugMode = false) {}

  // Calculate reading speed based on session data
  public calculateReadingSpeed(sessions: ReadingSession[]): ReadingSpeedMetrics {
    if (sessions.length === 0) {
      return {
        current: 200,
        average: 200,
        trend: 'stable',
        consistency: 0,
        efficiency: 0
      }
    }

    const validSessions = sessions.filter(s => s.readingSpeed > 0 && s.totalTime > 0)
    
    if (validSessions.length === 0) {
      return {
        current: 200,
        average: 200,
        trend: 'stable',
        consistency: 0,
        efficiency: 0
      }
    }

    // Calculate current speed (weighted average of recent sessions)
    const recentSessions = validSessions.slice(-5) // Last 5 sessions
    const current = this.calculateWeightedAverage(recentSessions)

    // Calculate overall average
    const average = validSessions.reduce((sum, s) => sum + s.readingSpeed, 0) / validSessions.length

    // Calculate trend
    const trend = this.calculateTrend(validSessions)

    // Calculate consistency (how stable the reading speed is)
    const consistency = this.calculateConsistency(validSessions)

    // Calculate efficiency (how effectively time is used)
    const efficiency = this.calculateEfficiency(validSessions)

    return {
      current,
      average,
      trend,
      consistency,
      efficiency
    }
  }

  // Estimate reading time for content
  public estimateReadingTime(
    elements: ContentElement[],
    position: ReadingPosition,
    userSpeed?: number,
    difficulty?: string
  ): ReadingEstimate {
    const baseSpeed = userSpeed || 200
    const difficultyMultiplier = this.difficultyMultipliers[difficulty || 'default']
    const adjustedSpeed = baseSpeed * difficultyMultiplier

    const breakdown = {
      text: 0,
      code: 0,
      images: 0,
      other: 0
    }

    let totalTime = 0
    let remainingTime = 0

    // Sort elements by position
    const sortedElements = elements.sort((a, b) => a.offsetTop - b.offsetTop)
    
    for (const element of sortedElements) {
      const elementTime = this.calculateElementTime(element, adjustedSpeed)
      totalTime += elementTime

      // Categorize time
      if (element.type === 'paragraph') {
        breakdown.text += elementTime
      } else if (element.type === 'code') {
        breakdown.code += elementTime
      } else if (element.type === 'image') {
        breakdown.images += elementTime
      } else {
        breakdown.other += elementTime
      }

      // Calculate remaining time based on position
      if (this.isElementAfterPosition(element, position)) {
        remainingTime += elementTime
      }
    }

    // Calculate completion time
    const completionTime = new Date(Date.now() + remainingTime)

    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence(elements, userSpeed !== undefined)

    return {
      totalReadingTime: totalTime,
      remainingTime,
      completionTime,
      confidence,
      breakdown
    }
  }

  // Estimate reading time for a single element
  public calculateElementTime(element: ContentElement, baseSpeed: number): number {
    const elementSpeed = this.baseReadingSpeeds[element.type] || this.baseReadingSpeeds.other
    const adjustedSpeed = this.adjustSpeedForContent(elementSpeed, element)
    
    if (element.type === 'image') {
      // Images are measured in seconds, not words per minute
      return this.baseReadingSpeeds.image * 1000 // Convert to milliseconds
    }

    // Calculate time in milliseconds
    const minutes = element.wordCount / adjustedSpeed
    return minutes * 60 * 1000
  }

  // Adjust speed based on content complexity
  private adjustSpeedForContent(baseSpeed: number, element: ContentElement): number {
    let adjustedSpeed = baseSpeed
    const content = element.textContent.toLowerCase()

    // Analyze sentence length
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const averageSentenceLength = sentences.length > 0 
      ? content.split(/\s+/).length / sentences.length 
      : 0

    if (averageSentenceLength > 20) {
      adjustedSpeed *= this.complexityFactors.longSentences
    } else if (averageSentenceLength < 10) {
      adjustedSpeed *= this.complexityFactors.shortSentences
    }

    // Analyze vocabulary complexity
    const complexWords = content.match(/\b\w{8,}\b/g) || []
    const complexityRatio = complexWords.length / (content.split(/\s+/).length || 1)
    
    if (complexityRatio > 0.3) {
      adjustedSpeed *= this.complexityFactors.complexVocabulary
    } else if (complexityRatio < 0.1) {
      adjustedSpeed *= this.complexityFactors.simplVocabulary
    }

    // Special content adjustments
    if (content.includes('```') || content.includes('<code>')) {
      adjustedSpeed *= this.complexityFactors.codeBlocks
    }

    if (content.match(/\$[^$]+\$|\\\([^)]+\\\)/)) {
      adjustedSpeed *= this.complexityFactors.mathFormulas
    }

    return Math.max(adjustedSpeed, 50) // Minimum 50 WPM
  }

  // Calculate weighted average of recent sessions
  private calculateWeightedAverage(sessions: ReadingSession[]): number {
    if (sessions.length === 0) return 200

    let totalWeight = 0
    let weightedSum = 0

    sessions.forEach((session, index) => {
      // More recent sessions have higher weight
      const weight = Math.pow(1.5, index)
      totalWeight += weight
      weightedSum += session.readingSpeed * weight
    })

    return weightedSum / totalWeight
  }

  // Calculate trend in reading speed
  private calculateTrend(sessions: ReadingSession[]): 'increasing' | 'decreasing' | 'stable' {
    if (sessions.length < 3) return 'stable'

    const recentSessions = sessions.slice(-5)
    const firstHalf = recentSessions.slice(0, Math.ceil(recentSessions.length / 2))
    const secondHalf = recentSessions.slice(Math.ceil(recentSessions.length / 2))

    const firstAverage = firstHalf.reduce((sum, s) => sum + s.readingSpeed, 0) / firstHalf.length
    const secondAverage = secondHalf.reduce((sum, s) => sum + s.readingSpeed, 0) / secondHalf.length

    const difference = secondAverage - firstAverage
    const threshold = firstAverage * 0.1 // 10% threshold

    if (difference > threshold) return 'increasing'
    if (difference < -threshold) return 'decreasing'
    return 'stable'
  }

  // Calculate consistency of reading speed
  private calculateConsistency(sessions: ReadingSession[]): number {
    if (sessions.length < 2) return 0

    const speeds = sessions.map(s => s.readingSpeed)
    const average = speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length
    
    // Calculate coefficient of variation
    const variance = speeds.reduce((sum, speed) => sum + Math.pow(speed - average, 2), 0) / speeds.length
    const standardDeviation = Math.sqrt(variance)
    const coefficientOfVariation = standardDeviation / average

    // Convert to 0-1 scale (lower CV = higher consistency)
    return Math.max(0, 1 - coefficientOfVariation)
  }

  // Calculate reading efficiency
  private calculateEfficiency(sessions: ReadingSession[]): number {
    if (sessions.length === 0) return 0

    // Efficiency is based on how much content was read relative to time spent
    let totalEfficiency = 0
    let validSessions = 0

    sessions.forEach(session => {
      if (session.totalTime > 0 && session.wordsRead > 0) {
        const actualSpeed = session.readingSpeed
        const expectedSpeed = 200 // Average reading speed
        const efficiency = Math.min(1, actualSpeed / expectedSpeed)
        
        totalEfficiency += efficiency
        validSessions++
      }
    })

    return validSessions > 0 ? totalEfficiency / validSessions : 0
  }

  // Check if element is after current position
  private isElementAfterPosition(element: ContentElement, position: ReadingPosition): boolean {
    const elementProgress = this.calculateElementProgress(element, position)
    return elementProgress < 0.5 // Less than 50% read
  }

  // Calculate how much of an element has been read
  private calculateElementProgress(element: ContentElement, position: ReadingPosition): number {
    const elementTop = element.offsetTop
    const elementBottom = elementTop + element.height
    const scrollTop = position.scrollTop
    const viewportHeight = window.innerHeight || 800

    // Element is completely above viewport
    if (elementBottom < scrollTop) {
      return 1.0
    }

    // Element is completely below viewport
    if (elementTop > scrollTop + viewportHeight) {
      return 0.0
    }

    // Element is partially visible
    const visibleTop = Math.max(elementTop, scrollTop)
    const visibleBottom = Math.min(elementBottom, scrollTop + viewportHeight)
    const visibleHeight = visibleBottom - visibleTop
    
    return Math.max(0, Math.min(1, visibleHeight / element.height))
  }

  // Calculate confidence in estimates
  private calculateConfidence(elements: ContentElement[], hasUserSpeed: boolean): number {
    let confidence = 0.5 // Base confidence

    // More elements = higher confidence
    const elementCount = elements.length
    confidence += Math.min(0.3, elementCount / 100)

    // Having user speed data increases confidence
    if (hasUserSpeed) {
      confidence += 0.2
    }

    // Diverse content types increase confidence
    const contentTypes = new Set(elements.map(e => e.type))
    confidence += Math.min(0.2, contentTypes.size / 6)

    return Math.min(1, confidence)
  }

  // Get reading recommendations based on analytics
  public getReadingRecommendations(
    analytics: ReadingAnalytics,
    estimate: ReadingEstimate
  ): string[] {
    const recommendations: string[] = []

    // Speed recommendations
    if (analytics.averageReadingSpeed < 150) {
      recommendations.push('Consider practicing speed reading techniques to improve your reading pace')
    } else if (analytics.averageReadingSpeed > 300) {
      recommendations.push('Your reading speed is excellent! Consider focusing on comprehension')
    }

    // Consistency recommendations
    if (analytics.sessionCount > 5) {
      const sessions = analytics.sessionCount
      const avgDuration = analytics.averageSessionDuration / (1000 * 60) // minutes
      
      if (avgDuration < 15) {
        recommendations.push('Try longer reading sessions for better focus and comprehension')
      } else if (avgDuration > 60) {
        recommendations.push('Consider taking breaks during long reading sessions')
      }
    }

    // Time management recommendations
    if (estimate.remainingTime > 2 * 60 * 60 * 1000) { // > 2 hours
      recommendations.push('Break this long read into multiple sessions for better retention')
    }

    // Completion recommendations
    if (analytics.completionRate < 50) {
      recommendations.push('Focus on completing shorter documents to build reading habits')
    }

    return recommendations
  }

  // Format time for display
  public formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  // Format reading speed
  public formatSpeed(wordsPerMinute: number): string {
    return `${Math.round(wordsPerMinute)} WPM`
  }
}