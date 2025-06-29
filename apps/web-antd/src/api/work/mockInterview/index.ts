import { requestClient } from '#/api/request';

export namespace MockInterviewApi {
  /** 模拟面试生成请求 */
  export interface MockInterviewGenerateReqVO {
    /** 用户消息 */
    userMessage: string;
  }

  /** 生成模拟面试 */
  export function generateMockInterview(data: MockInterviewGenerateReqVO) {
    return requestClient.post<string>('/biz/work/mockInterview', data);
  }
}
