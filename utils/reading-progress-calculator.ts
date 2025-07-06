import type { 
  ReadingSession, 
  ReadingProgress, 
  ContentElement, 
  ReadingPosition,
  ReadingAnalytics
} from '~/types/reading-progress'

export class ReadingProgressCalculator {
  private sessions: Map<string, ReadingSession> = new Map()
  private currentSession: ReadingSession | null = null
  private documentId: string
  private averageReadingSpeed: number
  private isTracking = false
  private lastActivityTime = 0
  private totalWords = 0
  private wordsReadPerSession = new Map<string, number>()
  private timeSpentPerElement = new Map<string, number>()
  private sessionStartTime = 0
  private lastVisibleElements: Set<string> = new Set()

  constructor(documentId: string, averageReadingSpeed = 200) {
    this.documentId = documentId
    this.averageReadingSpeed = averageReadingSpeed
  }

  public startSession(): ReadingSession {
    const sessionId = this.generateSessionId()
    const now = Date.now()
    
    this.currentSession = {
      sessionId,
      documentId: this.documentId,
      startTime: now,
      totalTime: 0,
      wordsRead: 0,
      charactersRead: 0,
      readingSpeed: 0,
      completionPercentage: 0
    }

    this.sessionStartTime = now
    this.lastActivityTime = now
    this.isTracking = true
    this.wordsReadPerSession.set(sessionId, 0)

    this.sessions.set(sessionId, this.currentSession)
    
    return this.currentSession
  }

  public endSession(): ReadingSession | null {
    if (!this.currentSession) return null

    const now = Date.now()
    const totalTime = now - this.currentSession.startTime
    const activeTime = this.calculateActiveTime()
    
    this.currentSession.endTime = now
    this.currentSession.totalTime = activeTime
    this.currentSession.readingSpeed = this.calculateReadingSpeed(
      this.currentSession.wordsRead, 
      activeTime
    )

    this.isTracking = false
    const completedSession = { ...this.currentSession }
    this.currentSession = null

    return completedSession
  }

  public updateActivity(visibleElements: ContentElement[]): void {
    if (!this.isTracking || !this.currentSession) return

    const now = Date.now()
    const timeDelta = now - this.lastActivityTime

    // Only update if reasonable time has passed (avoid rapid updates)
    if (timeDelta < 1000) return

    // Calculate words being read based on visible elements
    const currentlyVisibleIds = new Set(visibleElements.map(el => el.id))
    const newlyVisibleElements = visibleElements.filter(
      el => !this.lastVisibleElements.has(el.id)
    )

    // Track time spent on each element
    this.lastVisibleElements.forEach(elementId => {
      const timeSpent = this.timeSpentPerElement.get(elementId) || 0
      this.timeSpentPerElement.set(elementId, timeSpent + timeDelta)
    })

    // Calculate words read from newly visible elements
    let newWordsRead = 0
    let newCharactersRead = 0

    newlyVisibleElements.forEach(element => {
      // Only count words if element is significantly visible
      if (element.visibilityPercentage > 50) {
        newWordsRead += element.wordCount
        newCharactersRead += element.characterCount
      }
    })

    // Update session data
    this.currentSession.wordsRead += newWordsRead
    this.currentSession.charactersRead += newCharactersRead
    
    const currentSessionWords = this.wordsReadPerSession.get(this.currentSession.sessionId) || 0
    this.wordsReadPerSession.set(this.currentSession.sessionId, currentSessionWords + newWordsRead)

    // Update reading speed
    const activeTime = this.calculateActiveTime()
    this.currentSession.readingSpeed = this.calculateReadingSpeed(
      this.currentSession.wordsRead, 
      activeTime
    )

    this.lastActivityTime = now
    this.lastVisibleElements = currentlyVisibleIds
  }

  public updateProgress(elements: ContentElement[], position: ReadingPosition): ReadingProgress {
    const now = Date.now()
    
    // Calculate total words in document
    this.totalWords = elements.reduce((sum, el) => sum + el.wordCount, 0)
    
    // Calculate words read based on position
    const wordsRead = this.calculateWordsRead(elements, position)
    
    // Calculate progress percentage
    const progressPercentage = this.totalWords > 0 ? (wordsRead / this.totalWords) * 100 : 0
    
    // Calculate time estimates
    const estimates = this.calculateTimeEstimates(elements, position)
    
    // Get analytics
    const analytics = this.getAnalytics()

    const progress: ReadingProgress = {
      documentId: this.documentId,
      progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
      currentPosition: position,
      sessions: Array.from(this.sessions.values()),
      elements,
      bookmarks: [], // Will be populated by bookmark manager
      estimatedTotalTime: estimates.totalTime,
      estimatedRemainingTime: estimates.remainingTime,
      averageReadingSpeed: analytics.averageReadingSpeed,
      totalWords: this.totalWords,
      wordsRead,
      lastUpdated: now
    }

    // Update current session completion percentage
    if (this.currentSession) {
      this.currentSession.completionPercentage = progressPercentage
    }

    return progress
  }

