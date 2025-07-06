import type { 
  ReadingBookmark, 
  ReadingPosition, 
  ContentElement 
} from '~/types/reading-progress'

export class BookmarkManager {
  private bookmarks: Map<string, ReadingBookmark> = new Map()
  private documentId: string
  private onBookmarkChange?: (bookmarks: ReadingBookmark[]) => void
  private debugMode: boolean

  constructor(
    documentId: string,
    onBookmarkChange?: (bookmarks: ReadingBookmark[]) => void,
    debugMode = false
  ) {
    this.documentId = documentId
    this.onBookmarkChange = onBookmarkChange
    this.debugMode = debugMode
  }

  // Create bookmark
  public createBookmark(
    position: ReadingPosition,
    title: string,
    description?: string,
    tags?: string[],
    notes?: string
  ): ReadingBookmark {
    const bookmark: ReadingBookmark = {
      id: this.generateBookmarkId(),
      documentId: this.documentId,
      title: title.trim(),
      description: description?.trim(),
      position: { ...position },
      createdAt: Date.now(),
      tags: tags?.map(tag => tag.trim().toLowerCase()) || [],
      notes: notes?.trim()
    }

    this.bookmarks.set(bookmark.id, bookmark)
    this.notifyChange()

    if (this.debugMode) {
      console.log('Bookmark created:', bookmark.id, bookmark.title)
    }

    return bookmark
  }

  // Create bookmark at current position
  public createBookmarkAtPosition(
    position: ReadingPosition,
    element?: ContentElement,
    title?: string
  ): ReadingBookmark {
    const autoTitle = title || this.generateAutoTitle(position, element)
    const description = element ? this.generateAutoDescription(element) : undefined

    return this.createBookmark(position, autoTitle, description)
  }

  // Update bookmark
  public updateBookmark(
    bookmarkId: string,
    updates: Partial<Pick<ReadingBookmark, 'title' | 'description' | 'tags' | 'notes'>>
  ): ReadingBookmark | null {
    const bookmark = this.bookmarks.get(bookmarkId)
    if (!bookmark) return null

    const updatedBookmark: ReadingBookmark = {
      ...bookmark,
      ...updates,
      tags: updates.tags?.map(tag => tag.trim().toLowerCase()) || bookmark.tags
    }

    this.bookmarks.set(bookmarkId, updatedBookmark)
    this.notifyChange()

    if (this.debugMode) {
      console.log('Bookmark updated:', bookmarkId)
    }

    return updatedBookmark
  }

  // Delete bookmark
  public deleteBookmark(bookmarkId: string): boolean {
    const existed = this.bookmarks.has(bookmarkId)
    if (existed) {
      this.bookmarks.delete(bookmarkId)
      this.notifyChange()

      if (this.debugMode) {
        console.log('Bookmark deleted:', bookmarkId)
      }
    }

    return existed
  }

  // Get bookmark by ID
  public getBookmark(bookmarkId: string): ReadingBookmark | null {
    return this.bookmarks.get(bookmarkId) || null
  }

  // Get all bookmarks
  public getAllBookmarks(): ReadingBookmark[] {
    return Array.from(this.bookmarks.values())
      .sort((a, b) => b.createdAt - a.createdAt)
  }

  // Get bookmarks by tag
  public getBookmarksByTag(tag: string): ReadingBookmark[] {
    const normalizedTag = tag.toLowerCase()
    return this.getAllBookmarks()
      .filter(bookmark => bookmark.tags?.includes(normalizedTag))
  }

  // Get bookmarks by position range
  public getBookmarksByRange(
    startPercentage: number,
    endPercentage: number
  ): ReadingBookmark[] {
    return this.getAllBookmarks()
      .filter(bookmark => {
        const progress = bookmark.position.scrollPercentage
        return progress >= startPercentage && progress <= endPercentage
      })
  }

