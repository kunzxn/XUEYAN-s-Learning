SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET XACT_ABORT ON;
GO
IF EXISTS (SELECT 1 FROM dbo.SchemaMigrations WHERE Version='002-permissions')
    THROW 51001, 'Permissions migration already applied.', 1;
GO
CREATE ROLE xueyan_guest AUTHORIZATION dbo;
CREATE ROLE xueyan_learner AUTHORIZATION dbo;
CREATE ROLE xueyan_admin AUTHORIZATION dbo;
GO
-- No role or UserId supplied by the browser is trusted. The API hashes a random
-- session bearer token; this hash must match a non-revoked, unexpired DB session.
-- Runtime users cannot read/create sessions or password hashes.
CREATE FUNCTION security.fn_Identity()
RETURNS TABLE WITH SCHEMABINDING AS RETURN
    SELECT u.UserId, u.RoleCode
    FROM auth.Sessions AS s JOIN auth.Users AS u ON u.UserId=s.UserId
    WHERE s.TokenHash=TRY_CONVERT(binary(32),SESSION_CONTEXT(N'session_token_hash'))
      AND s.RevokedAt IS NULL AND s.ExpiresAt>SYSUTCDATETIME() AND u.Status='active'
      AND ((u.RoleCode='learner' AND IS_MEMBER(N'xueyan_learner')=1)
        OR (u.RoleCode='admin' AND IS_MEMBER(N'xueyan_admin')=1));
GO
CREATE FUNCTION security.fn_Admin()
RETURNS TABLE WITH SCHEMABINDING AS RETURN
    SELECT 1 AS Allowed WHERE IS_MEMBER(N'db_owner')=1
       OR EXISTS (SELECT 1 FROM security.fn_Identity() WHERE RoleCode='admin');
GO
CREATE FUNCTION security.fn_Owner(@UserId uniqueidentifier)
RETURNS TABLE WITH SCHEMABINDING AS RETURN
    SELECT 1 AS Allowed WHERE EXISTS (SELECT 1 FROM security.fn_Admin())
       OR EXISTS (SELECT 1 FROM security.fn_Identity() WHERE UserId=@UserId);
GO
CREATE FUNCTION security.fn_Grade(@UserId uniqueidentifier, @PublishedAt datetime2(3))
RETURNS TABLE WITH SCHEMABINDING AS RETURN
    SELECT 1 AS Allowed WHERE EXISTS (SELECT 1 FROM security.fn_Admin())
       OR (@PublishedAt IS NOT NULL AND EXISTS (SELECT 1 FROM security.fn_Identity() WHERE UserId=@UserId));
GO
-- FILTER protects reads/updates/deletes; BLOCK protects forged ownership on writes.
DECLARE @table nvarchar(150), @sql nvarchar(max);
DECLARE owned CURSOR LOCAL FAST_FORWARD FOR
SELECT TableName FROM (VALUES
 (N'learning.Profiles'),(N'learning.Preferences'),(N'learning.WordNotes'),
 (N'learning.Collections'),(N'learning.CollectionWords'),(N'learning.LessonProgress'),
 (N'learning.StudySessions'),(N'learning.ReviewEvents'),(N'learning.WordProgress'),
 (N'classroom.Enrollments'),(N'classroom.Submissions'),(N'classroom.ConsultationRequests'),
 (N'content.Assets'),(N'content.Notifications'),(N'content.SupportRequests')) AS t(TableName);
OPEN owned;
FETCH NEXT FROM owned INTO @table;
WHILE @@FETCH_STATUS=0
BEGIN
    SET @sql=N'CREATE SECURITY POLICY security.'+QUOTENAME(REPLACE(@table,N'.',N'_')+N'_owner')+N'
      ADD FILTER PREDICATE security.fn_Owner(UserId) ON '+@table+N',
      ADD BLOCK PREDICATE security.fn_Owner(UserId) ON '+@table+N' AFTER INSERT,
      ADD BLOCK PREDICATE security.fn_Owner(UserId) ON '+@table+N' AFTER UPDATE
      WITH (STATE=ON, SCHEMABINDING=ON);';
    EXEC sys.sp_executesql @sql;
    FETCH NEXT FROM owned INTO @table;
