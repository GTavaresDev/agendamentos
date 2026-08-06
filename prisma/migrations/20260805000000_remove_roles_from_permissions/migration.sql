-- Migration to remove 'Administrador', 'Gestor', 'Funcionario' from SystemPermissions and UserPermissions

DELETE FROM "UserPermissions" WHERE "name" IN ('Administrador', 'Gestor', 'Funcionario');
DELETE FROM "SystemPermissions" WHERE "name" IN ('Administrador', 'Gestor', 'Funcionario');
