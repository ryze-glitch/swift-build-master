-- Modify user_roles to allow null user_id initially (will be filled after user creation)
ALTER TABLE user_roles ALTER COLUMN user_id DROP NOT NULL;

-- Add a comment explaining this design
COMMENT ON COLUMN user_roles.user_id IS 'Initially null, filled when Discord user first authenticates and account is created';