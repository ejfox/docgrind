<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <p class="footer-text">docgrind</p>
        <p class="footer-desc">grind through js docs. build muscle memory. ship better code.</p>
      </div>
      
      <div class="footer-section">
        <h3 class="footer-heading">nav</h3>
        <ul class="footer-list">
          <li><NuxtLink to="/session" class="footer-link">session</NuxtLink></li>
          <li><NuxtLink to="/chapters" class="footer-link">chapters</NuxtLink></li>
          <li><NuxtLink to="/exercises" class="footer-link">exercises</NuxtLink></li>
          <li><NuxtLink to="/progress" class="footer-link">progress</NuxtLink></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h3 class="footer-heading">data</h3>
        <ul class="footer-list">
          <li>
            <button @click="exportData" class="footer-btn" :disabled="isExporting">
              {{ isExporting ? 'exporting...' : 'export' }}
            </button>
          </li>
          <li>
            <label class="footer-btn">
              import
              <input type="file" @change="importData" accept=".json" class="file-input">
            </label>
          </li>
          <li>
            <span class="footer-text">{{ formatDataSize(dataSize) }}</span>
          </li>
        </ul>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p class="footer-legal">
        content from <a href="https://developer.mozilla.org" target="_blank" rel="noopener" class="footer-link">mdn</a> under cc by-sa 2.5
      </p>
      <p class="footer-meta">made for js learners · v{{ appVersion }}</p>
    </div>
    
    <div v-if="showToast" class="toast" :class="toastType">{{ toastMessage }}</div>
  </footer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDataManager } from '~/composables/useDataManager'

const { exportData: exportUserData, importData: importUserData, getDataSize } = useDataManager()

const isExporting = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const dataSize = ref(0)
const appVersion = ref('1.0.0')

const formatDataSize = (bytes: number): string => {
  if (bytes === 0) return '0b'
  const k = 1024
  const sizes = ['b', 'kb', 'mb', 'gb']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i]
}

const exportData = async () => {
  isExporting.value = true
  try {
    const data = exportUserData()
    if (!data) throw new Error('no data to export')
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `docgrind-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    showToastMessage('exported', 'success')
  } catch (error) {
    showToastMessage('export failed', 'error')
  } finally {
    isExporting.value = false
  }
}

const importData = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    const success = await importUserData(data)
    
    if (success) {
      showToastMessage('imported', 'success')
      updateDataSize()
    } else {
      showToastMessage('import failed', 'error')
    }
  } catch (error) {
    showToastMessage('invalid file', 'error')
  } finally {
    input.value = ''
  }
}

const showToastMessage = (message: string, type: 'success' | 'error') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => showToast.value = false, 2000)
}

const updateDataSize = () => {
  dataSize.value = getDataSize()
}

onMounted(() => {
  updateDataSize()
  const interval = setInterval(updateDataSize, 30000)
  onUnmounted(() => clearInterval(interval))
})
</script>

<style scoped>
.footer {
  border-top: 1px solid var(--border);
  margin-top: var(--space-xl);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-lg) var(--space-md);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-lg);
}

.footer-section:first-child {
  grid-column: 1 / -1;
}

.footer-text {
  font-family: var(--font-mono);
  font-size: var(--text-md);
  font-weight: 500;
  color: var(--fg-bright);
  margin-bottom: var(--space-xs);
}

.footer-desc {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--fg-dim);
  margin: 0;
}

.footer-heading {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--fg);
  margin-bottom: var(--space-sm);
}

.footer-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.footer-link {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--fg-dim);
  text-decoration: none;
  border: none;
}

.footer-link:hover {
  color: var(--fg);
  border-bottom: 1px solid var(--border);
}

.footer-btn {
  background: none;
  border: none;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--fg-dim);
  cursor: pointer;
  padding: 0;
  text-align: left;
  position: relative;
}

.footer-btn:hover:not(:disabled) {
  color: var(--fg);
}

.footer-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

.footer-bottom {
  border-top: 1px solid var(--border);
  padding: var(--space-md);
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-md);
}

.footer-legal,
.footer-meta {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--fg-dim);
  margin: 0;
}

.toast {
  position: fixed;
  bottom: var(--space-md);
  right: var(--space-md);
  background: var(--bg-alt);
  border: 1px solid var(--border);
  padding: var(--space-sm) var(--space-md);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--fg);
  z-index: 1000;
}

.toast.error {
  border-color: var(--fg-bright);
  color: var(--fg-bright);
}

@media (max-width: 768px) {
  .footer-content {
    padding: var(--space-md) var(--space-sm);
    grid-template-columns: 1fr;
  }
  
  .footer-bottom {
    padding: var(--space-sm);
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-xs);
  }
}
</style>