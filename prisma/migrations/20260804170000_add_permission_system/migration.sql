-- Add description and enabled columns to UserPermissions
ALTER TABLE "UserPermissions" ADD COLUMN "description" TEXT;
ALTER TABLE "UserPermissions" ADD COLUMN "enabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "UserPermissions" ADD COLUMN "isSystemPermission" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "UserPermissions" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "UserPermissions" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add unique constraint to prevent duplicate permission names per user
ALTER TABLE "UserPermissions" ADD CONSTRAINT "UserPermissions_userId_name_key" UNIQUE("userId", "name");

-- Create SystemPermissions table to manage all available permissions
CREATE TABLE "SystemPermissions" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "category" TEXT DEFAULT 'general',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "requiresHierarchy" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Insert initial system permissions
INSERT INTO "SystemPermissions" ("name", "description", "category", "requiresHierarchy", "updatedAt")
VALUES
    ('ver_relatorios', 'Permite acesso ao módulo de Relatórios', 'reports', false, CURRENT_TIMESTAMP),
    ('compartilhar_permissoes', 'Permite atribuir permissões a outros usuários', 'admin', false, CURRENT_TIMESTAMP),
    ('Administrador', 'Nível de acesso total do sistema', 'roles', true, CURRENT_TIMESTAMP),
    ('Gestor', 'Acesso gerencial do sistema', 'roles', true, CURRENT_TIMESTAMP),
    ('Funcionario', 'Acesso básico do sistema', 'roles', true, CURRENT_TIMESTAMP);
