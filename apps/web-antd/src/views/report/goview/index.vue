<script lang="ts" setup>
import { ref } from 'vue';

import { Page } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';

import { IFrame } from '#/components/iframe';

defineOptions({ name: 'GoView' });

const accessStore = useAccessStore();

const src = ref(
  `${import.meta.env.VITE_GOVIEW_URL}?accessToken=${accessStore.accessToken}&refreshToken=${accessStore.refreshToken}`,
);
</script>

<template>
  <Page auto-content-height>
    <IFrame :src="src" />
  </Page>
</template>
