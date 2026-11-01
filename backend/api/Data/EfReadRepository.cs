using Microsoft.EntityFrameworkCore;

public interface IEfReadRepository
{
    Task<IReadOnlyList<WordDto>> Words(Actor actor);
    Task<IReadOnlyList<LearnedDto>> Progress(Actor actor);
    Task<IReadOnlyList<LearnedDto>> Due(Actor actor);
    Task<object> AdminList(Actor actor,string resource);
    Task<object> AdminLearned(Actor actor,Guid userId);
}
public sealed class EfReadRepository(Database database,TimeProvider clock):IEfReadRepository
{
    private async Task<LearningDbContext> Open(Actor actor){
        var connection=await database.Open(actor);
        try{return new(new DbContextOptionsBuilder<LearningDbContext>().UseSqlServer(connection,contextOwnsConnection:true).UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking).Options);}
        catch{await connection.DisposeAsync();throw;}
    }
    public async Task<IReadOnlyList<WordDto>> Words(Actor actor){await using var db=await Open(actor);return await db.PublishedWords.AsNoTracking().OrderByDescending(w=>w.WordId).Take(200).Select(w=>new WordDto(w.WordId,w.Slug,w.Simplified,w.Pinyin,w.HanViet,w.MeaningVi,w.MeaningEn)).ToListAsync();}
    public async Task<IReadOnlyList<LearnedDto>> Progress(Actor actor){await using var db=await Open(actor);return await db.Learned.AsNoTracking().Where(p=>p.UserId==actor.UserId).OrderByDescending(p=>p.LastReviewedAt).ThenBy(p=>p.Id).Select(p=>new LearnedDto(p.Id,p.Simplified,p.Pinyin,p.MeaningVi,p.Repetitions,p.LastReviewedAt,p.NextReviewAt,p.MeaningEn)).ToListAsync();}
    public async Task<IReadOnlyList<LearnedDto>> Due(Actor actor){
        var now=clock.GetUtcNow().UtcDateTime;await using var db=await Open(actor);
        return await (from p in db.Progress.AsNoTracking() join w in db.PublishedWords.AsNoTracking() on p.WordId equals w.WordId
            where p.UserId==actor.UserId&&p.NextReviewAt<=now orderby p.NextReviewAt,p.WordId
            select new LearnedDto(w.WordId,w.Simplified,w.Pinyin,w.MeaningVi,p.Repetitions,p.LastReviewedAt,p.NextReviewAt,w.MeaningEn)).Take(200).ToListAsync();
    }
    public async Task<object> AdminList(Actor actor,string resource){
        await using var db=await Open(actor);
        // Each branch has exactly one projected query, no lazy loading or per-row queries.
        return resource switch {
            "words"=>await db.Words.AsNoTracking().OrderByDescending(w=>w.WordId).Take(500).Select(w=>new{Id=w.WordId,w.Slug,w.Simplified,w.Pinyin,w.HanViet,w.MeaningVi,w.Status,w.Version}).ToListAsync(),
            "lessons"=>await db.Lessons.AsNoTracking().OrderByDescending(l=>l.LessonId).Take(500).Select(l=>new{Id=l.LessonId,l.LevelId,l.Slug,l.Title,l.Description,l.SortOrder,l.Status}).ToListAsync(),
            "teachers"=>await db.Teachers.AsNoTracking().OrderByDescending(t=>t.TeacherId).Take(500).Select(t=>new{Id=t.TeacherId,t.Slug,t.DisplayName,t.Headline,t.Bio,t.ConsultationSchedule,t.Status,t.Version}).ToListAsync(),
            "levels"=>await(from l in db.Levels.AsNoTracking() join f in db.Frameworks.AsNoTracking() on l.FrameworkId equals f.FrameworkId orderby f.FrameworkId,l.SortOrder select new{Id=l.LevelId,l.Title,Framework=f.Title}).ToListAsync(),
            "users"=>await(from u in db.Accounts.AsNoTracking() join p in db.Profiles.AsNoTracking() on u.UserId equals p.UserId into profiles from p in profiles.DefaultIfEmpty() orderby u.CreatedAt descending select new{Id=u.UserId,u.Email,u.RoleCode,u.Status,u.Version,DisplayName=p==null?null:p.DisplayName,LearnedWords=db.Progress.Count(w=>w.UserId==u.UserId)}).Take(500).ToListAsync(),
            _=>throw new ApiError(404,"Không có mục quản lý này.")};
    }
    public async Task<object> AdminLearned(Actor actor,Guid userId){await using var db=await Open(actor);if(userId==Guid.Empty)throw new ApiError(400,"ID người dùng không hợp lệ.");if(!await db.Accounts.AnyAsync(u=>u.UserId==userId))throw new ApiError(404,"Không tìm thấy người dùng.");return await(from p in db.Progress.AsNoTracking() join w in db.Words.AsNoTracking() on p.WordId equals w.WordId where p.UserId==userId orderby p.LastReviewedAt descending,p.WordId select new LearnedDto(w.WordId,w.Simplified,w.Pinyin,w.MeaningVi,p.Repetitions,p.LastReviewedAt,p.NextReviewAt,w.MeaningEn)).ToListAsync();}
}
