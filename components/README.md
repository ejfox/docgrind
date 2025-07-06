# DocGrind Components

This directory contains all the Vue components for the DocGrind application.

## Component Overview

### Core App Components
- **AppHeader.vue** - Main navigation header with timer and stats
- **AppFooter.vue** - Footer with data export/import functionality
- **SessionSelector.vue** - Time mode selection component

### MDN Content Components
- **MDNContentTree.vue** - Interactive chapter navigation tree
- **MDNErrorHandler.vue** - Error handling and loading states
- **MDNLoadingState.vue** - Loading indicators

### Reading Components
- **ReadingActivityChart.vue** - GitHub-style contribution chart (moved from root)

## Usage

All components are designed to work with the Vue 3 Composition API and TypeScript. They integrate with the global data management system via the `useDataManager` composable.

## Design System

Components follow the minimalist cyberpunk aesthetic with:
- Monospace fonts (IBM Plex Mono)
- High contrast black/white palette
- Clean borders and typography
- Responsive design
- Accessibility features