import { requestClient } from '#/api/request';

export namespace WorkTemplateApi {
  /** 标签响应 */
  export interface TagRespVO {
    /** 主键 */
    id: number;
    /** 名称 */
    name: string;
    /** 状态(0 禁用 1启用) */
    status: number;
    /** 创建时间 */
    createTime: string;
  }

  /** 模板响应 */
  export interface TemplateRespVO {
    /** 主键 */
    id: number;
    /** 模板名称 */
    name: string;
    /** 模板类型 */
    type: number;
    /** 输入用例 */
    input: string;
    /** 输出用例 */
    output: string;
    /** 创建时间 */
    createTime: string;
    /** 关联的标签列表 */
    tags: TagRespVO[];
  }

  /** 模板推荐请求 */
  export interface TemplateRecommendReqVO {
    /** 模板名称 */
    name?: string;
    /** 模板类型 */
    type?: number;
    /** 标签ID列表 */
    tagIds?: number[];
  }

  /** 获取推荐模板列表 */
  export function getRecommendTemplates(params?: TemplateRecommendReqVO) {
    return requestClient.get<TemplateRespVO[]>('/biz/template/recommend', {
      params,
    });
  }
}