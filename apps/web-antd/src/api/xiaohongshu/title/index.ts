import { requestClient } from '#/api/request';

export namespace XiaohongshuTitleApi {
  /** 小红书爆款标题生成请求 */
  export interface TitleGenerateReqVO {
    /** 用户消息 */
    userMessage: string;
  }

  /** 生成小红书爆款标题 */
  export function generateTitle(data: TitleGenerateReqVO) {
    return requestClient.post<string>('/biz/xiaohongshu/title', data);
  }
}
