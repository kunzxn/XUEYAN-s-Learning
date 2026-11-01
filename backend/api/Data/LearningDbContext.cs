using Microsoft.EntityFrameworkCore;

// Read model of the existing, SQL-migrated database. EF never EnsureCreated/Migrate here.
public sealed class LearningDbContext(DbContextOptions<LearningDbContext> options):DbContext(options)
{
    public DbSet<WordRead> Words=>Set<WordRead>();
    public DbSet<PublishedWordRead> PublishedWords=>Set<PublishedWordRead>();
    public DbSet<ProgressRead> Progress=>Set<ProgressRead>();
    public DbSet<LearnedRead> Learned=>Set<LearnedRead>();
    public DbSet<LessonRead> Lessons=>Set<LessonRead>();
    public DbSet<TeacherRead> Teachers=>Set<TeacherRead>();
    public DbSet<AdminAccountRead> Accounts=>Set<AdminAccountRead>();
    public DbSet<ProfileRead> Profiles=>Set<ProfileRead>();
    public DbSet<LevelRead> Levels=>Set<LevelRead>();
    public DbSet<FrameworkRead> Frameworks=>Set<FrameworkRead>();
    protected override void OnModelCreating(ModelBuilder m){
        m.Entity<WordRead>().ToTable("Words","catalog").HasKey(w=>w.WordId);
        m.Entity<WordRead>().Property(w=>w.Version).IsRowVersion();
        m.Entity<PublishedWordRead>().ToView("PublishedWords","catalog").HasNoKey();
        m.Entity<ProgressRead>().ToTable("WordProgress","learning").HasKey(p=>new{p.UserId,p.WordId});
        m.Entity<LearnedRead>().ToView("MyLearnedWords","learning").HasNoKey();
        m.Entity<LessonRead>().ToTable("Lessons","catalog").HasKey(l=>l.LessonId);
        m.Entity<TeacherRead>().ToTable("Teachers","classroom").HasKey(t=>t.TeacherId);
        m.Entity<TeacherRead>().Property(t=>t.Version).IsRowVersion();
        m.Entity<AdminAccountRead>().ToView("AdminAccounts","auth").HasNoKey();
        m.Entity<ProfileRead>().ToTable("Profiles","learning").HasKey(p=>p.UserId);
        m.Entity<LevelRead>().ToTable("Levels","catalog").HasKey(l=>l.LevelId);
        m.Entity<FrameworkRead>().ToTable("Frameworks","catalog").HasKey(f=>f.FrameworkId);
    }
}
public sealed class WordRead {public long WordId{get;set;}public string Slug{get;set;}="";public string Simplified{get;set;}="";public string Pinyin{get;set;}="";public string? HanViet{get;set;}public string? MeaningVi{get;set;}public string? MeaningEn{get;set;}public string Status{get;set;}="";public byte[] Version{get;set;}=[];}
public sealed class PublishedWordRead {public long WordId{get;set;}public string Slug{get;set;}="";public string Simplified{get;set;}="";public string Pinyin{get;set;}="";public string? HanViet{get;set;}public string? MeaningVi{get;set;}public string? MeaningEn{get;set;}}
public sealed class ProgressRead {public Guid UserId{get;set;}public long WordId{get;set;}public int Repetitions{get;set;}public DateTime? LastReviewedAt{get;set;}public DateTime NextReviewAt{get;set;}}
public sealed class LearnedRead {public Guid UserId{get;set;}public long Id{get;set;}public string Simplified{get;set;}="";public string Pinyin{get;set;}="";public string? MeaningVi{get;set;}public string? MeaningEn{get;set;}public int Repetitions{get;set;}public DateTime? LastReviewedAt{get;set;}public DateTime NextReviewAt{get;set;}}
public sealed class LessonRead {public long LessonId{get;set;}public int LevelId{get;set;}public string Slug{get;set;}="";public string Title{get;set;}="";public string? Description{get;set;}public int SortOrder{get;set;}public string Status{get;set;}="";}
public sealed class TeacherRead {public long TeacherId{get;set;}public string Slug{get;set;}="";public string DisplayName{get;set;}="";public string? Headline{get;set;}public string? Bio{get;set;}public string? ConsultationSchedule{get;set;}public string Status{get;set;}="";public byte[] Version{get;set;}=[];}
public sealed class AdminAccountRead {public Guid UserId{get;set;}public string Email{get;set;}="";public string RoleCode{get;set;}="";public string Status{get;set;}="";public DateTime CreatedAt{get;set;}public byte[] Version{get;set;}=[];}
public sealed class ProfileRead {public Guid UserId{get;set;}public string DisplayName{get;set;}="";}
public sealed class LevelRead {public int LevelId{get;set;}public int FrameworkId{get;set;}public string Title{get;set;}="";public short SortOrder{get;set;}}
public sealed class FrameworkRead {public int FrameworkId{get;set;}public string Title{get;set;}="";}
public sealed record WordDto(long Id,string Slug,string Simplified,string Pinyin,string? HanViet,string? MeaningVi,string? MeaningEn=null);
public sealed record LearnedDto(long Id,string Simplified,string Pinyin,string? MeaningVi,int Repetitions,DateTime? LastReviewedAt,DateTime NextReviewAt,string? MeaningEn=null);
