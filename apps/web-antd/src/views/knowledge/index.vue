<script lang="ts" setup>
import type { KnowledgeApi } from '#/api/biz/knowledge';

import { computed, h, onMounted, reactive, ref, watch } from 'vue';

import { Page } from '@vben/common-ui';
import { BookOpenText, RefreshCw, Search } from '@vben/icons';
import { cloneDeep } from '@vben/utils';

import { Button, Card, Empty, Input, Pagination, Tag } from 'ant-design-vue';

import { getKnowledgePage } from '#/api/biz/knowledge';
import { ContentWrap } from '#/components/content-wrap';

import KnowledgeDetailDrawer from './modules/detail-drawer.vue';

defineOptions({ name: 'KnowledgeList' });

const loading = ref(true); // 列表的加载中
const list = ref<KnowledgeApi.Knowledge[]>([]); // 列表的数据
const total = ref(0); // 列表的总页数
const searchKeyword = ref(''); // 搜索关键词
const queryParams = reactive({
  pageNo: 1,
  pageSize: 12, // 增加每页显示数量，适配卡片布局
});
const detailDrawerRef = ref<InstanceType<typeof KnowledgeDetailDrawer>>();

// 过滤后的列表数据
const filteredList = computed(() => {
  if (!searchKeyword.value.trim()) {
    return list.value;
  }
  const keyword = searchKeyword.value.toLowerCase().trim();
  return list.value.filter(
    (item) =>
      (item.title || '').toLowerCase().includes(keyword) ||
      (item.context || '').toLowerCase().includes(keyword),
  );
});

// 搜索防抖
const searchDebounced = ref('');
watch(
  searchKeyword,
  (newVal) => {
    clearTimeout(searchDebounced.value as any);
    searchDebounced.value = setTimeout(() => {
      // 搜索时重置分页
      if (newVal.trim()) {
        queryParams.pageNo = 1;
      }
    }, 300) as any;
  },
  { immediate: false },
);

/** 查询列表 */
const getList = async () => {
  loading.value = true;
  try {
    const params = cloneDeep(queryParams) as any;
    const data = await getKnowledgePage(params);
    list.value = data.list;
    total.value = data.total;
  } finally {
    loading.value = false;
  }
};

/** 查看知识库详情 */
const handleViewDetail = (row: KnowledgeApi.Knowledge) => {
  detailDrawerRef.value?.open(row.id as number);
};

/** 刷新列表 */
const handleRefresh = () => {
  searchKeyword.value = '';
  getList();
};

/** 清空搜索 */
const handleClearSearch = () => {
  searchKeyword.value = '';
};

/** 格式化内容预览 */
const formatContentPreview = (content?: string) => {
  if (!content) return '暂无内容';
  // 移除markdown语法，只保留纯文本
  const plainText = content
    .replaceAll(/[#*`_~[\]()]/g, '')
    .replaceAll(/\n+/g, ' ')
    .trim();
  return plainText.length > 100 ? `${plainText.slice(0, 100)}...` : plainText;
};

/** 初始化 */
onMounted(() => {
  getList();
});
</script>

<template>
  <Page auto-content-height>
    <!-- 详情抽屉 -->
    <KnowledgeDetailDrawer ref="detailDrawerRef" />

    <!-- 列表 -->
    <ContentWrap title="知识库">
      <template #extra>
        <Button :icon="h(RefreshCw)" type="primary" @click="handleRefresh">
          刷新
        </Button>
      </template>

      <!-- 搜索栏 -->
      <div class="mb-6">
        <Input
          v-model:value="searchKeyword"
          :prefix="h(Search)"
          placeholder="搜索知识库标题或内容..."
          size="large"
          allow-clear
          class="max-w-md"
          @clear="handleClearSearch"
        />
      </div>

      <!-- 卡片网格布局 -->
      <div v-if="!loading && filteredList.length > 0" class="knowledge-grid">
        <Card
          v-for="item in filteredList"
          :key="item.id"
          hoverable
          class="knowledge-card"
          @click="handleViewDetail(item)"
        >
          <template #title>
            <div class="flex items-center space-x-2">
              <BookOpenText class="h-4 w-4 text-blue-500" />
              <span class="truncate">{{ item.title || '未命名知识库' }}</span>
            </div>
          </template>

          <div class="knowledge-card-content">
            <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {{ formatContentPreview(item.context) }}
            </p>

            <div class="mt-4 flex items-center justify-between">
              <Tag color="blue" class="text-xs"> 知识库 </Tag>
              <div class="flex items-center space-x-1 text-xs text-gray-400">
                <Info class="h-3 w-3" />
                <span>ID: {{ item.id }}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- 空状态 -->
      <div
        v-else-if="!loading && filteredList.length === 0"
        class="empty-state"
      >
        <Empty
          :description="searchKeyword ? '未找到匹配的知识库' : '暂无知识库数据'"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
        >
          <Button
            v-if="searchKeyword"
            type="primary"
            @click="handleClearSearch"
          >
            清空搜索
          </Button>
        </Empty>
      </div>

      <!-- 加载状态 -->
      <div v-else class="loading-wrapper">
        <div class="py-16 text-center">
          <div
            class="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"
          ></div>
          <div class="mt-4 text-gray-500">加载中...</div>
        </div>
      </div>

      <!-- 分页 -->
      <div
        v-if="!searchKeyword && total > 0"
        class="mt-6 flex justify-center sm:justify-end"
      >
        <Pagination
          :total="total"
          v-model:current="queryParams.pageNo"
          v-model:page-size="queryParams.pageSize"
          :show-size-changer="false"
          :show-total="
            (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          "
          :simple="false"
          :responsive="true"
          class="pagination-responsive"
          @change="getList"
        />
      </div>
    </ContentWrap>
  </Page>
</template>

<style scoped>
@media (max-width: 768px) {
  .knowledge-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  /* 移动端分页优化 */
  :deep(.pagination-responsive .ant-pagination-total-text) {
    display: none;
  }

  :deep(.pagination-responsive .ant-pagination-options) {
    display: none;
  }
}

.knowledge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.knowledge-card {
  overflow: hidden;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.knowledge-card:hover {
  box-shadow: 0 8px 25px rgb(0 0 0 / 10%);
  transform: translateY(-2px);
}

.dark .knowledge-card:hover {
  box-shadow: 0 8px 25px rgb(0 0 0 / 30%);
}

.knowledge-card-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 120px;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.loading-wrapper {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.dark .loading-wrapper {
  background: #1f2937;
  border-color: #374151;
}

/* 搜索框样式优化 */
:deep(.ant-input-affix-wrapper) {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  transition: all 0.2s ease;
}

:deep(.ant-input-affix-wrapper:focus),
:deep(.ant-input-affix-wrapper-focused) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgb(59 130 246 / 10%);
}

.dark :deep(.ant-input-affix-wrapper) {
  color: #f3f4f6;
  background-color: #374151;
  border-color: #4b5563;
}

.dark :deep(.ant-input-affix-wrapper:focus),
.dark :deep(.ant-input-affix-wrapper-focused) {
  border-color: #60a5fa;
  box-shadow: 0 0 0 2px rgb(96 165 250 / 10%);
}
</style>
