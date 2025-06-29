import { requestClient } from '#/api/request';

export namespace XiaohongshuStoreVisitApi {
  /** 小红书探店文案生成请求 */
  export interface StoreVisitGenerateReqVO {
    /** 用户消息 */
    userMessage: string;
  }

  /** 生成小红书探店文案 */
  export function generateStoreVisit(data: StoreVisitGenerateReqVO) {
    return requestClient.post<string>('/biz/xiaohongshu/store-visit', data);
  }
}
