SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET XACT_ABORT ON;
BEGIN TRANSACTION;
DECLARE @old sysname=(SELECT TOP(1) name FROM sys.check_constraints WHERE parent_object_id=OBJECT_ID('auth.Users') AND definition LIKE '%RoleCode%' AND definition NOT LIKE '%teacher%');
IF @old IS NOT NULL BEGIN DECLARE @ddl nvarchar(max)=N'ALTER TABLE auth.Users DROP CONSTRAINT '+QUOTENAME(@old);EXEC sys.sp_executesql @ddl;END;
IF NOT EXISTS(SELECT 1 FROM sys.check_constraints WHERE parent_object_id=OBJECT_ID('auth.Users') AND name='CK_UserRole')
 ALTER TABLE auth.Users WITH CHECK ADD CONSTRAINT CK_UserRole CHECK(RoleCode IN ('learner','teacher','admin'));
IF NOT EXISTS(SELECT 1 FROM sys.database_principals WHERE name='xueyan_api_teacher') CREATE USER xueyan_api_teacher WITHOUT LOGIN;
-- Teacher UI is currently a preview: do not grant learner/admin private data access.
IF IS_ROLEMEMBER('xueyan_guest','xueyan_api_teacher')<>1 ALTER ROLE xueyan_guest ADD MEMBER xueyan_api_teacher;
COMMIT;
GO
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
 IF @RoleCode NOT IN ('learner','teacher','admin') OR @Status NOT IN ('pending','active','suspended','closed')
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
IF NOT EXISTS(SELECT 1 FROM dbo.SchemaMigrations WHERE Version='010-workspace-roles') INSERT dbo.SchemaMigrations(Version) VALUES('010-workspace-roles');
GO
