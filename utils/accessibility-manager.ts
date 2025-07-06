import type { ReadingPosition, ContentElement, ReadingBookmark } from '~/types/reading-progress'

export interface AccessibilityPreferences {
  announceProgress: boolean
  announceBookmarks: boolean
  announceChapterChanges: boolean
  announceTimeEstimates: boolean
  reducedMotion: boolean
  highContrast: boolean
  screenReaderOptimized: boolean
  keyboardNavigation: boolean
  focusIndicators: boolean
  skipLinks: boolean
}

export interface AccessibilityState {
  isScreenReaderActive: boolean
  hasKeyboardFocus: boolean
  currentFocusElement: string | null
  announcements: string[]
  lastAnnouncement: string | null
  lastAnnouncementTime: number
}

export class AccessibilityManager {
  private preferences: AccessibilityPreferences
  private state: AccessibilityState
  private announcer: HTMLElement | null = null
  private skipLinksContainer: HTMLElement | null = null
  private keyboardListeners: Map<string, (event: KeyboardEvent) => void> = new Map()
  private focusManager: FocusManager
  private debugMode: boolean

  constructor(
    preferences: Partial<AccessibilityPreferences> = {},
    debugMode = false
  ) {
    this.preferences = this.mergePreferences(preferences)
    this.state = {
      isScreenReaderActive: false,
      hasKeyboardFocus: false,
      currentFocusElement: null,
      announcements: [],
      lastAnnouncement: null,
      lastAnnouncementTime: 0
    }
    this.debugMode = debugMode
    this.focusManager = new FocusManager(this.debugMode)
    
    this.initialize()
  }

  private mergePreferences(preferences: Partial<AccessibilityPreferences>): AccessibilityPreferences {
    return {
      announceProgress: preferences.announceProgress ?? true,
      announceBookmarks: preferences.announceBookmarks ?? true,
      announceChapterChanges: preferences.announceChapterChanges ?? true,
      announceTimeEstimates: preferences.announceTimeEstimates ?? false,
      reducedMotion: preferences.reducedMotion ?? this.detectReducedMotion(),
      highContrast: preferences.highContrast ?? this.detectHighContrast(),
      screenReaderOptimized: preferences.screenReaderOptimized ?? this.detectScreenReader(),
      keyboardNavigation: preferences.keyboardNavigation ?? true,
      focusIndicators: preferences.focusIndicators ?? true,
      skipLinks: preferences.skipLinks ?? true
    }
  }

  private initialize(): void {
    this.setupAnnouncer()
    this.setupKeyboardNavigation()
    this.setupSkipLinks()
    this.detectAccessibilityFeatures()
    
    if (this.debugMode) {
      console.log('AccessibilityManager initialized', this.preferences)
    }
  }

  // Screen reader announcements
  private setupAnnouncer(): void {
    if (typeof document === 'undefined') return

    this.announcer = document.createElement('div')
    this.announcer.setAttribute('aria-live', 'polite')
    this.announcer.setAttribute('aria-atomic', 'true')
    this.announcer.setAttribute('id', 'reading-progress-announcer')
    this.announcer.style.position = 'absolute'
    this.announcer.style.left = '-10000px'
    this.announcer.style.width = '1px'
    this.announcer.style.height = '1px'
    this.announcer.style.overflow = 'hidden'
    
    document.body.appendChild(this.announcer)
  }

