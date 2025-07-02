import type { EventSourceMessage } from '@microsoft/fetch-event-source';

import { createSSEClient } from '#/api/sse-client';

export namespace ManusApi {
  export interface SSEData {
    type: 'AGENT' | 'SYSTEM';
    step: number;
    result: string;
  }

  export interface JManusStreamOptions {
    userMessage: string;
    onMessage: (data: SSEData) => void;
    onError?: (error: Error) => void;
    onClose?: () => void;
  }
}

export function jManusStream(
  options: ManusApi.JManusStreamOptions,
): () => void {
  const { userMessage, onMessage, onError, onClose } = options;

  const sseClient = createSSEClient();

  sseClient.connect({
    url: '/biz/manus/jManus',
    params: {
      userMessage,
    },
    onMessage: (msg: EventSourceMessage) => {
      try {
        if (msg.data) {
          const data = JSON.parse(msg.data) as ManusApi.SSEData;
          onMessage(data);
        }
      } catch (error) {
        console.error('Failed to parse SSE message:', error);
        onError?.(new Error('Failed to parse SSE message'));
      }
    },
    onError,
    onClose,
  });

  return () => sseClient.close();
}
