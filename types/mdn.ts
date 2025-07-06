/**
 * TypeScript types for MDN content structure
 */

export interface MDNFrontmatter {
  title: string;
  slug: string;
  page_type: 'guide' | 'reference' | 'tutorial' | 'landing-page';
  status?: string[];
  browser_compat?: string;
  spec_urls?: string[];
  short_title?: string;
  description?: string;
  tags?: string[];
  authors?: string[];
  last_modified?: string;
  created?: string;
}

export interface MDNContent {
  _id: string;
  _path: string;
  _dir: string;
  _draft: boolean;
  _partial: boolean;
  _locale: string;
  title: string;
  description?: string;
  body: any;
  head: any;
  _source: string;
  _file: string;
  _extension: string;
  frontmatter: MDNFrontmatter;
  slug: string;
  path: string;
  excerpt?: string;
  toc?: MDNTableOfContents[];
  navigation?: MDNNavigation;
  breadcrumbs?: MDNBreadcrumb[];
  modifiedAt?: Date;
  createdAt?: Date;
}

export interface MDNTableOfContents {
  id: string;
  depth: number;
  text: string;
  anchor?: string;
  children?: MDNTableOfContents[];
}

export interface MDNBreadcrumb {
  title: string;
  path: string;
  _path: string;
}

export interface MDNNavigation {
  title: string;
  _path: string;
  children?: MDNNavigation[];
}

export interface MDNChapter {
  id: string;
  title: string;
  slug: string;
  path: string;
  description?: string;
  order?: number;
  children?: MDNChapter[];
  parentId?: string;
  level: number;
  isExpanded?: boolean;
  pageType: 'guide' | 'reference' | 'tutorial' | 'landing-page';
  tags?: string[];
  lastModified?: string;
}

export interface MDNSearchResult {
  id: string;
  title: string;
  description?: string;
  path: string;
  slug: string;
  excerpt?: string;
  score: number;
  highlights?: string[];
  tags?: string[];
  pageType: 'guide' | 'reference' | 'tutorial' | 'landing-page';
}

export interface MDNSearchOptions {
  query: string;
  limit?: number;
  offset?: number;
  filters?: {
    pageType?: string[];
    tags?: string[];
    path?: string;
  };
  sortBy?: 'relevance' | 'title' | 'date';
  includeExcerpt?: boolean;
}

export interface MDNCache {
  key: string;
  data: any;
  timestamp: number;
  expiry: number;
}

export interface MDNError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export interface MDNFetchOptions {
  useCache?: boolean;
  cacheExpiry?: number;
  includeDrafts?: boolean;
  maxDepth?: number;
  transform?: (content: any) => any;
}

export interface MDNContentTree {
  root: MDNChapter;
  chapters: Map<string, MDNChapter>;
  totalCount: number;
  lastUpdated: Date;
}

export interface MDNContentStats {
  totalPages: number;
  pagesByType: Record<string, number>;
  pagesByTag: Record<string, number>;
  lastUpdated: Date;
  cacheHitRate: number;
}

export interface MDNGitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: 'file' | 'dir';
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

export interface MDNGitHubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  content: string;
  encoding: string;
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

export interface MDNContentProvider {
  fetchContent(path: string, options?: MDNFetchOptions): Promise<MDNContent>;
  fetchContentTree(options?: MDNFetchOptions): Promise<MDNContentTree>;
  searchContent(options: MDNSearchOptions): Promise<MDNSearchResult[]>;
  invalidateCache(pattern?: string): Promise<void>;
  getStats(): Promise<MDNContentStats>;
}

export interface MDNLoadingState {
  isLoading: boolean;
  isError: boolean;
  error?: MDNError;
  progress?: number;
  stage?: string;
}

export type MDNContentType = 'guide' | 'reference' | 'tutorial' | 'landing-page';
export type MDNSortOrder = 'asc' | 'desc';
export type MDNSortBy = 'title' | 'date' | 'relevance' | 'order';