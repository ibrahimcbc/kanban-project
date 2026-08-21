export type TaskStatus = "yapilacak" | "yapiliyor" | "tamamlandi";

export interface Task {
  id: string;
  title: string;
  category: string;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface Category {
  id: string;
  name: string;
  color: string | null;
}
