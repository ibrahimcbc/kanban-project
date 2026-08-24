export type TaskStatus = "yapilacak" | "yapiliyor" | "tamamlandi";
export type ProjectStatus = "ongoing" | "deadline" | "favorite" | "finished" | "archived";

export interface Task {
  id: string;
  title: string;
  bucket_id: string | null;
  project_id: string | null;
  status: TaskStatus;
  notes: string | null;
  deadline: string | null;
  importance: boolean;
  urgency: boolean;
  start_time: string | null;
  end_time: string | null;
  google_event_id: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface Bucket {
  id: string;
  name: string;
  color: string | null;
}

export interface Project {
  id: string;
  name: string;
  bucket_id: string | null;
  status: ProjectStatus;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}
