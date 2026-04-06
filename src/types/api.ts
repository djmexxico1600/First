export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  details?: Record<string, unknown>;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type WebhookPayload = {
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
};

export type ServerActionResponse<T = unknown> = Promise<{
  success: boolean;
  data?: T;
  error?: string;
}>;
