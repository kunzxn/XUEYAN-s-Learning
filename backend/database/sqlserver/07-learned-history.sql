SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO
-- Preserve the learner's history when a word is archived. Ownership comes from
-- RLS on WordProgress; no direct learner SELECT on unpublished Words is granted.
CREATE OR ALTER VIEW learning.MyLearnedWords AS
 SELECT p.UserId,w.WordId AS Id,w.Simplified,w.Pinyin,w.MeaningVi,p.Repetitions,p.LastReviewedAt,p.NextReviewAt
 FROM learning.WordProgress p JOIN catalog.Words w ON w.WordId=p.WordId;
GO
GRANT SELECT ON learning.MyLearnedWords TO xueyan_learner,xueyan_admin;
IF NOT EXISTS(SELECT 1 FROM dbo.SchemaMigrations WHERE Version='007-learned-history') INSERT dbo.SchemaMigrations(Version) VALUES('007-learned-history');
