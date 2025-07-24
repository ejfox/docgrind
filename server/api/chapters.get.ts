import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    // Read the MDN index file
    const indexPath = path.join(process.cwd(), 'content/mdn/index.json')
    
    if (!fs.existsSync(indexPath)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'MDN content index not found. Run `npm run build:content` first.'
      })
    }
    
    const indexContent = await fs.promises.readFile(indexPath, 'utf-8')
    const mdnData = JSON.parse(indexContent)
    
    return {
      success: true,
      data: mdnData,
      totalChapters: mdnData.chapters.length
    }
  } catch (error) {
    console.error('Error loading MDN chapters:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load MDN chapters'
    })
  }
})