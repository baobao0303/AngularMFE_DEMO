export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
}

export interface LoginReq {
  email: string;
  pass: string;
}
