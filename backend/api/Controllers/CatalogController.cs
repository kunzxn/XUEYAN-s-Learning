using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController,AllowAnonymous,Route("catalog")]
public sealed class CatalogController(Database database):ControllerBase
{
 [HttpGet("words")]
 public async Task<object> Search(string? query=null,string? level=null,int page=1){
  if((query?.Length??0)>100||page<1||page>100000||level!=null&&!new[]{"1","2","3","4","5","6","7-9"}.Contains(level))throw new ApiError(400,"Bộ lọc không hợp lệ.");
  var normalized=new string((query??"").Normalize(System.Text.NormalizationForm.FormD).Where(ch=>System.Globalization.CharUnicodeInfo.GetUnicodeCategory(ch)!=System.Globalization.UnicodeCategory.NonSpacingMark&&!char.IsWhiteSpace(ch)&&ch is not (>= '0' and <= '5')).ToArray());
  await using var c=await database.Open();
  const string source="""
   FROM catalog.Words w WHERE w.Status='published'
   AND (@level IS NULL OR EXISTS(SELECT 1 FROM catalog.WordLevels wl JOIN catalog.Levels l ON l.LevelId=wl.LevelId JOIN catalog.Frameworks f ON f.FrameworkId=l.FrameworkId WHERE wl.WordId=w.WordId AND l.Code=@level AND f.Code='HSK-3.0'))
   AND (@q='' OR CHARINDEX(@q,w.Simplified)>0 OR CHARINDEX(@q,REPLACE(w.Pinyin,' ','' ) COLLATE Latin1_General_100_CI_AI_SC)>0 OR CHARINDEX(@q,REPLACE(COALESCE(w.MeaningVi,w.MeaningEn,''),' ','' ) COLLATE Latin1_General_100_CI_AI_SC)>0 OR CHARINDEX(@q,REPLACE(COALESCE(w.HanViet,''),' ','' ) COLLATE Latin1_General_100_CI_AI_SC)>0)
   """;
  var values=new (string,object?)[]{("q",normalized),("level",level),("skip",(page-1)*20)};
  var count=await Database.Query(c,"SELECT COUNT(*) Total "+source,values);
  var items=await Database.Query(c,"SELECT w.WordId Id,w.Simplified,w.Pinyin,w.HanViet,w.MeaningVi,w.MeaningEn "+source+" ORDER BY CASE WHEN w.Simplified=@q THEN 0 ELSE 1 END,w.WordId OFFSET @skip ROWS FETCH NEXT 20 ROWS ONLY",values);
  return new{items,total=count[0]["total"],page,pageSize=20};
 }
 [HttpGet("levels")]
 public async Task<object> Levels(){await using var c=await database.Open();return await Database.Query(c,"""
  SELECT l.Code,l.Title,COUNT(w.WordId) WordCount FROM catalog.Levels l
  JOIN catalog.Frameworks f ON f.FrameworkId=l.FrameworkId AND f.Code='HSK-3.0'
  LEFT JOIN catalog.WordLevels wl ON wl.LevelId=l.LevelId
  LEFT JOIN catalog.Words w ON w.WordId=wl.WordId AND w.Status='published'
  GROUP BY l.Code,l.Title,l.SortOrder ORDER BY l.SortOrder
  """);}
 [HttpGet("levels/{level}/words")]
 public async Task<object> Words(string level,int page=1,int pageSize=30,string? query=null){
  if(!new[]{"1","2","3","4","5","6","7-9"}.Contains(level))throw new ApiError(404,"Không có cấp HSK này.");
  if(page<1||page>100000||pageSize<1||pageSize>100||query?.Length>100)throw new ApiError(400,"Bộ lọc hoặc phân trang không hợp lệ.");
  await using var c=await database.Open();
  const string source=" FROM catalog.Words w JOIN catalog.WordLevels wl ON wl.WordId=w.WordId JOIN catalog.Levels l ON l.LevelId=wl.LevelId JOIN catalog.Frameworks f ON f.FrameworkId=l.FrameworkId WHERE w.Status='published' AND f.Code='HSK-3.0' AND l.Code=@level AND (@q='' OR CHARINDEX(@q,w.Simplified)>0 OR CHARINDEX(@q,w.Pinyin)>0 OR CHARINDEX(@q,COALESCE(w.MeaningVi,w.MeaningEn,''))>0)";
  var values=new (string,object?)[]{("level",level),("q",query?.Trim()??""),("skip",(page-1)*pageSize),("take",pageSize)};
  var total=await Database.Query(c,"SELECT COUNT(*) Total"+source,values);
  var items=await Database.Query(c,"SELECT w.WordId Id,w.Simplified,w.Pinyin,w.HanViet,w.MeaningVi,w.MeaningEn"+source+" ORDER BY COALESCE(wl.SourceOrder,2147483647),w.WordId OFFSET @skip ROWS FETCH NEXT @take ROWS ONLY",values);
  return new{items,total=total[0]["total"],page,pageSize};
 }
}
