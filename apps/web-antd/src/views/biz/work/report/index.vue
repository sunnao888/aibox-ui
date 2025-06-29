<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';

import { ColPage, Spinner } from '@vben/common-ui';

import {
  Alert,
  Button,
  Card,
  Empty,
  Input,
  message,
  Radio,
  RadioGroup,
  Select,
  Space,
  Tag,
  Typography,
} from 'ant-design-vue';

import { WorkReportApi } from '#/api/work/report';
import { WorkTemplateApi } from '#/api/work/template';
import { $t } from '#/locales';

// 报告类型配置
const REPORT_TYPES = [
  { label: '日报', value: '日报', icon: '📊' },
  { label: '周报', value: '周报', icon: '📈' },
  { label: '月报', value: '月报', icon: '📋' },
] as const;

// 响应式状态
const reportType = ref<string>('日报');
const userMessage = ref<string>('');
const templateId = ref<number>(1);
const loading = ref(false);
const templatesLoading = ref(false);
const generatedReport = ref<string>('');
const templates = ref<WorkTemplateApi.TemplateRespVO[]>([]);
const selectedTemplate = ref<null | WorkTemplateApi.TemplateRespVO>(null);
const allTags = ref<WorkTemplateApi.TagRespVO[]>([]);
const selectedTagIds = ref<number[]>([]);

// 计算属性
const showReport = computed(() => generatedReport.value !== '');

const currentReportIcon = computed(() => {
  const type = REPORT_TYPES.find((t) => t.value === reportType.value);
  return type?.icon || '📊';
});

const placeholderText = computed(
  () => `请详细描述您的工作内容，系统将为您生成专业的${reportType.value}...`,
);

// 获取模板列表
async function fetchTemplates() {
  try {
    templatesLoading.value = true;
    const params: WorkTemplateApi.TemplateRecommendReqVO = {
      type: 0,
      tagIds:
        selectedTagIds.value.length > 0 ? selectedTagIds.value : undefined,
    };
    const response = await WorkTemplateApi.getRecommendTemplates(params);

    // 根据报告类型筛选模板
    const filteredTemplates = response.filter((template) => {
      // 检查模板是否包含当前报告类型的标签
      return (
        template.tags?.some((tag) => tag.name === reportType.value) || false
      );
    });

    templates.value = filteredTemplates;

    // 提取所有唯一的标签
    const tagsMap = new Map<number, WorkTemplateApi.TagRespVO>();
    templates.value.forEach((template) => {
      template.tags?.forEach((tag) => {
        if (!tagsMap.has(tag.id)) {
          tagsMap.set(tag.id, tag);
        }
      });
    });
    allTags.value = [...tagsMap.values()];
  } catch (error) {
    console.error('获取模板列表失败:', error);
    message.error('获取模板列表失败');
  } finally {
    templatesLoading.value = false;
  }
}

// 标签过滤变化
function handleTagFilterChange() {
  fetchTemplates();
}

// 选择模板
function selectTemplate(template: WorkTemplateApi.TemplateRespVO) {
  // 如果点击的是已选中的模板，则取消选中
  if (selectedTemplate.value?.id === template.id) {
    selectedTemplate.value = null;
    templateId.value = 1; // 重置为默认值
    message.success('已取消模板选择');
    return;
  }

  // 选中新模板
  selectedTemplate.value = template;
  templateId.value = template.id;

  if (template.input) {
    userMessage.value = template.input;
  }

  message.success(`已选择模板：${template.name}`);
}

// 生成报告
async function handleGenerate() {
  if (!userMessage.value.trim()) {
    message.warning('请输入工作内容描述');
    return;
  }

  try {
    loading.value = true;
    generatedReport.value = '';

    const data: WorkReportApi.ReportGenerateReqVO = {
      type: reportType.value,
      templateId: selectedTemplate.value?.id || templateId.value,
      userMessage: userMessage.value,
    };

    const response = await WorkReportApi.generateReport(data);
    generatedReport.value = response;
    message.success('报告生成成功！');
  } catch (error) {
    console.error('生成报告失败:', error);
    message.error('报告生成失败，请稍后重试');
  } finally {
    loading.value = false;
  }
}

// 重置表单
function handleReset() {
  userMessage.value = '';
  generatedReport.value = '';
  selectedTemplate.value = null;
}

// 复制报告内容
async function handleCopyReport() {
  try {
    await navigator.clipboard.writeText(generatedReport.value);
    message.success('报告内容已复制到剪贴板');
  } catch {
    message.error('复制失败，请手动选择复制');
  }
}

// 监听报告类型变化
watch(reportType, () => {
  if (selectedTemplate.value) {
    selectedTemplate.value = null;
    templateId.value = 1;
  }
  // 报告类型变化时重新获取模板
  fetchTemplates();
});

// 页面初始化
onMounted(() => {
  fetchTemplates();
});
</script>

