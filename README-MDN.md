# MDN Content Fetcher System

A robust and comprehensive system for integrating MDN (Mozilla Developer Network) JavaScript documentation into your Nuxt 3 application. This system provides intelligent content fetching, caching, navigation, and search capabilities.

## Features

- **🔄 Content Fetching**: Automated fetching from MDN GitHub repository
- **🚀 Intelligent Caching**: Multi-level caching with TTL and LRU eviction
- **🧭 Navigation System**: Hierarchical chapter navigation with breadcrumbs
- **🔍 Advanced Search**: Full-text search with filtering and suggestions
- **⚡ Performance**: Optimized for large content collections
- **📱 Responsive**: Mobile-friendly components and UI
- **🎨 Customizable**: Flexible configuration and theming
- **🔒 Error Handling**: Comprehensive error handling and retry logic

## Installation

1. **Install Dependencies**
```bash
npm install @nuxt/content @octokit/rest gray-matter markdown-it fuse.js
npm install -D @types/markdown-it
```

2. **Environment Variables**
Create a `.env` file with your GitHub token (optional but recommended for higher rate limits):
```env
GITHUB_TOKEN=your_github_token_here
```

3. **Configuration**
The system is pre-configured in `nuxt.config.ts` with sensible defaults.

## Usage

### Basic Usage

```vue
<template>
  <div>
    <MDNErrorHandler 
      :loading="loading" 
      :error="error"
      :on-retry="initialize"
    >
      <div v-if="contentTree">
        <MDNContentTree 
          :tree="contentTree"
          :max-depth="3"
          :show-descriptions="true"
        />
      </div>
    </MDNErrorHandler>
  </div>
</template>

<script setup>
import { useMDNContent } from '~/composables/useMDNContent';

const { contentTree, loading, error, initialize } = useMDNContent();

onMounted(() => {
  initialize();
});
</script>
```

### Content Fetching

```javascript
const { fetchContent } = useMDNContent();

// Fetch specific content
const content = await fetchContent('/guide/introduction');

// Fetch with options
const content = await fetchContent('/reference/global_objects/array', {
  useCache: true,
  cacheExpiry: 3600000 // 1 hour
});
```

### Search Functionality

```javascript
const { search, searchResults } = useMDNSearch();

// Basic search
await search('Promise');

// Advanced search with filters
await search('async', {
  filters: {
    pageType: ['guide', 'reference'],
    tags: ['javascript', 'async']
  },
  limit: 20
});
```

### Navigation

```javascript
const { 
  getBreadcrumbs, 
  getNextChapter, 
  getPreviousChapter 
} = useMDNContent();

// Get breadcrumbs for current page
const breadcrumbs = getBreadcrumbs('/guide/functions');

// Get next/previous chapters
const nextChapter = getNextChapter('/guide/functions');
const prevChapter = getPreviousChapter('/guide/functions');
```

## Components

### MDNErrorHandler

Handles loading states, errors, and retry logic:

```vue
<MDNErrorHandler 
  :loading="loading" 
  :error="error"
  :on-retry="retryFunction"
  :on-clear-error="clearError"
  :show-retry-button="true"
>
  <YourContent />
</MDNErrorHandler>
```

### MDNLoadingState

Customizable loading indicator:

```vue
<MDNLoadingState
  title="Loading Content"
  message="Fetching documentation..."
  :progress="75"
  :steps="loadingSteps"
  :current-step="2"
  size="large"
  variant="primary"
/>
```

### MDNContentTree

Interactive content tree navigation:

```vue
<MDNContentTree
  :tree="contentTree"
  :max-depth="3"
  :show-descriptions="true"
  :show-tags="true"
  :show-counts="true"
  :default-expanded="false"
  @node-select="handleNodeSelect"
/>
```

## Composables

### useMDNContent()

Main composable for content management:

```javascript
const {
  // State
  content,
  contentTree,
  loading,
  error,
  
  // Methods
  fetchContent,
  fetchContentTree,
  initialize,
  clearCache,
  getContentStats
} = useMDNContent();
```

### useMDNSearch()

Search functionality:

```javascript
const {
  // State
  query,
  results,
  suggestions,
  
  // Methods
  search,
  getSuggestions,
  clearSearch,
  setFilters
} = useMDNSearch();
```

## Configuration

### Nuxt Config

```typescript
export default defineNuxtConfig({
  modules: ['@nuxt/content'],
  content: {
    sources: {
      mdn: {
        driver: 'github',
        repo: 'mdn/content',
        branch: 'main',
        prefix: '/mdn',
        dir: 'files/en-us/web/javascript'
      }
    }
  },
  runtimeConfig: {
    githubToken: process.env.GITHUB_TOKEN,
    public: {
      mdnCacheExpiry: 1000 * 60 * 60 * 24 // 24 hours
    }
  }
});
```

### Cache Configuration

```javascript
const cache = getMDNCache({
  maxSize: 1000,
  defaultTTL: 3600000, // 1 hour
  cleanupInterval: 300000, // 5 minutes
  compressionEnabled: true
});
```

## Architecture

### Core Components

- **MDNFetcher**: GitHub API integration and content parsing
- **MDNContentCache**: Intelligent caching with LRU eviction
- **MDNNavigationManager**: Hierarchical navigation management
- **Composables**: Vue 3 composables for reactive state management

### Data Flow

1. **Content Request** → MDNFetcher checks cache
2. **Cache Miss** → Fetch from GitHub API
3. **Parse Content** → Extract frontmatter and markdown
4. **Cache Result** → Store with TTL
5. **Return Content** → Deliver to component

### Caching Strategy

- **L1 Cache**: In-memory cache for frequently accessed content
- **L2 Cache**: Browser storage for persistent caching
- **TTL-based**: Automatic expiration and cleanup
- **LRU Eviction**: Least recently used items removed first

## Error Handling

The system includes comprehensive error handling:

- **Network Errors**: Retry with exponential backoff
- **Rate Limiting**: Automatic retry with delay
- **Content Not Found**: Graceful fallback
- **Parse Errors**: Detailed error reporting

## Performance

- **Lazy Loading**: Content loaded on demand
- **Prefetching**: Related content preloaded
- **Tree Shaking**: Only used components bundled
- **Compression**: Content compressed in cache

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
interface MDNContent {
  title: string;
  description?: string;
  frontmatter: MDNFrontmatter;
  body: string;
  // ... more properties
}
```

## Browser Compatibility

- Modern browsers with ES2018+ support
- Vue 3 and Nuxt 3 compatibility
- Progressive enhancement for older browsers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This system is designed to work with MDN Web Docs content, which is licensed under CC-BY-SA 2.5.

## Support

For issues and questions:
- Check the error messages and suggestions
- Review the TypeScript types for API documentation
- Examine the example components for usage patterns

## Changelog

### v1.0.0
- Initial release with core functionality
- Content fetching and caching
- Navigation and search
- Error handling and loading states
- Full TypeScript support