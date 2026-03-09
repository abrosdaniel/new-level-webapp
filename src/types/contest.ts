import type { User } from "./user";

export interface Contest {
  id?: string | number;
  date_before_start: string;
  date_before_end: string;
  date_after_start: string;
  date_after_end: string;
  date_final_start: string;
  date_final_end: string;
  winner?: Participant | null;
}

export interface Participant {
  id?: string | number;
  user: User;
  image_before?: string;
  image_after?: string;
}
