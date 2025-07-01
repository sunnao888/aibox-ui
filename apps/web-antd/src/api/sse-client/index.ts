import type { EventSourceMessage } from '@microsoft/fetch-event-source';

import { isTenantEnable } from '@vben/hooks';
import { preferences } from '@vben/preferences';
import { useAccessStore } from '@vben/stores';

import {
  EventStreamContentType,
  fetchEventSource,
} from '@microsoft/fetch-event-source';

export interface SSEClientOptions {
  url: string;
  params?: Record<string, string>;
  onMessage: (message: EventSourceMessage) => void;
  onError?: (error: Error) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

class SSEClient {
  private controller: AbortController | null = null;
  private isClosing = false;

  close(): void {
    this.isClosing = true;
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
  }

  async connect(options: SSEClientOptions): Promise<void> {
    const { url, params, onMessage, onError, onOpen, onClose } = options;

    // 重置状态
    this.isClosing = false;
    this.controller = new AbortController();

    // 构建完整的 URL
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : '';
    const fullUrl = url + queryString;

    // 在连接时获取最新的headers
    const headers = this.getHeaders();
    console.log('SSE Headers:', headers);
    console.log('SSE URL:', fullUrl);

    try {
      await fetchEventSource(fullUrl, {
        method: 'GET',
        headers,
        signal: this.controller.signal,
        openWhenHidden: true, // 保持连接即使页面隐藏

        async onopen(response) {
          const contentType = response.headers.get('content-type');
          if (
            response.ok &&
            contentType?.includes('text/event-stream')
          ) {
            // SSE connection opened
            onOpen?.();
            return; // 明确返回，表示连接成功
          }
          
          // 处理错误响应
          let errorText = '';
          try {
            errorText = await response.text();
          } catch (e) {
            errorText = 'Unable to read error response';
          }
          
          console.error('SSE connection failed:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: errorText,
          });
          
          const error = new Error(
            `Failed to connect: ${response.status} ${response.statusText}. Response: ${errorText}`,
          );
          
          // 触发错误回调
          onError?.(error);
          
          // 抛出错误以停止连接尝试
          throw error;
        },

        onmessage(msg) {
          // 只处理 result 事件
          if (msg.event === 'result') {
            onMessage(msg);
          }
        },

        onerror: (error) => {
          console.error('SSE error:', error);

          // 如果是主动关闭，不触发错误回调
          if (this.isClosing) {
            throw error; // 抛出错误以停止重试
          }

          onError?.(error);

          // 抛出错误以停止自动重试
          throw error;
        },

        onclose: () => {
          // SSE connection closed
          onClose?.();
        },
      });
    } catch (error) {
      if (!this.isClosing) {
        console.error('SSE connection error:', error);
        onError?.(error as Error);
      }
    }
  }

  private getHeaders(): Record<string, string> {
    const accessStore = useAccessStore();
    const tenantEnable = isTenantEnable();

    const headers: Record<string, string> = {
      Accept: EventStreamContentType,
      'Accept-Language': preferences.app.locale,
    };

    // 添加认证令牌
    if (accessStore.accessToken) {
      headers.Authorization = `Bearer ${accessStore.accessToken}`;
    }

    // 添加租户信息
    if (tenantEnable) {
      if (accessStore.tenantId) {
        headers['tenant-id'] = accessStore.tenantId;
      }
      if (accessStore.visitTenantId) {
        headers['visit-tenant-id'] = accessStore.visitTenantId;
      }
    }

    return headers;
  }
}

export function createSSEClient(): SSEClient {
  return new SSEClient();
}

// 导出一个获取带认证的 headers 的辅助函数
export function getSSEHeaders(): Record<string, string> {
  const accessStore = useAccessStore();
  const tenantEnable = isTenantEnable();

  const headers: Record<string, string> = {
    Accept: EventStreamContentType,
    'Accept-Language': preferences.app.locale,
  };

  // 添加认证令牌
  if (accessStore.accessToken) {
    headers.Authorization = `Bearer ${accessStore.accessToken}`;
  }

  // 添加租户信息
  if (tenantEnable) {
    if (accessStore.tenantId) {
      headers['tenant-id'] = accessStore.tenantId;
    }
    if (accessStore.visitTenantId) {
      headers['visit-tenant-id'] = accessStore.visitTenantId;
    }
  }

  return headers;
}
