<template>
  <div class="mdn-demo">
    <div class="demo-header">
      <h1>MDN Content System Demo</h1>
      <p>Complete demonstration of all MDN content system features</p>
    </div>

    <div class="demo-sections">
      <!-- Content Fetching Demo -->
      <section class="demo-section">
        <h2>Content Fetching</h2>
        <div class="demo-controls">
          <select v-model="selectedContentPath" @change="fetchSelectedContent">
            <option value="">Select content to fetch...</option>
            <option value="/guide/introduction">Introduction Guide</option>
            <option value="/guide/functions">Functions Guide</option>
            <option value="/reference/global_objects/array">Array Reference</option>
            <option value="/reference/global_objects/promise">Promise Reference</option>
          </select>
          <button @click="fetchSelectedContent" :disabled="!selectedContentPath">
            Fetch Content
          </button>
        </div>

        <MDNErrorHandler 
          :loading="contentLoading" 
          :error="contentError"
          :on-retry="fetchSelectedContent"
        >
          <div v-if="selectedContent" class="content-display">
            <h3>{{ selectedContent.title }}</h3>
            <p v-if="selectedContent.description">{{ selectedContent.description }}</p>
            <div class="content-meta">
              <span class="meta-item">Type: {{ selectedContent.frontmatter.page_type }}</span>
              <span class="meta-item">Path: {{ selectedContent.path }}</span>
              <span v-if="selectedContent.frontmatter.tags" class="meta-item">
                Tags: {{ selectedContent.frontmatter.tags.join(', ') }}
              </span>
            </div>
            <div class="content-body">
              <pre>{{ selectedContent.body.substring(0, 500) }}...</pre>
            </div>
          </div>
        </MDNErrorHandler>
      </section>

      <!-- Search Demo -->
      <section class="demo-section">
        <h2>Search Functionality</h2>
        <div class="search-demo">
          <div class="search-controls">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search MDN documentation..."
              @keyup.enter="performSearch"
            />
            <button @click="performSearch">Search</button>
          </div>

          <div class="search-filters">
            <div class="filter-group">
              <label>Page Type:</label>
              <select v-model="searchFilters.pageType" multiple>
                <option value="guide">Guide</option>
                <option value="reference">Reference</option>
                <option value="tutorial">Tutorial</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Tags:</label>
              <input
                v-model="searchFilters.tags"
                type="text"
                placeholder="Comma-separated tags"
              />
            </div>
            <button @click="applyFilters">Apply Filters</button>
          </div>

          <div v-if="searchResults.length > 0" class="search-results">
            <h3>Search Results ({{ searchResults.length }})</h3>
            <div class="results-list">
              <div 
                v-for="result in searchResults" 
                :key="result.id"
                class="result-item"
              >
                <h4>{{ result.title }}</h4>
                <p v-if="result.description">{{ result.description }}</p>
                <div class="result-meta">
                  <span class="result-type">{{ result.pageType }}</span>
                  <span class="result-score">Score: {{ result.score.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Navigation Demo -->
      <section class="demo-section">
        <h2>Navigation System</h2>
        <div class="navigation-demo">
          <div class="nav-controls">
            <button @click="showBreadcrumbs = !showBreadcrumbs">
              {{ showBreadcrumbs ? 'Hide' : 'Show' }} Breadcrumbs
            </button>
            <button @click="showNavigation = !showNavigation">
              {{ showNavigation ? 'Hide' : 'Show' }} Navigation
            </button>
            <button @click="showRelated = !showRelated">
              {{ showRelated ? 'Hide' : 'Show' }} Related Content
            </button>
          </div>

          <div v-if="showBreadcrumbs && breadcrumbs.length > 0" class="breadcrumbs">
            <h3>Breadcrumbs</h3>
            <nav class="breadcrumb-nav">
              <span v-for="(crumb, index) in breadcrumbs" :key="index">
                <span v-if="index > 0"> / </span>
                <a href="#" @click.prevent="navigateTo(crumb.path)">
                  {{ crumb.title }}
                </a>
              </span>
            </nav>
          </div>

          <div v-if="showNavigation && currentNavigation" class="navigation-tree">
            <h3>Navigation</h3>
            <div class="nav-tree">
              <div v-for="item in currentNavigation.children" :key="item._path" class="nav-item">
                <a href="#" @click.prevent="navigateTo(item._path)">
                  {{ item.title }}
                </a>
              </div>
            </div>
          </div>

          <div v-if="showRelated && relatedChapters.length > 0" class="related-content">
            <h3>Related Content</h3>
            <div class="related-list">
              <div 
                v-for="chapter in relatedChapters" 
                :key="chapter.id"
                class="related-item"
              >
                <a href="#" @click.prevent="navigateTo(chapter.path)">
                  {{ chapter.title }}
                </a>
                <span class="chapter-type">{{ chapter.pageType }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Content Tree Demo -->
      <section class="demo-section">
        <h2>Content Tree</h2>
        <div class="tree-demo">
          <div class="tree-controls">
            <label>
              <input v-model="treeShowDescriptions" type="checkbox" />
              Show Descriptions
            </label>
            <label>
              <input v-model="treeShowTags" type="checkbox" />
              Show Tags
            </label>
            <label>
              <input v-model="treeShowCounts" type="checkbox" />
              Show Counts
            </label>
            <label>
              Max Depth:
              <input v-model.number="treeMaxDepth" type="number" min="1" max="5" />
            </label>
          </div>

          <MDNErrorHandler 
            :loading="loading" 
            :error="error"
            :on-retry="initialize"
          >
            <MDNContentTree
              v-if="contentTree"
              :tree="contentTree"
              :max-depth="treeMaxDepth"
              :show-descriptions="treeShowDescriptions"
              :show-tags="treeShowTags"
              :show-counts="treeShowCounts"
              :show-stats="true"
              :selected-path="selectedContentPath"
              @node-select="handleNodeSelect"
            />
          </MDNErrorHandler>
        </div>
      </section>

      <!-- Cache Demo -->
      <section class="demo-section">
        <h2>Cache Management</h2>
        <div class="cache-demo">
          <div class="cache-stats">
            <h3>Cache Statistics</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Cache Size:</span>
                <span class="stat-value">{{ cacheStats.size }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Hit Rate:</span>
                <span class="stat-value">{{ cacheStats.hitRate }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Total Requests:</span>
                <span class="stat-value">{{ cacheStats.totalRequests }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Memory Usage:</span>
                <span class="stat-value">{{ formatBytes(cacheStats.memoryUsage) }}</span>
              </div>
            </div>
          </div>

          <div class="cache-controls">
            <button @click="clearCache">Clear Cache</button>
            <button @click="refreshStats">Refresh Stats</button>
            <button @click="warmupCache">Warmup Cache</button>
          </div>
        </div>
      </section>

      <!-- Error Handling Demo -->
      <section class="demo-section">
        <h2>Error Handling</h2>
        <div class="error-demo">
          <div class="error-controls">
            <button @click="simulateError('NETWORK_ERROR')">
              Simulate Network Error
            </button>
            <button @click="simulateError('CONTENT_NOT_FOUND')">
              Simulate Content Not Found
            </button>
            <button @click="simulateError('RATE_LIMIT_ERROR')">
              Simulate Rate Limit Error
            </button>
          </div>

          <MDNErrorHandler 
            :loading="demoLoading" 
            :error="demoError"
            :on-retry="clearDemoError"
            :on-clear-error="clearDemoError"
          >
            <div class="success-message">
              <h3>✅ No errors - System working correctly!</h3>
              <p>All components are functioning properly.</p>
            </div>
          </MDNErrorHandler>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMDNContent } from '~/composables/useMDNContent';
import { useMDNSearch } from '~/composables/useMDNSearch';
import type { MDNContent, MDNError, MDNLoadingState } from '~/types/mdn';

// Page metadata
definePageMeta({
  title: 'MDN Content System Demo',
  description: 'Complete demonstration of MDN content system features'
});

// Composables
const {
  content,
  contentTree,
  loading,
  error,
  breadcrumbs,
  cacheStats,
  initialize,
  fetchContent,
  getBreadcrumbs,
  getNavigation,
  getRelatedChapters,
  clearCache: clearContentCache
} = useMDNContent();

const {
  query: searchQuery,
  results: searchResults,
  search,
  setFilters,
  initialize: initializeSearch
} = useMDNSearch();

// Local state
const selectedContentPath = ref('');
const selectedContent = ref<MDNContent | null>(null);
const contentLoading = ref<MDNLoadingState>({ isLoading: false, isError: false });
const contentError = ref<MDNError | null>(null);

const searchFilters = ref({
  pageType: [] as string[],
  tags: '' as string
});

const showBreadcrumbs = ref(true);
const showNavigation = ref(true);
const showRelated = ref(true);

const treeShowDescriptions = ref(true);
const treeShowTags = ref(false);
const treeShowCounts = ref(true);
const treeMaxDepth = ref(3);

const demoLoading = ref<MDNLoadingState>({ isLoading: false, isError: false });
const demoError = ref<MDNError | null>(null);

// Computed
const currentNavigation = computed(() => {
  if (!selectedContent.value) return null;
  return getNavigation(selectedContent.value._id);
});

const relatedChapters = computed(() => {
  if (!selectedContent.value) return [];
  return getRelatedChapters(selectedContent.value._id, 5);
});

// Methods
const fetchSelectedContent = async () => {
  if (!selectedContentPath.value) return;

  try {
    contentLoading.value = { isLoading: true, isError: false };
    contentError.value = null;

    const content = await fetchContent(selectedContentPath.value);
    selectedContent.value = content;

    // Update breadcrumbs
    const crumbs = getBreadcrumbs(selectedContentPath.value);
    breadcrumbs.value = crumbs;

    contentLoading.value = { isLoading: false, isError: false };
  } catch (err) {
    contentError.value = err as MDNError;
    contentLoading.value = { isLoading: false, isError: true };
  }
};

const performSearch = async () => {
  if (!searchQuery.value.trim()) return;

  await search(searchQuery.value, {
    limit: 10,
    filters: {
      pageType: searchFilters.value.pageType.length > 0 ? searchFilters.value.pageType : undefined,
      tags: searchFilters.value.tags ? searchFilters.value.tags.split(',').map(t => t.trim()) : undefined
    }
  });
};

const applyFilters = () => {
  const filters = {
    pageType: searchFilters.value.pageType.length > 0 ? searchFilters.value.pageType : undefined,
    tags: searchFilters.value.tags ? searchFilters.value.tags.split(',').map(t => t.trim()) : undefined
  };
  
  setFilters(filters);
};

const navigateTo = (path: string) => {
  selectedContentPath.value = path;
  fetchSelectedContent();
};

const handleNodeSelect = (node: any) => {
  selectedContentPath.value = node.path;
  fetchSelectedContent();
};

const clearCache = () => {
  clearContentCache();
  alert('Cache cleared successfully!');
};

const refreshStats = () => {
  // Force refresh of cache stats
  // This would typically trigger a reactive update
  console.log('Refreshing cache stats...');
};

const warmupCache = async () => {
  // Warmup cache with common content
  const commonPaths = [
    '/guide/introduction',
    '/guide/functions',
    '/reference/global_objects/array',
    '/reference/global_objects/promise'
  ];

  for (const path of commonPaths) {
    try {
      await fetchContent(path);
    } catch (error) {
      console.warn(`Failed to warmup cache for ${path}:`, error);
    }
  }

  alert('Cache warmup completed!');
};

const simulateError = (errorType: string) => {
  const errors = {
    NETWORK_ERROR: {
      code: 'NETWORK_ERROR',
      message: 'Network connection failed',
      timestamp: new Date()
    },
    CONTENT_NOT_FOUND: {
      code: 'CONTENT_NOT_FOUND',
      message: 'The requested content could not be found',
      timestamp: new Date()
    },
    RATE_LIMIT_ERROR: {
      code: 'RATE_LIMIT_ERROR',
      message: 'API rate limit exceeded',
      timestamp: new Date()
    }
  };

  demoError.value = errors[errorType as keyof typeof errors] as MDNError;
  demoLoading.value = { isLoading: false, isError: true };
};

const clearDemoError = () => {
  demoError.value = null;
  demoLoading.value = { isLoading: false, isError: false };
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Initialize on mount
onMounted(async () => {
  try {
    await initialize();
    if (contentTree.value) {
      initializeSearch(contentTree.value);
    }
  } catch (error) {
    console.error('Failed to initialize demo:', error);
  }
});
</script>

<style scoped>
.mdn-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.demo-header {
  text-align: center;
  margin-bottom: 3rem;
}

.demo-header h1 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.demo-header p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.demo-sections {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.demo-section {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.demo-section h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

.demo-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.demo-controls select,
.demo-controls input,
.demo-controls button {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.demo-controls button {
  background: #3498db;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.demo-controls button:hover:not(:disabled) {
  background: #2980b9;
}

.demo-controls button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.content-display {
  background: #f8f9fa;
  border-radius: 4px;
  padding: 1.5rem;
  margin-top: 1rem;
}

.content-display h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.content-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.meta-item {
  background: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.content-body {
  margin-top: 1rem;
}

.content-body pre {
  background: #f1f3f4;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.9rem;
}

.search-demo {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-controls input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-filters {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
}

.filter-group select,
.filter-group input {
  padding: 0.25rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-results {
  margin-top: 1rem;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.result-item {
  background: #f8f9fa;
  border-radius: 4px;
  padding: 1rem;
  border-left: 4px solid #3498db;
}

.result-item h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.result-meta {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.result-type {
  background: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.result-score {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.navigation-demo {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.nav-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.breadcrumbs,
.navigation-tree,
.related-content {
  background: #f8f9fa;
  border-radius: 4px;
  padding: 1rem;
}

.breadcrumbs h3,
.navigation-tree h3,
.related-content h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.breadcrumb-nav a,
.nav-item a,
.related-item a {
  color: #3498db;
  text-decoration: none;
  transition: color 0.3s ease;
}

.breadcrumb-nav a:hover,
.nav-item a:hover,
.related-item a:hover {
  color: #2980b9;
}

.nav-tree {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.related-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chapter-type {
  background: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.tree-demo {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tree-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.tree-controls label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cache-demo {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cache-stats {
  background: #f8f9fa;
  border-radius: 4px;
  padding: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
}

.stat-label {
  font-weight: 500;
  color: #2c3e50;
}

.stat-value {
  font-weight: bold;
  color: #3498db;
}

.cache-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.error-demo {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.error-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.success-message {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  padding: 1rem;
  text-align: center;
}

.success-message h3 {
  margin: 0 0 0.5rem 0;
}

.success-message p {
  margin: 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .mdn-demo {
    padding: 1rem;
  }
  
  .demo-controls,
  .search-controls,
  .search-filters,
  .nav-controls,
  .tree-controls,
  .cache-controls,
  .error-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-controls input {
    margin-bottom: 0.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>