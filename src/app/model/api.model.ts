export interface BaseResponse<T> {
  data: T;
  status: Status;
}

export interface Status {
  message: string;
  code: number;
}
