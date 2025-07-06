import type { 
  ReadingPosition, 
  ContentElement, 
  ReadingTrackerConfig,
  ReadingTrackerCallbacks 
} from '~/types/reading-progress'

export class PositionTracker {
  private observer: IntersectionObserver | null = null
  private resizeObserver: ResizeObserver | null = null
  private elements: Map<string, ContentElement> = new Map()
  private visibleElements: Set<string> = new Set()
  private config: Required<ReadingTrackerConfig>
  private callbacks: ReadingTrackerCallbacks
  private isDestroyed = false
  private lastScrollTop = 0
  private scrollDebounceTimeout: number | null = null

  constructor(config: ReadingTrackerConfig, callbacks: ReadingTrackerCallbacks = {}) {
    this.config = this.mergeConfig(config)
    this.callbacks = callbacks
    this.init()
  }

  private mergeConfig(config: ReadingTrackerConfig): Required<ReadingTrackerConfig> {
    return {
      documentId: config.documentId,
      containerSelector: config.containerSelector || 'body',
      contentSelectors: config.contentSelectors || [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'div', 'section', 'article',
        'pre', 'code', 'blockquote',
        'ul', 'ol', 'li', 'table'
      ],
      intersectionThreshold: config.intersectionThreshold || [0, 0.1, 0.25, 0.5, 0.75, 1],
      intersectionRootMargin: config.intersectionRootMargin || '0px',
      scrollDebounceDelay: config.scrollDebounceDelay || 100,
      autoSaveInterval: config.autoSaveInterval || 5000,
      enableTimeTracking: config.enableTimeTracking ?? true,
      enableBookmarks: config.enableBookmarks ?? true,
      averageReadingSpeed: config.averageReadingSpeed || 200,
      storageKeyPrefix: config.storageKeyPrefix || 'reading-progress',
      enableAccessibility: config.enableAccessibility ?? true,
      debug: config.debug ?? false
    }
  }

  private init(): void {
    try {
      this.setupIntersectionObserver()
      this.setupResizeObserver()
      this.discoverElements()
      this.setupScrollListener()
      
      if (this.config.debug) {
        console.log('PositionTracker initialized', {
          documentId: this.config.documentId,
          elementsFound: this.elements.size
        })
      }
    } catch (error) {
      this.handleError(error as Error)
    }
  }

