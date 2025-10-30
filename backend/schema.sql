-- Industrial Dashboard Database Schema
-- PostgreSQL 12+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Factories table: Represents manufacturing sites/facilities
CREATE TABLE IF NOT EXISTS factories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Connections table: Stores encrypted customer database credentials
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  db_type VARCHAR(50) NOT NULL CHECK (db_type IN ('postgres', 'mysql', 'mssql')),
  host VARCHAR(255) NOT NULL,
  port INTEGER NOT NULL,
  database VARCHAR(255) NOT NULL,
  user_enc TEXT NOT NULL, -- Encrypted username
  pass_enc TEXT NOT NULL, -- Encrypted password
  options_enc TEXT, -- Encrypted additional options as JSON
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(factory_id, name)
);

-- Dashboards table: Dashboard configurations
CREATE TABLE IF NOT EXISTS dashboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  layout JSONB NOT NULL DEFAULT '[]', -- Widget layout configuration
  filters JSONB NOT NULL DEFAULT '{"site":"alpha","range":"24h","lines":[],"sku":"","shifts":[],"productName":"cement"}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Widgets table: Individual dashboard widgets with SQL queries
CREATE TABLE IF NOT EXISTS widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('KPI', 'LINE', 'BAR', 'GAUGE', 'TABLE', 'HEATMAP', 'AREA', 'HORIZONTAL_BAR')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  connection_id UUID NOT NULL REFERENCES connections(id) ON DELETE RESTRICT,
  query TEXT NOT NULL, -- SQL query with parameter placeholders (e.g., :siteId)
  params JSONB NOT NULL DEFAULT '{}', -- Default parameter values
  refresh_interval INTEGER, -- Auto-refresh interval in seconds
  viz_options JSONB, -- Visualization options (colors, axes, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Dataset cache table: Cache query results for performance
CREATE TABLE IF NOT EXISTS dataset_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  widget_id UUID NOT NULL REFERENCES widgets(id) ON DELETE CASCADE,
  param_hash VARCHAR(64) NOT NULL, -- Hash of query parameters for cache key
  data JSONB NOT NULL, -- Cached query results
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(widget_id, param_hash)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_connections_factory_id ON connections(factory_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_factory_id ON dashboards(factory_id);
CREATE INDEX IF NOT EXISTS idx_widgets_dashboard_id ON widgets(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_widgets_connection_id ON widgets(connection_id);
CREATE INDEX IF NOT EXISTS idx_dataset_cache_widget_id ON dataset_cache(widget_id);
CREATE INDEX IF NOT EXISTS idx_dataset_cache_expires_at ON dataset_cache(expires_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_factories_updated_at BEFORE UPDATE ON factories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboards_updated_at BEFORE UPDATE ON dashboards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_widgets_updated_at BEFORE UPDATE ON widgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed data for development/testing
INSERT INTO factories (id, name, location, timezone) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Alpha Factory', 'Detroit, MI', 'America/Detroit'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Beta Factory', 'Austin, TX', 'America/Chicago')
ON CONFLICT (id) DO NOTHING;

-- Note: Connection credentials should be added through the API with encryption
-- Example connection (you'll need to add via API with real credentials):
-- INSERT INTO connections (factory_id, name, db_type, host, port, database, user_enc, pass_enc)
-- VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Production DB', 'postgres', 'localhost', 5432, 'production', 'encrypted_user', 'encrypted_pass');

COMMIT;
