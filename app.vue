<template>
  <div class="app">
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator />
    <AppHeader />
    <main class="main-content">
      <NuxtPage />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
// Global app configuration
useHead({
  title: 'DocGrind - JavaScript Documentation Practice',
  meta: [
    { name: 'description', content: 'Grind through JavaScript docs. Build muscle memory. Ship better code.' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ]
})

// Initialize data persistence on client-side only
const { initializeDataManager } = useDataManager()
onMounted(async () => {
  await initializeDataManager()
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

html, body {
  margin: 0;
  padding: 0;
  font-family: 'IBM Plex Sans', monospace;
  font-size: 16px;
  font-weight: 400;
  background-color: var(--bg);
  color: var(--fg);
  line-height: 1.4;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

:root {
  /* Monochromatic palette */
  --bg: #0a0a0a;
  --bg-alt: #111111;
  --border: #1a1a1a;
  --fg: #e0e0e0;
  --fg-dim: #808080;
  --fg-bright: #ffffff;
  --accent: #ffffff;
  --accent-dim: #666666;
  
  /* Typography scale */
  --text-xs: 14px;
  --text-sm: 16px;
  --text-md: 18px;
  
  /* Font families */
  --font-mono: 'IBM Plex Mono', monospace;
  --font-sans: 'IBM Plex Sans', sans-serif;
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
}

* {
  box-sizing: border-box;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

.main-content {
  flex: 1;
  padding: var(--space-md);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Base typography */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-mono);
  font-weight: 500;
  margin: 0;
  color: var(--fg-bright);
}

h1 { font-size: var(--text-md); }
h2 { font-size: var(--text-md); }
h3 { font-size: var(--text-sm); }

p {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 400;
  margin: 0;
  color: var(--fg);
}

/* Form elements */
input, select, textarea, button {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 400;
}

/* Links */
a {
  color: var(--fg-bright);
  text-decoration: none;
  border-bottom: 1px solid var(--border);
}

a:hover {
  border-bottom-color: var(--fg-bright);
}

/* Code */
code, pre {
  font-family: var(--font-mono);
  background: var(--bg-alt);
  border: 1px solid var(--border);
}

/* Lists */
ul, ol {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--fg);
}

@media (max-width: 768px) {
  .main-content {
    padding: var(--space-sm);
  }
}
</style>
