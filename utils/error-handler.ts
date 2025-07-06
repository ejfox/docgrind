export interface ErrorReport {
  id: string
  timestamp: number
  error: Error
  context: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  stackTrace?: string
  userAgent?: string
  url?: string
  userId?: string
  sessionId?: string
  additionalData?: Record<string, any>
  resolved?: boolean
  resolvedAt?: number
}

export interface ErrorHandlerConfig {
  enableLogging: boolean
  enableReporting: boolean
  enableUserNotification: boolean
  enableRetry: boolean
  maxRetries: number
  retryDelay: number
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  reportingEndpoint?: string
  onError?: (report: ErrorReport) => void
  onRetry?: (attempt: number, error: Error) => void
  onResolve?: (report: ErrorReport) => void
}

export interface RetryConfig {
  maxRetries: number
  delay: number
  backoff: 'linear' | 'exponential'
  shouldRetry?: (error: Error, attempt: number) => boolean
}

export class ErrorHandler {
  private config: ErrorHandlerConfig
  private errors: Map<string, ErrorReport> = new Map()
  private retryQueues: Map<string, RetryQueue> = new Map()
  private debugMode: boolean

  constructor(config: Partial<ErrorHandlerConfig> = {}, debugMode = false) {
    this.config = {
      enableLogging: config.enableLogging ?? true,
      enableReporting: config.enableReporting ?? false,
      enableUserNotification: config.enableUserNotification ?? true,
      enableRetry: config.enableRetry ?? true,
      maxRetries: config.maxRetries ?? 3,
      retryDelay: config.retryDelay ?? 1000,
      logLevel: config.logLevel ?? 'error',
      reportingEndpoint: config.reportingEndpoint,
      onError: config.onError,
      onRetry: config.onRetry,
      onResolve: config.onResolve
    }
    this.debugMode = debugMode
    this.setupGlobalErrorHandling()
  }

  // Main error handling method
  public handleError(
    error: Error,
    context: string,
    severity: ErrorReport['severity'] = 'medium',
    additionalData?: Record<string, any>
  ): ErrorReport {
    const report = this.createErrorReport(error, context, severity, additionalData)
    
    this.errors.set(report.id, report)
    
    if (this.config.enableLogging) {
      this.logError(report)
    }
    
    if (this.config.enableReporting) {
      this.reportError(report)
    }
    
    if (this.config.enableUserNotification) {
      this.notifyUser(report)
    }
    
    if (this.config.onError) {
      this.config.onError(report)
    }
    
    return report
  }

  // Async operation wrapper with error handling
  public async withErrorHandling<T>(
    operation: () => Promise<T>,
    context: string,
    retryConfig?: Partial<RetryConfig>
  ): Promise<T> {
    const finalRetryConfig: RetryConfig = {
      maxRetries: retryConfig?.maxRetries ?? this.config.maxRetries,
      delay: retryConfig?.delay ?? this.config.retryDelay,
      backoff: retryConfig?.backoff ?? 'exponential',
      shouldRetry: retryConfig?.shouldRetry ?? this.defaultShouldRetry
    }

    return this.executeWithRetry(operation, context, finalRetryConfig)
  }

  // Storage operation wrapper
  public async withStorageErrorHandling<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      const report = this.handleError(
        error as Error,
        `Storage operation: ${context}`,
        'high',
        { operation: 'storage', context }
      )
      
      // Check if it's a quota exceeded error
      if (this.isQuotaExceededError(error as Error)) {
        throw new StorageQuotaExceededError('Storage quota exceeded', error as Error)
      }
      
