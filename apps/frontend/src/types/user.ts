export interface User {
  id: string;
  name?: string;
  avatar?: string;
  email?: string;

  [key: string]: unknown;
}

export type IdToken = {
  at_hash: string;
  sub: string;
  email_verified: boolean;
  iss: string;
  "cognito:username": string;
  origin_jti: string;
  aud: string;
  event_id: string;
  token_use: "id";
  auth_time: number;
  exp: number;
  iat: number;
  jti: string;
  email: string;
};
