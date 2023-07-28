export type ApiResponse<T> = {
  status: number;
  statusText: string;
  data: T;
};
