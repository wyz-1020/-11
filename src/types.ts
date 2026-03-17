export interface SubProblem {
  id: string;
  content: string;
  imageUrl?: string;
  solution?: string;
  difficulty: number;
}

export interface MathProblem {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  problems: SubProblem[];
  unlockTime: string; // HH:mm format
  createdAt: number;
}

export type ViewMode = 'student' | 'teacher';
