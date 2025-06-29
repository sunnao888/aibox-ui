import { requestClient } from '#/api/request';

export namespace WorkReportApi {
  /** 报告生成请求 */
  export interface ReportGenerateReqVO {
    /** 报告类型 */
    type: string;
    /** 模板ID */
    templateId?: number;
    /** 用户消息 */
    userMessage: string;
  }

  /** 生成报告 */
  export function generateReport(data: ReportGenerateReqVO) {
    return requestClient.post<string>('/biz/work/report', data);
  }
}
