SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET NUMERIC_ROUNDABORT OFF;
GO
-- Account management is deliberately narrow; no runtime role gets UPDATE auth.Users.
CREATE OR ALTER PROCEDURE auth.SetUserAccess
    @TargetUserId uniqueidentifier,
    @RoleCode varchar(10),
    @Status varchar(12)
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF NOT EXISTS (SELECT 1 FROM security.fn_Admin()) THROW 51010, 'Admin session required.', 1;
 DECLARE @ActorId uniqueidentifier=(SELECT UserId FROM security.fn_Identity());
 DECLARE @AdminCount int;
 IF @RoleCode NOT IN ('learner','admin') OR @Status NOT IN ('pending','active','suspended','closed')
    THROW 51011, 'Invalid role or status.', 1;
 BEGIN TRANSACTION;
 -- Serializes all role changes, preventing simultaneous removal of the final admin.
 SELECT @AdminCount=COUNT(*) FROM auth.Users WITH (UPDLOCK,HOLDLOCK) WHERE RoleCode='admin' AND Status='active';
 IF NOT EXISTS (SELECT 1 FROM auth.Users WHERE UserId=@TargetUserId)
 BEGIN ROLLBACK; THROW 51012, 'User not found.', 1; END;
 IF EXISTS (SELECT 1 FROM auth.Users WHERE UserId=@TargetUserId AND RoleCode='admin' AND Status='active')
    AND (@RoleCode<>'admin' OR @Status<>'active')
    AND @AdminCount<=1
 BEGIN ROLLBACK; THROW 51013, 'Cannot remove the final active admin.', 1; END;
 UPDATE auth.Users SET RoleCode=@RoleCode,Status=@Status,UpdatedAt=SYSUTCDATETIME() WHERE UserId=@TargetUserId;
 UPDATE auth.Sessions SET RevokedAt=SYSUTCDATETIME() WHERE UserId=@TargetUserId AND RevokedAt IS NULL;
 INSERT auth.AuditEvents(ActorId,ActionCode,EntityType,EntityId)
 VALUES (@ActorId,'user.access_changed','user',CONVERT(nvarchar(36),@TargetUserId));
 COMMIT;
END;
GO
GRANT EXECUTE ON auth.SetUserAccess TO xueyan_admin;
GO
CREATE OR ALTER VIEW auth.AdminAccounts AS
 SELECT UserId,Email,RoleCode,Status,EmailVerifiedAt,CreatedAt,UpdatedAt,Version
 FROM auth.Users WHERE EXISTS (SELECT 1 FROM security.fn_Admin());
GO
GRANT SELECT ON auth.AdminAccounts TO xueyan_admin;

IF NOT EXISTS (SELECT 1 FROM dbo.SchemaMigrations WHERE Version='004-access-management') INSERT dbo.SchemaMigrations(Version) VALUES ('004-access-management');
GO

