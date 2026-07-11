export interface ProviderList {
  created_at: string;
  provider_id?: number;
  provider_name?: string;
  slug: string;
  logo: string | null;
  public_id: string | null;
  is_active: boolean;
}
