PRAGMA foreign_keys = ON;

CREATE TABLE goals (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  description TEXT,
  area TEXT,
  target_date TEXT CHECK (
    target_date IS NULL OR
    target_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
  ),
  accent_color TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'archived')),
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE milestones (
  id TEXT PRIMARY KEY NOT NULL,
  goal_id TEXT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  sort_order INTEGER NOT NULL CHECK (sort_order >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (goal_id, sort_order)
);

CREATE TABLE steps (
  id TEXT PRIMARY KEY NOT NULL,
  milestone_id TEXT NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  is_completed INTEGER NOT NULL DEFAULT 0 CHECK (is_completed IN (0, 1)),
  due_date TEXT CHECK (
    due_date IS NULL OR
    due_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
  ),
  completed_at TEXT,
  sort_order INTEGER NOT NULL CHECK (sort_order >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (milestone_id, sort_order)
);

CREATE INDEX goals_status_sort_order_idx
  ON goals(status, sort_order, created_at);

CREATE INDEX milestones_goal_sort_order_idx
  ON milestones(goal_id, sort_order);

CREATE INDEX steps_milestone_sort_order_idx
  ON steps(milestone_id, sort_order);

CREATE INDEX steps_due_date_idx
  ON steps(due_date, is_completed);

CREATE TRIGGER goals_create_default_milestone
AFTER INSERT ON goals
BEGIN
  INSERT INTO milestones (
    id,
    goal_id,
    title,
    sort_order,
    created_at,
    updated_at
  ) VALUES (
    lower(hex(randomblob(16))),
    NEW.id,
    'Основное',
    0,
    NEW.created_at,
    NEW.updated_at
  );
END;
