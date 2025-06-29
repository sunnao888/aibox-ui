import { requestClient } from '#/api/request';

export namespace XiaohongshuScoreApi {
  /** 小红书笔记评分生成请求 */
  export interface ScoreGenerateReqVO {
    /** 用户消息 */
    userMessage: string;
  }

  /** 生成小红书笔记评分 */
  export function generateScore(data: ScoreGenerateReqVO) {
    return requestClient.post<string>('/biz/xiaohongshu/score', data);
  }
}
