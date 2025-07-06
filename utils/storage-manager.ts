import type { 
  ReadingProgress, 
  ReadingPosition, 
  ReadingSession, 
  ReadingBookmark,
  StorageData
} from '~/types/reading-progress'

export class StorageManager {
  private readonly STORAGE_VERSION = 1
  private readonly keyPrefix: string
  private readonly maxStorageSize: number
  private readonly compressionEnabled: boolean
  private readonly debugMode: boolean

  constructor(
    keyPrefix = 'reading-progress',
    maxStorageSize = 5 * 1024 * 1024, // 5MB default
    compressionEnabled = true,
    debugMode = false
  ) {
    this.keyPrefix = keyPrefix
    this.maxStorageSize = maxStorageSize
    this.compressionEnabled = compressionEnabled
    this.debugMode = debugMode
  }

  // Progress storage
  public async saveProgress(progress: ReadingProgress): Promise<boolean> {
    try {
      const key = this.getProgressKey(progress.documentId)
      const data: StorageData = {
        progress,
        version: this.STORAGE_VERSION,
        lastSaved: Date.now()
      }

      const success = await this.setItem(key, data)
      
      if (success && this.debugMode) {
        console.log('Progress saved:', progress.documentId)
      }
      
      return success
    } catch (error) {
      console.error('Failed to save progress:', error)
      return false
    }
  }

  public async loadProgress(documentId: string): Promise<ReadingProgress | null> {
    try {
      const key = this.getProgressKey(documentId)
      const data = await this.getItem<StorageData>(key)
      
      if (!data) return null

      // Handle version migration if needed
      if (data.version !== this.STORAGE_VERSION) {
        const migrated = await this.migrateData(data)
        if (migrated) {
          await this.saveProgress(migrated.progress)
          return migrated.progress
        }
        return null
      }

      if (this.debugMode) {
        console.log('Progress loaded:', documentId)
      }

      return data.progress
    } catch (error) {
      console.error('Failed to load progress:', error)
      return null
    }
  }

  // Position storage
  public async savePosition(position: ReadingPosition): Promise<boolean> {
    try {
      const key = this.getPositionKey(position.documentId)
      const success = await this.setItem(key, position)
      
      if (success && this.debugMode) {
        console.log('Position saved:', position.documentId)
      }
      
      return success
    } catch (error) {
      console.error('Failed to save position:', error)
      return false
    }
  }

  public async loadPosition(documentId: string): Promise<ReadingPosition | null> {
    try {
      const key = this.getPositionKey(documentId)
      const position = await this.getItem<ReadingPosition>(key)
      
      if (this.debugMode && position) {
        console.log('Position loaded:', documentId)
      }
      
      return position
    } catch (error) {
      console.error('Failed to load position:', error)
      return null
    }
  }

  // Session storage
  public async saveSessions(documentId: string, sessions: ReadingSession[]): Promise<boolean> {
    try {
      const key = this.getSessionsKey(documentId)
      const success = await this.setItem(key, sessions)
      
      if (success && this.debugMode) {
        console.log('Sessions saved:', documentId, sessions.length)
      }
      
      return success
    } catch (error) {
      console.error('Failed to save sessions:', error)
      return false
    }
  }

  public async loadSessions(documentId: string): Promise<ReadingSession[]> {
    try {
      const key = this.getSessionsKey(documentId)
      const sessions = await this.getItem<ReadingSession[]>(key)
      
      if (this.debugMode && sessions) {
        console.log('Sessions loaded:', documentId, sessions.length)
      }
      
      return sessions || []
    } catch (error) {
      console.error('Failed to load sessions:', error)
      return []
    }
  }

  // Bookmark storage
  public async saveBookmarks(documentId: string, bookmarks: ReadingBookmark[]): Promise<boolean> {
    try {
      const key = this.getBookmarksKey(documentId)
      const success = await this.setItem(key, bookmarks)
      
      if (success && this.debugMode) {
        console.log('Bookmarks saved:', documentId, bookmarks.length)
      }
      
      return success
    } catch (error) {
      console.error('Failed to save bookmarks:', error)
      return false
    }
  }

  public async loadBookmarks(documentId: string): Promise<ReadingBookmark[]> {
    try {
      const key = this.getBookmarksKey(documentId)
      const bookmarks = await this.getItem<ReadingBookmark[]>(key)
      
      if (this.debugMode && bookmarks) {
        console.log('Bookmarks loaded:', documentId, bookmarks.length)
      }
      
      return bookmarks || []
    } catch (error) {
      console.error('Failed to load bookmarks:', error)
      return []
    }
  }

