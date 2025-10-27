// src/types.ts
export type Role = 'manager' | 'sales_rep' | 'viewer';
export type Status = 'Pending' | 'Approved' | 'Rejected';

export interface HistoryEntry {
  id: number;
  timestamp: string; 
  user: string; 
  action: string; 
  notes?: string; 
}

export interface Reply {
  id: number;
  author: string;
  role: Role;
  text: string;
  timestamp: string;
}

export interface Comment {
  id: number;
  author: string;
  role: Role;
  text: string;
  timestamp: string;
  replies?: Reply[];
}

export interface Quotation {
  id: string;
  client: string;
  amount: number;
  status: Status;
  last_updated: string; 
  description?: string;
  comments: Comment[];
  history: HistoryEntry[];
}

export interface User {
  name: string;
  email: string;
  role: Role;
}