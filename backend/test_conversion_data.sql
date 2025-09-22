-- Test script to add some conversion data to users for testing the UserManagement component
-- This simulates users who have performed various numbers of conversions

-- Update some users with test conversion counts
UPDATE users 
SET total_conversions = CASE 
  WHEN email = 'fatimaahmad9093@gmail.com' THEN 25
  WHEN role = 'ADMIN' THEN 10
  ELSE FLOOR(RANDOM() * 20 + 1)::integer
END
WHERE id IN (
  SELECT id FROM users LIMIT 10
);

-- Optional: Insert some sample conversion records (if you want detailed tracking)
-- Note: This assumes you have some users in your database
INSERT INTO conversions (id, user_id, original_file_name, converted_file_name, tool_type, file_size, status, created_at, updated_at)
SELECT 
  gen_random_uuid()::text as id,
  u.id as user_id,
  'sample_document_' || (ROW_NUMBER() OVER()) || '.pdf' as original_file_name,
  'sample_document_' || (ROW_NUMBER() OVER()) || '.docx' as converted_file_name,
  'pdf-to-word' as tool_type,
  FLOOR(RANDOM() * 1000000 + 100000)::integer as file_size,
  'COMPLETED'::conversion_status as status,
  NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 30) as created_at,
  NOW() as updated_at
FROM users u
WHERE u.total_conversions > 0
LIMIT 50;
