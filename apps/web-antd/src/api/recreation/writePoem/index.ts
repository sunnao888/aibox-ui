import { requestClient } from '#/api/request';

export namespace WritePoemApi {
  /** AI写诗生成请求 */
  export interface WritePoemGenerateReqVO {
    /** 用户消息 */
    userMessage: string;
  }

  /** 生成AI写诗 */
  export function generateWritePoem(data: WritePoemGenerateReqVO) {
    return requestClient.post<string>('/biz/recreation/writePoem', data);
  }
}
