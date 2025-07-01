<script lang="ts" setup>
import type { KnowledgeApi } from '#/api/biz/knowledge';

import { computed, nextTick, ref, watch } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { message } from 'ant-design-vue';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css'; // 导入代码高亮样式
import { marked } from 'marked';

import { getKnowledge } from '#/api/biz/knowledge';

defineOptions({
  name: 'KnowledgeDetailDrawer',
});

const knowledgeDetail = ref<KnowledgeApi.Knowledge>();
const loading = ref(false);
const markdownContainer = ref<HTMLElement>();

// 配置marked渲染器
const renderer = new marked.Renderer();

// 配置marked选项
marked.setOptions({
  renderer,
  highlight: function (code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-',
  pedantic: false,
  gfm: true,
  breaks: false,
  sanitize: false,
  smartypants: false,
  xhtml: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  title: '知识库详情',
  class: 'w-[95vw] max-w-[800px] sm:w-[800px]', // 响应式宽度
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = drawerApi.getData<{ id: number }>();
      if (data?.id) {
        loadKnowledgeDetail(data.id);
      }
    }
  },
});

/** 加载知识库详情 */
const loadKnowledgeDetail = async (id: number) => {
  try {
    loading.value = true;
    knowledgeDetail.value = await getKnowledge(id);
    drawerApi.setState({
      title: knowledgeDetail.value?.title || '知识库详情',
      loading: false,
    });
  } catch (error) {
    console.error('加载知识库详情失败:', error);
  } finally {
    loading.value = false;
  }
};

/** 渲染markdown内容 */
const renderedMarkdown = computed(() => {
  if (!knowledgeDetail.value?.context) {
    return '';
  }
  return marked(knowledgeDetail.value.context);
});

/** 复制代码到剪贴板 */
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    message.success('复制成功！');
  } catch (error) {
    console.error('复制失败:', error);
    message.error('复制失败，请手动复制');
  }
};

/** 为代码块添加复制按钮 */
const addCopyButtons = () => {
  if (!markdownContainer.value) return;

  const codeBlocks = markdownContainer.value.querySelectorAll('pre');

  codeBlocks.forEach((pre) => {
    // 检查是否已经添加过复制按钮
    if (pre.querySelector('.copy-btn')) return;

    const code = pre.querySelector('code');
    if (!code) return;

    // 设置pre的相对定位
    pre.style.position = 'relative';
    pre.style.paddingTop = '2.5rem'; // 为按钮留出空间

    // 创建复制按钮容器
    const btnContainer = document.createElement('div');
    btnContainer.className = 'copy-btn-container absolute top-2 right-2 z-10';

    // 创建复制按钮
    const copyBtn = document.createElement('button');
    copyBtn.className =
      'copy-btn flex items-center space-x-1 bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded-md opacity-80 hover:opacity-100 transition-all duration-200 border border-gray-600 hover:border-gray-500';

    // 添加图标和文字
    copyBtn.innerHTML = `
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
      </svg>
      <span>复制</span>
    `;

    // 添加点击事件
    copyBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const codeText = code.textContent || '';
      await copyToClipboard(codeText);

      // 临时改变按钮状态
      const originalHTML = copyBtn.innerHTML;
      copyBtn.innerHTML = `
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>已复制</span>
      `;
      copyBtn.className = copyBtn.className.replace(
        'bg-gray-700 hover:bg-gray-600',
        'bg-green-600 hover:bg-green-500',
      );

      setTimeout(() => {
        copyBtn.innerHTML = originalHTML;
        copyBtn.className = copyBtn.className.replace(
          'bg-green-600 hover:bg-green-500',
          'bg-gray-700 hover:bg-gray-600',
        );
      }, 2000);
    });

    btnContainer.appendChild(copyBtn);
    pre.appendChild(btnContainer);
  });
};

// 监听 markdown 内容变化，添加复制按钮
watch(renderedMarkdown, () => {
  nextTick(() => {
    addCopyButtons();
  });
});

defineExpose({
  open: (id: number) => {
    drawerApi.setData({ id }).open();
  },
});
</script>

<template>
  <Drawer
    :loading="loading"
    :show-confirm-button="false"
    :show-cancel-button="false"
  >
    <div v-if="knowledgeDetail" class="flex h-full flex-col">
      <!-- 知识库内容 -->
      <div
        class="flex-1 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800"
      >
        <div v-if="knowledgeDetail.context" class="h-full overflow-y-auto">
          <!-- 使用marked库渲染markdown内容 -->
          <div
            ref="markdownContainer"
            v-html="renderedMarkdown"
            class="markdown-content max-w-none p-6 text-sm leading-relaxed text-gray-800 dark:text-gray-200"
          ></div>
        </div>
        <div
          v-else
          class="flex h-full items-center justify-center text-gray-500"
        >
          <div class="text-center">
            <div class="mb-2 text-lg">📄</div>
            <div>暂无内容</div>
          </div>
        </div>
      </div>
    </div>
  </Drawer>
</template>

<style scoped>
/* 滚动条样式 */
:deep(.overflow-y-auto)::-webkit-scrollbar {
  @apply w-1.5;
}

