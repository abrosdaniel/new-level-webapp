export interface Recipe {
  id: string;
  sort: number;
  status: "published" | "unpublished";
  type: "breakfast" | "lunch" | "dinner" | "snack";
  cover: string;
  title: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  time: number;
  portion_weight: number;
  recipe: string;
}
