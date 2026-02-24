import type { Course } from "./courses";

export interface User {
  id: string | number;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string | null;
  status: string;
  role: string;
  telegram_id?: string | null;
  birthday: string;
  gender: "male" | "female";
  lifestyle: "low" | "easy" | "average" | "high" | "highst";
  goal: "weight_loss" | "weight_maintenance" | "gaining_muscle_mass";
  phone?: string | null;
  subscriptions?: Subscription[];
  measurements?: Measurement[];
  payments?: Payment[];
}

export interface Subscription {
  id: string | number;
  user: string;
  course: Course;
  date_expiration: string | null;
  amount: number;
  currency: string;
  date_created: string;
}

export interface Measurement {
  id: string | number;
  user: User;
  weight: number;
  height: number;
  chest?: number;
  waist?: number;
  hips?: number;
  thigh_left?: number;
  thigh_right?: number;
  arm_left?: number;
  arm_right?: number;
  date_created: string;
  images?: Array<{
    id: string;
    measurements_id: string;
    directus_files_id: string;
  }>;
}

export interface Payment {
  id: string | number;
  yookassa_payment_id: string;
  user: User;
  products: Product[];
  amount: number;
  currency: string;
  status: string;
  date_created: string;
}

export interface Product {
  collection: string;
  item: string;
}
