<script lang="ts" setup>
import type { InfraRedisApi } from '#/api/infra/redis';

import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Card } from 'ant-design-vue';

import { getRedisMonitorInfo } from '#/api/infra/redis';

import Commands from './modules/commands.vue';
import Info from './modules/info.vue';
import Memory from './modules/memory.vue';

const redisData = ref<InfraRedisApi.RedisMonitorInfo>();

/** 统一加载 Redis 数据 */
async function loadRedisData() {
  try {
    redisData.value = await getRedisMonitorInfo();
  } catch (error) {
    console.error('加载 Redis 数据失败', error);
  }
}

onMounted(async () => {
  await loadRedisData();
});
</script>

<template>
  <Page auto-content-height>
    <div class="class=" mt-5>
      <Card title="Redis 概览">
        <Info :redis-data="redisData" />
      </Card>
    </div>

    <div class="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card title="内存使用">
        <Memory :redis-data="redisData" />
      </Card>

      <Card title="命令统计">
        <Commands :redis-data="redisData" />
      </Card>
    </div>
  </Page>
</template>
