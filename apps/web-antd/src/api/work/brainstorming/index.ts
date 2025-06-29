import { requestClient } from '#/api/request';

export namespace WorkBrainstormingApi {
  /** 头脑风暴生成请求 */
  export interface BrainstormingGenerateReqVO {
    /** 用户消息 */
    userMessage: string;
  }

  /** 生成头脑风暴 */
  export function generateBrainstorming(data: BrainstormingGenerateReqVO) {
    return requestClient.post<string>('/biz/work/brainstorming', data);
  }
}
