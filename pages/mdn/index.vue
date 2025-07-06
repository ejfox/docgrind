<template>
  <div class="mdn-home">
    <MDNErrorHandler 
      :loading="loading" 
      :error="error"
      :on-retry="initialize"
      :on-clear-error="clearError"
    >
      <div class="hero-section">
        <div class="hero-content">
          <h1>MDN JavaScript Documentation</h1>
          <p>Comprehensive JavaScript documentation from MDN Web Docs</p>
          
          <!-- Search Bar -->
          <div class="search-container">
            <div class="search-input">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search JavaScript documentation..."
                @keyup.enter="performSearch"
              />
              <button @click="performSearch" class="search-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Quick Stats -->
          <div v-if="stats" class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">{{ stats.totalPages }}</div>
              <div class="stat-label">Total Pages</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ Object.keys(stats.pagesByType).length }}</div>
              <div class="stat-label">Content Types</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ Math.round(stats.cacheHitRate) }}%</div>
              <div class="stat-label">Cache Hit Rate</div>
            </div>
          </div>
        </div>
      </div>

      <div class="main-content">
        <!-- Search Results -->
        <div v-if="searchResults.length > 0" class="search-results">
          <h2>Search Results</h2>
          <div class="results-grid">
            <NuxtLink 
              v-for="result in searchResults" 
              :key="result.id"
              :to="result.path"
              class="result-card"
            >
              <div class="result-header">
                <h3>{{ result.title }}</h3>
                <span class="result-type">{{ result.pageType }}</span>
              </div>
              <p v-if="result.description" class="result-description">
                {{ result.description }}
              </p>
              <div v-if="result.tags" class="result-tags">
                <span v-for="tag in result.tags.slice(0, 3)" :key="tag" class="tag">
                  {{ tag }}
                </span>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Content Navigation -->
        <div v-else class="content-navigation">
          <h2>Browse JavaScript Documentation</h2>
          
          <!-- Popular Sections -->
          <div class="section-grid">
            <div class="section-card">
              <div class="section-icon">📚</div>
              <h3>Guide</h3>
              <p>Learn JavaScript concepts step by step</p>
              <NuxtLink to="/mdn/guide" class="section-link">
                Explore Guide →
              </NuxtLink>
            </div>
            
            <div class="section-card">
              <div class="section-icon">🔍</div>
              <h3>Reference</h3>
              <p>Complete API reference for JavaScript</p>
              <NuxtLink to="/mdn/reference" class="section-link">
                Browse Reference →
              </NuxtLink>
            </div>
            
            <div class="section-card">
              <div class="section-icon">🎯</div>
              <h3>Tutorials</h3>
              <p>Hands-on tutorials and examples</p>
              <NuxtLink to="/mdn/tutorials" class="section-link">
                Start Learning →
              </NuxtLink>
            </div>
          </div>

          <!-- Content Tree Preview -->
          <div v-if="contentTree" class="content-tree-preview">
            <h3>Content Structure</h3>
            <div class="tree-container">
              <MDNContentTree 
                :tree="contentTree"
                :max-depth="2"
                :show-counts="true"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <button @click="refreshContent" class="action-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23,4 23,10 17,10"/>
            <polyline points="1,20 1,14 7,14"/>
            <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4-4.64,4.36A9,9,0,0,1,3.51,15"/>
          </svg>
          Refresh
        </button>
        
        <button @click="clearCache" class="action-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3,6H5H21"/>
            <path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
          </svg>
          Clear Cache
        </button>
        
        <button @click="showStats = !showStats" class="action-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9,9H21a2,2,0,0,1,2,2v6a2,2,0,0,1-2,2H9"/>
            <path d="M9,21H5a2,2,0,0,1-2-2V5a2,2,0,0,1,2-2h4"/>
          </svg>
          {{ showStats ? 'Hide' : 'Show' }} Stats
        </button>
      </div>

      <!-- Detailed Stats -->
      <div v-if="showStats && stats" class="detailed-stats">
        <div class="stats-section">
          <h3>Content Statistics</h3>
          <div class="stats-details">
            <div class="stat-group">
              <h4>Pages by Type</h4>
              <div class="stat-list">
                <div v-for="(count, type) in stats.pagesByType" :key="type" class="stat-item">
                  <span class="stat-name">{{ type }}</span>
                  <span class="stat-count">{{ count }}</span>
                </div>
              </div>
            </div>
            
            <div class="stat-group">
              <h4>Top Tags</h4>
              <div class="stat-list">
                <div 
                  v-for="([tag, count]) in Object.entries(stats.pagesByTag).slice(0, 10)" 
                  :key="tag" 
                  class="stat-item"
                >
                  <span class="stat-name">{{ tag }}</span>
                  <span class="stat-count">{{ count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MDNErrorHandler>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useMDNContent } from '~/composables/useMDNContent';
import { useMDNSearch } from '~/composables/useMDNSearch';

// Page metadata
definePageMeta({
  title: 'MDN JavaScript Documentation',
  description: 'Browse and search MDN JavaScript documentation'
});

// Composables
const {
  contentTree,
  loading,
  error,
  stats,
  initialize,
  clearError,
  getContentStats,
  clearCache: clearContentCache
} = useMDNContent();

const {
  query: searchQuery,
  results: searchResults,
  search,
  initialize: initializeSearch
} = useMDNSearch();

// Local state
const showStats = ref(false);

// Methods
const performSearch = async () => {
  if (searchQuery.value.trim()) {
    await search();
  }
};

const refreshContent = async () => {
  await initialize({ useCache: false });
  await getContentStats();
};

const clearCache = () => {
  clearContentCache();
  // Show notification
  console.log('Cache cleared');
};

// Initialize on mount
onMounted(async () => {
  try {
    await initialize();
    if (contentTree.value) {
      initializeSearch(contentTree.value);
    }
  } catch (error) {
    console.error('Failed to initialize MDN content:', error);
  }
});
</script>

<style scoped>
.mdn-home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.hero-section {
  text-align: center;
  margin-bottom: 3rem;
}

.hero-content h1 {
  font-size: 3rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.hero-content p {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-bottom: 2rem;
}

.search-container {
  max-width: 600px;
  margin: 0 auto 2rem;
}

.search-input {
  display: flex;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-input input {
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  font-size: 1rem;
  outline: none;
}

.search-btn {
  padding: 1rem 1.5rem;
  background: #3498db;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.search-btn:hover {
  background: #2980b9;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  max-width: 500px;
  margin: 0 auto;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.main-content {
  margin-bottom: 3rem;
}

.search-results h2,
.content-navigation h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.result-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.result-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.result-type {
  background: #ecf0f1;
  color: #7f8c8d;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.result-description {
  color: #7f8c8d;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.result-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: #e8f4f8;
  color: #2980b9;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.section-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.section-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.section-card:hover {
  transform: translateY(-2px);
}

.section-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.section-card h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.section-card p {
  color: #7f8c8d;
  margin-bottom: 1.5rem;
}

.section-link {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.section-link:hover {
  color: #2980b9;
}

.content-tree-preview {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.content-tree-preview h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.quick-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #f8f9fa;
  border-color: #3498db;
}

.detailed-stats {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stats-section h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.stats-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.stat-group h4 {
  color: #34495e;
  margin-bottom: 1rem;
}

.stat-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.stat-name {
  color: #2c3e50;
}

.stat-count {
  color: #7f8c8d;
  font-weight: bold;
}

/* Responsive design */
@media (max-width: 768px) {
  .mdn-home {
    padding: 1rem;
  }
  
  .hero-content h1 {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .section-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .action-btn {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
}
</style>