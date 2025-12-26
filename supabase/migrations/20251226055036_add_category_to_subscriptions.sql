-- Add category column to subscriptions table with default value
ALTER TABLE subscriptions ADD COLUMN category TEXT NOT NULL DEFAULT 'Personal';

