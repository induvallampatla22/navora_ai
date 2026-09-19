export interface User {
  id: string;
  email: string;
  phone?: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  is_2fa_enabled: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  requires_2fa: boolean;
  user?: User;
  temp_token?: string;
}

export interface Setup2FAResponse {
  secret: string;
  qr_code_uri: string;
  recovery_codes: string[];
  message: string;
}

export interface DestinationSummary {
  id: string;
  slug: string;
  name: string;
  country: string;
  hero_image: string;
  categories: string[];
  approx_budget_per_day: number;
}
