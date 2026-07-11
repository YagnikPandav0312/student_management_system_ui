export interface BaseResponse<T> {
  data: T;
  total_records: number;
  status: Status;
}

export interface Status {
  message: string;
  code: number;
}

export interface getPayloadReq {
  page?: number;
  limit?: number;
  search?: string;
  end_date?: string;
  sort_by?: string;
  sort_order?: string;
  user_id?: number;
  category_id?: number[] | string;
  game_type_id?: number[] | string;
  device_type_id?: number[] | string;
}
