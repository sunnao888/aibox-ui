import { requestClient } from '#/api/request';

export namespace XiaohongshuAccountPositionApi {
  /** 小红书账号定位生成请求 */
  export interface AccountPositionGenerateReqVO {
    /** 用户消息 */
    userMessage: string;
  }

  /** 生成小红书账号定位 */
  export function generateAccountPosition(data: AccountPositionGenerateReqVO) {
    return requestClient.post<string>(
      '/biz/xiaohongshu/account-position',
      data,
    );
  }
}
