<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemNotifyTemplateApi } from '#/api/system/notify/template';

import { Page, useVbenModal } from '@vben/common-ui';
import { downloadFileFromBlobPart } from '@vben/utils';

import { message } from 'ant-design-vue';

import { ACTION_ICON, TableAction, useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteNotifyTemplate,
  exportNotifyTemplate,
  getNotifyTemplatePage,
} from '#/api/system/notify/template';
import { $t } from '#/locales';

import { useGridColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';
import SendForm from './modules/send-form.vue';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [SendModal, sendModalApi] = useVbenModal({
  connectedComponent: SendForm,
  destroyOnClose: true,
});

/** 刷新表格 */
function onRefresh() {
  gridApi.query();
}

/** 导出表格 */
async function handleExport() {
  const data = await exportNotifyTemplate(await gridApi.formApi.getValues());
  downloadFileFromBlobPart({ fileName: '站内信模板.xls', source: data });
}

/** 创建站内信模板 */
function handleCreate() {
  formModalApi.setData(null).open();
}

/** 编辑站内信模板 */
function handleEdit(row: SystemNotifyTemplateApi.NotifyTemplate) {
  formModalApi.setData(row).open();
}

/** 发送测试站内信 */
function handleSend(row: SystemNotifyTemplateApi.NotifyTemplate) {
  sendModalApi.setData(row).open();
}

/** 删除站内信模板 */
async function handleDelete(row: SystemNotifyTemplateApi.NotifyTemplate) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    key: 'action_key_msg',
  });
  try {
    await deleteNotifyTemplate(row.id as number);
    message.success({
      content: $t('ui.actionMessage.deleteSuccess', [row.name]),
      key: 'action_key_msg',
    });
    onRefresh();
  } finally {
    hideLoading();
  }
}

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
  },
  gridOptions: {
    columns: useGridColumns(),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getNotifyTemplatePage({
            pageNo: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },
    toolbarConfig: {
      refresh: { code: 'query' },
      search: true,
    },
  } as VxeTableGridOptions<SystemNotifyTemplateApi.NotifyTemplate>,
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="onRefresh" />
    <SendModal />
    <Grid table-title="站内信模板列表">
      <template #toolbar-tools>
        <TableAction
          :actions="[
            {
              label: $t('ui.actionTitle.create', ['短信渠道']),
              type: 'primary',
              icon: ACTION_ICON.ADD,
              auth: ['system:notify-template:create'],
              onClick: handleCreate,
            },
            {
              label: $t('ui.actionTitle.export'),
              type: 'primary',
              icon: ACTION_ICON.DOWNLOAD,
              auth: ['system:notify-template:export'],
              onClick: handleExport,
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
              auth: ['system:notify-template:update'],
              onClick: handleEdit.bind(null, row),
            },
            {
              label: '测试',
              type: 'link',
              icon: ACTION_ICON.ADD,
              auth: ['system:notify-template:send-notify'],
              onClick: handleSend.bind(null, row),
            },
            {
              label: $t('common.delete'),
              type: 'link',
              danger: true,
              icon: ACTION_ICON.DELETE,
              auth: ['system:notify-template:delete'],
              popConfirm: {
                title: $t('ui.actionMessage.deleteConfirm', [row.name]),
                confirm: handleDelete.bind(null, row),
              },
            },
          ]"
        />
      </template>
    </Grid>
  </Page>
</template>
