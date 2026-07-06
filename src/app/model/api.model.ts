export interface BaseResponse<T> {
  data: T;
  total_records: number;
  status: Status;
}

export interface Status {
  message: string;
  code: number;
}
