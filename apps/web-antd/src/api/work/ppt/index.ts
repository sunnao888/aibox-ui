import { requestClient } from '#/api/request';

export namespace PPTApi {
  /** 头脑风暴生成请求 */
  export interface PPTGenerateReqVO {
    /** 用户消息 */
    userMessage: string;
  }

  /** 生成头脑风暴 */
  export function generatePPT(data: PPTGenerateReqVO) {
    return requestClient.post<string>('/biz/work/ppt', data);
  }
}
