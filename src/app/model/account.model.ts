export interface User {
  user_id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export interface loginResponse {
  token: string;
  user: User;
}
