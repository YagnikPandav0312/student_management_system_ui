export interface GameCategoryList {
  created_at: string;
  game_categorie_id?: number;
  game_categorie_name?: string;
  is_active: boolean;
  slug: string;
  game_type_id?: number[] | string | number | null;
  game_type_name?: string;
}
