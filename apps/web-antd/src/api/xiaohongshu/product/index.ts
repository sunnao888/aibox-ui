import { requestClient } from '#/api/request';

export namespace XiaohongshuProductApi {
  /** 小红书种草文案生成请求 */
  export interface ProductGenerateReqVO {
    /** 用户消息 */
    userMessage: string;
  }

  /** 生成小红书种草文案 */
  export function generateProduct(data: ProductGenerateReqVO) {
    return requestClient.post<string>('/biz/xiaohongshu/product', data);
  }
}
