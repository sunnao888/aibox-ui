<script lang="ts" setup>
import type { KnowledgeApi } from '#/api/biz/knowledge';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  createKnowledge,
  getKnowledge,
  updateKnowledge,
} from '#/api/biz/knowledge';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emit = defineEmits(['success']);
const formData = ref<KnowledgeApi.Knowledge>();
const getTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['知识库'])
    : $t('ui.actionTitle.create', ['知识库']);
});

const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    formItemClass: 'col-span-2',
    labelWidth: 80,
  },
  layout: 'horizontal',
  schema: useFormSchema(),
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    modalApi.lock();
    // 提交表单
    const data = (await formApi.getValues()) as KnowledgeApi.Knowledge;
    try {
      await (formData.value?.id
        ? updateKnowledge(data)
        : createKnowledge(data));
      // 关闭并提示
      await modalApi.close();
      emit('success');
      message.success($t('ui.actionMessage.operationSuccess'));
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      formData.value = undefined;
      return;
    }
    // 加载数据
    let data = modalApi.getData<KnowledgeApi.Knowledge>();
    if (!data) {
      return;
    }
    if (data.id) {
      modalApi.lock();
      try {
        data = await getKnowledge(data.id);
      } finally {
        modalApi.unlock();
      }
    }
    // 设置到 values
    formData.value = data;
    await formApi.setValues(formData.value);
  },
});
</script>

<template>
  <Modal :title="getTitle">
    <Form class="mx-4" />
  </Modal>
</template>
