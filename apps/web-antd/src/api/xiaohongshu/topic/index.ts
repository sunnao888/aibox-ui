import { requestClient } from '#/api/request';

export namespace XiaohongshuTopicApi {
  /** 小红书选题灵感生成请求 */
  export interface TopicGenerateReqVO {
    /** 用户消息 */
    userMessage: string;
  }

  /** 生成小红书选题灵感 */
  export function generateTopic(data: TopicGenerateReqVO) {
    return requestClient.post<string>('/biz/xiaohongshu/topic', data);
  }
}
