SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET XACT_ABORT ON;
BEGIN TRANSACTION;
IF OBJECT_ID('learning.AvatarImages','U') IS NULL
 CREATE TABLE learning.AvatarImages (
  UserId uniqueidentifier NOT NULL PRIMARY KEY REFERENCES auth.Users(UserId),
  Content varbinary(max) NOT NULL,
  Version rowversion NOT NULL,
  CONSTRAINT CK_AvatarBytes CHECK(DATALENGTH(Content) BETWEEN 4 AND 24576)
 );
EXEC(N'CREATE OR ALTER VIEW learning.MySavedWords AS
 SELECT DISTINCT cw.UserId,w.WordId Id,w.Simplified,w.Pinyin,w.HanViet,w.MeaningVi,w.MeaningEn
 FROM learning.CollectionWords cw JOIN catalog.Words w ON w.WordId=cw.WordId JOIN learning.Collections c ON c.CollectionId=cw.CollectionId AND c.UserId=cw.UserId WHERE c.Name=N''Từ đã lưu'';');
GRANT SELECT ON learning.MySavedWords TO xueyan_learner,xueyan_admin;
IF NOT EXISTS(SELECT 1 FROM dbo.SchemaMigrations WHERE Version='009-user-profile')
 INSERT dbo.SchemaMigrations(Version) VALUES('009-user-profile');
COMMIT;
