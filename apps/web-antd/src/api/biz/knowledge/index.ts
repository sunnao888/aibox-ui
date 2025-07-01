import type { PageParam, PageResult } from '@vben/request';

import { requestClient } from '#/api/request';

export namespace KnowledgeApi {
  /** 知识库信息 */
  export interface Knowledge {
    id: number; // 用户ID
    title?: string; // 标题
    status?: number; // 状态
    context?: string; // 内容
  }
}

/** 查询知识库分页 */
export function getKnowledgePage(params: PageParam) {
  return requestClient.get<PageResult<KnowledgeApi.Knowledge>>(
    '/biz/knowledge/page',
    { params },
  );
}

/** 查询知识库详情 */
export function getKnowledge(id: number) {
  return requestClient.get<KnowledgeApi.Knowledge>(
    `/biz/knowledge/get?id=${id}`,
  );
}

/** 新增知识库 */
export function createKnowledge(data: KnowledgeApi.Knowledge) {
  return requestClient.post('/biz/knowledge/create', data);
}

/** 修改知识库 */
export function updateKnowledge(data: KnowledgeApi.Knowledge) {
  return requestClient.put('/biz/knowledge/update', data);
}

/** 删除知识库 */
export function deleteKnowledge(id: number) {
  return requestClient.delete(`/biz/knowledge/delete?id=${id}`);
}

/** 批量删除知识库 */
export function deleteKnowledgeListByIds(ids: number[]) {
  return requestClient.delete(
    `/biz/knowledge/delete-list?ids=${ids.join(',')}`,
  );
}

/** 导出知识库 */
export function exportKnowledge(params: any) {
  return requestClient.download('/biz/knowledge/export-excel', params);
}