END;
CLOSE owned; DEALLOCATE owned;
GO
CREATE SECURITY POLICY security.classroom_Grades_visibility
 ADD FILTER PREDICATE security.fn_Grade(UserId,PublishedAt) ON classroom.Grades,
 ADD BLOCK PREDICATE security.fn_Grade(UserId,PublishedAt) ON classroom.Grades AFTER INSERT,
 ADD BLOCK PREDICATE security.fn_Grade(UserId,PublishedAt) ON classroom.Grades AFTER UPDATE
 WITH (STATE=ON,SCHEMABINDING=ON);
GO
CREATE VIEW catalog.PublishedWords AS
 SELECT WordId,Slug,Simplified,Traditional,Pinyin,HanViet,MeaningVi,PartOfSpeech
 FROM catalog.Words WHERE Status='published';
GO
CREATE VIEW catalog.PublishedWordLevels AS
 SELECT wl.WordId,wl.LevelId FROM catalog.WordLevels wl
 JOIN catalog.Words w ON w.WordId=wl.WordId WHERE w.Status='published';
GO
CREATE VIEW catalog.PublishedExamples AS
 SELECT e.* FROM catalog.Examples e JOIN catalog.Words w ON w.WordId=e.WordId WHERE w.Status='published';
GO
CREATE VIEW catalog.PublishedLessons AS
 SELECT LessonId,LevelId,Slug,Title,Description,SortOrder FROM catalog.Lessons WHERE Status='published';
GO
CREATE VIEW catalog.PublishedLessonWords AS
 SELECT lw.* FROM catalog.LessonWords lw JOIN catalog.Lessons l ON l.LessonId=lw.LessonId
 JOIN catalog.Words w ON w.WordId=lw.WordId WHERE l.Status='published' AND w.Status='published';
GO
CREATE VIEW classroom.PublishedTeachers AS
 SELECT TeacherId,Slug,DisplayName,Headline,Bio,ConsultationSchedule FROM classroom.Teachers WHERE Status='published';
GO
CREATE VIEW classroom.PublicClasses AS
 SELECT ClassId,Slug,TeacherId,LevelId,Title,ScheduleDescription,Status,StartsAt,EndsAt
 FROM classroom.Classes WHERE Status IN ('open','active','completed');
GO
CREATE VIEW classroom.MyClasses AS
 SELECT c.* FROM classroom.Classes c
 WHERE EXISTS (SELECT 1 FROM classroom.Enrollments e JOIN security.fn_Identity() i ON i.UserId=e.UserId
               WHERE e.ClassId=c.ClassId AND e.Status IN ('active','completed'));
GO
CREATE VIEW classroom.MyAssignments AS
 SELECT a.* FROM classroom.Assignments a WHERE a.Status IN ('published','closed')
 AND EXISTS (SELECT 1 FROM classroom.Enrollments e JOIN security.fn_Identity() i ON i.UserId=e.UserId
             WHERE e.ClassId=a.ClassId AND e.Status IN ('active','completed'));
GO
CREATE VIEW content.PublishedArticles AS
 SELECT ArticleId,Slug,Kind,Title,Body,PublishedAt,UpdatedAt FROM content.Articles
 WHERE Status='published' AND PublishedAt<=SYSUTCDATETIME();
GO
CREATE VIEW auth.MyAccount AS
 SELECT UserId,Email,RoleCode,Status,EmailVerifiedAt,CreatedAt FROM auth.Users u
 WHERE EXISTS (SELECT 1 FROM security.fn_Identity() i WHERE i.UserId=u.UserId);
GO
DECLARE @role sysname, @sql nvarchar(max);
DECLARE readers CURSOR LOCAL FAST_FORWARD FOR SELECT name FROM sys.database_principals
 WHERE name IN ('xueyan_guest','xueyan_learner');
