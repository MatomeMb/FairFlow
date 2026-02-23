export type AppRole = "ceo" | "cto" | "merchant" | "investor" | "consumer";

export interface AuthUser {
  id: string;
  email: string;
  role: AppRole;
  name?: string;
  avatarUrl?: string;
}

export interface JWTClaims {
  sub: string;
  email: string;
  user_role: AppRole;
  exp: number;
  iat: number;
}