<template>
  <ColPage
    :title="$t('AI 工作报告生成器')"
    description="🚀 使用 AI 将您的工作内容智能转换为专业格式的工作报告，让您专注于工作本身，而不是专注于汇报。"
    :left-width="65"
    :right-width="35"
    :left-min-width="50"
    :left-max-width="80"
    :resizable="true"
    :left-collapsible="false"
  >
    <!-- 左侧：主要内容区 -->
    <template #left>
      <div class="space-y-6 pr-6">
        <!-- 配置卡片 -->
        <Card>
          <template #title>
            <Space>
              <span>{{ currentReportIcon }}</span>
              <span>报告配置</span>
            </Space>
          </template>

          <div class="space-y-6">
            <!-- 报告类型选择 -->
            <div>
              <div class="mb-2 text-sm font-medium text-gray-700">报告类型</div>
              <RadioGroup
                v-model:value="reportType"
                button-style="solid"
                size="large"
              >
                <Radio
                  v-for="option in REPORT_TYPES"
                  :key="option.value"
                  :value="option.value"
                >
                  <Space>
                    <span>{{ option.icon }}</span>
                    <span>{{ option.label }}</span>
                  </Space>
                </Radio>
              </RadioGroup>
            </div>

            <!-- 选中的模板提示 -->
            <Alert v-if="selectedTemplate" type="info" show-icon>
              <template #message>
                <Space>
                  <span>当前模板：</span>
                  <Tag color="blue">{{ selectedTemplate.name }}</Tag>
                </Space>
              </template>
            </Alert>

            <!-- 内容输入 -->
            <div>
              <div class="mb-2 text-sm font-medium text-gray-700">
                工作内容描述
              </div>
              <Input.TextArea
                v-model:value="userMessage"
                :placeholder="placeholderText"
                :auto-size="{ minRows: 8, maxRows: 16 }"
                :max-length="3000"
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
                  <span>✨</span>
                </template>
                {{ loading ? '正在生成中...' : '开始生成报告' }}
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
                AI 正在为您生成报告...
              </Typography.Title>
              <Typography.Text type="secondary">
                请稍候，正在分析您的工作内容并生成专业报告
              </Typography.Text>
            </div>
          </div>
        </Card>

        <!-- 报告展示区域 -->
        <Card v-if="showReport && !loading">
          <template #title>
            <Space>
              <span>{{ currentReportIcon }}</span>
              <span>{{ reportType }}预览</span>
            </Space>
          </template>

          <template #extra>
            <Space>
              <Button type="text" size="small" @click="handleCopyReport">
                📋 复制
              </Button>
              <Button type="text" size="small" @click="handleReset">
                🔄 重新生成
              </Button>
            </Space>
          </template>

          <!-- 报告内容展示 -->
          <div class="mb-3">
            <div class="mb-2 text-sm font-medium text-gray-600">
              📄 生成的{{ reportType }}：
            </div>
            <div
              class="rounded bg-gray-50 p-4 text-sm text-gray-700"
              style="border-left: 3px solid #1890ff"
            >
              <pre
                class="m-0 whitespace-pre-wrap break-words font-sans leading-relaxed"
                >{{ generatedReport }}
              </pre>
            </div>
          </div>
        </Card>
      </div>
    </template>

    <!-- 右侧：模板库 -->
    <template #default>
      <Card title="🎯 模板库" class="h-full">
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
        <Alert type="warning" show-icon class="mb-4">
          <template #message>
            <div class="text-sm">
              <strong>⚠️ 使用说明：</strong>
              <div class="mt-1 text-gray-600">
                • AI 输出具有不确定性，每次生成的报告可能有所不同<br />
                • 模板仅用于引导 AI
                理解您的需求，无法保证严格按照模板格式输出<br />
                • 建议根据实际需要对生成内容进行调整和完善<br />
                •
                如果您有优秀的报告模板，欢迎联系我(微信:sunnao678)，我会将您的模板添加到模板库中<br />
              </div>
            </div>
          </template>
        </Alert>

        <!-- 标签过滤 -->
        <div class="mb-4">
          <div class="mb-2 text-sm font-medium text-gray-600">标签筛选</div>
          <Select
            v-model:value="selectedTagIds"
            mode="multiple"
            placeholder="选择标签过滤模板"
            style="width: 100%"
            :options="
              allTags.map((tag) => ({ label: tag.name, value: tag.id }))
            "
            allow-clear
            @change="handleTagFilterChange"
          >
            <template #tagRender="{ label, closable, onClose }">
              <Tag :closable="closable" @close="onClose" color="blue">
                {{ label }}
              </Tag>
            </template>
          </Select>
        </div>

        <!-- 模板加载中 -->
        <div
          v-if="templatesLoading"
          class="flex flex-col items-center justify-center py-12 text-center"
        >
          <Spinner :spinning="true" />
          <div class="mt-3 text-gray-500">正在加载模板...</div>
        </div>

        <!-- 模板列表 -->
        <div
          v-else-if="templates.length > 0"
          style="max-height: calc(100vh - 300px); overflow-y: auto"
        >
          <div class="space-y-3">
            <div
              v-for="template in templates"
              :key="template.id"
              class="cursor-pointer rounded border p-4"
              :class="{
                'border-blue-500 bg-blue-50':
                  selectedTemplate?.id === template.id,
              }"
              @click="selectTemplate(template)"
              style="height: 280px; overflow-y: auto"
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
                  class="rounded bg-gray-50 p-2 text-xs text-gray-600"
                  style="border-left: 3px solid #e5e7eb"
                >
                  <pre
                    style="
                      margin: 0;
                      white-space: pre-wrap;
                      word-wrap: break-word;
                      line-height: 1.4;
                    "
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
                  class="rounded bg-gray-50 p-2 text-xs text-gray-600"
                  style="border-left: 3px solid #e5e7eb"
                >
                  <pre
                    style="
                      margin: 0;
                      white-space: pre-wrap;
                      word-wrap: break-word;
                      line-height: 1.4;
                    "
                    >{{ template.output }}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <Empty v-else description="暂无可用模板" />
      </Card>
    </template>
  </ColPage>
</template>

<style scoped>
/* 保持简洁，移除所有动画效果 */
</style>
