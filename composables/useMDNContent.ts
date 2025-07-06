import { ref, computed } from 'vue'
import type { ParsedContent } from '@nuxt/content/dist/runtime/types'

export interface MDNChapter extends ParsedContent {
  title: string
  slug: string
  path: string
  wordCount: number
  readingTime: number
  codeBlocks: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string
  tags: string[]
  lastModified: string
}

export interface MDNChapterIndex {
  chapters: MDNChapter[]
  generated: string
  totalChapters: number
}

export const useMDNContent = () => {
  const chapters = ref<MDNChapter[]>([])
  const currentChapter = ref<MDNChapter | null>(null)
  const chapterIndex = ref<MDNChapterIndex | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Get all chapters
  const getAllChapters = async (): Promise<MDNChapter[]> => {
    if (chapters.value.length > 0) {
      return chapters.value
    }

    try {
      isLoading.value = true
      error.value = null

      // Load chapter index
      const indexResponse = await $fetch('/content/mdn/index.json')
      chapterIndex.value = indexResponse as MDNChapterIndex
      chapters.value = chapterIndex.value.chapters

      return chapters.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load chapters'
      console.error('Error loading chapters:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // Get chapter by slug
  const getChapterBySlug = async (slug: string): Promise<MDNChapter | null> => {
    try {
      isLoading.value = true
      error.value = null

      // Use Nuxt Content to fetch the chapter
      const chapter = await queryContent('/docs/mdn')
        .where({ slug })
        .findOne() as MDNChapter

      currentChapter.value = chapter
      return chapter
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load chapter'
      console.error('Error loading chapter:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Get chapters by category
  const getChaptersByCategory = async (category: string): Promise<MDNChapter[]> => {
    const allChapters = await getAllChapters()
    return allChapters.filter(chapter => 
      chapter.category.toLowerCase() === category.toLowerCase()
    )
  }

  // Get chapters by difficulty
  const getChaptersByDifficulty = async (difficulty: 'beginner' | 'intermediate' | 'advanced'): Promise<MDNChapter[]> => {
    const allChapters = await getAllChapters()
    return allChapters.filter(chapter => chapter.difficulty === difficulty)
  }

  // Search chapters
  const searchChapters = async (query: string): Promise<MDNChapter[]> => {
    const allChapters = await getAllChapters()
    const lowerQuery = query.toLowerCase()
    
    return allChapters.filter(chapter => 
      chapter.title.toLowerCase().includes(lowerQuery) ||
      chapter.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      chapter.category.toLowerCase().includes(lowerQuery)
    )
  }

  // Get next chapter
  const getNextChapter = async (currentSlug: string): Promise<MDNChapter | null> => {
    const allChapters = await getAllChapters()
    const currentIndex = allChapters.findIndex(chapter => chapter.slug === currentSlug)
    
    if (currentIndex >= 0 && currentIndex < allChapters.length - 1) {
      return allChapters[currentIndex + 1]
    }
    return null
  }

  // Get previous chapter
  const getPreviousChapter = async (currentSlug: string): Promise<MDNChapter | null> => {
    const allChapters = await getAllChapters()
    const currentIndex = allChapters.findIndex(chapter => chapter.slug === currentSlug)
    
    if (currentIndex > 0) {
      return allChapters[currentIndex - 1]
    }
    return null
  }

  // Get chapter navigation
  const getChapterNavigation = async (currentSlug: string) => {
    const [previous, next] = await Promise.all([
      getPreviousChapter(currentSlug),
      getNextChapter(currentSlug)
    ])
    
    return { previous, next }
  }

  // Get category list
  const getCategories = computed(() => {
    const categories = new Set(chapters.value.map(chapter => chapter.category))
    return Array.from(categories).sort()
  })

  // Get chapter statistics
  const getChapterStats = computed(() => {
    const allChapters = chapters.value
    const totalChapters = allChapters.length
    const totalWords = allChapters.reduce((sum, chapter) => sum + chapter.wordCount, 0)
    const avgReadingTime = Math.round(allChapters.reduce((sum, chapter) => sum + chapter.readingTime, 0) / totalChapters)
    
    const byDifficulty = {
      beginner: allChapters.filter(c => c.difficulty === 'beginner').length,
      intermediate: allChapters.filter(c => c.difficulty === 'intermediate').length,
      advanced: allChapters.filter(c => c.difficulty === 'advanced').length
    }
    
    return {
      totalChapters,
      totalWords,
      avgReadingTime,
      byDifficulty
    }
  })

  // Get breadcrumb path
  const getBreadcrumbs = (chapter: MDNChapter) => {
    const breadcrumbs = [
      { name: 'JavaScript', path: '/docs/mdn' },
      { name: chapter.category, path: `/docs/mdn/category/${chapter.category.toLowerCase()}` },
      { name: chapter.title, path: `/docs/mdn/${chapter.slug}` }
    ]
    
    return breadcrumbs
  }

  return {
    // State
    chapters: readonly(chapters),
    currentChapter: readonly(currentChapter),
    chapterIndex: readonly(chapterIndex),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Computed
    categories: getCategories,
    chapterStats: getChapterStats,

    // Methods
    getAllChapters,
    getChapterBySlug,
    getChaptersByCategory,
    getChaptersByDifficulty,
    searchChapters,
    getNextChapter,
    getPreviousChapter,
    getChapterNavigation,
    getBreadcrumbs
  }
}