      throw error
    }
  }

  // Network operation wrapper
  public async withNetworkErrorHandling<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    const retryConfig: RetryConfig = {
      maxRetries: 3,
      delay: 1000,
      backoff: 'exponential',
      shouldRetry: (error, attempt) => {
        return this.isNetworkError(error) && attempt < 3
      }
    }

    return this.executeWithRetry(operation, `Network operation: ${context}`, retryConfig)
  }

  // Observer operation wrapper
  public withObserverErrorHandling<T>(
    operation: () => T,
    context: string,
    fallback?: () => T
  ): T {
    try {
      return operation()
    } catch (error) {
      this.handleError(
        error as Error,
        `Observer operation: ${context}`,
        'medium',
        { operation: 'observer', context }
      )
      
      if (fallback) {
        return fallback()
      }
      
      throw error
    }
  }

  // Retry mechanism
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string,
    config: RetryConfig
  ): Promise<T> {
    let lastError: Error | null = null
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const result = await operation()
        
        // If we succeeded after retries, mark any previous errors as resolved
        if (attempt > 0) {
          this.resolveErrorsForContext(context)
        }
        
        return result
      } catch (error) {
        lastError = error as Error
        
        if (attempt === config.maxRetries) {
          // Final attempt failed
          break
        }
        
        if (config.shouldRetry && !config.shouldRetry(lastError, attempt)) {
          // Shouldn't retry this error
          break
        }
        
        // Calculate delay
        const delay = config.backoff === 'exponential' 
          ? config.delay * Math.pow(2, attempt)
          : config.delay * (attempt + 1)
        
        if (this.config.onRetry) {
          this.config.onRetry(attempt + 1, lastError)
        }
        
        if (this.debugMode) {
          console.log(`Retrying ${context} (attempt ${attempt + 1}/${config.maxRetries}) in ${delay}ms`)
        }
        
        await this.sleep(delay)
      }
    }
    
    // All retries failed
    throw lastError || new Error('Operation failed after retries')
  }

  // Error classification
  private isNetworkError(error: Error): boolean {
    return error.name === 'NetworkError' || 
           error.message.includes('fetch') || 
           error.message.includes('network') ||
           error.message.includes('timeout')
  }

  private isQuotaExceededError(error: Error): boolean {
    return error.name === 'QuotaExceededError' ||
           error.message.includes('quota') ||
           error.message.includes('storage')
  }

  private isObserverError(error: Error): boolean {
    return error.message.includes('IntersectionObserver') ||
           error.message.includes('ResizeObserver') ||
           error.message.includes('MutationObserver')
  }

  private defaultShouldRetry(error: Error, attempt: number): boolean {
    // Don't retry certain types of errors
    const nonRetryableErrors = [
      'TypeError',
      'ReferenceError',
      'SyntaxError',
      'QuotaExceededError'
    ]
    
    if (nonRetryableErrors.includes(error.name)) {
      return false
    }
    
    // Retry network errors and temporary failures
    return this.isNetworkError(error) || 
           error.message.includes('temporary') ||
           error.message.includes('timeout')
  }

  // Error report creation
  private createErrorReport(
    error: Error,
    context: string,
    severity: ErrorReport['severity'],
    additionalData?: Record<string, any>
  ): ErrorReport {
    return {
      id: this.generateErrorId(),
      timestamp: Date.now(),
      error,
      context,
      severity,
      stackTrace: error.stack,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      sessionId: this.generateSessionId(),
      additionalData,
      resolved: false
    }
  }

  // Logging
  private logError(report: ErrorReport): void {
    const logLevel = this.config.logLevel
    const message = `[${report.severity.toUpperCase()}] ${report.context}: ${report.error.message}`
    
    switch (logLevel) {
      case 'debug':
        console.debug(message, report)
        break
      case 'info':
        console.info(message, report)
        break
      case 'warn':
        console.warn(message, report)
        break
      case 'error':
        console.error(message, report)
        break
    }
  }

  // Error reporting
  private async reportError(report: ErrorReport): Promise<void> {
    if (!this.config.reportingEndpoint) return

    try {
      await fetch(this.config.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: report.id,
          timestamp: report.timestamp,
          message: report.error.message,
          stack: report.stackTrace,
          context: report.context,
          severity: report.severity,
          userAgent: report.userAgent,
          url: report.url,
          sessionId: report.sessionId,
          additionalData: report.additionalData
        })
      })
    } catch (error) {
      if (this.debugMode) {
        console.warn('Failed to report error:', error)
      }
    }
  }

  // User notification
  private notifyUser(report: ErrorReport): void {
    if (report.severity === 'low' || report.severity === 'medium') {
      // Don't notify users for low/medium severity errors
      return
    }

    const message = this.getUserFriendlyMessage(report)
    
    // Create a simple notification
    if (typeof window !== 'undefined') {
      // You can replace this with your preferred notification system
      console.warn('User notification:', message)
      
      // Emit custom event for UI to handle
      window.dispatchEvent(new CustomEvent('reading-progress:error', {
        detail: { message, report }
      }))
    }
  }

  private getUserFriendlyMessage(report: ErrorReport): string {
    const contextMessages: Record<string, string> = {
      'Storage operation': 'There was an issue saving your reading progress. Your data may not be saved.',
      'Network operation': 'There was a network connectivity issue. Please check your connection.',
      'Observer operation': 'There was an issue tracking your reading position.',
      'Position tracking': 'Reading position tracking encountered an error.',
      'Bookmark creation': 'There was an issue creating your bookmark.',
      'Progress calculation': 'There was an issue calculating your reading progress.'
    }

    for (const [key, message] of Object.entries(contextMessages)) {
      if (report.context.includes(key)) {
        return message
      }
    }

    return 'An unexpected error occurred. Please try again.'
  }

  // Error resolution
  public resolveError(errorId: string): void {
    const report = this.errors.get(errorId)
    if (report) {
      report.resolved = true
      report.resolvedAt = Date.now()
      
      if (this.config.onResolve) {
        this.config.onResolve(report)
      }
    }
  }

  private resolveErrorsForContext(context: string): void {
    Array.from(this.errors.values())
      .filter(report => report.context === context && !report.resolved)
      .forEach(report => {
        report.resolved = true
        report.resolvedAt = Date.now()
        
        if (this.config.onResolve) {
          this.config.onResolve(report)
        }
      })
  }

  // Error retrieval
  public getErrors(): ErrorReport[] {
    return Array.from(this.errors.values())
  }

  public getUnresolvedErrors(): ErrorReport[] {
    return Array.from(this.errors.values()).filter(report => !report.resolved)
  }

  public getErrorsForContext(context: string): ErrorReport[] {
    return Array.from(this.errors.values()).filter(report => report.context === context)
  }

  // Global error handling
  private setupGlobalErrorHandling(): void {
    if (typeof window === 'undefined') return

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(
        new Error(event.reason),
        'Unhandled promise rejection',
        'high',
        { reason: event.reason }
      )
    })

    // Handle global errors
    window.addEventListener('error', (event) => {
      this.handleError(
        event.error || new Error(event.message),
        'Global error',
        'high',
        { 
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      )
    })
  }

  // Utility methods
  private generateErrorId(): string {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Cleanup
  public clearErrors(): void {
    this.errors.clear()
  }

  public clearResolvedErrors(): void {
    const unresolved = Array.from(this.errors.values()).filter(report => !report.resolved)
    this.errors.clear()
    unresolved.forEach(report => {
      this.errors.set(report.id, report)
    })
  }
}

// Custom error types
export class StorageQuotaExceededError extends Error {
  constructor(message: string, public originalError: Error) {
    super(message)
    this.name = 'StorageQuotaExceededError'
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError: Error) {
    super(message)
    this.name = 'NetworkError'
  }
}

export class ObserverError extends Error {
  constructor(message: string, public originalError: Error) {
    super(message)
    this.name = 'ObserverError'
  }
}

// Retry queue for failed operations
class RetryQueue {
  private queue: Array<{
    operation: () => Promise<any>
    context: string
    config: RetryConfig
    attempts: number
  }> = []
  private processing = false

  public add(
    operation: () => Promise<any>,
    context: string,
    config: RetryConfig
  ): void {
    this.queue.push({ operation, context, config, attempts: 0 })
    this.process()
  }

  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) return

    this.processing = true

    while (this.queue.length > 0) {
      const item = this.queue.shift()!
      
      try {
        await item.operation()
        // Success - continue to next item
      } catch (error) {
        item.attempts++
        
        if (item.attempts < item.config.maxRetries) {
          // Re-queue for retry
          this.queue.push(item)
        } else {
          // Max retries reached - give up
          console.error(`Failed to retry operation: ${item.context}`)
        }
      }
    }

    this.processing = false
  }
}