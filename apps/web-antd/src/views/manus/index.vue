<script setup lang="ts">
import type { BubbleListProps, PromptsProps } from 'ant-design-x-vue';

import type { ManusApi } from '#/api/biz/manus';

import { computed, h, onUnmounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { message as antMessage, Card, Space, Tag } from 'ant-design-vue';
import {
  Bubble,
  Prompts,
  Sender,
  useXAgent,
  useXChat,
  Welcome,
} from 'ant-design-x-vue';
import hljs from 'highlight.js';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';

import { jManusStream } from '#/api/biz/manus';

defineOptions({ name: 'AIAssistant' });

// 配置 marked
marked.use(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  }),
);

const renderLabel = (iconName: string, title: string) =>
  h(Space, { align: 'start' }, () => [
    h(IconifyIcon, { icon: iconName }),
    h('span', title),
  ]);

const placeholderPromptsItems: PromptsProps['items'] = [
  {
    key: '1',
    label: renderLabel('lucide:flame', '时间助手'),
    description: '查询时间',
    children: [
      {
        key: '1-1',
        description: '告诉我现在的北京时间？',
      },
      {
        key: '1-2',
        description: '告诉我现在的纽约时间？',
      },
      {
        key: '1-3',
        description: '告诉我现在的东京时间？',
      },
    ],
  },
  {
    key: '2',
    label: renderLabel('lucide:book-open', '天气助手'),
    description: '查询天气',
    children: [
      {
        key: '2-1',
        icon: h(IconifyIcon, { icon: 'lucide:heart' }),
        description: '告诉我现在泰安的天气？',
      },
      {
        key: '2-2',
        icon: h(IconifyIcon, { icon: 'lucide:smile' }),
        description: '告诉我现在北京的天气？',
      },
      {
        key: '2-3',
        icon: h(IconifyIcon, { icon: 'lucide:message-circle' }),
        description: '告诉我现在上海的天气？',
      },
    ],
  },
  {
    key: '3',
    label: renderLabel('lucide:file-text', '新闻助手'),
    description: '查询新闻',
    children: [
      {
        key: '3-1',
        description: '整理最新的AI领域新闻？',
      },
      {
        key: '3-2',
        description: '整理最新的体育领域新闻？',
      },
      {
        key: '3-3',
        description: '整理最新的科技领域新闻？',
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
  system: {
    placement: 'start',
    variant: 'borderless',
    styles: {
      content: {
        borderRadius: '8px',
        backgroundColor: '#f0f4f8',
        border: '1px solid #e2e8f0',
        padding: '12px 16px',
        maxWidth: '70%',
      },
    },
  },
};

// ==================== State ====================
const content = ref('');
const agentRequestLoading = ref(false);
const sseCloseFunc = ref<(() => void) | null>(null);
// 存储每个对话的流式消息
const conversationMessages = ref<
  Map<
    string,
    Array<{
      content: string;
      id: string;
      role: 'ai' | 'user';
      type?: 'AGENT' | 'SYSTEM';
    }>
  >
>(new Map());
// 当前对话的流式消息
const currentConversationId = ref<null | string>(null);

// ==================== Runtime ====================
const [agent] = useXAgent({
  request: async ({ message }, { onUpdate, onSuccess, onError }) => {
    agentRequestLoading.value = true;

    // 为新对话创建唯一ID
    currentConversationId.value = `conv-${Date.now()}`;
    conversationMessages.value.set(currentConversationId.value, []);

    // 关闭之前的连接
    if (sseCloseFunc.value) {
      sseCloseFunc.value();
      sseCloseFunc.value = null;
    }

    try {
      sseCloseFunc.value = jManusStream({
        userMessage: message as string,
        onMessage: (data: ManusApi.SSEData) => {
          const currentMessages = conversationMessages.value.get(
            currentConversationId.value!,
          );
          if (!currentMessages) return;

          if (data.type === 'SYSTEM') {
            // 添加系统消息
            currentMessages.push({
              id: `system-${Date.now()}-${data.step}`,
              role: 'ai',
              content: data.result,
              type: 'SYSTEM',
            });
          } else if (data.type === 'AGENT') {
            // 添加助手消息
            currentMessages.push({
              id: `agent-${Date.now()}-${data.step}`,
              role: 'ai',
              content: data.result,
              type: 'AGENT',
            });
            // 更新显示（触发重新渲染）
            onUpdate('streaming');
          }
        },
        onError: (error) => {
          console.error('SSE error:', error);
          agentRequestLoading.value = false;
          antMessage.error(`连接失败：${error.message || '未知错误'}`);
          onError(error);
        },
        onClose: () => {
          agentRequestLoading.value = false;
          const currentMessages = conversationMessages.value.get(
            currentConversationId.value!,
          );
          if (currentMessages && currentMessages.length > 0) {
            onSuccess('completed');
          } else {
            onError(new Error('连接关闭，未收到回复'));
          }
        },
      });
    } catch (error) {
      agentRequestLoading.value = false;
      onError(error as Error);
    }
  },
});

const { onRequest, messages } = useXChat({
  agent: agent?.value,
});

// 组件卸载时清理SSE连接
onUnmounted(() => {
  if (sseCloseFunc.value) {
    sseCloseFunc.value();
    sseCloseFunc.value = null;
  }
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

const items = computed<BubbleListProps['items']>(() => {
  if (!messages.value) return [];

  const result: BubbleListProps['items'] = [];

  messages.value.forEach(({ id, message, status }, index) => {
    // 添加用户消息
    switch (status) {
      case 'loading': {
        // 获取当前对话的消息
        const currentMessages = conversationMessages.value.get(
          currentConversationId.value!,
        );
        if (currentMessages && currentMessages.length > 0) {
          // 正在加载时，显示当前对话的流式消息
          currentMessages.forEach((msg) => {
            if (msg.type === 'SYSTEM') {
              // 系统消息使用方形气泡样式
              result.push({
                key: msg.id,
                role: 'system',
                content: h('div', { class: 'system-message-content' }, [
                  h(Tag, { color: 'blue', size: 'small' }, () => '系统'),
                  h(
                    'span',
                    { class: 'ml-2 text-sm text-gray-700' },
                    msg.content,
                  ),
                ]),
              });
            } else {
              // 助手消息
              result.push({
                key: msg.id,
                role: 'ai',
                content: h('div', {
                  innerHTML: marked(msg.content),
                  class: 'markdown-content',
                }),
              });
            }
          });
        } else {
          // 如果没有流式消息，显示加载中
          result.push({
            key: `${id}-ai`,
            loading: true,
            role: 'ai',
            content: '正在思考...',
          });
        }

        break;
      }
      case 'local': {
        result.push({
          key: `${id}-user`,
          role: 'local',
          content: message,
        });

        break;
      }
      case 'success': {
        // 完成时，显示该对话对应的所有流式消息
        // 找到对应的会话ID（基于消息顺序）
        const convIds = [...conversationMessages.value.keys()];
        const currentMessage = messages.value[index];
        if (!currentMessage) return;
        const convIndex = messages.value
          .filter((m) => m.status === 'success')
          .indexOf(currentMessage);
        if (convIndex !== -1 && convIndex < convIds.length) {
          const convId = convIds[convIndex];
          const convMessages = conversationMessages.value.get(convId!);
          if (convMessages) {
            convMessages.forEach((msg) => {
              if (msg.type === 'SYSTEM') {
                // 系统消息使用方形气泡样式
                result.push({
                  key: msg.id,
                  role: 'system',
                  content: h('div', { class: 'system-message-content' }, [
                    h(Tag, { color: 'blue', size: 'small' }, () => '系统'),
                    h(
                      'span',
                      { class: 'ml-2 text-sm text-gray-700' },
                      msg.content,
                    ),
                  ]),
                });
              } else {
                // 助手消息
                result.push({
                  key: msg.id,
                  role: 'ai',
                  content: h('div', {
                    innerHTML: marked(msg.content),
                    class: 'markdown-content',
                  }),
                });
              }
            });
          }
        }

        break;
      }
      // No default
    }
  });

  return result;
});
</script>

<template>
  <Page class="h-full">
    <!-- 聊天容器 -->
    <Card class="flex h-full flex-col" :bordered="false">
      <!-- Body - 消息区域 -->
      <div class="min-h-0 flex-1 overflow-y-auto p-6">
        <!-- 消息列表 -->
        <Bubble.List
          v-if="items && items.length > 0"
          :items="items"
          :roles="roles"
          style="max-height: calc(100vh - 240px); overflow-y: auto"
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
              @item-click="onPromptsItemClick"
            />
          </Space>
        </div>
      </div>

      <!-- Footer - 对话框区域，固定在卡片底部 -->
      <div class="absolute bottom-4 left-4 right-4 rounded px-4 py-2">
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

<style scoped>
.system-message-content {
  display: flex;
  align-items: center;
  width: 100%;
}

:deep(.ant-bubble-content) {
  max-width: 80%;
}

:deep(.markdown-content) {
  line-height: 1.6;
}

:deep(.markdown-content h1),
:deep(.markdown-content h2),
:deep(.markdown-content h3),
:deep(.markdown-content h4),
:deep(.markdown-content h5),
:deep(.markdown-content h6) {
  margin-top: 16px;
  margin-bottom: 8px;
  font-weight: 600;
}

:deep(.markdown-content p) {
  margin-bottom: 8px;
}

:deep(.markdown-content ul),
:deep(.markdown-content ol) {
  padding-left: 20px;
  margin-bottom: 8px;
}

:deep(.markdown-content li) {
  margin-bottom: 4px;
}

:deep(.markdown-content code) {
  padding: 2px 4px;
  font-size: 0.9em;
  background-color: #f0f0f0;
  border-radius: 3px;
}

:deep(.markdown-content pre) {
  padding: 12px;
  margin-bottom: 8px;
  overflow-x: auto;
  background-color: #f5f5f5;
  border-radius: 4px;
}

:deep(.markdown-content pre code) {
  padding: 0;
  background-color: transparent;
}

:deep(.markdown-content blockquote) {
  padding-left: 16px;
  margin: 8px 0;
  color: #666;
  border-left: 4px solid #e0e0e0;
}

:deep(.markdown-content a) {
  color: #1890ff;
  text-decoration: none;
}

:deep(.markdown-content a:hover) {
  text-decoration: underline;
}

:deep(.markdown-content strong) {
  font-weight: 600;
}

:deep(.markdown-content em) {
  font-style: italic;
}
</style>
