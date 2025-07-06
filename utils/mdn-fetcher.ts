/**
 * MDN Content Fetcher Utilities
 * Handles fetching and parsing MDN JavaScript documentation from GitHub
 */

import { Octokit } from '@octokit/rest';
import matter from 'gray-matter';
import type {
  MDNContent,
  MDNGitHubFile,
  MDNGitHubContent,
  MDNFrontmatter,
  MDNFetchOptions,
  MDNError,
  MDNChapter,
  MDNContentTree
} from '~/types/mdn';

export class MDNFetcher {
  private octokit: Octokit;
  private owner = 'mdn';
  private repo = 'content';
  private basePath = 'files/en-us/web/javascript';
  private cache = new Map<string, any>();

  constructor(githubToken?: string) {
    this.octokit = new Octokit({
      auth: githubToken,
      request: {
        timeout: 10000
      }
    });
  }

  /**
   * Fetch directory contents from MDN GitHub repository
   */
  async fetchDirectoryContents(path: string = ''): Promise<MDNGitHubFile[]> {
    try {
      const fullPath = path ? `${this.basePath}/${path}` : this.basePath;
      const response = await this.octokit.rest.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: fullPath
      });

      if (!Array.isArray(response.data)) {
        throw new Error('Expected directory contents to be an array');
      }