  // Utility methods
  public async getAllDocuments(): Promise<string[]> {
    try {
      const keys = await this.getAllKeys()
      const progressKeys = keys.filter(key => key.includes('progress'))
      
      return progressKeys.map(key => {
        const match = key.match(new RegExp(`${this.keyPrefix}-progress-(.+)`))
        return match ? match[1] : null
      }).filter(Boolean) as string[]
    } catch (error) {
      console.error('Failed to get all documents:', error)
      return []
    }
  }

  public async getStorageUsage(): Promise<{
    used: number
    total: number
    percentage: number
    documents: Record<string, number>
  }> {
    try {
      const keys = await this.getAllKeys()
      const documents: Record<string, number> = {}
      let totalUsed = 0

      for (const key of keys) {
        const value = localStorage.getItem(key)
        if (value) {
          const size = new Blob([value]).size
          totalUsed += size

          // Extract document ID for categorization
          const match = key.match(new RegExp(`${this.keyPrefix}-\\w+-(.*)`))
          if (match) {
            const docId = match[1]
            documents[docId] = (documents[docId] || 0) + size
          }
        }
      }

      return {
        used: totalUsed,
        total: this.maxStorageSize,
        percentage: (totalUsed / this.maxStorageSize) * 100,
        documents
      }
    } catch (error) {
      console.error('Failed to get storage usage:', error)
      return {
        used: 0,
        total: this.maxStorageSize,
        percentage: 0,
        documents: {}
      }
    }
  }

  public async clearDocument(documentId: string): Promise<boolean> {
    try {
      const keys = [
        this.getProgressKey(documentId),
        this.getPositionKey(documentId),
        this.getSessionsKey(documentId),
        this.getBookmarksKey(documentId)
      ]

      let success = true
      for (const key of keys) {
        if (!await this.removeItem(key)) {
          success = false
        }
      }

      if (success && this.debugMode) {
        console.log('Document cleared:', documentId)
      }

      return success
    } catch (error) {
      console.error('Failed to clear document:', error)
      return false
    }
  }

  public async clearAllData(): Promise<boolean> {
    try {
      const keys = await this.getAllKeys()
      let success = true

      for (const key of keys) {
        if (!await this.removeItem(key)) {
          success = false
        }
      }

      if (success && this.debugMode) {
        console.log('All data cleared')
      }

      return success
    } catch (error) {
      console.error('Failed to clear all data:', error)
      return false
    }
  }

  public async exportData(): Promise<string | null> {
    try {
      const keys = await this.getAllKeys()
      const data: Record<string, any> = {}

      for (const key of keys) {
        const value = await this.getItem(key)
        if (value) {
          data[key] = value
        }
      }

      return JSON.stringify({
        version: this.STORAGE_VERSION,
        exportDate: new Date().toISOString(),
        data
      }, null, 2)
    } catch (error) {
      console.error('Failed to export data:', error)
      return null
    }
  }

  public async importData(jsonData: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonData)
      
      if (!parsed.data || !parsed.version) {
        throw new Error('Invalid data format')
      }

      // Handle version compatibility
      if (parsed.version !== this.STORAGE_VERSION) {
        console.warn('Version mismatch during import')
      }

      let success = true
      for (const [key, value] of Object.entries(parsed.data)) {
        if (!await this.setItem(key, value)) {
          success = false
        }
      }

      if (success && this.debugMode) {
        console.log('Data imported successfully')
      }

