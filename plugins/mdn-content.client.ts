/**
 * MDN Content Plugin
 * Initializes the MDN content system on the client side
 */

import { useMDNContent } from '~/composables/useMDNContent';
import { useMDNSearch } from '~/composables/useMDNSearch';

export default defineNuxtPlugin(async () => {
  // Only run on client side
  if (process.server) return;

  const { initialize, contentTree } = useMDNContent();
  const { initialize: initializeSearch } = useMDNSearch();

  try {
    console.log('Initializing MDN content system...');
    
    // Initialize content system
    await initialize({
      useCache: true,
      maxDepth: 3
    });

    // Initialize search if content tree is available
    if (contentTree.value) {
      initializeSearch(contentTree.value);
      console.log('MDN content system initialized successfully');
    }
  } catch (error) {
    console.warn('Failed to initialize MDN content system:', error);
  }
});