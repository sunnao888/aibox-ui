import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { TemplateApi } from '#/api/biz/template';

import { getAllTags } from '#/api/biz/tag';
import { DICT_TYPE, getDictOptions, getRangePickerDefaultProps } from '#/utils';

/** 新增/修改的表单 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'id',
      component: 'Input',
      dependencies: {
        triggerFields: [''],
        show: () => false,
      },
    },
    {
      fieldName: 'name',
      label: '模板名称',
      rules: 'required',
      component: 'Input',
      componentProps: {
        placeholder: '请输入模板名称',
      },
    },
    {
      fieldName: 'type',
      label: '模板类型',
      rules: 'required',
      component: 'Select',
      componentProps: {
        options: getDictOptions(DICT_TYPE.BIZ_TEMPLATE_TYPE, 'number'),
        placeholder: '请选择模板类型',
      },
    },
    {
      fieldName: 'input',
      label: '输入用例',
      rules: 'required',
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入输入用例',
      },
    },
    {
      fieldName: 'output',
      label: '输出用例',
      rules: 'required',
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入输出用例',
      },
    },
    {
      fieldName: 'tagIds',
      label: '关联标签',
      component: 'ApiSelect',
      componentProps: {
        mode: 'multiple',
        api: getAllTags,
        labelField: 'name',
        valueField: 'id',
        placeholder: '请选择关联标签',
        allowClear: true,
      },
    },
  ];
}

/** 列表的搜索表单 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'name',
      label: '模板名称',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入模板名称',
      },
    },
    {
      fieldName: 'type',
      label: '模板类型',
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: getDictOptions(DICT_TYPE.BIZ_TEMPLATE_TYPE, 'number'),
        placeholder: '请选择模板类型',
      },
    },
    {
      fieldName: 'createTime',
      label: '创建时间',
      component: 'RangePicker',
      componentProps: {
        ...getRangePickerDefaultProps(),
        allowClear: true,
      },
    },
  ];
}

/** 列表的字段 */
export function useGridColumns(): VxeTableGridOptions<TemplateApi.Template>['columns'] {
  return [
    { type: 'checkbox', width: 40 },
    {
      field: 'name',
      title: '模板名称',
      minWidth: 150,
    },
    {
      field: 'type',
      title: '模板类型',
      minWidth: 120,
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.BIZ_TEMPLATE_TYPE },
      },
    },
    {
      field: 'input',
      title: '输入用例',
      minWidth: 120,
    },
    {
      field: 'output',
      title: '输出用例',
      minWidth: 120,
    },
    {
      field: 'tags',
      title: '关联标签',
      minWidth: 150,
      slots: { default: 'tags' },
    },
    {
      field: 'createTime',
      title: '创建时间',
      minWidth: 120,
      formatter: 'formatDateTime',
    },
    {
      title: '操作',
      width: 200,
      fixed: 'right',
      slots: { default: 'actions' },
    },
  ];
}
