<template>
  <div class="mdn-loading-state" :class="{ 'is-fullscreen': fullscreen }">
    <div class="loading-content">
      <!-- Loading Spinner -->
      <div class="loading-spinner" :class="spinnerSize">
        <div class="spinner" :style="spinnerStyle"></div>
      </div>
      
      <!-- Loading Message -->
      <div v-if="showMessage" class="loading-message">
        <h3 v-if="title">{{ title }}</h3>
        <p v-if="message">{{ message }}</p>
        <p v-if="stage" class="loading-stage">{{ stage }}</p>
      </div>
      
      <!-- Progress Bar -->
      <div v-if="showProgress && progress !== undefined" class="progress-container">
        <div class="progress-bar">
          <div 
            class="progress-fill"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <div class="progress-text">{{ progress }}%</div>
      </div>
      
      <!-- Loading Steps -->
      <div v-if="steps && steps.length > 0" class="loading-steps">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="loading-step"
          :class="{
            'is-active': index === currentStep,
            'is-complete': index < currentStep,
            'is-pending': index > currentStep
          }"
        >
          <div class="step-icon">
            <svg v-if="index < currentStep" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
            <div v-else-if="index === currentStep" class="step-spinner">
              <div class="mini-spinner"></div>
            </div>
            <div v-else class="step-number">{{ index + 1 }}</div>
          </div>
          <div class="step-content">
            <div class="step-title">{{ step.title }}</div>
            <div v-if="step.description" class="step-description">{{ step.description }}</div>
          </div>
        </div>
      </div>
      
      <!-- Estimated Time -->
      <div v-if="estimatedTime" class="estimated-time">
        <p>Estimated time: {{ formatTime(estimatedTime) }}</p>
      </div>
      
      <!-- Cancel Button -->
      <div v-if="showCancel && onCancel" class="loading-actions">
        <button @click="onCancel" class="btn btn-secondary">
          Cancel
        </button>
      </div>
    </div>
    
    <!-- Backdrop -->
    <div v-if="fullscreen" class="loading-backdrop" @click="handleBackdropClick"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';

interface LoadingStep {
  title: string;
  description?: string;
}

interface Props {
  title?: string;
  message?: string;
  stage?: string;
  progress?: number;
  steps?: LoadingStep[];
  currentStep?: number;
  estimatedTime?: number;
  fullscreen?: boolean;
  showMessage?: boolean;
  showProgress?: boolean;
  showCancel?: boolean;
  dismissible?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'primary' | 'secondary';
  onCancel?: () => void;
  onDismiss?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  showMessage: true,
  showProgress: true,
  showCancel: false,
  dismissible: false,
  size: 'medium',
  variant: 'default',
  currentStep: 0
});

const startTime = ref<number>(Date.now());

const spinnerSize = computed(() => {
  return `spinner-${props.size}`;
});

const spinnerStyle = computed(() => {
  const colors = {
    default: '#3498db',
    primary: '#2ecc71',
    secondary: '#95a5a6'
  };
  
  return {
    borderTopColor: colors[props.variant]
  };
});

const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const remainingMinutes = Math.floor((seconds % 3600) / 60);
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
};

const handleBackdropClick = () => {
  if (props.dismissible && props.onDismiss) {
    props.onDismiss();
  }
};

onMounted(() => {
  startTime.value = Date.now();
});
</script>

<style scoped>
.mdn-loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  position: relative;
}

.mdn-loading-state.is-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
}

.loading-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 500px;
  padding: 2rem;
}

.loading-spinner {
  margin-bottom: 1.5rem;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-small .spinner {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

.spinner-medium .spinner {
  width: 40px;
  height: 40px;
  border-width: 4px;
}

.spinner-large .spinner {
  width: 60px;
  height: 60px;
  border-width: 6px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-message {
  margin-bottom: 1.5rem;
}

.loading-message h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.loading-message p {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 1.1rem;
}

.loading-stage {
  color: #3498db !important;
  font-weight: 500;
  font-size: 1rem !important;
}

.progress-container {
  width: 100%;
  max-width: 300px;
  margin-bottom: 1.5rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background-color: #3498db;
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-text {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.loading-steps {
  width: 100%;
  max-width: 400px;
  margin-bottom: 1.5rem;
}

.loading-step {
  display: flex;
  align-items: flex-start;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.loading-step.is-active {
  background-color: #e3f2fd;
  border: 1px solid #2196f3;
}

.loading-step.is-complete {
  background-color: #e8f5e8;
  border: 1px solid #4caf50;
}

.loading-step.is-pending {
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
}

.step-icon {
  width: 24px;
  height: 24px;
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.loading-step.is-complete .step-icon {
  background-color: #4caf50;
  color: white;
}

.loading-step.is-active .step-icon {
  background-color: #2196f3;
  color: white;
}

.loading-step.is-pending .step-icon {
  background-color: #e0e0e0;
  color: #666;
}

.step-number {
  font-size: 0.9rem;
  font-weight: 600;
}

.step-spinner {
  width: 16px;
  height: 16px;
}

.mini-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.step-content {
  text-align: left;
  flex: 1;
}

.step-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.step-description {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
}

.estimated-time {
  margin-bottom: 1.5rem;
}

.estimated-time p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
}

.loading-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .mdn-loading-state.is-fullscreen {
    background-color: rgba(0, 0, 0, 0.9);
  }
  
  .loading-message h3,
  .step-title {
    color: #f8f9fa;
  }
  
  .loading-message p,
  .progress-text,
  .step-description,
  .estimated-time p {
    color: #ced4da;
  }
  
  .progress-bar {
    background-color: #495057;
  }
  
  .loading-step.is-pending {
    background-color: #343a40;
    border-color: #495057;
  }
  
  .loading-step.is-pending .step-icon {
    background-color: #495057;
    color: #ced4da;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .loading-content {
    padding: 1rem;
  }
  
  .loading-message h3 {
    font-size: 1.3rem;
  }
  
  .loading-message p {
    font-size: 1rem;
  }
  
  .progress-container {
    max-width: 250px;
  }
  
  .loading-steps {
    max-width: 350px;
  }
  
  .loading-step {
    padding: 0.5rem;
  }
  
  .step-icon {
    width: 20px;
    height: 20px;
    margin-right: 0.5rem;
  }
}
</style>