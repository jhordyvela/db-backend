-- Add a role column to clientes with default 'cliente'
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'cliente';

-- Ensure existing rows have a role value
UPDATE clientes
SET role = 'cliente'
WHERE role IS NULL;

-- You can update a specific user to admin manually, for example:
-- UPDATE clientes SET role = 'administrador' WHERE email = 'admin@gmail.com';