      return response.data.map(item => ({
        name: item.name,
        path: item.path,
        sha: item.sha,
        size: item.size,
        url: item.url,
        html_url: item.html_url,
        git_url: item.git_url,
        download_url: item.download_url,
        type: item.type as 'file' | 'dir',
        _links: {
          self: item.url,
          git: item.git_url,
          html: item.html_url
        }
      }));
    } catch (error) {
      throw this.createError('FETCH_DIRECTORY_FAILED', `Failed to fetch directory: ${path}`, error);
    }
  }

  /**
   * Fetch file content from MDN GitHub repository
   */
  async fetchFileContent(path: string): Promise<MDNGitHubContent> {
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: path
      });

      if (Array.isArray(response.data) || !('content' in response.data)) {
        throw new Error('Expected file content, got directory or invalid response');
      }

      return {
        name: response.data.name,
        path: response.data.path,
        sha: response.data.sha,
        size: response.data.size,
        url: response.data.url,
        html_url: response.data.html_url,
        git_url: response.data.git_url,
        download_url: response.data.download_url,
        type: response.data.type,
        content: response.data.content,
        encoding: response.data.encoding,
        _links: {
          self: response.data.url,
          git: response.data.git_url,
          html: response.data.html_url
        }
      };
    } catch (error) {
      throw this.createError('FETCH_FILE_FAILED', `Failed to fetch file: ${path}`, error);
    }
  }

  /**
   * Parse MDN markdown content with frontmatter
   */
  parseMarkdownContent(content: string, filePath: string): MDNContent {
    try {
      const decoded = Buffer.from(content, 'base64').toString('utf-8');
      const { data: frontmatter, content: body } = matter(decoded);

      const pathParts = filePath.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const directory = pathParts.slice(0, -1).join('/');
      
      // Extract slug from path
      const slug = this.extractSlugFromPath(filePath);
      const mdnPath = this.convertToMDNPath(filePath);

      return {
        _id: filePath,
        _path: mdnPath,
        _dir: directory,
        _draft: false,
        _partial: false,
        _locale: 'en-us',
        title: frontmatter.title || this.generateTitleFromSlug(slug),
        description: frontmatter.description,
        body,
        head: {},
        _source: 'mdn-github',
        _file: fileName,
        _extension: 'md',
        frontmatter: frontmatter as MDNFrontmatter,
        slug,
        path: mdnPath,
        excerpt: this.extractExcerpt(body),
        toc: this.generateTableOfContents(body),
        modifiedAt: new Date(),
        createdAt: new Date()
      };
    } catch (error) {
      throw this.createError('PARSE_CONTENT_FAILED', `Failed to parse content: ${filePath}`, error);
    }
  }

  /**
   * Fetch and parse MDN content
   */
  async fetchMDNContent(path: string, options: MDNFetchOptions = {}): Promise<MDNContent> {
    const cacheKey = `content:${path}`;
    
    // Check cache first
    if (options.useCache !== false && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < (options.cacheExpiry || 3600000)) {
        return cached.data;
      }
    }

    try {
      // Look for index.md or index.html files
      const indexPath = path.endsWith('/') ? `${path}index.md` : `${path}/index.md`;
      const fileContent = await this.fetchFileContent(indexPath);
      const parsedContent = this.parseMarkdownContent(fileContent.content, fileContent.path);
      
      // Apply transform if provided
      const finalContent = options.transform ? options.transform(parsedContent) : parsedContent;
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: finalContent,
        timestamp: Date.now()
      });

      return finalContent;
    } catch (error) {
      // Try alternative file names
      const alternativePaths = [
        path.endsWith('/') ? `${path}index.html` : `${path}/index.html`,
        `${path}.md`,
        `${path}.html`
      ];

      for (const altPath of alternativePaths) {
        try {
          const fileContent = await this.fetchFileContent(altPath);
          const parsedContent = this.parseMarkdownContent(fileContent.content, fileContent.path);
          const finalContent = options.transform ? options.transform(parsedContent) : parsedContent;
          
          this.cache.set(cacheKey, {
            data: finalContent,
            timestamp: Date.now()
          });

          return finalContent;
        } catch (altError) {
          // Continue to next alternative
        }
      }

      throw this.createError('CONTENT_NOT_FOUND', `Content not found: ${path}`, error);
    }
  }

  /**
   * Build content tree from MDN JavaScript documentation
   */
  async buildContentTree(options: MDNFetchOptions = {}): Promise<MDNContentTree> {
    const cacheKey = 'content-tree';
    
    if (options.useCache !== false && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < (options.cacheExpiry || 3600000)) {
        return cached.data;
      }
    }

    try {
      const chapters = new Map<string, MDNChapter>();
      const rootChapter: MDNChapter = {
        id: 'root',
        title: 'JavaScript',
        slug: 'javascript',
        path: '/mdn/javascript',
        level: 0,
        pageType: 'landing-page',
        children: []
      };

      await this.buildChapterTree('', rootChapter, chapters, 0, options.maxDepth || 3);

      const contentTree: MDNContentTree = {
        root: rootChapter,
        chapters,
        totalCount: chapters.size,
        lastUpdated: new Date()
      };

      this.cache.set(cacheKey, {
        data: contentTree,
        timestamp: Date.now()
      });

      return contentTree;
    } catch (error) {
      throw this.createError('BUILD_TREE_FAILED', 'Failed to build content tree', error);
    }
  }

  /**
   * Recursively build chapter tree
   */
  private async buildChapterTree(
    path: string,
    parent: MDNChapter,
    chapters: Map<string, MDNChapter>,
    level: number,
    maxDepth: number
  ): Promise<void> {
    if (level >= maxDepth) return;

    try {
      const contents = await this.fetchDirectoryContents(path);
      const directories = contents.filter(item => item.type === 'dir');
      const files = contents.filter(item => item.type === 'file' && 
        (item.name === 'index.md' || item.name === 'index.html'));

      // Process index file for current directory
      if (files.length > 0) {
        try {
          const content = await this.fetchMDNContent(path);
          parent.description = content.description;
          parent.lastModified = content.frontmatter.last_modified;
          parent.tags = content.frontmatter.tags;
          parent.pageType = content.frontmatter.page_type || 'guide';
        } catch (error) {
          // Continue if index file cannot be processed
        }
      }

      // Process subdirectories
      for (const dir of directories) {
        const relativePath = path ? `${path}/${dir.name}` : dir.name;
        const chapterId = `${parent.id}/${dir.name}`;
        
        const chapter: MDNChapter = {
          id: chapterId,
          title: this.generateTitleFromSlug(dir.name),
          slug: dir.name,
          path: `/mdn/javascript/${relativePath}`,
          level: level + 1,
          parentId: parent.id,
          pageType: 'guide',
          children: []
        };

        chapters.set(chapterId, chapter);
        parent.children = parent.children || [];
        parent.children.push(chapter);

        // Recursively build subtree
        await this.buildChapterTree(relativePath, chapter, chapters, level + 1, maxDepth);
      }
    } catch (error) {
      console.warn(`Failed to build chapter tree for path: ${path}`, error);
    }
  }

  /**
   * Extract slug from file path
   */
  private extractSlugFromPath(filePath: string): string {
    const pathParts = filePath.replace(this.basePath, '').split('/').filter(Boolean);
    return pathParts[pathParts.length - 2] || pathParts[pathParts.length - 1] || 'index';
  }

  /**
   * Convert GitHub path to MDN path
   */
  private convertToMDNPath(filePath: string): string {
    return filePath.replace(this.basePath, '/mdn/javascript').replace(/\/index\.(md|html)$/, '');
  }

  /**
   * Generate title from slug
   */
  private generateTitleFromSlug(slug: string): string {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Extract excerpt from markdown content
   */
  private extractExcerpt(content: string, maxLength: number = 200): string {
    const plainText = content.replace(/[#*`_~]/g, '').trim();
    const firstParagraph = plainText.split('\n\n')[0];
    
    if (firstParagraph.length <= maxLength) {
      return firstParagraph;
    }
    
    return firstParagraph.substring(0, maxLength).trim() + '...';
  }

  /**
   * Generate table of contents from markdown content
   */
  private generateTableOfContents(content: string): any[] {
    const headings = content.match(/^#{1,6}\s+.+$/gm) || [];
    
    return headings.map((heading, index) => {
      const level = heading.match(/^#+/)?.[0].length || 1;
      const text = heading.replace(/^#+\s+/, '');
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      return {
        id,
        depth: level,
        text,
        anchor: `#${id}`
      };
    });
  }

  /**
   * Create standardized error object
   */
  private createError(code: string, message: string, originalError?: any): MDNError {
    return {
      code,
      message,
      details: originalError,
      timestamp: new Date()
    };
  }

  /**
   * Clear cache
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      const keys = Array.from(this.cache.keys()).filter(key => key.includes(pattern));
      keys.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}