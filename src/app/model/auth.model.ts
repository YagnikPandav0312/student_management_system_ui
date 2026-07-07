export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  role: string;
}
