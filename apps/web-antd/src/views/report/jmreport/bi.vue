<script lang="ts" setup>
import { ref } from 'vue';

import { Page } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';

import { IFrame } from '#/components/iframe';

defineOptions({ name: 'JimuBI' });
const accessStore = useAccessStore();

const src = ref(
  `${import.meta.env.VITE_BASE_URL}/drag/list?token=${
    accessStore.refreshToken
  }`,
);
</script>

<template>
  <Page auto-content-height>
    <IFrame :src="src" />
  </Page>
</template>
