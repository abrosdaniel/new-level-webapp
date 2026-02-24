export interface Course {
  id: string | number;
  status: "open" | "close";
  date_start: string;
  level: string;
  cover: string;
  title: string;
  brief_description: string;
  description: string;
  subscription_price: number;
  weeks?: Week[];
}

export interface Week {
  id?: string | number;
  course: Course;
  sort: number;
  status: "open" | "close";
  date_start: string;
  date_open?: string;
  trainings: Training[];
}

export interface Training {
  id?: string | number;
  week: Week;
  sort: number;
  cover: string;
  brief_description: string;
  description: string;
  video?: string;
  kcal?: number;
  time?: number;
}
