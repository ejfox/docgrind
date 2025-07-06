/**
 * MDN Chapter Navigation System
 * Handles navigation structure and chapter management
 */

import type {
  MDNChapter,
  MDNContentTree,
  MDNContent,
  MDNBreadcrumb,
  MDNNavigation,
  MDNError
} from '~/types/mdn';

export interface NavigationConfig {
  maxDepth: number;
  includeHidden: boolean;
  sortBy: 'order' | 'title' | 'date';
  sortOrder: 'asc' | 'desc';
}

export class MDNNavigationManager {
  private contentTree: MDNContentTree | null = null;
  private config: NavigationConfig;

  constructor(config: Partial<NavigationConfig> = {}) {
    this.config = {
      maxDepth: config.maxDepth || 5,
      includeHidden: config.includeHidden || false,
      sortBy: config.sortBy || 'order',
      sortOrder: config.sortOrder || 'asc',
      ...config
    };
  }

  /**
   * Initialize navigation with content tree
   */
  initialize(contentTree: MDNContentTree): void {
    this.contentTree = contentTree;
  }

  /**
   * Get navigation structure for a specific chapter
   */
  getNavigation(chapterId: string): MDNNavigation | null {
    if (!this.contentTree) return null;

    const chapter = this.contentTree.chapters.get(chapterId);
    if (!chapter) return null;

    return this.buildNavigation(chapter);
  }

  /**
   * Get breadcrumb navigation for a specific path
   */
  getBreadcrumbs(path: string): MDNBreadcrumb[] {
    if (!this.contentTree) return [];

    const chapter = this.findChapterByPath(path);
    if (!chapter) return [];

    const breadcrumbs: MDNBreadcrumb[] = [];
    let currentChapter = chapter;

    // Build breadcrumb trail from current chapter to root
    while (currentChapter) {
      breadcrumbs.unshift({
        title: currentChapter.title,
        path: currentChapter.path,
        _path: currentChapter.path
      });

      if (currentChapter.parentId) {
        currentChapter = this.contentTree.chapters.get(currentChapter.parentId) || null;
      } else {
        break;
      }
    }

    return breadcrumbs;
  }

  /**
   * Get next chapter in navigation order
   */
  getNextChapter(currentPath: string): MDNChapter | null {
    if (!this.contentTree) return null;

    const currentChapter = this.findChapterByPath(currentPath);
    if (!currentChapter) return null;

    // First, try to find first child
    if (currentChapter.children && currentChapter.children.length > 0) {
      return currentChapter.children[0];
    }

    // Then, try to find next sibling
    const nextSibling = this.getNextSibling(currentChapter);
    if (nextSibling) return nextSibling;

    // Finally, try to find next sibling of parent
    let parentChapter = currentChapter.parentId ? 
      this.contentTree.chapters.get(currentChapter.parentId) : null;
    
    while (parentChapter) {
      const nextParentSibling = this.getNextSibling(parentChapter);
      if (nextParentSibling) return nextParentSibling;
      
      parentChapter = parentChapter.parentId ? 
        this.contentTree.chapters.get(parentChapter.parentId) : null;
    }

    return null;
  }

  /**
   * Get previous chapter in navigation order
   */
  getPreviousChapter(currentPath: string): MDNChapter | null {
    if (!this.contentTree) return null;

    const currentChapter = this.findChapterByPath(currentPath);
    if (!currentChapter) return null;

    // First, try to find previous sibling
    const prevSibling = this.getPreviousSibling(currentChapter);
    if (prevSibling) {
      // If previous sibling has children, go to its last descendant
      return this.getLastDescendant(prevSibling);
    }

    // Then, return parent
    if (currentChapter.parentId) {
      return this.contentTree.chapters.get(currentChapter.parentId) || null;
    }

    return null;
  }

  /**
   * Get table of contents for a chapter
   */
  getTableOfContents(chapterId: string, maxDepth: number = 3): MDNNavigation[] {
    if (!this.contentTree) return [];

    const chapter = this.contentTree.chapters.get(chapterId);
    if (!chapter || !chapter.children) return [];

    return this.buildTableOfContents(chapter.children, 0, maxDepth);
  }

  /**
   * Search chapters by title or content
   */
  searchChapters(query: string, filters?: {
    pageType?: string[];
    tags?: string[];
    maxResults?: number;
  }): MDNChapter[] {
    if (!this.contentTree) return [];

    const searchQuery = query.toLowerCase();
    const results: MDNChapter[] = [];
    
    for (const chapter of this.contentTree.chapters.values()) {
      // Skip if doesn't match filters
      if (filters?.pageType && !filters.pageType.includes(chapter.pageType)) {
        continue;
      }
      
      if (filters?.tags && chapter.tags && 
          !filters.tags.some(tag => chapter.tags!.includes(tag))) {
        continue;
      }

      // Search in title and description
      const titleMatch = chapter.title.toLowerCase().includes(searchQuery);
      const descMatch = chapter.description?.toLowerCase().includes(searchQuery);
      
      if (titleMatch || descMatch) {
        results.push(chapter);
      }
    }

    // Sort by relevance (title matches first)
    results.sort((a, b) => {
      const aTitle = a.title.toLowerCase().includes(searchQuery);
      const bTitle = b.title.toLowerCase().includes(searchQuery);
      
      if (aTitle && !bTitle) return -1;
      if (!aTitle && bTitle) return 1;
      
      return a.title.localeCompare(b.title);
    });

    return results.slice(0, filters?.maxResults || 50);
  }

  /**
   * Get chapter hierarchy as flat list
   */
  getFlatChapterList(): MDNChapter[] {
    if (!this.contentTree) return [];

    const chapters: MDNChapter[] = [];
    this.traverseChapters(this.contentTree.root, chapters);
    return chapters;
  }

