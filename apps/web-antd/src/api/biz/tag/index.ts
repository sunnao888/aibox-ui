import type { PageParam, PageResult } from '@vben/request';

import { requestClient } from '#/api/request';

export namespace TagApi {
  /** 标签信息 */
  export interface Tag {
    id: number; // 用户ID
    name?: string; // 名称
    status?: boolean; // 状态(0 禁用 1启用)
  }
}

/** 查询标签分页 */
export function getTagPage(params: PageParam) {
  return requestClient.get<PageResult<TagApi.Tag>>('/biz/tag/page', { params });
}

/** 查询标签详情 */
export function getTag(id: number) {
  return requestClient.get<TagApi.Tag>(`/biz/tag/get?id=${id}`);
}

/** 新增标签 */
export function createTag(data: TagApi.Tag) {
  return requestClient.post('/biz/tag/create', data);
}

/** 修改标签 */
export function updateTag(data: TagApi.Tag) {
  return requestClient.put('/biz/tag/update', data);
}

/** 删除标签 */
export function deleteTag(id: number) {
  return requestClient.delete(`/biz/tag/delete?id=${id}`);
}

/** 批量删除标签 */
export function deleteTagListByIds(ids: number[]) {
  return requestClient.delete(`/biz/tag/delete-list?ids=${ids.join(',')}`);
}

/** 导出标签 */
export function exportTag(params: any) {
  return requestClient.download('/biz/tag/export-excel', params);
}