:deep(.overflow-y-auto)::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-800;
}

:deep(.overflow-y-auto)::-webkit-scrollbar-thumb {
  @apply rounded-sm bg-gray-300 dark:bg-gray-600;
}

:deep(.overflow-y-auto)::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-gray-500;
}

/* Markdown 内容样式 */
:deep(.markdown-content) {
  line-height: 1.7;
}

/* 标题样式 */
:deep(.markdown-content h1) {
  @apply mb-4 mt-8 border-b border-gray-200 pb-2 text-2xl font-bold text-blue-600 dark:border-gray-600 dark:text-blue-400;
}

:deep(.markdown-content h2) {
  @apply mb-3 mt-6 text-xl font-semibold text-blue-500 dark:text-blue-300;
}

:deep(.markdown-content h3) {
  @apply mb-3 mt-5 text-lg font-semibold text-indigo-500 dark:text-indigo-400;
}

:deep(.markdown-content h4) {
  @apply mb-2 mt-4 text-base font-semibold text-gray-700 dark:text-gray-300;
}

:deep(.markdown-content h5) {
  @apply mb-2 mt-3 text-sm font-semibold text-gray-600 dark:text-gray-400;
}

:deep(.markdown-content h6) {
  @apply mb-2 mt-3 text-sm font-medium text-gray-500 dark:text-gray-500;
}

/* 段落样式 */
:deep(.markdown-content p) {
  @apply my-4 leading-7;
}

/* 列表样式 */
:deep(.markdown-content ul) {
  @apply my-4 space-y-1 pl-6;
}

:deep(.markdown-content ol) {
  @apply my-4 space-y-1 pl-6;
}

:deep(.markdown-content li) {
  @apply leading-6;
}

:deep(.markdown-content ul li) {
  @apply list-disc;
}

:deep(.markdown-content ol li) {
  @apply list-decimal;
}

/* 行内代码样式 */
:deep(.markdown-content code:not(pre code)) {
  @apply rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-red-600 dark:border-gray-700 dark:bg-gray-800 dark:text-red-400;
}

/* 代码块样式 */
:deep(.markdown-content pre) {
  @apply relative my-4 overflow-x-auto rounded-lg border border-gray-700 bg-gray-900 p-4 text-gray-100 dark:border-gray-800 dark:bg-gray-950;
  font-family: 'Fira Code', 'Monaco', 'Consolas', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
}

:deep(.markdown-content pre code) {
  @apply rounded-none border-0 bg-transparent p-0 text-inherit;
  font-family: inherit;
}

/* 引用样式 */
:deep(.markdown-content blockquote) {
  @apply my-4 rounded-r border-l-4 border-blue-400 bg-gray-50 py-2 pl-4 italic text-gray-600 dark:border-blue-500 dark:bg-gray-800 dark:text-gray-400;
}

/* 表格样式 */
:deep(.markdown-content table) {
  @apply my-4 w-full border-collapse overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600;
}

:deep(.markdown-content th) {
  @apply border-b border-gray-300 bg-gray-50 px-4 py-2 text-left font-semibold dark:border-gray-600 dark:bg-gray-700;
}

:deep(.markdown-content td) {
  @apply border-b border-gray-200 px-4 py-2 dark:border-gray-700;
}

:deep(.markdown-content tr:last-child td) {
  @apply border-b-0;
}

/* 分割线样式 */
:deep(.markdown-content hr) {
  @apply my-6 border-0 border-t border-gray-300 dark:border-gray-600;
}

/* 链接样式 */
:deep(.markdown-content a) {
  @apply text-blue-600 underline transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300;
}

/* 图片样式 */
:deep(.markdown-content img) {
  @apply my-4 h-auto max-w-full rounded-lg shadow-sm;
}

/* 强调样式 */
:deep(.markdown-content strong) {
  @apply font-bold text-gray-900 dark:text-gray-100;
}

:deep(.markdown-content em) {
  @apply italic;
}

/* 删除线样式 */
:deep(.markdown-content del) {
  @apply text-gray-500 line-through dark:text-gray-400;
}

/* 移动端优化 */
@media (max-width: 768px) {
  :deep(.markdown-content) {
    @apply p-4 text-sm;
  }

  :deep(.markdown-content h1) {
    @apply mb-3 mt-6 text-xl;
  }

  :deep(.markdown-content h2) {
    @apply mb-2 mt-5 text-lg;
  }

  :deep(.markdown-content h3) {
    @apply mb-2 mt-4 text-base;
  }

  :deep(.markdown-content pre) {
    @apply p-3 text-xs;
    font-size: 12px;
  }

  :deep(.markdown-content table) {
    @apply text-xs;
  }

  :deep(.markdown-content th),
  :deep(.markdown-content td) {
    @apply px-2 py-1;
  }

  /* 移动端复制按钮优化 */
  :deep(.copy-btn) {
    @apply px-2 py-1 text-xs;
  }

  :deep(.copy-btn svg) {
    @apply h-2.5 w-2.5;
  }
}
</style>
