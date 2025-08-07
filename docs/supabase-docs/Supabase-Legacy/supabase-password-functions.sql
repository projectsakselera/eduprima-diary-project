-- ==========================================
-- PASSWORD VERIFICATION FUNCTIONS
-- Run this in Supabase SQL Editor
-- ==========================================

-- Function to check password against stored hash
CREATE OR REPLACE FUNCTION check_password(
  stored_hash TEXT,
  input_password TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN stored_hash = crypt(input_password, stored_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify user password and return user data
CREATE OR REPLACE FUNCTION verify_user_password(
  user_email TEXT,
  user_password TEXT
)
RETURNS TABLE(
  id UUID,
  email TEXT,
  user_code TEXT,
  role user_role,
  primary_role TEXT,
  account_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.user_code,
    u.role,
    u.primary_role,
    u.account_type
  FROM t_310_01_01_users_universal u
  WHERE u.email = user_email
    AND u.user_status = 'active'
    AND u.password_hash = crypt(user_password, u.password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 