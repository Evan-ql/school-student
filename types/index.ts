export interface Teacher {
  id: string
  name: string
  email: string
  school: string
  created_at: string
}

export interface Class {
  id: string
  teacher_id: string
  name: string
  grade: number
  subject: string
  created_at: string
}

export interface Student {
  id: string
  class_id: string
  name: string
  student_number: string
  created_at: string
}

export interface LearningNode {
  id: string
  class_id: string
  title: string
  type: 'lesson' | 'chapter' | 'unit'
  order: number
  parent_id?: string
  created_at: string
}

export interface Assignment {
  id: string
  node_id: string
  title: string
  type: string
  total_score: number
  assigned_date: string
  due_date: string
  created_at: string
}

export interface StudentAssignment {
  id: string
  assignment_id: string
  student_id: string
  image_url: string
  score: number
  submitted_at: string
  graded_at?: string
  ai_analysis?: any
  teacher_notes?: string
}

export interface KnowledgePoint {
  id: string
  node_id: string
  name: string
  description: string
  difficulty: number
  created_at: string
}

export interface StudentKnowledgeProgress {
  id: string
  student_id: string
  knowledge_point_id: string
  mastery_level: number
  practice_count: number
  correct_count: number
  last_practiced: string
  updated_at: string
}
