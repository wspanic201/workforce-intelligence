SELECT 
  id,
  program_name,
  status,
  created_at,
  updated_at,
  (SELECT COUNT(*) FROM project_components WHERE project_id = projects.id AND status = 'completed') as completed_components,
  (SELECT COUNT(*) FROM project_components WHERE project_id = projects.id AND status = 'error') as error_components,
  (SELECT COUNT(*) FROM project_components WHERE project_id = projects.id) as total_components,
  LENGTH(report_content) as report_length
FROM projects
ORDER BY created_at DESC
LIMIT 5;
