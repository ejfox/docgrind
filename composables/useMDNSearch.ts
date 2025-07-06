/**
 * MDN Search Composable
 * Specialized composable for searching MDN content with advanced features
 */

import { ref, computed, watch, type Ref } from 'vue';
import Fuse from 'fuse.js';
import type {
  MDNSearchResult,
  MDNSearchOptions,
  MDNChapter,
  MDNContentTree,
  MDNError,
  MDNLoadingState
} from '~/types/mdn';

interface SearchState {
  query: Ref<string>;
  results: Ref<MDNSearchResult[]>;
  suggestions: Ref<string[]>;
  filters: Ref<MDNSearchOptions['filters']>;
  loading: Ref<MDNLoadingState>;
  error: Ref<MDNError | null>;
  history: Ref<string[]>;
  recentSearches: Ref<string[]>;
}

interface SearchConfig {
  debounceMs: number;
  maxResults: number;
  minQueryLength: number;
  maxSuggestions: number;
  enableHistory: boolean;
  enableSuggestions: boolean;
  fuseOptions: Fuse.IFuseOptions<MDNChapter>;
}

// Simple debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | undefined;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function useMDNSearch(config: Partial<SearchConfig> = {}) {
  // Configuration
  const searchConfig: SearchConfig = {
    debounceMs: 300,
    maxResults: 20,
    minQueryLength: 2,
    maxSuggestions: 5,
    enableHistory: true,
    enableSuggestions: true,
    fuseOptions: {
      keys: [
        { name: 'title', weight: 0.7 },
        { name: 'description', weight: 0.3 },
        { name: 'tags', weight: 0.2 }
      ],
      threshold: 0.6,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2
    },
    ...config
  };

  // State
  const state: SearchState = {
    query: ref(''),
    results: ref<MDNSearchResult[]>([]),
    suggestions: ref<string[]>([]),
    filters: ref<MDNSearchOptions['filters']>({}),
    loading: ref<MDNLoadingState>({
      isLoading: false,
      isError: false
    }),
    error: ref<MDNError | null>(null),
    history: ref<string[]>([]),
    recentSearches: ref<string[]>([])
  };

  // Fuse instance for fuzzy search
  let fuseInstance: Fuse<MDNChapter> | null = null;

  // Content tree reference
  let contentTree: MDNContentTree | null = null;

  // Computed
  const isLoading = computed(() => state.loading.value.isLoading);
  const hasError = computed(() => state.loading.value.isError);
  const hasResults = computed(() => state.results.value.length > 0);
  const hasQuery = computed(() => state.query.value.length >= searchConfig.minQueryLength);
  const canSearch = computed(() => hasQuery.value && !isLoading.value);

  // Methods
  const setLoading = (loading: Partial<MDNLoadingState>) => {
    state.loading.value = { ...state.loading.value, ...loading };
  };

  const setError = (error: MDNError | null) => {
    state.error.value = error;
    state.loading.value.isError = !!error;
  };

  const clearError = () => {
    setError(null);
  };

  /**
   * Initialize search with content tree
   */
  const initialize = (tree: MDNContentTree) => {
    contentTree = tree;
    
    // Initialize Fuse.js with chapter data
    const chapters = Array.from(tree.chapters.values());
    fuseInstance = new Fuse(chapters, searchConfig.fuseOptions);
    
    // Load search history from localStorage
    if (searchConfig.enableHistory && process.client) {
      const savedHistory = localStorage.getItem('mdn-search-history');
      if (savedHistory) {
        try {
          state.history.value = JSON.parse(savedHistory);
        } catch (error) {
          console.warn('Failed to load search history', error);
        }
      }

      const savedRecent = localStorage.getItem('mdn-recent-searches');
      if (savedRecent) {
        try {
          state.recentSearches.value = JSON.parse(savedRecent);
        } catch (error) {
          console.warn('Failed to load recent searches', error);
        }
      }
    }
  };

  /**
   * Perform search
   */
  const search = async (query?: string, options: Partial<MDNSearchOptions> = {}) => {
    const searchQuery = query || state.query.value;
    
    if (!searchQuery || searchQuery.length < searchConfig.minQueryLength) {
      state.results.value = [];
      return [];
    }

    try {
      setLoading({ isLoading: true, isError: false, stage: 'Searching...' });
      clearError();

      if (!fuseInstance || !contentTree) {
        throw new Error('Search not initialized. Call initialize() first.');
      }

      // Perform fuzzy search
      const fuseResults = fuseInstance.search(searchQuery);
      
      // Convert Fuse results to MDNSearchResult
      let results: MDNSearchResult[] = fuseResults.map(result => {
        const chapter = result.item;
        const score = result.score || 0;
        
        // Extract highlights from matches
        const highlights: string[] = [];
        if (result.matches) {
          result.matches.forEach(match => {
            if (match.indices && match.value) {
              // Simple highlight extraction - in production, you'd want more sophisticated highlighting
              highlights.push(match.value);
            }
          });
        }

        return {
          id: chapter.id,
          title: chapter.title,
          description: chapter.description,
          path: chapter.path,
          slug: chapter.slug,
          score: 1 - score, // Invert score (Fuse returns 0 for perfect match)
          highlights,
          pageType: chapter.pageType,
          tags: chapter.tags
        };
      });

      // Apply filters
      if (options.filters || state.filters.value) {
        const filters = { ...state.filters.value, ...options.filters };
        results = applyFilters(results, filters);
      }

      // Sort results
      const sortBy = options.sortBy || 'relevance';
      results = sortResults(results, sortBy);

      // Limit results
      const limit = options.limit || searchConfig.maxResults;
      results = results.slice(0, limit);

      state.results.value = results;
      
      // Add to search history
      if (searchConfig.enableHistory) {
        addToHistory(searchQuery);
      }

      setLoading({ isLoading: false, stage: 'Complete' });
      return results;
    } catch (error) {
      const mdnError: MDNError = {
        code: 'SEARCH_FAILED',
        message: `Search failed: ${searchQuery}`,
        details: error,
        timestamp: new Date()
      };
      
      setError(mdnError);
      setLoading({ isLoading: false, stage: 'Error' });
      throw mdnError;
    }
  };

  /**
   * Get search suggestions
   */
  const getSuggestions = (query: string): string[] => {
    if (!searchConfig.enableSuggestions || !contentTree) return [];
    
    const suggestions: string[] = [];
    const queryLower = query.toLowerCase();
    
    // Get suggestions from chapter titles
    for (const chapter of contentTree.chapters.values()) {
      const title = chapter.title.toLowerCase();
      if (title.includes(queryLower) && !suggestions.includes(chapter.title)) {
        suggestions.push(chapter.title);
      }
      
      // Add tag suggestions
      if (chapter.tags) {
        chapter.tags.forEach(tag => {
          if (tag.toLowerCase().includes(queryLower) && !suggestions.includes(tag)) {
            suggestions.push(tag);
          }
        });
      }
    }

    return suggestions.slice(0, searchConfig.maxSuggestions);
  };

  /**
   * Apply filters to search results
   */
  const applyFilters = (results: MDNSearchResult[], filters: MDNSearchOptions['filters']): MDNSearchResult[] => {
    if (!filters) return results;

    return results.filter(result => {
      // Filter by page type
      if (filters.pageType && !filters.pageType.includes(result.pageType)) {
        return false;
      }

      // Filter by tags
      if (filters.tags && result.tags) {
        const hasMatchingTag = filters.tags.some(tag => result.tags!.includes(tag));
        if (!hasMatchingTag) return false;
      }

      // Filter by path
      if (filters.path && !result.path.includes(filters.path)) {
        return false;
      }

      return true;
    });
  };

  /**
   * Sort search results
   */
  const sortResults = (results: MDNSearchResult[], sortBy: string): MDNSearchResult[] => {
    const sortedResults = [...results];
    
    switch (sortBy) {
      case 'relevance':
        return sortedResults.sort((a, b) => b.score - a.score);
      case 'title':
        return sortedResults.sort((a, b) => a.title.localeCompare(b.title));
      case 'date':
        // Would need modification date in the data
        return sortedResults;
      default:
        return sortedResults;
    }
  };

  /**
   * Add query to search history
   */
  const addToHistory = (query: string) => {
    if (!searchConfig.enableHistory) return;

    // Remove if already exists
    const index = state.history.value.indexOf(query);
    if (index > -1) {
      state.history.value.splice(index, 1);
    }

    // Add to beginning
    state.history.value.unshift(query);

    // Limit history size
    if (state.history.value.length > 20) {
      state.history.value = state.history.value.slice(0, 20);
    }

    // Add to recent searches
    if (!state.recentSearches.value.includes(query)) {
      state.recentSearches.value.unshift(query);
      if (state.recentSearches.value.length > 10) {
        state.recentSearches.value = state.recentSearches.value.slice(0, 10);
      }
    }

    // Save to localStorage
    if (process.client) {
      try {
        localStorage.setItem('mdn-search-history', JSON.stringify(state.history.value));
        localStorage.setItem('mdn-recent-searches', JSON.stringify(state.recentSearches.value));
      } catch (error) {
        console.warn('Failed to save search history', error);
      }
    }
  };

  /**
   * Clear search
   */
  const clearSearch = () => {
    state.query.value = '';
    state.results.value = [];
    state.suggestions.value = [];
    clearError();
  };

  /**
   * Clear search history
   */
  const clearHistory = () => {
    state.history.value = [];
    state.recentSearches.value = [];
    
    if (process.client) {
      localStorage.removeItem('mdn-search-history');
      localStorage.removeItem('mdn-recent-searches');
    }
  };

  /**
   * Set search filters
   */
  const setFilters = (filters: MDNSearchOptions['filters']) => {
    state.filters.value = filters;
    
    // Re-search with new filters if we have a query
    if (state.query.value) {
      search();
    }
  };

  /**
   * Get popular searches
   */
  const getPopularSearches = (): string[] => {
    // In a real implementation, this would come from analytics
    return [
      'Promise',
      'async await',
      'Array methods',
      'Object destructuring',
      'Modules',
      'Classes',
      'Closures',
      'Event loop',
      'Fetch API',
      'Regular expressions'
    ];
  };

  // Debounced search for real-time results
  const debouncedSearch = debounce(search, searchConfig.debounceMs);

  // Watch for query changes
  watch(
    () => state.query.value,
    (newQuery) => {
      if (newQuery.length >= searchConfig.minQueryLength) {
        // Update suggestions
        if (searchConfig.enableSuggestions) {
          state.suggestions.value = getSuggestions(newQuery);
        }
        
        // Perform debounced search
        debouncedSearch();
      } else {
        state.results.value = [];
        state.suggestions.value = [];
      }
    }
  );

  return {
    // State
    ...state,
    
    // Computed
    isLoading,
    hasError,
    hasResults,
    hasQuery,
    canSearch,
    
    // Methods
    initialize,
    search,
    getSuggestions,
    clearSearch,
    clearHistory,
    setFilters,
    getPopularSearches,
    clearError,
    setLoading,
    setError
  };
}