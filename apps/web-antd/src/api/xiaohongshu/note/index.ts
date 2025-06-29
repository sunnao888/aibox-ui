import { requestClient } from '#/api/request';

export namespace XiaohongshuNoteApi {
  /** 小红书笔记助手生成请求 */
  export interface NoteGenerateReqVO {
    /** 用户消息 */
    userMessage: string;
  }

  /** 生成小红书笔记 */
  export function generateNote(data: NoteGenerateReqVO) {
    return requestClient.post<string>('/biz/xiaohongshu/note', data);
  }
}
