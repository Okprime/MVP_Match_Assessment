export interface AccessToken {
  accessToken: string;
}

export interface UserPayload {
  username: string;
  password: string;
  role: string;
  deposit: number;
}
