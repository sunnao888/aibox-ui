<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

import { Page, Spinner } from '@vben/common-ui';

import {
  Alert,
  Button,
  Card,
  Empty,
  Input,
  message,
  Space,
  Tag,
  Typography,
} from 'ant-design-vue';

import { WritePoemApi } from '#/api/recreation/writePoem';
import { WorkTemplateApi } from '#/api/work/template';
import { $t } from '#/locales';

// 响应式状态
const userMessage = ref<string>('');
const loading = ref(false);
const templatesLoading = ref(false);
const generatedResult = ref<string>('');
const templates = ref<WorkTemplateApi.TemplateRespVO[]>([]);
const selectedTemplate = ref<null | WorkTemplateApi.TemplateRespVO>(null);

// 计算属性
const showResult = computed(() => generatedResult.value !== '');

const placeholderText = computed(
  () =>
    '请详细描述您的诗歌创作需求，包括主题内容、诗歌风格（如古体诗、现代诗、自由诗等）、情感基调、意境要求等，系统将为您创作优美的诗歌作品...',
);

// 获取推荐模板列表
async function fetchTemplates() {
  try {
    templatesLoading.value = true;
    const params: WorkTemplateApi.TemplateRecommendReqVO = {
      type: 4, // 写诗模板类型
    };
    const response = await WorkTemplateApi.getRecommendTemplates(params);
    templates.value = response;
  } catch (error) {
    console.error('获取模板列表失败:', error);
    message.error('获取模板列表失败');
  } finally {
    templatesLoading.value = false;
  }
}

// 选择模板
function selectTemplate(template: WorkTemplateApi.TemplateRespVO) {
  // 如果点击的是已选中的模板，则取消选中
  if (selectedTemplate.value?.id === template.id) {
    selectedTemplate.value = null;
    message.success('已取消模板选择');
    return;
  }

  // 选中新模板
  selectedTemplate.value = template;

  if (template.input) {
    userMessage.value = template.input;
  }

  message.success(`已选择模板：${template.name}`);
}

// 生成AI写诗
async function handleGenerate() {
  if (!userMessage.value.trim()) {
    message.warning('请输入诗歌创作需求描述');
    return;
  }

  try {
    loading.value = true;
    generatedResult.value = '';

    const data: WritePoemApi.WritePoemGenerateReqVO = {
      userMessage: userMessage.value,
    };

    const response = await WritePoemApi.generateWritePoem(data);
    generatedResult.value = response;
    message.success('AI写诗生成成功！');
  } catch (error) {
    console.error('生成AI写诗失败:', error);
    message.error('AI写诗生成失败，请稍后重试');
  } finally {
    loading.value = false;
  }
}

// 重置表单
function handleReset() {
  userMessage.value = '';
  generatedResult.value = '';
  selectedTemplate.value = null;
}

// 复制结果内容
async function handleCopyResult() {
  try {
    await navigator.clipboard.writeText(generatedResult.value);
    message.success('内容已复制到剪贴板');
  } catch {
    message.error('复制失败，请手动选择复制');
  }
}

// 页面初始化
onMounted(() => {
  fetchTemplates();
});
</script>

