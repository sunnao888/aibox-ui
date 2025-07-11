import type { PageParam, PageResult } from '@vben/request';

import { requestClient } from '#/api/request';

export namespace TemplateApi {
  /** 标签信息 */
  export interface Tag {
    id: number;
    name: string;
    status: boolean;
    createTime: string;
  }

  /** 模板信息 */
  export interface Template {
    id: number; // 用户ID
    name?: string; // 模板名称
    type?: number; // 模板类型
    input?: string; // 输入用例
    output?: string; // 输出用例
    createTime?: string; // 创建时间
    tags?: Tag[]; // 关联的标签列表
    tagIds?: number[]; // 标签ID列表（用于表单提交）
  }
}

/** 查询模板分页 */
export function getTemplatePage(params: PageParam) {
  return requestClient.get<PageResult<TemplateApi.Template>>(
    '/biz/template/page',
    { params },
  );
}

/** 查询模板详情 */
export function getTemplate(id: number) {
  return requestClient.get<TemplateApi.Template>(`/biz/template/get?id=${id}`);
}

/** 新增模板 */
export function createTemplate(data: TemplateApi.Template) {
  return requestClient.post('/biz/template/create', data);
}

/** 修改模板 */
export function updateTemplate(data: TemplateApi.Template) {
  return requestClient.put('/biz/template/update', data);
}

/** 删除模板 */
export function deleteTemplate(id: number) {
  return requestClient.delete(`/biz/template/delete?id=${id}`);
}

/** 批量删除模板 */
export function deleteTemplateListByIds(ids: number[]) {
  return requestClient.delete(`/biz/template/delete-list?ids=${ids.join(',')}`);
}

/** 导出模板 */
export function exportTemplate(params: any) {
  return requestClient.download('/biz/template/export-excel', params);
}