  /**
   * Get chapters by level
   */
  getChaptersByLevel(level: number): MDNChapter[] {
    if (!this.contentTree) return [];

    return Array.from(this.contentTree.chapters.values())
      .filter(chapter => chapter.level === level)
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  /**
   * Get related chapters
   */
  getRelatedChapters(chapterId: string, limit: number = 5): MDNChapter[] {
    if (!this.contentTree) return [];

    const chapter = this.contentTree.chapters.get(chapterId);
    if (!chapter) return [];

    const related: MDNChapter[] = [];

    // Add siblings
    if (chapter.parentId) {
      const parent = this.contentTree.chapters.get(chapter.parentId);
      if (parent?.children) {
        parent.children.forEach(sibling => {
          if (sibling.id !== chapter.id) {
            related.push(sibling);
          }
        });
      }
    }

    // Add children
    if (chapter.children) {
      related.push(...chapter.children);
    }

    // Add chapters with similar tags
    if (chapter.tags) {
      for (const otherChapter of this.contentTree.chapters.values()) {
        if (otherChapter.id !== chapter.id && 
            otherChapter.tags &&
            this.hasCommonTags(chapter.tags, otherChapter.tags)) {
          related.push(otherChapter);
        }
      }
    }

    // Remove duplicates and limit results
    const uniqueRelated = related.filter((chapter, index, self) =>
      index === self.findIndex(c => c.id === chapter.id)
    );

    return uniqueRelated.slice(0, limit);
  }

  /**
   * Build navigation structure from chapter
   */
  private buildNavigation(chapter: MDNChapter): MDNNavigation {
    const navigation: MDNNavigation = {
      title: chapter.title,
      _path: chapter.path,
      children: []
    };

    if (chapter.children && chapter.children.length > 0) {
      navigation.children = chapter.children.map(child => this.buildNavigation(child));
    }

    return navigation;
  }

  /**
   * Find chapter by path
   */
  private findChapterByPath(path: string): MDNChapter | null {
    if (!this.contentTree) return null;

    for (const chapter of this.contentTree.chapters.values()) {
      if (chapter.path === path) {
        return chapter;
      }
    }

    return null;
  }

  /**
   * Get next sibling chapter
   */
  private getNextSibling(chapter: MDNChapter): MDNChapter | null {
    if (!chapter.parentId || !this.contentTree) return null;

    const parent = this.contentTree.chapters.get(chapter.parentId);
    if (!parent?.children) return null;

    const currentIndex = parent.children.findIndex(c => c.id === chapter.id);
    if (currentIndex === -1 || currentIndex === parent.children.length - 1) {
      return null;
    }

    return parent.children[currentIndex + 1];
  }

  /**
   * Get previous sibling chapter
   */
  private getPreviousSibling(chapter: MDNChapter): MDNChapter | null {
    if (!chapter.parentId || !this.contentTree) return null;

    const parent = this.contentTree.chapters.get(chapter.parentId);
    if (!parent?.children) return null;

    const currentIndex = parent.children.findIndex(c => c.id === chapter.id);
    if (currentIndex <= 0) return null;

    return parent.children[currentIndex - 1];
  }

  /**
   * Get last descendant of a chapter
   */
  private getLastDescendant(chapter: MDNChapter): MDNChapter {
    if (!chapter.children || chapter.children.length === 0) {
      return chapter;
    }

    const lastChild = chapter.children[chapter.children.length - 1];
    return this.getLastDescendant(lastChild);
  }

  /**
   * Build table of contents recursively
   */
  private buildTableOfContents(chapters: MDNChapter[], depth: number, maxDepth: number): MDNNavigation[] {
    if (depth >= maxDepth) return [];

    return chapters.map(chapter => ({
      title: chapter.title,
      _path: chapter.path,
      children: chapter.children ? 
        this.buildTableOfContents(chapter.children, depth + 1, maxDepth) : []
    }));
  }

  /**
   * Traverse chapters recursively
   */
  private traverseChapters(chapter: MDNChapter, result: MDNChapter[]): void {
    result.push(chapter);
    
    if (chapter.children) {
      chapter.children.forEach(child => this.traverseChapters(child, result));
    }
  }

  /**
   * Check if two tag arrays have common elements
   */
  private hasCommonTags(tags1: string[], tags2: string[]): boolean {
    return tags1.some(tag => tags2.includes(tag));
  }

  /**
   * Update chapter expansion state
   */
  updateChapterExpansion(chapterId: string, isExpanded: boolean): void {
    if (!this.contentTree) return;

    const chapter = this.contentTree.chapters.get(chapterId);
    if (chapter) {
      chapter.isExpanded = isExpanded;
    }
  }

  /**
   * Get expanded chapters
   */
  getExpandedChapters(): string[] {
    if (!this.contentTree) return [];

    return Array.from(this.contentTree.chapters.values())
      .filter(chapter => chapter.isExpanded)
      .map(chapter => chapter.id);
  }

  /**
   * Reset all chapter expansions
   */
  resetExpansions(): void {
    if (!this.contentTree) return;

    for (const chapter of this.contentTree.chapters.values()) {
      chapter.isExpanded = false;
    }
  }
}

// Global navigation manager instance
let globalNavigationManager: MDNNavigationManager | null = null;

/**
 * Get or create global navigation manager
 */
export function getMDNNavigationManager(config?: Partial<NavigationConfig>): MDNNavigationManager {
  if (!globalNavigationManager) {
    globalNavigationManager = new MDNNavigationManager(config);
  }
  return globalNavigationManager;
}