  private setupIntersectionObserver(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      if (this.config.debug) {
        console.warn('IntersectionObserver not supported')
      }
      return
    }

    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        threshold: this.config.intersectionThreshold,
        rootMargin: this.config.intersectionRootMargin
      }
    )
  }

  private setupResizeObserver(): void {
    if (typeof window === 'undefined' || !('ResizeObserver' in window)) {
      if (this.config.debug) {
        console.warn('ResizeObserver not supported')
      }
      return
    }

    this.resizeObserver = new ResizeObserver(
      this.handleResize.bind(this)
    )
  }

  private discoverElements(): void {
    const container = document.querySelector(this.config.containerSelector)
    if (!container) {
      throw new Error(`Container not found: ${this.config.containerSelector}`)
    }

    const selector = this.config.contentSelectors.join(', ')
    const elements = container.querySelectorAll(selector)

    elements.forEach((element, index) => {
      const contentElement = this.createContentElement(element as HTMLElement, index)
      this.elements.set(contentElement.id, contentElement)
      
      if (this.observer) {
        this.observer.observe(element)
      }
      
      if (this.resizeObserver) {
        this.resizeObserver.observe(element)
      }
    })
  }

  private createContentElement(element: HTMLElement, index: number): ContentElement {
    const rect = element.getBoundingClientRect()
    const textContent = element.textContent || ''
    const wordCount = this.countWords(textContent)
    const characterCount = textContent.length
    
    // Generate ID if element doesn't have one
    const id = element.id || `element-${index}`
    if (!element.id) {
      element.id = id
    }

    return {
      id,
      type: this.getElementType(element),
      level: this.getElementLevel(element),
      textContent,
      wordCount,
      characterCount,
      offsetTop: element.offsetTop,
      height: rect.height,
      estimatedReadingTime: this.calculateReadingTime(wordCount),
      isVisible: false,
      visibilityPercentage: 0
    }
  }

  private getElementType(element: HTMLElement): ContentElement['type'] {
    const tagName = element.tagName.toLowerCase()
    
    if (tagName.match(/^h[1-6]$/)) return 'heading'
    if (tagName === 'p') return 'paragraph'
    if (tagName === 'pre' || tagName === 'code') return 'code'
    if (tagName === 'img') return 'image'
    if (tagName === 'ul' || tagName === 'ol' || tagName === 'li') return 'list'
    if (tagName === 'table' || tagName === 'tr' || tagName === 'td' || tagName === 'th') return 'table'
    
    return 'other'
  }

  private getElementLevel(element: HTMLElement): number | undefined {
    const tagName = element.tagName.toLowerCase()
    const match = tagName.match(/^h([1-6])$/)
    return match ? parseInt(match[1], 10) : undefined
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  private calculateReadingTime(wordCount: number): number {
    return (wordCount / this.config.averageReadingSpeed) * 60 * 1000 // milliseconds
  }

  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      const element = this.elements.get(entry.target.id)
      if (!element) return

      const isVisible = entry.isIntersecting
      const visibilityPercentage = Math.round(entry.intersectionRatio * 100)

      // Update element visibility
      element.isVisible = isVisible
      element.visibilityPercentage = visibilityPercentage

      if (isVisible) {
        this.visibleElements.add(element.id)
        this.callbacks.onElementVisible?.(element)
      } else {
        this.visibleElements.delete(element.id)
        this.callbacks.onElementHidden?.(element)
      }

      // Update position if this is the most visible element
      if (isVisible && visibilityPercentage > 50) {
        this.updatePosition(element)
      }
    })
  }

  private handleResize(entries: ResizeObserverEntry[]): void {
    entries.forEach(entry => {
      const element = this.elements.get(entry.target.id)
      if (!element) return

      const rect = entry.contentRect
      element.height = rect.height
      element.offsetTop = (entry.target as HTMLElement).offsetTop
    })
  }

  private setupScrollListener(): void {
    if (typeof window === 'undefined') return

    const handleScroll = () => {
      if (this.scrollDebounceTimeout) {
        clearTimeout(this.scrollDebounceTimeout)
      }
      
      this.scrollDebounceTimeout = window.setTimeout(() => {
        this.updateScrollPosition()
      }, this.config.scrollDebounceDelay)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
  }

  private updateScrollPosition(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const documentHeight = document.documentElement.scrollHeight
    const viewportHeight = window.innerHeight
    const scrollPercentage = Math.round((scrollTop / (documentHeight - viewportHeight)) * 100)

    this.lastScrollTop = scrollTop

    const position: ReadingPosition = {
      documentId: this.config.documentId,
      scrollTop,
      documentHeight,
      scrollPercentage: Math.min(100, Math.max(0, scrollPercentage)),
      timestamp: Date.now(),
      currentElementId: this.getCurrentElementId(),
      currentChapter: this.getCurrentChapter(),
      sessionId: this.generateSessionId()
    }

    this.callbacks.onPositionChange?.(position)
  }

  private updatePosition(element: ContentElement): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const documentHeight = document.documentElement.scrollHeight
    const viewportHeight = window.innerHeight
    const scrollPercentage = Math.round((scrollTop / (documentHeight - viewportHeight)) * 100)

    const position: ReadingPosition = {
      documentId: this.config.documentId,
      scrollTop,
      documentHeight,
      scrollPercentage: Math.min(100, Math.max(0, scrollPercentage)),
      timestamp: Date.now(),
      currentElementId: element.id,
      currentChapter: this.getCurrentChapter(),
      sessionId: this.generateSessionId()
    }

    this.callbacks.onPositionChange?.(position)
  }

  private getCurrentElementId(): string | undefined {
    // Find the most visible element
    let mostVisible: ContentElement | null = null
    let maxVisibility = 0

    for (const elementId of this.visibleElements) {
      const element = this.elements.get(elementId)
      if (element && element.visibilityPercentage > maxVisibility) {
        maxVisibility = element.visibilityPercentage
        mostVisible = element
      }
    }

    return mostVisible?.id
  }

  private getCurrentChapter(): string | undefined {
    // Find the current chapter based on visible headings
    const visibleHeadings = Array.from(this.visibleElements)
      .map(id => this.elements.get(id))
      .filter(element => element?.type === 'heading')
      .sort((a, b) => (a?.level || 0) - (b?.level || 0))

    return visibleHeadings[0]?.textContent
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private handleError(error: Error): void {
    if (this.config.debug) {
      console.error('PositionTracker error:', error)
    }
    this.callbacks.onError?.(error)
  }

  // Public methods
  public getElements(): ContentElement[] {
    return Array.from(this.elements.values())
  }

  public getVisibleElements(): ContentElement[] {
    return Array.from(this.visibleElements)
      .map(id => this.elements.get(id))
      .filter(Boolean) as ContentElement[]
  }

  public getCurrentPosition(): ReadingPosition {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const documentHeight = document.documentElement.scrollHeight
    const viewportHeight = window.innerHeight
    const scrollPercentage = Math.round((scrollTop / (documentHeight - viewportHeight)) * 100)

    return {
      documentId: this.config.documentId,
      scrollTop,
      documentHeight,
      scrollPercentage: Math.min(100, Math.max(0, scrollPercentage)),
      timestamp: Date.now(),
      currentElementId: this.getCurrentElementId(),
      currentChapter: this.getCurrentChapter(),
      sessionId: this.generateSessionId()
    }
  }

  public scrollToPosition(position: ReadingPosition): void {
    try {
      if (position.currentElementId) {
        const element = document.getElementById(position.currentElementId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          return
        }
      }

      // Fallback to scroll position
      window.scrollTo({
        top: position.scrollTop,
        behavior: 'smooth'
      })
    } catch (error) {
      this.handleError(error as Error)
    }
  }

  public scrollToElement(elementId: string): void {
    try {
      const element = document.getElementById(elementId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        
        // Update position after scroll
        setTimeout(() => {
          this.updateScrollPosition()
        }, 500)
      }
    } catch (error) {
      this.handleError(error as Error)
    }
  }

  public destroy(): void {
    if (this.isDestroyed) return

    this.isDestroyed = true

    // Clean up observers
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }

    // Clear timeouts
    if (this.scrollDebounceTimeout) {
      clearTimeout(this.scrollDebounceTimeout)
      this.scrollDebounceTimeout = null
    }

    // Clear data
    this.elements.clear()
    this.visibleElements.clear()

    if (this.config.debug) {
      console.log('PositionTracker destroyed')
    }
  }
}