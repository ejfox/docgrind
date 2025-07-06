<template>
  <header class="header">
    <div class="header-content">
      <!-- Brand -->
      <NuxtLink to="/" class="brand">docgrind</NuxtLink>
      
      <!-- Navigation -->
      <nav class="nav">
        <NuxtLink to="/session" class="nav-link" activeClass="nav-link--active">session</NuxtLink>
        <NuxtLink to="/chapters" class="nav-link" activeClass="nav-link--active">chapters</NuxtLink>
        <NuxtLink to="/exercises" class="nav-link" activeClass="nav-link--active">exercises</NuxtLink>
        <NuxtLink to="/progress" class="nav-link" activeClass="nav-link--active">progress</NuxtLink>
        <NuxtLink to="/settings" class="nav-link" activeClass="nav-link--active">settings</NuxtLink>
      </nav>
      
      <!-- Session timer -->
      <div v-if="isSessionActive" class="timer">
        <span class="timer-text">{{ formatTime(sessionElapsed) }}</span>
        <button @click="pauseSession" class="timer-btn" v-if="!isSessionPaused">[pause]</button>
        <button @click="resumeSession" class="timer-btn" v-else>[resume]</button>
        <button @click="showMenu = !showMenu" class="timer-btn">[menu]</button>
        
        <div v-if="showMenu" class="timer-menu">
          <button @click="completeSessionEarly" class="menu-item">complete</button>
          <button @click="cancelSession" class="menu-item">cancel</button>
        </div>
      </div>
      
      <!-- Stats -->
      <div class="stats">
        <span class="stat">{{ currentStreak }}d</span>
        <span class="stat">{{ totalChaptersCompleted }}ch</span>
        <span class="stat">{{ Math.floor(totalReadingTime / 60) }}h</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDataManager } from '~/composables/useDataManager'

const { 
  isSessionActive,
  isSessionPaused,
  currentStreak,
  totalChaptersCompleted,
  totalReadingTime,
  sessionElapsed,
  pauseSession,
  resumeSession,
  completeSession,
  interruptSession
} = useDataManager()

const showMenu = ref(false)

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${mins}m`
}

const completeSessionEarly = async () => {
  showMenu.value = false
  await completeSession()
}

const cancelSession = async () => {
  showMenu.value = false
  await interruptSession()
}
</script>

<style scoped>
.header {
  border-bottom: 1px solid var(--border);
  background: var(--bg);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-md);
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.brand {
  font-family: var(--font-mono);
  font-size: var(--text-md);
  font-weight: 500;
  color: var(--fg-bright);
  text-decoration: none;
  border: none;
}

.nav {
  display: flex;
  gap: var(--space-md);
  flex: 1;
}

.nav-link {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--fg-dim);
  text-decoration: none;
  border: none;
  padding: var(--space-xs) 0;
  border-bottom: 1px solid transparent;
}

.nav-link:hover {
  color: var(--fg);
  border-bottom-color: var(--border);
}

.nav-link--active {
  color: var(--fg-bright);
  border-bottom-color: var(--fg-bright);
}

.timer {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--fg);
}

.timer-text {
  color: var(--fg-bright);
}

.timer-btn {
  background: none;
  border: none;
  color: var(--fg-dim);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  cursor: pointer;
  padding: 0;
}

.timer-btn:hover {
  color: var(--fg);
}

.timer-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: var(--space-xs);
  background: var(--bg-alt);
  border: 1px solid var(--border);
  padding: var(--space-xs);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  min-width: 80px;
}

.menu-item {
  background: none;
  border: none;
  color: var(--fg);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  cursor: pointer;
  padding: var(--space-xs);
  text-align: left;
}

.menu-item:hover {
  background: var(--border);
}

.stats {
  display: flex;
  gap: var(--space-md);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.stat {
  color: var(--fg-dim);
}

@media (max-width: 768px) {
  .header-content {
    padding: var(--space-sm);
    gap: var(--space-sm);
    flex-wrap: wrap;
  }
  
  .nav {
    order: 3;
    width: 100%;
    justify-content: space-between;
  }
  
  .stats {
    gap: var(--space-sm);
  }
}

@media (max-width: 480px) {
  .nav {
    gap: var(--space-xs);
  }
  
  .nav-link {
    font-size: var(--text-xs);
  }
  
  .stats {
    font-size: var(--text-xs);
  }
}
</style>