OPEN readers; FETCH NEXT FROM readers INTO @role;
WHILE @@FETCH_STATUS=0
BEGIN
 SET @sql=N'GRANT SELECT ON catalog.Frameworks TO '+QUOTENAME(@role)+N';
 GRANT SELECT ON catalog.Levels TO '+QUOTENAME(@role)+N';
 GRANT SELECT ON catalog.PublishedWords TO '+QUOTENAME(@role)+N';
 GRANT SELECT ON catalog.PublishedWordLevels TO '+QUOTENAME(@role)+N';
 GRANT SELECT ON catalog.PublishedExamples TO '+QUOTENAME(@role)+N';
 GRANT SELECT ON catalog.PublishedLessons TO '+QUOTENAME(@role)+N';
 GRANT SELECT ON catalog.PublishedLessonWords TO '+QUOTENAME(@role)+N';
 GRANT SELECT ON classroom.PublishedTeachers TO '+QUOTENAME(@role)+N';
 GRANT SELECT ON classroom.PublicClasses TO '+QUOTENAME(@role)+N';
 GRANT SELECT ON content.PublishedArticles TO '+QUOTENAME(@role)+N';';
 EXEC sys.sp_executesql @sql;
 FETCH NEXT FROM readers INTO @role;
END;
CLOSE readers; DEALLOCATE readers;
GO
GRANT SELECT ON auth.MyAccount TO xueyan_learner;
GRANT SELECT,INSERT,UPDATE ON learning.Profiles TO xueyan_learner;
GRANT SELECT,INSERT,UPDATE ON learning.Preferences TO xueyan_learner;
GRANT SELECT,INSERT,UPDATE,DELETE ON learning.WordNotes TO xueyan_learner;
GRANT SELECT,INSERT,UPDATE,DELETE ON learning.Collections TO xueyan_learner;
GRANT SELECT,INSERT,DELETE ON learning.CollectionWords TO xueyan_learner;
GRANT SELECT ON learning.LessonProgress TO xueyan_learner;
GRANT SELECT ON learning.StudySessions TO xueyan_learner;
GRANT SELECT ON learning.ReviewEvents TO xueyan_learner;
GRANT SELECT ON learning.WordProgress TO xueyan_learner;
GRANT SELECT ON classroom.MyClasses TO xueyan_learner;
GRANT SELECT ON classroom.MyAssignments TO xueyan_learner;
GRANT SELECT ON classroom.Enrollments TO xueyan_learner;
GRANT SELECT ON classroom.Submissions TO xueyan_learner;
GRANT SELECT ON classroom.Grades TO xueyan_learner;
GRANT SELECT ON classroom.ConsultationRequests TO xueyan_learner;
GRANT SELECT ON content.Assets TO xueyan_learner;
GRANT SELECT ON content.Notifications TO xueyan_learner;
GRANT UPDATE (ReadAt) ON content.Notifications TO xueyan_learner;
GRANT SELECT ON content.SupportRequests TO xueyan_learner;
-- Workflows (submitting, grading, enrolling, SRS) must use validated server commands.
-- No direct learner write to authoritative progress/grade/enrollment/session tables.
GRANT SELECT,INSERT,UPDATE,DELETE ON SCHEMA::catalog TO xueyan_admin;
GRANT SELECT,INSERT,UPDATE,DELETE ON SCHEMA::classroom TO xueyan_admin;
GRANT SELECT,INSERT,UPDATE,DELETE ON SCHEMA::content TO xueyan_admin;
GRANT SELECT,INSERT,UPDATE,DELETE ON SCHEMA::learning TO xueyan_admin;
GRANT SELECT ON auth.AuditEvents TO xueyan_admin;
DENY SELECT,INSERT,UPDATE,DELETE ON auth.PasswordCredentials TO xueyan_learner,xueyan_admin,xueyan_guest;
DENY SELECT,INSERT,UPDATE,DELETE ON auth.Sessions TO xueyan_learner,xueyan_admin,xueyan_guest;
DENY SELECT,INSERT,UPDATE,DELETE ON auth.OneTimeTokens TO xueyan_learner,xueyan_admin,xueyan_guest;
GO
INSERT dbo.SchemaMigrations(Version) VALUES ('002-permissions');
GO

