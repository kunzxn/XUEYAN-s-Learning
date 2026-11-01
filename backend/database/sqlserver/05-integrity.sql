SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET XACT_ABORT ON;
GO
IF NOT EXISTS (SELECT 1 FROM dbo.SchemaMigrations WHERE Version='005-integrity')
BEGIN
 BEGIN TRANSACTION;
 -- Continue-learning pointers must refer to words actually in that lesson.
 ALTER TABLE learning.LessonProgress ADD CONSTRAINT FK_LastWordInLesson
 FOREIGN KEY (LessonId,LastWordId) REFERENCES catalog.LessonWords(LessonId,WordId);
 INSERT dbo.SchemaMigrations(Version) VALUES ('005-integrity');
 COMMIT;
END;
GO
