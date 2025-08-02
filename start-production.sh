#!/bin/bash
export PORT=8642
export NODE_ENV=production

# Ensure content is available in production
if [ ! -d ".output/server/content" ]; then
  echo "Copying content directory to production build..."
  cp -r content .output/server/
fi

node .output/server/index.mjs