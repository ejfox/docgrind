<template>
  <div class="page">
    <div class="hero">
      <h1 class="hero-title">docgrind</h1>
      <p class="hero-desc">grind through javascript documentation. build muscle memory. ship better code.</p>
      
      <div class="hero-actions">
        <NuxtLink to="/session" class="btn btn--primary">start session</NuxtLink>
        <NuxtLink to="/chapters" class="btn btn--secondary">browse chapters</NuxtLink>
      </div>
    </div>
    
    <div class="stats-grid" v-if="stats">
      <div class="stat-item">
        <span class="stat-value">{{ stats.totalChaptersCompleted }}</span>
        <span class="stat-label">chapters completed</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ Math.floor(stats.totalReadingTime / 60) }}</span>
        <span class="stat-label">hours read</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.currentStreak }}</span>
        <span class="stat-label">day streak</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.totalExercisesCompleted }}</span>
        <span class="stat-label">exercises done</span>
      </div>
    </div>
    
    <div class="recent-activity" v-if="recentSessions.length > 0">
      <h2 class="section-title">recent sessions</h2>
      <div class="session-list">
        <div v-for="session in recentSessions.slice(0, 3)" :key="session.id" class="session-item">
          <span class="session-chapter">{{ session.chapterTitle }}</span>
          <span class="session-time">{{ session.actualDuration }}m</span>
          <span class="session-status">{{ session.completed ? 'done' : 'stopped' }}</span>
        </div>
      </div>
    </div>
    
    <div class="quick-nav">
      <h2 class="section-title">quick access</h2>
      <div class="nav-grid">
        <NuxtLink to="/progress" class="nav-card">
          <h3 class="nav-title">progress</h3>
          <p class="nav-desc">view your reading stats and activity chart</p>
        </NuxtLink>
        <NuxtLink to="/exercises" class="nav-card">
          <h3 class="nav-title">exercises</h3>
          <p class="nav-desc">practice with coding challenges</p>
        </NuxtLink>
        <NuxtLink to="/settings" class="nav-card">
          <h3 class="nav-title">settings</h3>
          <p class="nav-desc">customize your reading experience</p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDataManager } from '~/composables/useDataManager'

definePageMeta({
  title: 'DocGrind - JavaScript Documentation Practice',
  description: 'Grind through JavaScript docs. Build muscle memory. Ship better code.'
})

const { stats, userProgress } = useDataManager()

const recentSessions = computed(() => {
  return userProgress.value?.sessions || []
})
</script>

<style scoped>
.page {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-xl) 0;
}

.hero {
  text-align: center;
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-xl);
  border-bottom: 1px solid var(--border);
}

.hero-title {
  font-family: var(--font-mono);
  font-size: var(--text-md);
  font-weight: 500;
  color: var(--fg-bright);
  margin-bottom: var(--space-md);
}

.hero-desc {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--fg);
  margin-bottom: var(--space-lg);
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--fg);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:hover {
  background: var(--bg-alt);
  border-color: var(--fg-dim);
}

.btn--primary {
  background: var(--fg-bright);
  color: var(--bg);
  border-color: var(--fg-bright);
}

.btn--primary:hover {
  background: var(--fg);
  border-color: var(--fg);
}

.btn--secondary {
  border-color: var(--fg-dim);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-xl);
  border-bottom: 1px solid var(--border);
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-family: var(--font-mono);
  font-size: var(--text-md);
  font-weight: 500;
  color: var(--fg-bright);
  margin-bottom: var(--space-xs);
}

.stat-label {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--fg-dim);
}

.recent-activity,
.quick-nav {
  margin-bottom: var(--space-xl);
}

.section-title {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--fg);
  margin-bottom: var(--space-md);
}

.session-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm);
  border: 1px solid var(--border);
  background: var(--bg-alt);
}

.session-chapter {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--fg);
  flex: 1;
}

.session-time,
.session-status {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--fg-dim);
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-md);
}

.nav-card {
  padding: var(--space-md);
  border: 1px solid var(--border);
  background: var(--bg-alt);
  text-decoration: none;
  transition: all 0.2s ease;
}

.nav-card:hover {
  border-color: var(--fg-dim);
  background: var(--bg);
}

.nav-title {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--fg-bright);
  margin-bottom: var(--space-xs);
}

.nav-desc {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--fg-dim);
  margin: 0;
}

@media (max-width: 768px) {
  .page {
    padding: var(--space-lg) 0;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 200px;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .nav-grid {
    grid-template-columns: 1fr;
  }
}
</style>