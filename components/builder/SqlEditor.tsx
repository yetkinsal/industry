
import React from 'react';

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const SqlEditor: React.FC<SqlEditorProps> = ({ value, onChange }) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-40 bg-background border border-border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary no-drag"
      placeholder="-- Enter your SQL query here
-- e.g., SELECT value FROM kpi WHERE id = :kpi_id"
    />
  );
};

export default SqlEditor;