  private calculateWordsRead(elements: ContentElement[], position: ReadingPosition): number {
    let wordsRead = 0
    const scrollPercentage = position.scrollPercentage / 100

    // Find elements above current position
    const sortedElements = elements.sort((a, b) => a.offsetTop - b.offsetTop)
    
    for (const element of sortedElements) {
      const elementProgress = this.calculateElementProgress(element, position)
      wordsRead += Math.round(element.wordCount * elementProgress)
    }

    return wordsRead
  }

  private calculateElementProgress(element: ContentElement, position: ReadingPosition): number {
    const elementTop = element.offsetTop
    const elementBottom = elementTop + element.height
    const scrollTop = position.scrollTop
    const viewportHeight = window.innerHeight

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

  private calculateTimeEstimates(elements: ContentElement[], position: ReadingPosition): {
    totalTime: number
    remainingTime: number
  } {
    const totalWords = this.totalWords
    const wordsRead = this.calculateWordsRead(elements, position)
    const wordsRemaining = totalWords - wordsRead

    const currentSpeed = this.getCurrentReadingSpeed()
    const totalTime = (totalWords / currentSpeed) * 60 * 1000 // milliseconds
    const remainingTime = (wordsRemaining / currentSpeed) * 60 * 1000

    return {
      totalTime: Math.max(0, totalTime),
      remainingTime: Math.max(0, remainingTime)
    }
  }

  private getCurrentReadingSpeed(): number {
    if (this.currentSession && this.currentSession.readingSpeed > 0) {
      return this.currentSession.readingSpeed
    }

    const analytics = this.getAnalytics()
    return analytics.averageReadingSpeed || this.averageReadingSpeed
  }

  private calculateActiveTime(): number {
    if (!this.currentSession) return 0

    const now = Date.now()
    const totalTime = now - this.currentSession.startTime
    
    // Apply activity heuristics to estimate actual reading time
    // Assume 70% of time is actual reading (account for pauses, distractions)
    const activityFactor = 0.7
    
    return Math.round(totalTime * activityFactor)
  }

  private calculateReadingSpeed(wordsRead: number, timeMs: number): number {
    if (timeMs === 0) return 0
    
    const minutes = timeMs / (1000 * 60)
    return Math.round(wordsRead / minutes)
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  public getAnalytics(): ReadingAnalytics {
    const sessions = Array.from(this.sessions.values())
    const completedSessions = sessions.filter(s => s.endTime)

    const totalReadingTime = completedSessions.reduce((sum, s) => sum + s.totalTime, 0)
    const sessionCount = completedSessions.length
    const averageSessionDuration = sessionCount > 0 ? totalReadingTime / sessionCount : 0

    const totalWordsRead = completedSessions.reduce((sum, s) => sum + s.wordsRead, 0)
    const readingSpeeds = completedSessions
      .map(s => s.readingSpeed)
      .filter(speed => speed > 0)
    const averageReadingSpeed = readingSpeeds.length > 0 
      ? readingSpeeds.reduce((sum, speed) => sum + speed, 0) / readingSpeeds.length 
      : this.averageReadingSpeed

    const completionRate = this.totalWords > 0 ? (totalWordsRead / this.totalWords) * 100 : 0

    // Calculate reading consistency (simplified)
    const daysSinceFirst = sessionCount > 0 ? 
      Math.max(1, Math.ceil((Date.now() - completedSessions[0].startTime) / (1000 * 60 * 60 * 24))) : 
      1
    const readingConsistency = sessionCount / daysSinceFirst

    // Content type distribution (simplified)
    const contentTypeDistribution: Record<string, number> = {}
    this.timeSpentPerElement.forEach((time, elementId) => {
      // This would need element type information
      contentTypeDistribution['text'] = (contentTypeDistribution['text'] || 0) + time
    })

    // Time of day patterns (simplified)
    const timeOfDayPatterns: Record<string, number> = {}
    completedSessions.forEach(session => {
      const hour = new Date(session.startTime).getHours()
      const timeOfDay = hour < 6 ? 'night' : 
                      hour < 12 ? 'morning' : 
                      hour < 18 ? 'afternoon' : 'evening'
      timeOfDayPatterns[timeOfDay] = (timeOfDayPatterns[timeOfDay] || 0) + session.totalTime
    })

    return {
      totalReadingTime,
      sessionCount,
      averageSessionDuration,
      totalWordsRead,
      averageReadingSpeed,
      readingConsistency,
      completionRate,
      contentTypeDistribution,
      timeOfDayPatterns
    }
  }

  public getCurrentSession(): ReadingSession | null {
    return this.currentSession
  }

  public getAllSessions(): ReadingSession[] {
    return Array.from(this.sessions.values())
  }

  public getSessionById(sessionId: string): ReadingSession | null {
    return this.sessions.get(sessionId) || null
  }

  public isActivelyTracking(): boolean {
    return this.isTracking && this.currentSession !== null
  }

  public pauseTracking(): void {
    this.isTracking = false
  }

  public resumeTracking(): void {
    this.isTracking = true
    this.lastActivityTime = Date.now()
  }

  public reset(): void {
    this.endSession()
    this.sessions.clear()
    this.wordsReadPerSession.clear()
    this.timeSpentPerElement.clear()
    this.lastVisibleElements.clear()
    this.totalWords = 0
    this.isTracking = false
  }
}