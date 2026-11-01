SET NOCOUNT ON;
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET ARITHABORT ON;
SET XACT_ABORT OFF;
BEGIN TRANSACTION;
BEGIN TRY
 DECLARE @A uniqueidentifier=NEWID(),@B uniqueidentifier=NEWID();
 INSERT auth.Users(UserId,Email,Status) VALUES (@A,N'integrity-a@example.invalid','active'),(@B,N'integrity-b@example.invalid','active');
 INSERT catalog.Words(Slug,Simplified,Pinyin) VALUES ('integrity-word',N'学习',N'xuéxí');
 DECLARE @W bigint=SCOPE_IDENTITY();
 DECLARE @L int=(SELECT TOP(1) LevelId FROM catalog.Levels ORDER BY LevelId);
 INSERT catalog.Lessons(LevelId,Slug,Title,SortOrder) VALUES (@L,'integrity-lesson',N'Bài thử',999999);
 DECLARE @Lesson bigint=SCOPE_IDENTITY();
 BEGIN TRY
  INSERT learning.LessonProgress(UserId,LessonId,LastWordId) VALUES (@A,@Lesson,@W);
  THROW 52999,'Word outside lesson was accepted.',1;
 END TRY BEGIN CATCH IF ERROR_NUMBER()<>547 THROW; END CATCH;
 INSERT catalog.LessonWords(LessonId,WordId,SortOrder) VALUES (@Lesson,@W,1);
 INSERT learning.LessonProgress(UserId,LessonId,LastWordId) VALUES (@A,@Lesson,@W);
 INSERT learning.Collections(UserId,Name) VALUES (@A,N'Bộ riêng');
 DECLARE @Collection bigint=SCOPE_IDENTITY();
 BEGIN TRY
  INSERT learning.CollectionWords(CollectionId,UserId,WordId) VALUES (@Collection,@B,@W);
  THROW 52999,'Cross-owner collection item accepted.',1;
 END TRY BEGIN CATCH IF ERROR_NUMBER()<>547 THROW; END CATCH;
 INSERT learning.StudySessions(UserId,Mode) VALUES (@A,'review');
 DECLARE @Session uniqueidentifier=(SELECT StudySessionId FROM learning.StudySessions WHERE UserId=@A);
 DECLARE @Event uniqueidentifier=NEWID();
 BEGIN TRY
  INSERT learning.ReviewEvents(UserId,StudySessionId,WordId,ClientEventId,Rating,DurationMs) VALUES (@B,@Session,@W,@Event,3,1000);
  THROW 52999,'Cross-owner review accepted.',1;
 END TRY BEGIN CATCH IF ERROR_NUMBER()<>547 THROW; END CATCH;
 INSERT learning.ReviewEvents(UserId,StudySessionId,WordId,ClientEventId,Rating,DurationMs) VALUES (@A,@Session,@W,@Event,3,1000);
 BEGIN TRY
  INSERT learning.ReviewEvents(UserId,StudySessionId,WordId,ClientEventId,Rating,DurationMs) VALUES (@A,@Session,@W,@Event,3,1000);
  THROW 52999,'Duplicate review retry accepted.',1;
 END TRY BEGIN CATCH IF ERROR_NUMBER() NOT IN (2601,2627) THROW; END CATCH;
 PRINT 'PASS integrity: last word belongs to lesson, collection/session owner enforced, retry idempotency key unique';
 ROLLBACK;
END TRY BEGIN CATCH
 IF @@TRANCOUNT>0 ROLLBACK;
 THROW;
END CATCH;
