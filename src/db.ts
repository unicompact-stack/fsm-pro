// Database schema and types for FSM Pro
// Updated with isNew and createdAt fields for task tracking

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'worker' | 'master';
  avatar?: string;
  phone?: string;
  specialization?: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: number;
  assignedBy?: number;
  createdAt: string;
  updatedAt?: string;
  dueDate?: string;
  completedAt?: string;
  location?: string;
  photos?: string[];
  comments?: TaskComment[];
  isNew?: boolean;
  viewedAt?: string;
}

export interface TaskComment {
  id: number;
  taskId: number;
  userId: number;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'task_assigned' | 'task_updated' | 'comment' | 'system';
  read: boolean;
  createdAt: string;
  taskId?: number;
}

export interface FSMState {
  id: string;
  name: string;
  type: 'initial' | 'intermediate' | 'final' | 'choice' | 'event';
  x: number;
  y: number;
}

export interface FSMTransition {
  id: string;
  from: string;
  to: string;
  event?: string;
  guard?: string;
  action?: string;
}

export interface FSMDiagram {
  id: number;
  name: string;
  description?: string;
  states: FSMState[];
  transitions: FSMTransition[];
  createdAt: string;
  updatedAt: string;
  ownerId: number;
}
