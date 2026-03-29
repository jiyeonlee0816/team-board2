export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
  columnId: string;
  createdAt: number;
}

export interface Column {
  id: string;
  title: string;
}
