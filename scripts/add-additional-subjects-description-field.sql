-- Add additional_subjects_description field to tutor_details table
-- This field stores mataPelajaranLainnya as free-form descriptive text
-- Created: January 2025

-- Add the new column
ALTER TABLE tutor_details 
ADD COLUMN additional_subjects_description TEXT;

-- Add comment for documentation
COMMENT ON COLUMN tutor_details.additional_subjects_description IS 
'Free-form descriptive text field for additional subjects that tutor can teach. This is the mataPelajaranLainnya field from the form - stored as simple text, not parsed.';

-- Optional: Set default value for existing records (can be empty)
UPDATE tutor_details 
SET additional_subjects_description = ''
WHERE additional_subjects_description IS NULL;

-- Verify the column was added
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'tutor_details' 
  AND column_name = 'additional_subjects_description';

-- Show sample data structure
SELECT 
  id, 
  user_id,
  academic_status,
  other_skills,
  additional_subjects_description,
  created_at
FROM tutor_details 
LIMIT 3;

