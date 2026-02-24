export interface Video {
  title: string;
  brief_description: string;
  description: string;
  time: number;
  cover: string;
  sort: number;
  status: "published" | "unpublished";
  video: string;
}
