-- Teachers table
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  school TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes table
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade INTEGER NOT NULL,
  subject TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  student_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning nodes table
CREATE TABLE learning_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('lesson', 'chapter', 'unit')),
  "order" INTEGER NOT NULL,
  parent_id UUID REFERENCES learning_nodes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignments table
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID REFERENCES learning_nodes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  total_score INTEGER NOT NULL,
  assigned_date DATE NOT NULL,
  due_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student assignments table
CREATE TABLE student_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  score DECIMAL(5,2) DEFAULT 0,
  submitted_at TIMESTAMPTZ NOT NULL,
  graded_at TIMESTAMPTZ,
  ai_analysis JSONB,
  teacher_notes TEXT,
  UNIQUE(assignment_id, student_id)
);

-- Knowledge points table
CREATE TABLE knowledge_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID REFERENCES learning_nodes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student knowledge progress table
CREATE TABLE student_knowledge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  knowledge_point_id UUID REFERENCES knowledge_points(id) ON DELETE CASCADE,
  mastery_level DECIMAL(3,2) CHECK (mastery_level BETWEEN 0 AND 1),
  practice_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  last_practiced TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, knowledge_point_id)
);

-- Create indexes
CREATE INDEX idx_classes_teacher ON classes(teacher_id);
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_learning_nodes_class ON learning_nodes(class_id);
CREATE INDEX idx_assignments_node ON assignments(node_id);
CREATE INDEX idx_student_assignments_assignment ON student_assignments(assignment_id);
CREATE INDEX idx_student_assignments_student ON student_assignments(student_id);
CREATE INDEX idx_knowledge_points_node ON knowledge_points(node_id);
CREATE INDEX idx_student_knowledge_progress_student ON student_knowledge_progress(student_id);

-- Enable Row Level Security
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_knowledge_progress ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for assignment images
INSERT INTO storage.buckets (id, name, public) VALUES ('assignments', 'assignments', true);

-- Storage policy
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'assignments');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'assignments' AND auth.role() = 'authenticated');
