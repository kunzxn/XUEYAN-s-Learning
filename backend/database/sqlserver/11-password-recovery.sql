SET XACT_ABORT ON;
BEGIN TRANSACTION;
IF OBJECT_ID(N'auth.PasswordResets',N'U') IS NULL
CREATE TABLE auth.PasswordResets(
 TokenHash binary(32) NOT NULL PRIMARY KEY,
 UserId uniqueidentifier NOT NULL REFERENCES auth.Users(UserId),
 ExpiresAt datetime2(3) NOT NULL,
 UsedAt datetime2(3) NULL,
 CreatedAt datetime2(3) NOT NULL DEFAULT SYSUTCDATETIME()
);
IF NOT EXISTS(SELECT 1 FROM dbo.SchemaMigrations WHERE Version='011-password-recovery')
INSERT dbo.SchemaMigrations(Version) VALUES('011-password-recovery');
COMMIT;
