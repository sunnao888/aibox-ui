<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { KnowledgeApi } from '#/api/biz/knowledge';

import { Page, useVbenModal } from '@vben/common-ui';
import { message,Tabs } from 'ant-design-vue';
import Form from './modules/form.vue';


import { ref, computed } from 'vue';
import { $t } from '#/locales';
import { ACTION_ICON, TableAction, useVbenVxeGrid } from '#/adapter/vxe-table';
import { getKnowledgePage, deleteKnowledge, deleteKnowledgeListByIds, exportKnowledge } from '#/api/biz/knowledge';
import { downloadFileFromBlobPart, isEmpty } from '@vben/utils';

import { useGridColumns, useGridFormSchema } from './data';


const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true
});


/** 刷新表格 */
function onRefresh() {
  gridApi.query();
}

/** 创建知识库 */
function handleCreate() {
  formModalApi.setData({}).open();
}

/** 编辑知识库 */
function handleEdit(row: KnowledgeApi.Knowledge) {
  formModalApi.setData(row).open();
}


/** 删除知识库 */
async function handleDelete(row: KnowledgeApi.Knowledge) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.id]),
    key: 'action_key_msg'
  });
  try {
    await deleteKnowledge(row.id as number);
    message.success({
      content: $t('ui.actionMessage.deleteSuccess', [row.id]),
      key: 'action_key_msg',
    });
    onRefresh();
  } finally {
    hideLoading();
  }
}

/** 批量删除知识库 */
async function handleDeleteBatch() {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting'),
    key: 'action_key_msg'
  });
  try {
    await deleteKnowledgeListByIds(deleteIds.value);
    message.success({
      content: $t('ui.actionMessage.deleteSuccess'),
      key: 'action_key_msg',
    });
    onRefresh();
  } finally {
    hideLoading();
  }
}

const deleteIds = ref<number[]>([]) // 待删除知识库 ID
function setDeleteIds({
  records
}: {
  records: KnowledgeApi.Knowledge[];
}) {
  deleteIds.value = records.map((item) => item.id);
}

/** 导出表格 */
async function handleExport() {
  const data = await exportKnowledge(await gridApi.formApi.getValues());
  downloadFileFromBlobPart({ fileName: '知识库.xls', source: data });
}

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema()
  },
  gridOptions: {
    columns: useGridColumns(),
    height: 'auto',
    pagerConfig: {
      enabled: true,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getKnowledgePage({
            pageNo: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
      isHover: true,
    },
    toolbarConfig: {
      refresh: { code: 'query' },
      search: true,
    }
  } as VxeTableGridOptions<KnowledgeApi.Knowledge>,
  gridEvents:{
      checkboxAll: setDeleteIds,
      checkboxChange: setDeleteIds
  }
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="onRefresh" />

    <Grid table-title="知识库列表">
      <template #toolbar-tools>
        <TableAction
          :actions="[
            {
              label: $t('ui.actionTitle.create', ['知识库']),
              type: 'primary',
              icon: ACTION_ICON.ADD,
              auth: ['biz:knowledge:create'],
              onClick: handleCreate,
            },
            {
              label: $t('ui.actionTitle.export'),
              type: 'primary',
              icon: ACTION_ICON.DOWNLOAD,
              auth: ['biz:knowledge:export'],
              onClick: handleExport,
            },
            {
              label: $t('ui.actionTitle.deleteBatch'),
              type: 'primary',
              danger: true,
              icon: ACTION_ICON.DELETE,
              disabled: isEmpty(deleteIds),
              auth: ['biz:knowledge:delete'],
              onClick: handleDeleteBatch,
            },
          ]"
        />
      </template>
      <template #actions="{ row }">
        <TableAction
          :actions="[
            {
              label: $t('common.edit'),
              type: 'link',
              icon: ACTION_ICON.EDIT,
              auth: ['biz:knowledge:update'],
              onClick: handleEdit.bind(null, row),
            },
            {
              label: $t('common.delete'),
              type: 'link',
              danger: true,
              icon: ACTION_ICON.DELETE,
              auth: ['biz:knowledge:delete'],
              popConfirm: {
                title: $t('ui.actionMessage.deleteConfirm', [row.id]),
                confirm: handleDelete.bind(null, row),
              },
            },
          ]"
        />
      </template>
    </Grid>

  </Page>
</template>