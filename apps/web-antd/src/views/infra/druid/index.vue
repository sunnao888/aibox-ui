<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { getConfigKey } from '#/api/infra/config';
import { IFrame } from '#/components/iframe';

const loading = ref(true); // 是否加载中
const src = ref(`${import.meta.env.VITE_BASE_URL}/druid/index.html`);

/** 初始化 */
onMounted(async () => {
  try {
    const data = await getConfigKey('url.druid');
    if (data && data.length > 0) {
      src.value = data;
    }
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <Page auto-content-height>
    <IFrame v-if="!loading" v-loading="loading" :src="src" />
  </Page>
</template>
