<script setup lang="ts">
import type { BubbleListProps, PromptsProps } from 'ant-design-x-vue';

import { computed, h, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Card, Space } from 'ant-design-vue';
import {
  Bubble,
  Prompts,
  Sender,
  useXAgent,
  useXChat,
  Welcome,
} from 'ant-design-x-vue';

defineOptions({ name: 'AIAssistant' });

const renderLabel = (iconName: string, title: string) =>
  h(Space, { align: 'start' }, () => [
    h(IconifyIcon, { icon: iconName }),
    h('span', title),
  ]);

const placeholderPromptsItems: PromptsProps['items'] = [
  {
    key: '1',
    label: renderLabel('lucide:flame', '热门话题'),
    description: '探索当下热点',
    children: [
      {
        key: '1-1',
        description: '最新科技趋势是什么？',
      },
      {
        key: '1-2',
        description: 'AI如何改变我们的生活？',
      },
      {
        key: '1-3',
        description: '未来十年的发展方向？',
      },
    ],
  },
  {
    key: '2',
    label: renderLabel('lucide:book-open', '学习助手'),
    description: '获取知识与技能',
    children: [
      {
        key: '2-1',
        icon: h(IconifyIcon, { icon: 'lucide:heart' }),
        description: '如何提升学习效率？',
      },
      {
        key: '2-2',
        icon: h(IconifyIcon, { icon: 'lucide:smile' }),
        description: '推荐一些学习资源',
      },
      {
        key: '2-3',
        icon: h(IconifyIcon, { icon: 'lucide:message-circle' }),
        description: '解释一个复杂概念',
      },
    ],
  },
  {
    key: '3',
    label: renderLabel('lucide:file-text', '写作助手'),
    description: '提升创作能力',
    children: [
      {
        key: '3-1',
        description: '帮我润色这段文字',
      },
      {
        key: '3-2',
        description: '生成一份工作报告',
      },
      {
        key: '3-3',
        description: '创作一个故事开头',
      },
    ],
  },
];

const roles: BubbleListProps['roles'] = {
  ai: {
    placement: 'start',
    typing: { step: 5, interval: 20 },
    styles: {
      content: {
        borderRadius: '16px 16px 16px 4px',
      },
    },
  },
  local: {
    placement: 'end',
    variant: 'shadow',
    styles: {
      content: {
        borderRadius: '16px 16px 4px 16px',
      },
    },
  },
};

// ==================== State ====================
const content = ref('');
const agentRequestLoading = ref(false);

// ==================== Runtime ====================
const [agent] = useXAgent({
  request: async ({ message }, { onUpdate, onSuccess }) => {
    agentRequestLoading.value = true;

    // 模拟打字效果
    const mockResponse = `感谢您的提问！关于 "${message}"，我来为您详细解答：

这是一个非常好的问题。让我从几个方面来为您分析：

1. **核心概念**：首先，我们需要理解相关的基础知识...
2. **实际应用**：在实际场景中，这个概念可以这样应用...
3. **注意事项**：使用时需要特别注意以下几点...

希望这个回答对您有所帮助！如果您还有其他问题，请随时告诉我。`;

    let currentText = '';
    const words = [...mockResponse];

    for (const word of words) {
      await new Promise((resolve) => setTimeout(resolve, 30));
      currentText += word;
      onUpdate(currentText);
    }

    agentRequestLoading.value = false;
    onSuccess(currentText);
  },
});

const { onRequest, messages } = useXChat({
  agent: agent?.value,
});

// ==================== Event ====================
const onSubmit = (nextContent: string) => {
  if (!nextContent) return;
  onRequest(nextContent);
  content.value = '';
};

const onPromptsItemClick: PromptsProps['onItemClick'] = (info) => {
  onRequest(info.data.description as string);
};

// ==================== Computed ====================
const welcomeIcon = computed(() =>
  h(IconifyIcon, {
    icon: 'lucide:bot',
    style: {
      fontSize: '48px',
    },
  }),
);

const items = computed<BubbleListProps['items']>(
  () =>
    messages.value?.map(({ id, message, status }) => ({
      key: id,
      loading: status === 'loading',
      role: status === 'local' ? 'local' : 'ai',
      content: message,
    })) || [],
);
</script>

<template>
  <Page auto-content-height>
    <!-- 聊天容器 -->
    <Card class="flex h-full flex-col" :bordered="false">
      <!-- Body - 消息区域 -->
      <div class="min-h-0 flex-1 overflow-y-auto p-6">
        <!-- 消息列表 -->
        <Bubble.List
          v-if="items && items.length > 0"
          :items="items"
          :roles="roles"
          class="h-full"
        />
        <!-- 欢迎页面 -->
        <div v-else class="flex h-full flex-col justify-center">
          <Space direction="vertical" :size="20" style="width: 100%">
            <Welcome
              description="我是用Spring AI构建的通用助理，你可以把我看做Open Manus的Java实现。有什么可以帮助您的吗？"
              :icon="welcomeIcon"
              title="您好，我是JManus"
              variant="borderless"
            />
            <Prompts
              :items="placeholderPromptsItems"
              :styles="{
                list: { width: '100%' },
                item: {
                  flex: 1,
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  transition: 'all 0.3s',
                },
              }"
              title="您可能想了解"
              @item-click="onPromptsItemClick"
            />
          </Space>
        </div>
      </div>

      <!-- Footer - 对话框区域，固定在卡片底部 -->
      <div class="absolute bottom-4 left-4 right-4 rounded px-4 py-2 font-bold">
        <!-- 输入框 -->
        <Sender
          v-model:value="content"
          :loading="agentRequestLoading"
          placeholder="输入您的问题，我会尽力为您解答..."
          class="rounded-lg border shadow-sm"
          @submit="onSubmit"
        />
      </div>
    </Card>
  </Page>
</template>
