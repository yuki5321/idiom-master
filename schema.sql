-- Cloudflare D1 Database Schema for Idiom Learning App

-- Learning records table
CREATE TABLE learning_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  phrase TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('known', 'unknown', 'correct', 'incorrect')),
  timestamp TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_learning_records_user_id ON learning_records(user_id);
CREATE INDEX idx_learning_records_phrase ON learning_records(phrase);
CREATE INDEX idx_learning_records_timestamp ON learning_records(timestamp);

-- Optional: User statistics table for caching
CREATE TABLE user_stats (
  user_id TEXT PRIMARY KEY,
  total_records INTEGER DEFAULT 0,
  known_count INTEGER DEFAULT 0,
  unknown_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for user stats
CREATE INDEX idx_user_stats_last_updated ON user_stats(last_updated); 