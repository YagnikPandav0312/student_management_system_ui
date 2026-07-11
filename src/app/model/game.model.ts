export interface GameList {
  created_at: string;
  game_id: number;
  provider_id: number;
  category_id: any;
  game_type_id: any;
  device_type_id: any;
  game_name: string;
  slug: string;
  thumbnail: string | null;
  release_date: string | null;
  max_win: string | null;
  min_bet: number | null;
  max_bet: number | null;
  rtp: number | null;
  variance: string | null;
  is_active: boolean;
}
