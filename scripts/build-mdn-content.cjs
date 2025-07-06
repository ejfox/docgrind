#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const MDN_REPO = 'https://github.com/mdn/content.git'
const TEMP_DIR = path.join(process.cwd(), 'temp-mdn')
const CONTENT_DIR = path.join(process.cwd(), 'content', 'mdn')
const JS_PATH = 'files/en-us/web/javascript'

console.log('🚀 Building MDN content for DocGrind...')

// Clean up existing content
if (fs.existsSync(CONTENT_DIR)) {
  fs.rmSync(CONTENT_DIR, { recursive: true, force: true })
}

// Clean up temp directory
if (fs.existsSync(TEMP_DIR)) {
  fs.rmSync(TEMP_DIR, { recursive: true, force: true })
}

try {
  // Clone MDN content repository
  console.log('📥 Cloning MDN content repository...')
  execSync(`git clone --depth 1 ${MDN_REPO} ${TEMP_DIR}`, { stdio: 'inherit' })
  
  // Create content directory
  fs.mkdirSync(CONTENT_DIR, { recursive: true })
  
  // Copy JavaScript documentation
  const sourcePath = path.join(TEMP_DIR, JS_PATH)
  if (fs.existsSync(sourcePath)) {
    console.log('📂 Processing JavaScript documentation...')
    copyAndProcessMDNContent(sourcePath, CONTENT_DIR)
  } else {
    console.error('❌ JavaScript documentation not found in MDN repo')
    process.exit(1)
  }
  
  // Generate chapter index
  console.log('📋 Generating chapter index...')
  generateChapterIndex(CONTENT_DIR)
  
  // Clean up temp directory
  fs.rmSync(TEMP_DIR, { recursive: true, force: true })
  
  console.log('✅ MDN content build complete!')
  
} catch (error) {
  console.error('❌ Error building MDN content:', error)
  process.exit(1)
}

function copyAndProcessMDNContent(sourceDir, targetDir) {
  let chapterCount = 0
  
  function processDirectory(src, dest) {
    const items = fs.readdirSync(src)
    
    for (const item of items) {
      const srcPath = path.join(src, item)
      const destPath = path.join(dest, item)
      const stat = fs.statSync(srcPath)
      
      if (stat.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true })
        processDirectory(srcPath, destPath)
      } else if (item === 'index.md') {
        // Process markdown file
        const content = fs.readFileSync(srcPath, 'utf8')
        const processed = processMarkdownFile(content, srcPath)
        fs.writeFileSync(destPath, processed)
        chapterCount++
      }
    }
  }
  
  processDirectory(sourceDir, targetDir)
  console.log(`📄 Processed ${chapterCount} chapters`)
}

function processMarkdownFile(content, filePath) {
  // Extract frontmatter if exists
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/)
  let frontmatter = {}
  let markdownContent = content
  
  if (frontmatterMatch) {
    // Parse existing frontmatter
    const yamlContent = frontmatterMatch[1]
    markdownContent = content.substring(frontmatterMatch[0].length)
  }
  
  // Generate slug from file path
  const relativePath = path.relative(path.join(process.cwd(), 'temp-mdn', 'files/en-us/web/javascript'), filePath)
  const slug = relativePath.replace(/\/index\.md$/, '').replace(/\//g, '-')
  
  // Extract title from first heading
  const titleMatch = markdownContent.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1] : slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  // Generate estimated reading time (average 200 words per minute)
  const wordCount = markdownContent.split(/\s+/).length
  const readingTime = Math.ceil(wordCount / 200)
  
  // Count code blocks
  const codeBlocks = (markdownContent.match(/```/g) || []).length / 2
  
  // Generate new frontmatter
  const newFrontmatter = {
    title,
    slug,
    path: relativePath,
    wordCount,
    readingTime,
    codeBlocks,
    difficulty: estimateDifficulty(markdownContent, codeBlocks),
    category: extractCategory(relativePath),
    tags: extractTags(markdownContent),
    lastModified: new Date().toISOString(),
    ...frontmatter
  }
  
  // Return processed content
  return `---
${Object.entries(newFrontmatter).map(([key, value]) => {
  if (Array.isArray(value)) {
    return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`
  } else if (typeof value === 'string') {
    return `${key}: "${value}"`
  } else {
    return `${key}: ${value}`
  }
}).join('\n')}
---

${markdownContent}`
}

function estimateDifficulty(content, codeBlocks) {
  const advancedKeywords = ['async', 'await', 'prototype', 'closure', 'hoisting', 'this', 'bind', 'call', 'apply']
  const intermediateKeywords = ['function', 'class', 'module', 'import', 'export', 'destructuring']
  
  const hasAdvanced = advancedKeywords.some(keyword => content.toLowerCase().includes(keyword))
  const hasIntermediate = intermediateKeywords.some(keyword => content.toLowerCase().includes(keyword))
  
  if (hasAdvanced || codeBlocks > 5) return 'advanced'
  if (hasIntermediate || codeBlocks > 2) return 'intermediate'
  return 'beginner'
}

function extractCategory(filePath) {
  const pathParts = filePath.split('/')
  if (pathParts.length > 1) {
    return pathParts[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
  return 'General'
}

function extractTags(content) {
  const tags = []
  const lowerContent = content.toLowerCase()
  
  // Common JavaScript concepts
  const concepts = [
    'variables', 'functions', 'arrays', 'objects', 'loops', 'conditionals',
    'classes', 'modules', 'async', 'promises', 'events', 'dom', 'api',
    'es6', 'destructuring', 'spread', 'rest', 'arrow-functions'
  ]
  
  concepts.forEach(concept => {
    if (lowerContent.includes(concept.replace('-', ' '))) {
      tags.push(concept)
    }
  })
  
  return tags.slice(0, 5) // Limit to 5 tags
}

function generateChapterIndex(contentDir) {
  const chapters = []
  
  function scanDirectory(dir, relativePath = '') {
    const items = fs.readdirSync(dir)
    
    for (const item of items) {
      const itemPath = path.join(dir, item)
      const stat = fs.statSync(itemPath)
      
      if (stat.isDirectory()) {
        scanDirectory(itemPath, path.join(relativePath, item))
      } else if (item === 'index.md') {
        const content = fs.readFileSync(itemPath, 'utf8')
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/)
        
        if (frontmatterMatch) {
          const yamlContent = frontmatterMatch[1]
          const chapter = {}
          
          // Parse YAML frontmatter
          yamlContent.split('\n').forEach(line => {
            const match = line.match(/^(\w+):\s*(.+)$/)
            if (match) {
              const [, key, value] = match
              if (value.startsWith('[') && value.endsWith(']')) {
                chapter[key] = value.slice(1, -1).split(',').map(v => v.trim().replace(/"/g, ''))
              } else {
                chapter[key] = value.replace(/"/g, '')
              }
            }
          })
          
          chapters.push(chapter)
        }
      }
    }
  }
  
  scanDirectory(contentDir)
  
  // Sort chapters by category and difficulty
  chapters.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category)
    }
    const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 }
    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
  })
  
  // Write chapter index
  const indexPath = path.join(contentDir, 'index.json')
  fs.writeFileSync(indexPath, JSON.stringify({
    chapters,
    generated: new Date().toISOString(),
    totalChapters: chapters.length
  }, null, 2))
  
  console.log(`📊 Generated index with ${chapters.length} chapters`)
}