  // Search bookmarks
  public searchBookmarks(query: string): ReadingBookmark[] {
    const normalizedQuery = query.toLowerCase()
    
    return this.getAllBookmarks()
      .filter(bookmark => {
        const titleMatch = bookmark.title.toLowerCase().includes(normalizedQuery)
        const descriptionMatch = bookmark.description?.toLowerCase().includes(normalizedQuery)
        const notesMatch = bookmark.notes?.toLowerCase().includes(normalizedQuery)
        const tagMatch = bookmark.tags?.some(tag => tag.includes(normalizedQuery))
        
        return titleMatch || descriptionMatch || notesMatch || tagMatch
      })
  }

  // Get closest bookmark to position
  public getClosestBookmark(position: ReadingPosition): ReadingBookmark | null {
    const bookmarks = this.getAllBookmarks()
    if (bookmarks.length === 0) return null

    let closest: ReadingBookmark | null = null
    let minDistance = Infinity

    for (const bookmark of bookmarks) {
      const distance = Math.abs(
        bookmark.position.scrollPercentage - position.scrollPercentage
      )
      
      if (distance < minDistance) {
        minDistance = distance
        closest = bookmark
      }
    }

    return closest
  }

  // Get bookmark statistics
  public getBookmarkStats(): {
    total: number
    byTag: Record<string, number>
    averagePosition: number
    oldestBookmark: ReadingBookmark | null
    newestBookmark: ReadingBookmark | null
    mostUsed: ReadingBookmark | null
  } {
    const bookmarks = this.getAllBookmarks()
    const total = bookmarks.length

    if (total === 0) {
      return {
        total: 0,
        byTag: {},
        averagePosition: 0,
        oldestBookmark: null,
        newestBookmark: null,
        mostUsed: null
      }
    }

    // Count by tag
    const byTag: Record<string, number> = {}
    bookmarks.forEach(bookmark => {
      bookmark.tags?.forEach(tag => {
        byTag[tag] = (byTag[tag] || 0) + 1
      })
    })

    // Calculate average position
    const averagePosition = bookmarks.reduce(
      (sum, bookmark) => sum + bookmark.position.scrollPercentage,
      0
    ) / total

    // Find oldest and newest
    const sortedByDate = [...bookmarks].sort((a, b) => a.createdAt - b.createdAt)
    const oldestBookmark = sortedByDate[0]
    const newestBookmark = sortedByDate[sortedByDate.length - 1]

    // Find most used (most recently accessed)
    const mostUsed = [...bookmarks]
      .filter(bookmark => bookmark.lastAccessed)
      .sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0))[0] || null

    return {
      total,
      byTag,
      averagePosition,
      oldestBookmark,
      newestBookmark,
      mostUsed
    }
  }

  // Access bookmark (updates last accessed time)
  public accessBookmark(bookmarkId: string): ReadingBookmark | null {
    const bookmark = this.bookmarks.get(bookmarkId)
    if (!bookmark) return null

    bookmark.lastAccessed = Date.now()
    this.bookmarks.set(bookmarkId, bookmark)

    if (this.debugMode) {
      console.log('Bookmark accessed:', bookmarkId)
    }

    return bookmark
  }

  // Import bookmarks
  public importBookmarks(bookmarks: ReadingBookmark[]): number {
    let imported = 0
    
    for (const bookmark of bookmarks) {
      // Validate bookmark
      if (this.validateBookmark(bookmark)) {
        // Ensure unique ID
        let id = bookmark.id
        let counter = 1
        while (this.bookmarks.has(id)) {
          id = `${bookmark.id}-${counter}`
          counter++
        }
        
        const importedBookmark = { ...bookmark, id }
        this.bookmarks.set(id, importedBookmark)
        imported++
      }
    }

    if (imported > 0) {
      this.notifyChange()
      
      if (this.debugMode) {
        console.log('Bookmarks imported:', imported)
      }
    }

    return imported
  }

  // Export bookmarks
  public exportBookmarks(): ReadingBookmark[] {
    return this.getAllBookmarks()
  }

  // Clear all bookmarks
  public clearAllBookmarks(): void {
    const count = this.bookmarks.size
    this.bookmarks.clear()
    
    if (count > 0) {
      this.notifyChange()
      
      if (this.debugMode) {
        console.log('All bookmarks cleared:', count)
      }
    }
  }

  // Load bookmarks from array
  public loadBookmarks(bookmarks: ReadingBookmark[]): void {
    this.bookmarks.clear()
    
    for (const bookmark of bookmarks) {
      if (this.validateBookmark(bookmark)) {
        this.bookmarks.set(bookmark.id, bookmark)
      }
    }

    this.notifyChange()

    if (this.debugMode) {
      console.log('Bookmarks loaded:', this.bookmarks.size)
    }
  }

  // Auto-bookmark functionality
  public shouldCreateAutoBookmark(
    position: ReadingPosition,
    element?: ContentElement,
    timeSpentMs?: number
  ): boolean {
    // Create auto-bookmark for headings if user spent significant time
    if (element?.type === 'heading' && timeSpentMs && timeSpentMs > 30000) {
      return true
    }

    // Create auto-bookmark at major progress milestones
    const milestones = [25, 50, 75, 100]
    const currentProgress = position.scrollPercentage
    
    for (const milestone of milestones) {
      if (Math.abs(currentProgress - milestone) < 1) {
        const existingMilestone = this.getAllBookmarks()
          .find(b => Math.abs(b.position.scrollPercentage - milestone) < 5)
        
        if (!existingMilestone) {
          return true
        }
      }
    }

    return false
  }

  public createAutoBookmark(
    position: ReadingPosition,
    element?: ContentElement,
    timeSpentMs?: number
  ): ReadingBookmark | null {
    if (!this.shouldCreateAutoBookmark(position, element, timeSpentMs)) {
      return null
    }

    const title = element?.type === 'heading' 
      ? element.textContent.substring(0, 50)
      : `${Math.round(position.scrollPercentage)}% Complete`

    const description = element?.type === 'heading'
      ? 'Auto-bookmark: Extended reading time'
      : `Auto-bookmark: ${Math.round(position.scrollPercentage)}% progress milestone`

    return this.createBookmark(position, title, description, ['auto-bookmark'])
  }

  // Private methods
  private generateBookmarkId(): string {
    return `bookmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private generateAutoTitle(position: ReadingPosition, element?: ContentElement): string {
    if (element?.type === 'heading') {
      return element.textContent.substring(0, 50) + (element.textContent.length > 50 ? '...' : '')
    }

    if (position.currentChapter) {
      return `${position.currentChapter} (${Math.round(position.scrollPercentage)}%)`
    }

    return `Bookmark at ${Math.round(position.scrollPercentage)}%`
  }

  private generateAutoDescription(element: ContentElement): string {
    const snippet = element.textContent.substring(0, 100)
    return snippet + (element.textContent.length > 100 ? '...' : '')
  }

  private validateBookmark(bookmark: ReadingBookmark): boolean {
    return !!(
      bookmark.id &&
      bookmark.documentId &&
      bookmark.title &&
      bookmark.position &&
      bookmark.createdAt &&
      typeof bookmark.position.scrollPercentage === 'number' &&
      bookmark.position.scrollPercentage >= 0 &&
      bookmark.position.scrollPercentage <= 100
    )
  }

  private notifyChange(): void {
    if (this.onBookmarkChange) {
      this.onBookmarkChange(this.getAllBookmarks())
    }
  }

  // Utility methods for UI integration
  public getBookmarkColors(): Record<string, string> {
    // Predefined colors for bookmark visualization
    return {
      'auto-bookmark': '#6366f1',
      'important': '#ef4444',
      'reference': '#10b981',
      'question': '#f59e0b',
      'note': '#8b5cf6',
      'default': '#6b7280'
    }
  }

  public getBookmarkColor(bookmark: ReadingBookmark): string {
    const colors = this.getBookmarkColors()
    
    for (const tag of bookmark.tags || []) {
      if (colors[tag]) {
        return colors[tag]
      }
    }
    
    return colors.default
  }

  public getBookmarkIcon(bookmark: ReadingBookmark): string {
    const tags = bookmark.tags || []
    
    if (tags.includes('auto-bookmark')) return '🔖'
    if (tags.includes('important')) return '⭐'
    if (tags.includes('reference')) return '📚'
    if (tags.includes('question')) return '❓'
    if (tags.includes('note')) return '📝'
    
    return '📍'
  }
}