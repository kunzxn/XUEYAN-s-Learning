SET QUOTED_IDENTIFIER ON;
SET XACT_ABORT ON;
IF NOT EXISTS(SELECT 1 FROM sys.database_principals WHERE name='xueyan_api_admin') CREATE USER xueyan_api_admin WITHOUT LOGIN;
IF NOT EXISTS(SELECT 1 FROM sys.database_principals WHERE name='xueyan_api_learner') CREATE USER xueyan_api_learner WITHOUT LOGIN;
ALTER ROLE xueyan_admin ADD MEMBER xueyan_api_admin;
ALTER ROLE xueyan_learner ADD MEMBER xueyan_api_learner;
IF NOT EXISTS(SELECT 1 FROM dbo.SchemaMigrations WHERE Version='006-api-principals') INSERT dbo.SchemaMigrations(Version) VALUES('006-api-principals');
