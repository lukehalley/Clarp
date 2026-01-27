-- Add missing DELETE policy for projects table
CREATE POLICY "Allow service delete on projects" ON projects
  FOR DELETE
  USING (true);