  public announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.announcer || !message.trim()) return

    const now = Date.now()
    const timeSinceLastAnnouncement = now - this.state.lastAnnouncementTime

    // Avoid duplicate announcements within 2 seconds
    if (this.state.lastAnnouncement === message && timeSinceLastAnnouncement < 2000) {
      return
    }

    this.announcer.setAttribute('aria-live', priority)
    this.announcer.textContent = message
    
    this.state.announcements.push(message)
    this.state.lastAnnouncement = message
    this.state.lastAnnouncementTime = now

    // Keep only last 10 announcements
    if (this.state.announcements.length > 10) {
      this.state.announcements.shift()
    }

    if (this.debugMode) {
      console.log('Announced:', message)
    }
  }

  // Progress announcements
  public announceProgressUpdate(position: ReadingPosition): void {
    if (!this.preferences.announceProgress) return

    const percentage = Math.round(position.scrollPercentage)
    
    // Announce at 25%, 50%, 75%, and 100% milestones
    const milestones = [25, 50, 75, 100]
    for (const milestone of milestones) {
      if (Math.abs(percentage - milestone) < 1) {
        this.announce(`Reading progress: ${milestone}% complete`)
        break
      }
    }
  }

  public announceChapterChange(chapterName: string): void {
    if (!this.preferences.announceChapterChanges || !chapterName) return
    
    this.announce(`Now reading: ${chapterName}`)
  }

  public announceBookmarkCreated(bookmark: ReadingBookmark): void {
    if (!this.preferences.announceBookmarks) return
    
    this.announce(`Bookmark created: ${bookmark.title}`)
  }

  public announceTimeEstimate(remainingTime: number): void {
    if (!this.preferences.announceTimeEstimates) return
    
    const minutes = Math.round(remainingTime / (1000 * 60))
    if (minutes > 0) {
      this.announce(`Estimated reading time remaining: ${minutes} minutes`)
    }
  }

  // Keyboard navigation
  private setupKeyboardNavigation(): void {
    if (!this.preferences.keyboardNavigation || typeof window === 'undefined') return

    // Global keyboard shortcuts
    const shortcuts = {
      'KeyP': this.createProgressShortcut(),
      'KeyB': this.createBookmarkShortcut(),
      'KeyN': this.createNextChapterShortcut(),
      'KeyM': this.createPreviousChapterShortcut(),
      'KeyR': this.createResumeShortcut(),
      'KeyH': this.createHelpShortcut(),
      'Escape': this.createEscapeShortcut(),
      'Space': this.createSpaceShortcut()
    }

    const handleKeydown = (event: KeyboardEvent) => {
      // Only handle shortcuts with Alt key to avoid conflicts
      if (!event.altKey) return

      const handler = shortcuts[event.code as keyof typeof shortcuts]
      if (handler) {
        event.preventDefault()
        handler(event)
      }
    }

    window.addEventListener('keydown', handleKeydown)
    this.keyboardListeners.set('global', handleKeydown)
  }

  private createProgressShortcut() {
    return (event: KeyboardEvent) => {
      this.announce('Reading progress shortcut activated')
      // Emit event for progress display
      window.dispatchEvent(new CustomEvent('reading-progress:show-progress'))
    }
  }

  private createBookmarkShortcut() {
    return (event: KeyboardEvent) => {
      this.announce('Bookmark shortcut activated')
      window.dispatchEvent(new CustomEvent('reading-progress:create-bookmark'))
    }
  }

  private createNextChapterShortcut() {
    return (event: KeyboardEvent) => {
      this.announce('Next chapter shortcut activated')
      window.dispatchEvent(new CustomEvent('reading-progress:next-chapter'))
    }
  }

  private createPreviousChapterShortcut() {
    return (event: KeyboardEvent) => {
      this.announce('Previous chapter shortcut activated')
      window.dispatchEvent(new CustomEvent('reading-progress:previous-chapter'))
    }
  }

  private createResumeShortcut() {
    return (event: KeyboardEvent) => {
      this.announce('Resume reading shortcut activated')
      window.dispatchEvent(new CustomEvent('reading-progress:resume'))
    }
  }

  private createHelpShortcut() {
    return (event: KeyboardEvent) => {
      this.announce('Help shortcut activated')
      this.announceKeyboardShortcuts()
    }
  }

  private createEscapeShortcut() {
    return (event: KeyboardEvent) => {
      this.announce('Escape pressed')
      window.dispatchEvent(new CustomEvent('reading-progress:escape'))
    }
  }

  private createSpaceShortcut() {
    return (event: KeyboardEvent) => {
      // Only handle space if not in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }
      
      event.preventDefault()
      window.dispatchEvent(new CustomEvent('reading-progress:toggle-tracking'))
    }
  }

  private announceKeyboardShortcuts(): void {
    const shortcuts = [
      'Alt+P: Show progress',
      'Alt+B: Create bookmark',
      'Alt+N: Next chapter',
      'Alt+M: Previous chapter',
      'Alt+R: Resume reading',
      'Alt+H: Show help',
      'Space: Toggle tracking',
      'Escape: Close dialogs'
    ]
    
    this.announce('Keyboard shortcuts: ' + shortcuts.join(', '))
  }

  // Skip links
  private setupSkipLinks(): void {
    if (!this.preferences.skipLinks || typeof document === 'undefined') return

    this.skipLinksContainer = document.createElement('div')
    this.skipLinksContainer.setAttribute('id', 'reading-progress-skip-links')
    this.skipLinksContainer.style.position = 'absolute'
    this.skipLinksContainer.style.top = '-40px'
    this.skipLinksContainer.style.left = '6px'
    this.skipLinksContainer.style.zIndex = '1000'
    this.skipLinksContainer.style.backgroundColor = '#000'
    this.skipLinksContainer.style.color = '#fff'
    this.skipLinksContainer.style.padding = '8px'
    this.skipLinksContainer.style.borderRadius = '4px'
    this.skipLinksContainer.style.fontSize = '14px'
    this.skipLinksContainer.style.fontFamily = 'sans-serif'
    this.skipLinksContainer.style.display = 'none'

    const skipLinks = [
      { text: 'Skip to main content', target: '#main-content' },
      { text: 'Skip to reading progress', target: '#reading-progress' },
      { text: 'Skip to bookmarks', target: '#bookmarks' },
      { text: 'Skip to chapter navigation', target: '#chapter-navigation' }
    ]

    skipLinks.forEach(link => {
      const skipLink = document.createElement('a')
      skipLink.href = link.target
      skipLink.textContent = link.text
      skipLink.style.color = '#fff'
      skipLink.style.textDecoration = 'underline'
      skipLink.style.display = 'block'
      skipLink.style.marginBottom = '4px'
      
      skipLink.addEventListener('focus', () => {
        this.skipLinksContainer!.style.display = 'block'
        this.skipLinksContainer!.style.top = '6px'
      })
      
      skipLink.addEventListener('blur', () => {
        this.skipLinksContainer!.style.display = 'none'
        this.skipLinksContainer!.style.top = '-40px'
      })
      
      this.skipLinksContainer.appendChild(skipLink)
    })

    document.body.insertBefore(this.skipLinksContainer, document.body.firstChild)
  }

  // Feature detection
  private detectReducedMotion(): boolean {
    if (typeof window === 'undefined') return false
    
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  private detectHighContrast(): boolean {
    if (typeof window === 'undefined') return false
    
    return window.matchMedia('(prefers-contrast: high)').matches ||
           window.matchMedia('(-ms-high-contrast: active)').matches
  }

  private detectScreenReader(): boolean {
    if (typeof window === 'undefined') return false
    
    // Check for common screen reader indicators
    const userAgent = navigator.userAgent.toLowerCase()
    const screenReaderPatterns = [
      'jaws', 'nvda', 'dragon', 'voiceover', 'narrator', 'talkback'
    ]
    
    return screenReaderPatterns.some(pattern => userAgent.includes(pattern))
  }

  private detectAccessibilityFeatures(): void {
    if (typeof window === 'undefined') return

    // Listen for screen reader detection
    const detectScreenReader = () => {
      this.state.isScreenReaderActive = this.detectScreenReader()
    }

    // Listen for keyboard navigation
    const handleKeyNavigation = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        this.state.hasKeyboardFocus = true
        this.state.currentFocusElement = (event.target as HTMLElement)?.id || null
      }
    }

    // Listen for mouse usage (indicates not keyboard-only)
    const handleMouseUsage = () => {
      this.state.hasKeyboardFocus = false
    }

    window.addEventListener('keydown', handleKeyNavigation)
    window.addEventListener('mousedown', handleMouseUsage)
    
    // Initial detection
    detectScreenReader()
  }

  // ARIA labels and descriptions
  public generateAriaLabel(element: ContentElement): string {
    const typeLabel = this.getElementTypeLabel(element.type)
    const progressInfo = element.isVisible ? 'currently visible' : 'not visible'
    
    return `${typeLabel}, ${element.wordCount} words, ${progressInfo}`
  }

  public generateBookmarkAriaLabel(bookmark: ReadingBookmark): string {
    const progress = Math.round(bookmark.position.scrollPercentage)
    const date = new Date(bookmark.createdAt).toLocaleDateString()
    
    return `Bookmark: ${bookmark.title}, ${progress}% through document, created ${date}`
  }

  private getElementTypeLabel(type: ContentElement['type']): string {
    const labels = {
      'heading': 'Heading',
      'paragraph': 'Paragraph',
      'code': 'Code block',
      'image': 'Image',
      'list': 'List',
      'table': 'Table',
      'other': 'Content'
    }
    
    return labels[type] || 'Content'
  }

  // Focus management
  public manageFocus(targetId: string): void {
    this.focusManager.setFocus(targetId)
  }

  public restoreFocus(): void {
    this.focusManager.restoreFocus()
  }

  // Preferences management
  public updatePreferences(updates: Partial<AccessibilityPreferences>): void {
    this.preferences = { ...this.preferences, ...updates }
    
    if (this.debugMode) {
      console.log('Accessibility preferences updated:', this.preferences)
    }
  }

  public getPreferences(): AccessibilityPreferences {
    return { ...this.preferences }
  }

  public getState(): AccessibilityState {
    return { ...this.state }
  }

  // Cleanup
  public destroy(): void {
    // Remove announcer
    if (this.announcer) {
      document.body.removeChild(this.announcer)
      this.announcer = null
    }

    // Remove skip links
    if (this.skipLinksContainer) {
      document.body.removeChild(this.skipLinksContainer)
      this.skipLinksContainer = null
    }

    // Remove keyboard listeners
    this.keyboardListeners.forEach((listener, key) => {
      if (key === 'global') {
        window.removeEventListener('keydown', listener)
      }
    })
    this.keyboardListeners.clear()

    // Destroy focus manager
    this.focusManager.destroy()

    if (this.debugMode) {
      console.log('AccessibilityManager destroyed')
    }
  }
}

// Focus management utility
class FocusManager {
  private focusStack: string[] = []
  private debugMode: boolean

  constructor(debugMode = false) {
    this.debugMode = debugMode
  }

  public setFocus(targetId: string): void {
    if (typeof document === 'undefined') return

    const currentFocus = document.activeElement?.id
    if (currentFocus) {
      this.focusStack.push(currentFocus)
    }

    const targetElement = document.getElementById(targetId)
    if (targetElement) {
      targetElement.focus()
      
      if (this.debugMode) {
        console.log('Focus set to:', targetId)
      }
    }
  }

  public restoreFocus(): void {
    if (this.focusStack.length === 0) return

    const previousFocusId = this.focusStack.pop()
    if (previousFocusId) {
      const element = document.getElementById(previousFocusId)
      if (element) {
        element.focus()
        
        if (this.debugMode) {
          console.log('Focus restored to:', previousFocusId)
        }
      }
    }
  }

  public destroy(): void {
    this.focusStack = []
  }
}