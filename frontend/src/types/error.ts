export interface ApiError {
  message: string;
  code?: string;
  response?: {
    status?: number;
    data?: {
      detail?: string;
      message?: string;
    };
  };
}

export function getErrorMessage(error: unknown): string {
  const apiError = error as ApiError;
  return (
    apiError.response?.data?.detail ||
    apiError.response?.data?.message ||
    apiError.message ||
    '오류가 발생했습니다'
  );
}
