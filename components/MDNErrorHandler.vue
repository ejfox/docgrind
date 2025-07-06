<template>
  <div class="mdn-error-handler">
    <!-- Loading States -->
    <div v-if="loading.isLoading" class="mdn-loading">
      <div class="loading-spinner">
        <div class="spinner"></div>
      </div>
      <div class="loading-content">
        <h3>Loading MDN Content</h3>
        <p v-if="loading.stage">{{ loading.stage }}</p>
        <div v-if="loading.progress" class="progress-bar">
          <div 
            class="progress-fill"
            :style="{ width: `${loading.progress}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Error States -->
    <div v-else-if="loading.isError && error" class="mdn-error">
      <div class="error-content">
        <div class="error-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        
        <h3>{{ getErrorTitle(error.code) }}</h3>
        <p class="error-message">{{ error.message }}</p>
        
        <div v-if="showDetails" class="error-details">
          <h4>Error Details</h4>
          <pre><code>{{ formatErrorDetails(error) }}</code></pre>
        </div>
        
        <div class="error-actions">
          <button @click="retry" class="btn btn-primary">
            Retry
          </button>
          <button @click="showDetails = !showDetails" class="btn btn-secondary">
            {{ showDetails ? 'Hide' : 'Show' }} Details
          </button>
          <button v-if="onClearError" @click="onClearError" class="btn btn-secondary">
            Clear Error
          </button>
        </div>
        
        <!-- Suggestions based on error type -->
        <div v-if="getSuggestions(error.code).length > 0" class="error-suggestions">
          <h4>Suggestions</h4>
          <ul>
            <li v-for="suggestion in getSuggestions(error.code)" :key="suggestion">
              {{ suggestion }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Success/Content State -->
    <div v-else class="mdn-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { MDNError, MDNLoadingState } from '~/types/mdn';

interface Props {
  loading: MDNLoadingState;
  error: MDNError | null;
  onRetry?: () => void;
  onClearError?: () => void;
  showRetryButton?: boolean;
  retryDelay?: number;
}

const props = withDefaults(defineProps<Props>(), {
  showRetryButton: true,
  retryDelay: 1000
});

const showDetails = ref(false);
const retryAttempts = ref(0);
const maxRetryAttempts = 3;

const canRetry = computed(() => {
  return props.showRetryButton && 
         retryAttempts.value < maxRetryAttempts &&
         props.onRetry;
});

const retry = async () => {
  if (!canRetry.value) return;
  
  retryAttempts.value++;
  
  // Add delay before retry
  if (props.retryDelay > 0) {
    await new Promise(resolve => setTimeout(resolve, props.retryDelay));
  }
  
  props.onRetry?.();
};

const getErrorTitle = (code: string): string => {
  const titles: Record<string, string> = {
    'FETCH_CONTENT_FAILED': 'Failed to Load Content',
    'FETCH_DIRECTORY_FAILED': 'Failed to Load Directory',
    'FETCH_FILE_FAILED': 'Failed to Load File',
    'FETCH_TREE_FAILED': 'Failed to Load Content Tree',
    'PARSE_CONTENT_FAILED': 'Failed to Parse Content',
    'CONTENT_NOT_FOUND': 'Content Not Found',
    'BUILD_TREE_FAILED': 'Failed to Build Navigation',
    'SEARCH_FAILED': 'Search Failed',
    'INIT_FAILED': 'Initialization Failed',
    'NETWORK_ERROR': 'Network Error',
    'TIMEOUT_ERROR': 'Request Timeout',
    'RATE_LIMIT_ERROR': 'Rate Limit Exceeded',
    'PERMISSION_ERROR': 'Permission Denied'
  };
  
  return titles[code] || 'An Error Occurred';
};

const getSuggestions = (code: string): string[] => {
  const suggestions: Record<string, string[]> = {
    'FETCH_CONTENT_FAILED': [
      'Check your internet connection',
      'The content might be temporarily unavailable',
      'Try refreshing the page'
    ],
    'CONTENT_NOT_FOUND': [
      'The content path might be incorrect',
      'The content might have been moved or deleted',
      'Check the URL and try again'
    ],
    'NETWORK_ERROR': [
      'Check your internet connection',
      'GitHub might be experiencing issues',
      'Try again in a few moments'
    ],
    'RATE_LIMIT_ERROR': [
      'You have exceeded the API rate limit',
      'Wait a few minutes before trying again',
      'Consider using a GitHub token for higher limits'
    ],
    'TIMEOUT_ERROR': [
      'The request took too long to complete',
      'Check your internet connection speed',
      'Try again with a more stable connection'
    ],
    'PERMISSION_ERROR': [
      'You might not have permission to access this content',
      'Check if you need to authenticate',
      'Contact an administrator if the issue persists'
    ]
  };
  
  return suggestions[code] || [
    'Try refreshing the page',
    'Check your internet connection',
    'If the problem persists, please report it'
  ];
};

const formatErrorDetails = (error: MDNError): string => {
  const details = {
    code: error.code,
    message: error.message,
    timestamp: error.timestamp.toISOString(),
    ...(error.details && { details: error.details })
  };
  
  return JSON.stringify(details, null, 2);
};

// Reset retry attempts when error changes
watch(() => props.error, () => {
  retryAttempts.value = 0;
});
</script>

<style scoped>
.mdn-error-handler {
  width: 100%;
  min-height: 200px;
}

.mdn-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.loading-spinner {
  margin-bottom: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-content h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.loading-content p {
  margin: 0 0 1rem 0;
  color: #666;
}

.progress-bar {
  width: 300px;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #3498db;
  transition: width 0.3s ease;
}

.mdn-error {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.error-content {
  max-width: 600px;
  text-align: center;
}

.error-icon {
  color: #e74c3c;
  margin-bottom: 1rem;
}

.error-content h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.5rem;
}

.error-message {
  margin: 0 0 1.5rem 0;
  color: #666;
  font-size: 1.1rem;
}

.error-details {
  margin: 1.5rem 0;
  text-align: left;
}

.error-details h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.error-details pre {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 1rem;
  overflow-x: auto;
  font-size: 0.9rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-suggestions {
  text-align: left;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 1rem;
}

.error-suggestions h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.error-suggestions ul {
  margin: 0;
  padding-left: 1.5rem;
}

.error-suggestions li {
  margin-bottom: 0.5rem;
  color: #666;
}

.mdn-content {
  min-height: inherit;
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .loading-content h3,
  .error-content h3,
  .error-details h4,
  .error-suggestions h4 {
    color: #f8f9fa;
  }
  
  .loading-content p,
  .error-message,
  .error-suggestions li {
    color: #ced4da;
  }
  
  .error-details pre,
  .error-suggestions {
    background-color: #343a40;
    border-color: #495057;
    color: #f8f9fa;
  }
  
  .progress-bar {
    background-color: #495057;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 200px;
  }
  
  .progress-bar {
    width: 100%;
    max-width: 300px;
  }
}
</style>