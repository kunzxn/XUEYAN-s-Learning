SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET NUMERIC_ROUNDABORT OFF;
GO
-- Run ONLY against a development database. All fixture rows and test users roll back.
SET NOCOUNT ON;
SET XACT_ABORT OFF;
BEGIN TRANSACTION;
BEGIN TRY
 CREATE USER xueyan_test_learner WITHOUT LOGIN;
 CREATE USER xueyan_test_admin WITHOUT LOGIN;
 CREATE USER xueyan_test_guest WITHOUT LOGIN;
 ALTER ROLE xueyan_learner ADD MEMBER xueyan_test_learner;
 ALTER ROLE xueyan_admin ADD MEMBER xueyan_test_admin;
 ALTER ROLE xueyan_guest ADD MEMBER xueyan_test_guest;

 DECLARE @A uniqueidentifier=NEWID(),@B uniqueidentifier=NEWID(),@Admin uniqueidentifier=NEWID();
 DECLARE @HashA binary(32)=HASHBYTES('SHA2_256','disposable-test-session-A'),
         @HashB binary(32)=HASHBYTES('SHA2_256','disposable-test-session-B'),
         @HashAdmin binary(32)=HASHBYTES('SHA2_256','disposable-test-session-admin');
 INSERT auth.Users(UserId,Email,Status,RoleCode) VALUES
 (@A,N'rls-test-a@example.invalid','active','learner'),
 (@B,N'rls-test-b@example.invalid','active','learner'),
 (@Admin,N'rls-test-admin@example.invalid','active','admin');
 INSERT auth.Sessions(UserId,TokenHash,ExpiresAt) VALUES
 (@A,@HashA,DATEADD(hour,1,SYSUTCDATETIME())),
 (@B,@HashB,DATEADD(hour,1,SYSUTCDATETIME())),
 (@Admin,@HashAdmin,DATEADD(hour,1,SYSUTCDATETIME()));
 INSERT learning.Profiles(UserId,DisplayName) VALUES (@A,N'Người học A · 学习 xuéxí'),(@B,N'Người học B');
 INSERT catalog.Words(Slug,Simplified,Pinyin,MeaningVi,Status) VALUES
 ('permission-test-published',N'学习',N'xuéxí',N'Học tập','published'),
 ('permission-test-private',N'朋友',N'péngyou',N'Bạn bè','draft');
 DECLARE @WordId bigint=(SELECT WordId FROM catalog.Words WHERE Slug='permission-test-published');
 DECLARE @OtherWordId bigint=(SELECT WordId FROM catalog.Words WHERE Slug='permission-test-private');
 INSERT learning.WordNotes(UserId,WordId,Note) VALUES (@A,@WordId,N'Ghi chú A'),(@B,@WordId,N'Ghi chú B');
 INSERT classroom.Teachers(Slug,DisplayName,Status) VALUES ('permission-class-teacher',N'Giáo viên mẫu test','published');
 DECLARE @Teacher bigint=SCOPE_IDENTITY();
 INSERT classroom.Classes(Slug,TeacherId,Title,MeetingUrl,Status)
 VALUES ('permission-class',@Teacher,N'Lớp test',N'https://example.invalid/private-room','active');
 DECLARE @Class bigint=SCOPE_IDENTITY();
 INSERT classroom.Enrollments(ClassId,UserId) VALUES (@Class,@A);
 INSERT classroom.Assignments(ClassId,Title,Instructions,Status) VALUES (@Class,N'Bài test',N'Hướng dẫn','published');
 DECLARE @Assignment bigint=SCOPE_IDENTITY();
 INSERT classroom.Submissions(AssignmentId,ClassId,UserId,AttemptNo,Status,SubmittedAt)
 VALUES (@Assignment,@Class,@A,1,'submitted',SYSUTCDATETIME()),(@Assignment,@Class,@A,2,'submitted',SYSUTCDATETIME());
 INSERT classroom.Grades(SubmissionId,UserId,GraderId,Score,Feedback,PublishedAt)
 SELECT SubmissionId,@A,@Admin,80,N'Điểm test',CASE WHEN AttemptNo=1 THEN SYSUTCDATETIME() END
 FROM classroom.Submissions WHERE AssignmentId=@Assignment;

 EXECUTE AS USER='xueyan_test_guest';
 IF (SELECT COUNT(*) FROM catalog.PublishedWords WHERE Slug LIKE 'permission-test-%')<>1 THROW 52001,'Guest sees unpublished content.',1;
 BEGIN TRY
  SELECT * FROM learning.Profiles;
  THROW 52999,'Expected access denial.',1;
 END TRY BEGIN CATCH
  IF ERROR_NUMBER()=52999 THROW;
 END CATCH;
 REVERT;
 PRINT 'PASS guest: published content only; private profiles denied';

 EXECUTE AS USER='xueyan_test_learner';
 EXEC sys.sp_set_session_context @key=N'session_token_hash',@value=NULL;
 IF EXISTS (SELECT 1 FROM learning.Profiles) THROW 52002,'Missing session must deny personal rows.',1;
 -- Forging role/user context alone is intentionally ineffective.
 EXEC sys.sp_set_session_context @key=N'user_id',@value=@B;
 EXEC sys.sp_set_session_context @key=N'role',@value=N'admin';
 IF EXISTS (SELECT 1 FROM learning.Profiles) THROW 52003,'Untrusted role context was accepted.',1;
 EXEC sys.sp_set_session_context @key=N'session_token_hash',@value=@HashA;
 IF (SELECT COUNT(*) FROM learning.Profiles)<>1 THROW 52004,'Learner row isolation failed.',1;
 IF EXISTS (SELECT 1 FROM learning.WordNotes WHERE UserId=@B) THROW 52005,'Other notes leaked.',1;
 IF (SELECT COUNT(*) FROM classroom.MyClasses WHERE ClassId=@Class)<>1 THROW 52021,'Own class missing.',1;
 IF (SELECT COUNT(*) FROM classroom.MyAssignments WHERE ClassId=@Class)<>1 THROW 52022,'Own assignment missing.',1;
 IF (SELECT COUNT(*) FROM classroom.Grades WHERE UserId=@A)<>1 THROW 52023,'Draft grade leaked or published grade missing.',1;
 UPDATE learning.Profiles SET DisplayName=N'Đã sửa · 学言' WHERE UserId=@A;
 IF @@ROWCOUNT<>1 THROW 52006,'Own profile update failed.',1;
 UPDATE learning.Profiles SET DisplayName=N'Forbidden' WHERE UserId=@B;
 IF @@ROWCOUNT<>0 THROW 52007,'Other profile update allowed.',1;
 BEGIN TRY
  UPDATE learning.WordNotes SET UserId=@Admin WHERE UserId=@A AND WordId=@WordId;
  THROW 52999,'Expected ownership write denial.',1;
 END TRY BEGIN CATCH
  IF ERROR_NUMBER()=52999 THROW;
 END CATCH;
 BEGIN TRY
  INSERT learning.WordNotes(UserId,WordId,Note) VALUES (@B,@OtherWordId,N'Forged');
  THROW 52999,'Expected forged insert denial.',1;
 END TRY BEGIN CATCH
  IF ERROR_NUMBER()=52999 THROW;
 END CATCH;
 INSERT learning.Collections(UserId,Name) VALUES (@A,N'Bộ từ kiểm thử');
 BEGIN TRY
  INSERT learning.Collections(UserId,Name) VALUES (@A,N'bỘ TỪ KIỂM THỬ');
  THROW 52999,'Expected case-insensitive duplicate denial.',1;
 END TRY BEGIN CATCH
  IF ERROR_NUMBER()=52999 THROW;
 END CATCH;
 BEGIN TRY
  INSERT learning.Collections(UserId,Name) VALUES (@A,N'   ');
  THROW 52999,'Expected blank name denial.',1;
 END TRY BEGIN CATCH
  IF ERROR_NUMBER()=52999 THROW;
 END CATCH;
 BEGIN TRY
  UPDATE auth.Users SET RoleCode='admin' WHERE UserId=@A;
  THROW 52999,'Expected role escalation denial.',1;
 END TRY BEGIN CATCH
  IF ERROR_NUMBER()=52999 THROW;
 END CATCH;
 BEGIN TRY
  SELECT TokenHash FROM auth.Sessions;
  THROW 52999,'Expected session secret read denial.',1;
 END TRY BEGIN CATCH
  IF ERROR_NUMBER()=52999 THROW;
 END CATCH;
 BEGIN TRY
  UPDATE classroom.Grades SET Score=100;
  THROW 52999,'Expected grade forgery denial.',1;
 END TRY BEGIN CATCH
  IF ERROR_NUMBER()=52999 THROW;
 END CATCH;
 -- A valid admin token cannot elevate a connection assigned only learner role.
 EXEC sys.sp_set_session_context @key=N'session_token_hash',@value=@HashB;
 IF EXISTS (SELECT 1 FROM classroom.MyClasses WHERE ClassId=@Class) THROW 52024,'Non-enrolled class leaked.',1;
 IF EXISTS (SELECT 1 FROM classroom.MyAssignments WHERE ClassId=@Class) THROW 52025,'Non-enrolled assignment leaked.',1;
 EXEC sys.sp_set_session_context @key=N'session_token_hash',@value=@HashAdmin;
 IF EXISTS (SELECT 1 FROM learning.Profiles) THROW 52008,'DB role mismatch accepted.',1;
 REVERT;
 PRINT 'PASS learner: ownership read/write, missing context, forged role, grade/role escalation and secret denial';
 PRINT 'PASS collections: blank and normalized duplicate names rejected';
 PRINT 'PASS classroom: enrolled views only; unpublished grades hidden';

 UPDATE auth.Sessions SET ExpiresAt=DATEADD(second,-1,SYSUTCDATETIME()),CreatedAt=DATEADD(hour,-2,SYSUTCDATETIME()) WHERE UserId=@A;
 EXECUTE AS USER='xueyan_test_learner';
 EXEC sys.sp_set_session_context @key=N'session_token_hash',@value=@HashA;
 IF EXISTS (SELECT 1 FROM learning.Profiles) THROW 52009,'Expired session accepted.',1;
 REVERT;
 UPDATE auth.Sessions SET RevokedAt=SYSUTCDATETIME() WHERE UserId=@B;
 EXECUTE AS USER='xueyan_test_learner';
 EXEC sys.sp_set_session_context @key=N'session_token_hash',@value=@HashB;
 IF EXISTS (SELECT 1 FROM learning.Profiles) THROW 52010,'Revoked session accepted.',1;
 REVERT;
 PRINT 'PASS expired/revoked sessions: no personal rows';

 EXECUTE AS USER='xueyan_test_admin';
 EXEC sys.sp_set_session_context @key=N'session_token_hash',@value=@HashAdmin;
 IF (SELECT COUNT(*) FROM learning.Profiles WHERE UserId IN (@A,@B))<>2 THROW 52011,'Admin cannot manage profiles.',1;
 IF (SELECT COUNT(*) FROM auth.AdminAccounts WHERE UserId IN (@A,@B,@Admin))<>3 THROW 52026,'Admin account view failed.',1;
 INSERT classroom.Teachers(Slug,DisplayName,Status) VALUES ('permission-test-teacher',N'Hồ sơ giáo viên thử','draft');
 IF @@ROWCOUNT<>1 THROW 52012,'Admin content write failed.',1;
 EXEC auth.SetUserAccess @TargetUserId=@B,@RoleCode='learner',@Status='suspended';
 REVERT;
 IF NOT EXISTS (SELECT 1 FROM auth.Users WHERE UserId=@B AND Status='suspended') THROW 52013,'Admin account update failed.',1;
 IF NOT EXISTS (SELECT 1 FROM auth.AuditEvents WHERE ActorId=@Admin AND ActionCode='user.access_changed') THROW 52014,'Access change missing audit.',1;
 PRINT 'PASS admin: manages profiles/teacher records and account status with audit';

 -- Preserve a literal distinction between verified Unicode and mojibake.
 IF NOT EXISTS (SELECT 1 FROM learning.Profiles WHERE UserId=@A AND DisplayName=N'Đã sửa · 学言')
    THROW 52015,'Vietnamese/Han Unicode round-trip failed.',1;
 PRINT 'PASS Unicode: Vietnamese accents and Han preserved';

 EXEC sys.sp_set_session_context @key=N'session_token_hash',@value=NULL;
 EXEC sys.sp_set_session_context @key=N'user_id',@value=NULL;
 EXEC sys.sp_set_session_context @key=N'role',@value=NULL;
 ROLLBACK;
 PRINT 'PASS: all test fixtures rolled back; no test accounts remain.';
END TRY
BEGIN CATCH
 IF USER_NAME() IN ('xueyan_test_guest','xueyan_test_learner','xueyan_test_admin') REVERT;
 IF @@TRANCOUNT>0 ROLLBACK;
 EXEC sys.sp_set_session_context @key=N'session_token_hash',@value=NULL;
 THROW;
END CATCH;

