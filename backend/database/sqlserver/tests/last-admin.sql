SET NOCOUNT ON;
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET XACT_ABORT OFF;
-- The access procedure deliberately aborts its transaction when blocking removal.
-- A surrounding transaction is also rolled back; fixtures never survive this test.
IF EXISTS (SELECT 1 FROM auth.Users WHERE RoleCode='admin' AND Status='active')
BEGIN
 PRINT 'SKIP last-admin fixture: database already contains an active admin.';
 RETURN;
END;
BEGIN TRANSACTION;
BEGIN TRY
 DECLARE @Id uniqueidentifier=NEWID();
 INSERT auth.Users(UserId,Email,RoleCode,Status) VALUES (@Id,N'last-admin-test@example.invalid','admin','active');
 BEGIN TRY
  EXEC auth.SetUserAccess @TargetUserId=@Id,@RoleCode='learner',@Status='active';
  THROW 52999,'Final admin protection failed.',1;
 END TRY BEGIN CATCH
  IF ERROR_NUMBER()<>51013 THROW;
 END CATCH;
 IF @@TRANCOUNT>0 ROLLBACK;
 IF EXISTS (SELECT 1 FROM auth.Users WHERE Email=N'last-admin-test@example.invalid')
  THROW 52020,'Test fixture was not rolled back.',1;
 PRINT 'PASS final active admin cannot be demoted/disabled; fixture rolled back';
END TRY BEGIN CATCH
 IF @@TRANCOUNT>0 ROLLBACK;
 THROW;
END CATCH;
