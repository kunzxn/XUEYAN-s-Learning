using System.Data;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Data.SqlClient;

// Explicit maintenance command only; never imports on web startup or overwrites edited words.
public static class HskImporter
{
 public static async Task Run(Database db,string source) {
  var rows=new DataTable();rows.Columns.Add("Slug",typeof(string));rows.Columns.Add("Traditional",typeof(string));rows.Columns.Add("Simplified",typeof(string));rows.Columns.Add("Pinyin",typeof(string));rows.Columns.Add("MeaningEn",typeof(string));rows.Columns.Add("Level",typeof(string));rows.Columns.Add("SourceOrder",typeof(int));
  foreach(var level in new[]{"1","2","3","4","5","6","7-9"}) {
   var path=Path.Combine(source,$"HSK {level}.tsv");
   var order=0;foreach(var line in await File.ReadAllLinesAsync(path,Encoding.UTF8)) {
    if(string.IsNullOrWhiteSpace(line))continue;
    var parts=line.Split('\t');
    if(parts.Length<4||parts.Take(4).Any(string.IsNullOrWhiteSpace)||parts[0].Length>100||parts[1].Length>100||parts[2].Length>200||parts[3].Length>4000)throw new InvalidOperationException($"Invalid source row in HSK {level}; no data was imported.");
    var key=parts[1].Normalize()+"|"+parts[2].Normalize();
    var slug="hsk30-"+Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(key))).ToLowerInvariant();
    rows.Rows.Add(slug,parts[0],parts[1],parts[2],parts[3],level,++order);
   }
  }
  await using var c=await db.Open();using var tx=c.BeginTransaction(IsolationLevel.Serializable);
  try {
   using(var create=Database.Command(c,"CREATE TABLE #Hsk(Slug varchar(100) COLLATE DATABASE_DEFAULT,Traditional nvarchar(100) COLLATE DATABASE_DEFAULT,Simplified nvarchar(100) COLLATE DATABASE_DEFAULT,Pinyin nvarchar(200) COLLATE DATABASE_DEFAULT,MeaningEn nvarchar(4000) COLLATE DATABASE_DEFAULT,Level varchar(10) COLLATE DATABASE_DEFAULT,SourceOrder int);")){create.Transaction=tx;await create.ExecuteNonQueryAsync();}
   using(var bulk=new SqlBulkCopy(c,SqlBulkCopyOptions.Default,tx)){bulk.DestinationTableName="#Hsk";await bulk.WriteToServerAsync(rows);}
   using var command=Database.Command(c,"""
    IF (SELECT COUNT(*) FROM catalog.Levels l JOIN catalog.Frameworks f ON f.FrameworkId=l.FrameworkId WHERE f.Code='HSK-3.0')<>7 THROW 51040,'Apply reference-data migration first.',1;
    INSERT catalog.Words(Slug,Traditional,Simplified,Pinyin,MeaningEn,Status,SourceReference)
    SELECT h.Slug,MIN(h.Traditional),MIN(h.Simplified),MIN(h.Pinyin),MIN(h.MeaningEn),'published',N'data/HSK-3.0-words-list-main/HSK list with meaning; CC BY-SA 4.0; English definitions, Vietnamese pending review'
    FROM #Hsk h WHERE NOT EXISTS(SELECT 1 FROM catalog.Words w WHERE w.Slug=h.Slug) GROUP BY h.Slug;
    INSERT catalog.WordLevels(WordId,LevelId,SourceOrder)
    SELECT DISTINCT w.WordId,l.LevelId,h.SourceOrder FROM #Hsk h JOIN catalog.Words w ON w.Slug=h.Slug
    JOIN catalog.Levels l ON l.Code=h.Level JOIN catalog.Frameworks f ON f.FrameworkId=l.FrameworkId AND f.Code='HSK-3.0'
    WHERE NOT EXISTS(SELECT 1 FROM catalog.WordLevels wl WHERE wl.WordId=w.WordId AND wl.LevelId=l.LevelId);
    UPDATE wl SET SourceOrder=h.SourceOrder FROM catalog.WordLevels wl
    JOIN catalog.Words w ON w.WordId=wl.WordId JOIN catalog.Levels l ON l.LevelId=wl.LevelId
    JOIN catalog.Frameworks f ON f.FrameworkId=l.FrameworkId AND f.Code='HSK-3.0'
    JOIN (SELECT Slug,Level,MIN(SourceOrder) SourceOrder FROM #Hsk GROUP BY Slug,Level) h ON h.Slug=w.Slug AND h.Level=l.Code
    WHERE wl.SourceOrder IS NULL;
    """);command.Transaction=tx;await command.ExecuteNonQueryAsync();tx.Commit();
   Console.WriteLine($"HSK import complete: {rows.Rows.Count} source rows. Existing vocabulary and learner progress preserved.");
  } catch {tx.Rollback();throw;}
 }
}
