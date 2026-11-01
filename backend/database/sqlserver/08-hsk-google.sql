SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET XACT_ABORT ON;
BEGIN TRANSACTION;
IF COL_LENGTH('catalog.Words','MeaningEn') IS NULL
 ALTER TABLE catalog.Words ADD MeaningEn nvarchar(4000) NULL;
IF COL_LENGTH('catalog.WordLevels','SourceOrder') IS NULL
 ALTER TABLE catalog.WordLevels ADD SourceOrder int NULL;
IF OBJECT_ID('auth.ExternalIdentities','U') IS NULL
 CREATE TABLE auth.ExternalIdentities (
  Provider varchar(20) NOT NULL,
  Subject varchar(255) NOT NULL,
  UserId uniqueidentifier NOT NULL REFERENCES auth.Users(UserId),
  PRIMARY KEY(Provider,Subject),
  UNIQUE(Provider,UserId)
 );
EXEC(N'CREATE OR ALTER VIEW catalog.PublishedWords AS
 SELECT WordId,Slug,Simplified,Traditional,Pinyin,HanViet,MeaningVi,MeaningEn,PartOfSpeech
 FROM catalog.Words WHERE Status=''published'';');
EXEC(N'CREATE OR ALTER VIEW learning.MyLearnedWords AS
 SELECT p.UserId,w.WordId AS Id,w.Simplified,w.Pinyin,w.MeaningVi,w.MeaningEn,p.Repetitions,p.LastReviewedAt,p.NextReviewAt
 FROM learning.WordProgress p JOIN catalog.Words w ON w.WordId=p.WordId;');
IF NOT EXISTS(SELECT 1 FROM dbo.SchemaMigrations WHERE Version='008-hsk-google')
 INSERT dbo.SchemaMigrations(Version) VALUES('008-hsk-google');
COMMIT;