<template>
  <Page
    :title="$t('AI 写诗助手')"
    description="🎭 使用 AI 为您创作优美的诗歌作品，支持多种诗歌风格和主题。"
    auto-content-height
  >
    <div class="space-y-6">
      <!-- 诗歌创作输入区域 -->
      <Card>
        <div class="space-y-6">
          <!-- 选中的模板提示 -->
          <Alert v-if="selectedTemplate" type="info" show-icon>
            <template #message>
              <Space>
                <span>当前模板：</span>
                <Tag color="blue">{{ selectedTemplate.name }}</Tag>
              </Space>
            </template>
          </Alert>

          <!-- 诗歌创作需求输入 -->
          <div>
            <div class="mb-2 text-sm font-medium text-gray-700">
              诗歌创作需求描述
            </div>
            <Input.TextArea
              v-model:value="userMessage"
              :placeholder="placeholderText"
              :auto-size="{ minRows: 6, maxRows: 12 }"
              :max-length="2000"
              show-count
              :disabled="loading"
            />
          </div>

          <!-- 操作按钮 -->
          <div class="flex space-x-4 pt-2">
            <Button
              type="primary"
              size="large"
              :loading="loading"
              @click="handleGenerate"
            >
              <template #icon>
                <span>🎭</span>
              </template>
              {{ loading ? '正在生成中...' : '开始生成' }}
            </Button>
            <Button size="large" :disabled="loading" @click="handleReset">
              重置
            </Button>
          </div>
        </div>
      </Card>

      <!-- 生成中的动画 -->
      <Card v-if="loading">
        <div class="flex flex-col items-center justify-center py-12">
          <Spinner :spinning="true" size="large" />
          <div class="mt-4 text-center">
            <Typography.Title :level="4">
              AI 正在为您创作诗歌...
            </Typography.Title>
            <Typography.Text type="secondary">
              请稍候，正在分析您的创作需求并生成优美的诗歌作品
            </Typography.Text>
          </div>
        </div>
      </Card>

      <!-- 结果展示区域 -->
      <Card v-if="showResult && !loading">
        <template #title>
          <Space>
            <span>🎭</span>
            <span>AI写诗结果</span>
          </Space>
        </template>

        <template #extra>
          <Space>
            <Button type="text" size="small" @click="handleCopyResult">
              📋 复制
            </Button>
            <Button type="text" size="small" @click="handleReset">
              🔄 重新生成
            </Button>
          </Space>
        </template>

        <!-- 结果内容展示 -->
        <div class="mb-3">
          <div class="mb-2 text-sm font-medium text-gray-600">
            📝 生成的诗歌作品：
          </div>
          <div
            class="rounded bg-gray-50 p-4 text-sm text-gray-700"
            style="border-left: 3px solid #1890ff"
          >
            <pre
              class="m-0 whitespace-pre-wrap break-words font-sans leading-relaxed"
              >{{ generatedResult }}
            </pre>
          </div>
        </div>
      </Card>

      <!-- 使用案例展示区域 -->
      <Card title="🎯 使用案例">
        <template #extra>
          <Button
            size="small"
            @click="fetchTemplates"
            :loading="templatesLoading"
            type="text"
          >
            🔄 刷新
          </Button>
        </template>

        <!-- 注意事项 -->
        <Alert type="info" show-icon class="mb-4">
          <template #message>
            <div class="text-sm">
              <strong>💡 使用说明：</strong>
              <div class="mt-1 text-gray-600">
                • 点击下方模板可快速填入示例内容，帮助您更好地描述创作需求<br />
                • AI 会根据您的描述创作符合要求的诗歌作品<br />
                • 建议详细描述主题、风格、情感基调和意境要求<br />
                • 如果您有优秀的写诗模板，欢迎联系我们添加到模板库中
              </div>
            </div>
          </template>
        </Alert>

        <!-- 模板加载中 -->
        <div
          v-if="templatesLoading"
          class="flex flex-col items-center justify-center py-12 text-center"
        >
          <Spinner :spinning="true" />
          <div class="mt-3 text-gray-500">正在加载模板...</div>
        </div>

        <!-- 模板列表 - 单列垂直布局 -->
        <div v-else-if="templates.length > 0" class="space-y-4">
          <div
            v-for="template in templates"
            :key="template.id"
            class="cursor-pointer rounded border p-4 transition-all hover:shadow-md"
            :class="{
              'border-blue-500 bg-blue-50':
                selectedTemplate?.id === template.id,
              'border-gray-200 hover:border-blue-300':
                selectedTemplate?.id !== template.id,
            }"
            @click="selectTemplate(template)"
          >
            <!-- 模板头部 -->
            <div class="mb-3 flex items-center justify-between">
              <Typography.Title :level="5" class="mb-0 text-gray-800">
                {{ template.name }}
              </Typography.Title>
              <div
                v-if="selectedTemplate?.id === template.id"
                class="text-green-500"
              >
                ✅
              </div>
            </div>

            <!-- 标签 -->
            <div v-if="template.tags?.length" class="mb-3">
              <Tag
                v-for="tag in template.tags"
                :key="tag.id"
                size="small"
                :color="tag.status === 1 ? 'blue' : 'default'"
                class="mb-1 mr-1"
              >
                {{ tag.name }}
              </Tag>
            </div>

            <!-- 输入示例 -->
            <div class="mb-3">
              <div class="mb-1 text-xs font-medium text-gray-500">
                💡 输入示例：
              </div>
              <div
                class="rounded bg-gray-50 p-3 text-sm text-gray-600"
                style="border-left: 3px solid #e5e7eb"
              >
                <pre
                  class="m-0 whitespace-pre-wrap break-words font-sans leading-relaxed"
                  >{{ template.input }}
                </pre>
              </div>
            </div>

            <!-- 输出示例 -->
            <div>
              <div class="mb-1 text-xs font-medium text-gray-500">
                📄 输出示例：
              </div>
              <div
                class="rounded bg-gray-50 p-3 text-sm text-gray-600"
                style="border-left: 3px solid #e5e7eb"
              >
                <pre
                  class="m-0 whitespace-pre-wrap break-words font-sans leading-relaxed"
                  >{{ template.output }}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <Empty v-else description="暂无可用模板" />
      </Card>
    </div>
  </Page>
</template>

<style scoped>
/* 保持简洁，移除所有动画效果 */
</style>
