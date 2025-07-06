<template>
  <div class="mdn-content-tree">
    <div class="tree-header" v-if="title">
      <h3>{{ title }}</h3>
      <div class="tree-controls">
        <button @click="expandAll" class="control-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6,9 12,15 18,9"/>
          </svg>
          Expand All
        </button>
        <button @click="collapseAll" class="control-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="18,15 12,9 6,15"/>
          </svg>
          Collapse All
        </button>
      </div>
    </div>
    
    <div class="tree-container">
      <ul class="tree-root">
        <TreeNode
          v-for="child in rootChildren"
          :key="child.id"
          :node="child"
          :level="0"
          :max-depth="maxDepth"
          :show-counts="showCounts"
          :show-descriptions="showDescriptions"
          :show-tags="showTags"
          :expanded-nodes="expandedNodes"
          :selected-node="selectedNode"
          @toggle="toggleNode"
          @select="selectNode"
        />
      </ul>
    </div>
    
    <div v-if="showStats" class="tree-stats">
      <div class="stats-item">
        <span class="stats-label">Total Nodes:</span>
        <span class="stats-value">{{ totalNodes }}</span>
      </div>
      <div class="stats-item">
        <span class="stats-label">Visible Nodes:</span>
        <span class="stats-value">{{ visibleNodes }}</span>
      </div>
      <div class="stats-item">
        <span class="stats-label">Max Depth:</span>
        <span class="stats-value">{{ actualMaxDepth }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { MDNContentTree, MDNChapter } from '~/types/mdn';

interface Props {
  tree: MDNContentTree;
  title?: string;
  maxDepth?: number;
  showCounts?: boolean;
  showDescriptions?: boolean;
  showTags?: boolean;
  showStats?: boolean;
  defaultExpanded?: boolean;
  selectedPath?: string;
}

const props = withDefaults(defineProps<Props>(), {
  maxDepth: 3,
  showCounts: false,
  showDescriptions: true,
  showTags: false,
  showStats: false,
  defaultExpanded: false
});

const emit = defineEmits<{
  nodeSelect: [node: MDNChapter];
  nodeToggle: [node: MDNChapter, expanded: boolean];
}>();

// Local state
const expandedNodes = ref<Set<string>>(new Set());
const selectedNode = ref<string | null>(null);

// Computed properties
const rootChildren = computed(() => {
  return props.tree.root.children || [];
});

const totalNodes = computed(() => {
  return props.tree.totalCount;
});

const visibleNodes = computed(() => {
  return countVisibleNodes(rootChildren.value, 0);
});

const actualMaxDepth = computed(() => {
  return calculateMaxDepth(rootChildren.value, 0);
});

// Methods
const toggleNode = (nodeId: string) => {
  const node = props.tree.chapters.get(nodeId);
  if (!node) return;
  
  if (expandedNodes.value.has(nodeId)) {
    expandedNodes.value.delete(nodeId);
  } else {
    expandedNodes.value.add(nodeId);
  }
  
  emit('nodeToggle', node, expandedNodes.value.has(nodeId));
};

const selectNode = (nodeId: string) => {
  const node = props.tree.chapters.get(nodeId);
  if (!node) return;
  
  selectedNode.value = nodeId;
  emit('nodeSelect', node);
};

const expandAll = () => {
  expandedNodes.value.clear();
  addAllNodeIds(rootChildren.value, expandedNodes.value, 0);
};

const collapseAll = () => {
  expandedNodes.value.clear();
};

const addAllNodeIds = (nodes: MDNChapter[], set: Set<string>, level: number) => {
  if (level >= props.maxDepth) return;
  
  nodes.forEach(node => {
    set.add(node.id);
    if (node.children) {
      addAllNodeIds(node.children, set, level + 1);
    }
  });
};

const countVisibleNodes = (nodes: MDNChapter[], level: number): number => {
  if (level >= props.maxDepth) return 0;
  
  let count = nodes.length;
  
  nodes.forEach(node => {
    if (node.children && expandedNodes.value.has(node.id)) {
      count += countVisibleNodes(node.children, level + 1);
    }
  });
  
  return count;
};

const calculateMaxDepth = (nodes: MDNChapter[], level: number): number => {
  let maxDepth = level;
  
  nodes.forEach(node => {
    if (node.children && node.children.length > 0) {
      const childDepth = calculateMaxDepth(node.children, level + 1);
      maxDepth = Math.max(maxDepth, childDepth);
    }
  });
  
  return maxDepth;
};

// Initialize expanded nodes
const initializeExpanded = () => {
  if (props.defaultExpanded) {
    expandAll();
  }
};

// Watch for selected path changes
watch(() => props.selectedPath, (newPath) => {
  if (newPath) {
    const node = Array.from(props.tree.chapters.values())
      .find(chapter => chapter.path === newPath);
    if (node) {
      selectedNode.value = node.id;
      // Expand parent nodes
      expandParentNodes(node);
    }
  }
});

const expandParentNodes = (node: MDNChapter) => {
  if (node.parentId) {
    expandedNodes.value.add(node.parentId);
    const parent = props.tree.chapters.get(node.parentId);
    if (parent) {
      expandParentNodes(parent);
    }
  }
};

// Initialize on mount
onMounted(() => {
  initializeExpanded();
});
</script>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

// Tree Node Component
const TreeNode = defineComponent({
  name: 'TreeNode',
  props: {
    node: {
      type: Object as PropType<MDNChapter>,
      required: true
    },
    level: {
      type: Number,
      required: true
    },
    maxDepth: {
      type: Number,
      required: true
    },
    showCounts: {
      type: Boolean,
      default: false
    },
    showDescriptions: {
      type: Boolean,
      default: true
    },
    showTags: {
      type: Boolean,
      default: false
    },
    expandedNodes: {
      type: Set as PropType<Set<string>>,
      required: true
    },
    selectedNode: {
      type: String,
      default: null
    }
  },
  emits: ['toggle', 'select'],
  setup(props, { emit }) {
    const hasChildren = computed(() => {
      return props.node.children && props.node.children.length > 0;
    });
    
    const isExpanded = computed(() => {
      return props.expandedNodes.has(props.node.id);
    });
    
    const isSelected = computed(() => {
      return props.selectedNode === props.node.id;
    });
    
    const canExpand = computed(() => {
      return hasChildren.value && props.level < props.maxDepth;
    });
    
    const childrenCount = computed(() => {
      return props.node.children?.length || 0;
    });
    
    const toggleExpanded = () => {
      if (canExpand.value) {
        emit('toggle', props.node.id);
      }
    };
    
    const selectNode = () => {
      emit('select', props.node.id);
    };
    
    return {
      hasChildren,
      isExpanded,
      isSelected,
      canExpand,
      childrenCount,
      toggleExpanded,
      selectNode
    };
  },
  template: `
    <li class="tree-node" :class="{ 'is-selected': isSelected }">
      <div 
        class="node-content"
        :style="{ paddingLeft: level * 20 + 'px' }"
        @click="selectNode"
      >
        <button
          v-if="canExpand"
          class="expand-btn"
          @click.stop="toggleExpanded"
        >
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2"
            :class="{ 'is-expanded': isExpanded }"
          >
            <polyline points="9,18 15,12 9,6"/>
          </svg>
        </button>
        
        <div v-else class="expand-spacer"></div>
        
        <div class="node-info">
          <div class="node-header">
            <span class="node-title">{{ node.title }}</span>
            <span v-if="showCounts && childrenCount > 0" class="node-count">
              ({{ childrenCount }})
            </span>
            <span class="node-type">{{ node.pageType }}</span>
          </div>
          
          <div v-if="showDescriptions && node.description" class="node-description">
            {{ node.description }}
          </div>
          
          <div v-if="showTags && node.tags" class="node-tags">
            <span v-for="tag in node.tags.slice(0, 3)" :key="tag" class="node-tag">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
      
      <ul v-if="hasChildren && isExpanded && level < maxDepth" class="node-children">
        <TreeNode
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          :level="level + 1"
          :max-depth="maxDepth"
          :show-counts="showCounts"
          :show-descriptions="showDescriptions"
          :show-tags="showTags"
          :expanded-nodes="expandedNodes"
          :selected-node="selectedNode"
          @toggle="(id) => $emit('toggle', id)"
          @select="(id) => $emit('select', id)"
        />
      </ul>
    </li>
  `
});

export default TreeNode;
</script>

<style scoped>
.mdn-content-tree {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.tree-header h3 {
  margin: 0;
  color: #2c3e50;
}

.tree-controls {
  display: flex;
  gap: 0.5rem;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.tree-container {
  max-height: 600px;
  overflow-y: auto;
}

.tree-root,
.node-children {
  list-style: none;
  margin: 0;
  padding: 0;
}

.tree-node {
  border-bottom: 1px solid #f8f9fa;
}

.tree-node.is-selected > .node-content {
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
}

.node-content {
  display: flex;
  align-items: flex-start;
  padding: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.node-content:hover {
  background: #f8f9fa;
}

.expand-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: none;
  border: none;
  cursor: pointer;
  color: #6c757d;
  margin-right: 0.5rem;
  border-radius: 2px;
  transition: all 0.2s ease;
}

.expand-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.expand-btn svg {
  transition: transform 0.2s ease;
}

.expand-btn svg.is-expanded {
  transform: rotate(90deg);
}

.expand-spacer {
  width: 20px;
  margin-right: 0.5rem;
}

.node-info {
  flex: 1;
  min-width: 0;
}

.node-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.node-title {
  font-weight: 500;
  color: #2c3e50;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-count {
  font-size: 0.8rem;
  color: #6c757d;
}

.node-type {
  font-size: 0.75rem;
  color: #6c757d;
  background: #f8f9fa;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.node-description {
  font-size: 0.875rem;
  color: #6c757d;
  line-height: 1.4;
  margin-bottom: 0.25rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.node-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.node-tag {
  font-size: 0.75rem;
  color: #495057;
  background: #e9ecef;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

.tree-stats {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  font-size: 0.875rem;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stats-label {
  color: #6c757d;
}

.stats-value {
  font-weight: 500;
  color: #2c3e50;
}

/* Responsive design */
@media (max-width: 768px) {
  .tree-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .tree-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .control-btn {
    flex: 1;
    justify-content: center;
  }
  
  .node-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .tree-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .mdn-content-tree {
    background: #343a40;
    border-color: #495057;
  }
  
  .tree-header {
    background: #495057;
    border-color: #6c757d;
  }
  
  .tree-header h3,
  .node-title,
  .stats-value {
    color: #f8f9fa;
  }
  
  .control-btn {
    background: #495057;
    border-color: #6c757d;
    color: #f8f9fa;
  }
  
  .control-btn:hover {
    background: #5a6268;
  }
  
  .node-content:hover {
    background: #495057;
  }
  
  .tree-node.is-selected > .node-content {
    background: #1e3a5f;
    border-left-color: #007bff;
  }
  
  .node-description,
  .node-count,
  .stats-label {
    color: #ced4da;
  }
  
  .node-type,
  .node-tag {
    background: #495057;
    color: #ced4da;
  }
  
  .tree-stats {
    background: #495057;
    border-color: #6c757d;
  }
}
</style>