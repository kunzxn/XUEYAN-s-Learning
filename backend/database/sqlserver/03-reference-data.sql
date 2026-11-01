SET XACT_ABORT ON;
BEGIN TRANSACTION;
IF NOT EXISTS (SELECT 1 FROM catalog.Frameworks WHERE Code='HSK-3.0')
 INSERT catalog.Frameworks(Code,Title,SourceDescription)
 VALUES ('HSK-3.0',N'HSK 3.0',N'data/HSK-3.0-words-list-main; raw sources require review before publication.');
DECLARE @FrameworkId int=(SELECT FrameworkId FROM catalog.Frameworks WHERE Code='HSK-3.0');
INSERT catalog.Levels(FrameworkId,Code,Title,SortOrder)
SELECT @FrameworkId,v.Code,v.Title,v.SortOrder
FROM (VALUES ('1',N'HSK 1',1),('2',N'HSK 2',2),('3',N'HSK 3',3),('4',N'HSK 4',4),
 ('5',N'HSK 5',5),('6',N'HSK 6',6),('7-9',N'HSK 7–9',7)) v(Code,Title,SortOrder)
WHERE NOT EXISTS (SELECT 1 FROM catalog.Levels l WHERE l.FrameworkId=@FrameworkId AND l.Code=v.Code);
IF NOT EXISTS (SELECT 1 FROM dbo.SchemaMigrations WHERE Version='003-reference-data')
 INSERT dbo.SchemaMigrations(Version) VALUES ('003-reference-data');
COMMIT;
-- Intentionally no demo users/passwords, fabricated teacher qualifications or mock progress.