      return success
    } catch (error) {
      console.error('Failed to import data:', error)
      return false
    }
  }

  // Private methods
  private async setItem<T>(key: string, value: T): Promise<boolean> {
    try {
      if (typeof window === 'undefined') return false

      const serialized = JSON.stringify(value)
      const compressed = this.compressionEnabled ? await this.compress(serialized) : serialized
      
      // Check storage size before saving
      const currentUsage = await this.getStorageUsage()
      const newItemSize = new Blob([compressed]).size
      
      if (currentUsage.used + newItemSize > this.maxStorageSize) {
        console.warn('Storage quota exceeded')
        await this.cleanup()
      }

      localStorage.setItem(key, compressed)
      return true
    } catch (error) {
      console.error('Failed to set item:', error)
      return false
    }
  }

  private async getItem<T>(key: string): Promise<T | null> {
    try {
      if (typeof window === 'undefined') return null

      const stored = localStorage.getItem(key)
      if (!stored) return null

      const decompressed = this.compressionEnabled ? await this.decompress(stored) : stored
      return JSON.parse(decompressed) as T
    } catch (error) {
      console.error('Failed to get item:', error)
      return null
    }
  }

  private async removeItem(key: string): Promise<boolean> {
    try {
      if (typeof window === 'undefined') return false

      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Failed to remove item:', error)
      return false
    }
  }

  private async getAllKeys(): Promise<string[]> {
    try {
      if (typeof window === 'undefined') return []

      const keys: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.keyPrefix)) {
          keys.push(key)
        }
      }
      return keys
    } catch (error) {
      console.error('Failed to get all keys:', error)
      return []
    }
  }

  private async compress(data: string): Promise<string> {
    // Simple compression - in production, consider using a proper compression library
    if (typeof window !== 'undefined' && 'CompressionStream' in window) {
      try {
        const stream = new CompressionStream('gzip')
        const writer = stream.writable.getWriter()
        const reader = stream.readable.getReader()
        
        writer.write(new TextEncoder().encode(data))
        writer.close()
        
        const chunks: Uint8Array[] = []
        let result = await reader.read()
        
        while (!result.done) {
          chunks.push(result.value)
          result = await reader.read()
        }
        
        const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
        let offset = 0
        
        chunks.forEach(chunk => {
          compressed.set(chunk, offset)
          offset += chunk.length
        })
        
        return btoa(String.fromCharCode(...compressed))
      } catch (error) {
        console.warn('Compression failed, using uncompressed data')
        return data
      }
    }
    
    return data
  }

  private async decompress(data: string): Promise<string> {
    // Simple decompression - in production, consider using a proper compression library
    if (typeof window !== 'undefined' && 'DecompressionStream' in window) {
      try {
        const compressed = new Uint8Array(atob(data).split('').map(c => c.charCodeAt(0)))
        const stream = new DecompressionStream('gzip')
        const writer = stream.writable.getWriter()
        const reader = stream.readable.getReader()
        
        writer.write(compressed)
        writer.close()
        
        const chunks: Uint8Array[] = []
        let result = await reader.read()
        
        while (!result.done) {
          chunks.push(result.value)
          result = await reader.read()
        }
        
        const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
        let offset = 0
        
        chunks.forEach(chunk => {
          decompressed.set(chunk, offset)
          offset += chunk.length
        })
        
        return new TextDecoder().decode(decompressed)
      } catch (error) {
        console.warn('Decompression failed, trying as uncompressed data')
        return data
      }
    }
    
    return data
  }

  private async cleanup(): Promise<void> {
    try {
      const usage = await this.getStorageUsage()
      const documents = Object.entries(usage.documents)
        .sort(([,a], [,b]) => b - a) // Sort by size, largest first
      
      // Remove largest documents until we're under 80% capacity
      const targetUsage = this.maxStorageSize * 0.8
      let currentUsage = usage.used
      
      for (const [docId, size] of documents) {
        if (currentUsage < targetUsage) break
        
        await this.clearDocument(docId)
        currentUsage -= size
        
        if (this.debugMode) {
          console.log('Cleaned up document:', docId)
        }
      }
    } catch (error) {
      console.error('Failed to cleanup storage:', error)
    }
  }

  private async migrateData(data: StorageData): Promise<StorageData | null> {
    try {
      // Handle data migration between versions
      // This is a placeholder - implement actual migration logic based on version differences
      
      if (data.version < this.STORAGE_VERSION) {
        // Perform migration
        const migrated = { ...data }
        migrated.version = this.STORAGE_VERSION
        migrated.lastSaved = Date.now()
        
        if (this.debugMode) {
          console.log('Data migrated from version', data.version, 'to', this.STORAGE_VERSION)
        }
        
        return migrated
      }
      
      return data
    } catch (error) {
      console.error('Failed to migrate data:', error)
      return null
    }
  }

  // Key generators
  private getProgressKey(documentId: string): string {
    return `${this.keyPrefix}-progress-${documentId}`
  }

  private getPositionKey(documentId: string): string {
    return `${this.keyPrefix}-position-${documentId}`
  }

  private getSessionsKey(documentId: string): string {
    return `${this.keyPrefix}-sessions-${documentId}`
  }

  private getBookmarksKey(documentId: string): string {
    return `${this.keyPrefix}-bookmarks-${documentId}`
  }
}