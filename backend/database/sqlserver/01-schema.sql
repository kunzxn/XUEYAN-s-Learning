SET XACT_ABORT ON;
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO
IF OBJECT_ID(N'dbo.SchemaMigrations', N'U') IS NOT NULL
    THROW 51000, 'Initial schema already exists. Use a new migration; do not rerun on existing data.', 1;
GO
BEGIN TRANSACTION;
EXEC(N'CREATE SCHEMA auth AUTHORIZATION dbo');
EXEC(N'CREATE SCHEMA catalog AUTHORIZATION dbo');
EXEC(N'CREATE SCHEMA learning AUTHORIZATION dbo');
EXEC(N'CREATE SCHEMA classroom AUTHORIZATION dbo');
EXEC(N'CREATE SCHEMA content AUTHORIZATION dbo');
EXEC(N'CREATE SCHEMA security AUTHORIZATION dbo');

CREATE TABLE dbo.SchemaMigrations (
    Version varchar(30) NOT NULL PRIMARY KEY,
    AppliedAt datetime2(3) NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE TABLE auth.Users (
    UserId uniqueidentifier NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    Email nvarchar(254) NOT NULL,
    NormalizedEmail AS LOWER(LTRIM(RTRIM(Email))) PERSISTED,
    RoleCode varchar(10) NOT NULL DEFAULT 'learner' CHECK (RoleCode IN ('learner','admin')),
    Status varchar(12) NOT NULL DEFAULT 'pending' CHECK (Status IN ('pending','active','suspended','closed')),
    EmailVerifiedAt datetime2(3) NULL,
    CreatedAt datetime2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt datetime2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    Version rowversion NOT NULL,
    CONSTRAINT CK_UserEmail CHECK (LEN(LTRIM(RTRIM(Email))) > 3),
    CONSTRAINT UQ_UserEmail UNIQUE (NormalizedEmail)
);
-- Authentication is not implemented by this migration. Only encoded hashes go here.
CREATE TABLE auth.PasswordCredentials (
    UserId uniqueidentifier NOT NULL PRIMARY KEY REFERENCES auth.Users(UserId),
    PasswordHash varchar(512) NOT NULL CHECK (LEN(PasswordHash) >= 40),
    ChangedAt datetime2(3) NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE TABLE auth.Sessions (
    SessionId uniqueidentifier NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    UserId uniqueidentifier NOT NULL REFERENCES auth.Users(UserId),
    TokenHash binary(32) NOT NULL UNIQUE,
    ExpiresAt datetime2(3) NOT NULL,
    RevokedAt datetime2(3) NULL,
    CreatedAt datetime2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_SessionExpiry CHECK (ExpiresAt > CreatedAt)
);
CREATE INDEX IX_SessionsUser ON auth.Sessions(UserId, ExpiresAt);
CREATE TABLE auth.OneTimeTokens (
    TokenId uniqueidentifier NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    UserId uniqueidentifier NOT NULL REFERENCES auth.Users(UserId),
    Purpose varchar(20) NOT NULL CHECK (Purpose IN ('verify_email','reset_password')),
    TokenHash binary(32) NOT NULL UNIQUE,
    ExpiresAt datetime2(3) NOT NULL,
    UsedAt datetime2(3) NULL,
    CreatedAt datetime2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_OneTimeExpiry CHECK (ExpiresAt > CreatedAt)
);
CREATE TABLE auth.AuditEvents (
    AuditId bigint IDENTITY PRIMARY KEY,
    ActorId uniqueidentifier NULL REFERENCES auth.Users(UserId),
    ActionCode varchar(80) NOT NULL,
    EntityType varchar(60) NOT NULL,
    EntityId nvarchar(100) NULL,
    -- Do not put passwords, raw tokens or personal draft contents in metadata.
    Metadata nvarchar(max) NULL CHECK (Metadata IS NULL OR ISJSON(Metadata)=1),
    CreatedAt datetime2(3) NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE TABLE learning.Profiles (
    UserId uniqueidentifier NOT NULL PRIMARY KEY REFERENCES auth.Users(UserId),
    DisplayName nvarchar(80) NOT NULL CHECK (LEN(LTRIM(RTRIM(DisplayName))) > 0),
    ChineseName nvarchar(100) NULL,
    Bio nvarchar(2000) NULL,
    AvatarStorageKey nvarchar(500) NULL,
    UpdatedAt datetime2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    Version rowversion NOT NULL
);
CREATE TABLE learning.Preferences (
    UserId uniqueidentifier NOT NULL PRIMARY KEY REFERENCES auth.Users(UserId),
    DailyWordGoal smallint NOT NULL DEFAULT 20 CHECK (DailyWordGoal BETWEEN 5 AND 100),
    TargetLevelCode varchar(10) NULL,
    Purpose nvarchar(200) NULL,
    ShowPinyin bit NOT NULL DEFAULT 1,
    ShowHanViet bit NOT NULL DEFAULT 1,
    Autoplay bit NOT NULL DEFAULT 0,
    StudyTime time(0) NOT NULL DEFAULT '20:30',
    -- Store IANA IDs used by the web; do not compute streaks in server local time.
    TimeZoneId varchar(80) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    ProfileVisibility varchar(10) NOT NULL DEFAULT 'private' CHECK (ProfileVisibility IN ('private','public')),
    OnboardingCompletedAt datetime2(3) NULL,
    Version rowversion NOT NULL
);
CREATE TABLE catalog.Frameworks (
    FrameworkId int IDENTITY PRIMARY KEY,
    Code varchar(30) NOT NULL UNIQUE,
    Title nvarchar(100) NOT NULL,
    SourceDescription nvarchar(1000) NULL
);
CREATE TABLE catalog.Levels (
    LevelId int IDENTITY PRIMARY KEY,
    FrameworkId int NOT NULL REFERENCES catalog.Frameworks(FrameworkId),
    Code varchar(10) NOT NULL,
    Title nvarchar(150) NOT NULL,
    SortOrder smallint NOT NULL CHECK (SortOrder > 0),
    UNIQUE (FrameworkId, Code)
);
CREATE TABLE catalog.Words (
    WordId bigint IDENTITY PRIMARY KEY,
    Slug varchar(100) NOT NULL UNIQUE,
    Simplified nvarchar(100) NOT NULL,
    Traditional nvarchar(100) NULL,
    Pinyin nvarchar(200) NOT NULL,
    HanViet nvarchar(200) NULL,
    MeaningVi nvarchar(2000) NULL,
    PartOfSpeech nvarchar(100) NULL,
    Status varchar(10) NOT NULL DEFAULT 'draft' CHECK (Status IN ('draft','published','archived')),
    SourceReference nvarchar(1000) NULL,
    Version rowversion NOT NULL
);
-- A word can belong to several standards/levels; no unique constraint on Han alone (polyphony).
CREATE TABLE catalog.WordLevels (
    WordId bigint NOT NULL REFERENCES catalog.Words(WordId),
    LevelId int NOT NULL REFERENCES catalog.Levels(LevelId),
    PRIMARY KEY (WordId, LevelId)
);
CREATE TABLE catalog.Examples (
    ExampleId bigint IDENTITY PRIMARY KEY,
    WordId bigint NOT NULL REFERENCES catalog.Words(WordId),
    Han nvarchar(1000) NOT NULL,
    Pinyin nvarchar(2000) NULL,
    TranslationVi nvarchar(2000) NULL,
    AudioStorageKey nvarchar(500) NULL
);
CREATE INDEX IX_ExamplesWord ON catalog.Examples(WordId);
CREATE TABLE catalog.Lessons (
    LessonId bigint IDENTITY PRIMARY KEY,
    LevelId int NOT NULL REFERENCES catalog.Levels(LevelId),
    Slug varchar(100) NOT NULL UNIQUE,
    Title nvarchar(200) NOT NULL,
    Description nvarchar(2000) NULL,
    SortOrder int NOT NULL CHECK (SortOrder > 0),
    Status varchar(10) NOT NULL DEFAULT 'draft' CHECK (Status IN ('draft','published','archived')),
    UNIQUE (LevelId, SortOrder)
);
CREATE TABLE catalog.LessonWords (
    LessonId bigint NOT NULL REFERENCES catalog.Lessons(LessonId),
    WordId bigint NOT NULL REFERENCES catalog.Words(WordId),
    SortOrder int NOT NULL CHECK (SortOrder > 0),
    PRIMARY KEY (LessonId, WordId), UNIQUE (LessonId, SortOrder)
);
CREATE TABLE learning.WordNotes (
    UserId uniqueidentifier NOT NULL REFERENCES auth.Users(UserId),
    WordId bigint NOT NULL REFERENCES catalog.Words(WordId),
    Note nvarchar(4000) NOT NULL DEFAULT N'',
    UpdatedAt datetime2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    Version rowversion NOT NULL,
    PRIMARY KEY (UserId, WordId)
);
CREATE TABLE learning.Collections (
    CollectionId bigint IDENTITY PRIMARY KEY,
    UserId uniqueidentifier NOT NULL REFERENCES auth.Users(UserId),
    -- Application collapses Unicode whitespace; DB enforces canonical single ASCII spaces too.
    Name nvarchar(60) NOT NULL,
    NormalizedName AS LOWER(LTRIM(RTRIM(Name))) PERSISTED,
    CreatedAt datetime2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    Version rowversion NOT NULL,
    CONSTRAINT CK_CollectionName CHECK (LEN(LTRIM(RTRIM(Name))) > 0 AND Name=LTRIM(RTRIM(Name)) AND CHARINDEX(N'  ',Name)=0 AND CHARINDEX(NCHAR(9),Name)=0 AND CHARINDEX(NCHAR(10),Name)=0 AND CHARINDEX(NCHAR(13),Name)=0),
    UNIQUE (UserId, NormalizedName), UNIQUE (CollectionId, UserId)
);
CREATE TABLE learning.CollectionWords (
    CollectionId bigint NOT NULL,
    UserId uniqueidentifier NOT NULL,
    WordId bigint NOT NULL REFERENCES catalog.Words(WordId),
    AddedAt datetime2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    PRIMARY KEY (CollectionId, WordId),
    FOREIGN KEY (CollectionId, UserId) REFERENCES learning.Collections(CollectionId, UserId)
);
CREATE TABLE learning.LessonProgress (
    UserId uniqueidentifier NOT NULL REFERENCES auth.Users(UserId),
    LessonId bigint NOT NULL REFERENCES catalog.Lessons(LessonId),
    State varchar(12) NOT NULL DEFAULT 'not_started' CHECK (State IN ('not_started','in_progress','completed')),
    LastWordId bigint NULL REFERENCES catalog.Words(WordId),
    StartedAt datetime2(3) NULL,
    CompletedAt datetime2(3) NULL,
    Version rowversion NOT NULL,
    PRIMARY KEY (UserId, LessonId),
    CHECK ((State='completed' AND CompletedAt IS NOT NULL) OR (State<>'completed' AND CompletedAt IS NULL))
);
CREATE TABLE learning.StudySessions (
    StudySessionId uniqueidentifier NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    UserId uniqueidentifier NOT NULL REFERENCES auth.Users(UserId),
    Mode varchar(10) NOT NULL CHECK (Mode IN ('learn','review','practice')),
    LessonId bigint NULL REFERENCES catalog.Lessons(LessonId),
    Status varchar(12) NOT NULL DEFAULT 'in_progress' CHECK (Status IN ('in_progress','completed','abandoned')),
    StartedAt datetime2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    EndedAt datetime2(3) NULL,
    UNIQUE (StudySessionId, UserId),
    CHECK ((Status='in_progress' AND EndedAt IS NULL) OR (Status<>'in_progress' AND EndedAt IS NOT NULL AND EndedAt>=StartedAt))
);
CREATE TABLE learning.ReviewEvents (
    ReviewEventId bigint IDENTITY PRIMARY KEY,
    UserId uniqueidentifier NOT NULL,
    StudySessionId uniqueidentifier NOT NULL,
    WordId bigint NOT NULL REFERENCES catalog.Words(WordId),
    ClientEventId uniqueidentifier NOT NULL,
    Rating tinyint NULL CHECK (Rating BETWEEN 1 AND 4),
    IsCorrect bit NULL,
    DurationMs int NOT NULL CHECK (DurationMs BETWEEN 0 AND 3600000),
    ReviewedAt datetime2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    FOREIGN KEY (StudySessionId, UserId) REFERENCES learning.StudySessions(StudySessionId, UserId),
    UNIQUE (UserId, ClientEventId),
    CHECK (Rating IS NOT NULL OR IsCorrect IS NOT NULL)
);
CREATE TABLE learning.WordProgress (
    UserId uniqueidentifier NOT NULL REFERENCES auth.Users(UserId),
    WordId bigint NOT NULL REFERENCES catalog.Words(WordId),
    NextReviewAt datetime2(3) NOT NULL,
    LastReviewedAt datetime2(3) NULL,
    Repetitions int NOT NULL DEFAULT 0 CHECK (Repetitions>=0),
    Lapses int NOT NULL DEFAULT 0 CHECK (Lapses>=0),
    SchedulerVersion varchar(40) NOT NULL,
    SchedulerState nvarchar(max) NOT NULL CHECK (ISJSON(SchedulerState)=1),
    Version rowversion NOT NULL,
    PRIMARY KEY (UserId, WordId)
);
CREATE INDEX IX_WordProgressDue ON learning.WordProgress(UserId, NextReviewAt);
CREATE INDEX IX_ReviewEventsUserTime ON learning.ReviewEvents(UserId, ReviewedAt);
CREATE TABLE classroom.Teachers (
    TeacherId bigint IDENTITY PRIMARY KEY,
    Slug varchar(100) NOT NULL UNIQUE,
    DisplayName nvarchar(100) NOT NULL,
    Headline nvarchar(200) NULL,
    Bio nvarchar(max) NULL,
    ConsultationSchedule nvarchar(1000) NULL,
    Status varchar(10) NOT NULL DEFAULT 'draft' CHECK (Status IN ('draft','published','archived')),
    Version rowversion NOT NULL
);
CREATE TABLE classroom.Classes (
    ClassId bigint IDENTITY PRIMARY KEY,
    Slug varchar(100) NOT NULL UNIQUE,
    TeacherId bigint NOT NULL REFERENCES classroom.Teachers(TeacherId),
    LevelId int NULL REFERENCES catalog.Levels(LevelId),
    Title nvarchar(200) NOT NULL,
    ScheduleDescription nvarchar(1000) NULL,
    MeetingUrl nvarchar(1000) NULL,
    Status varchar(12) NOT NULL DEFAULT 'draft' CHECK (Status IN ('draft','open','active','completed','cancelled')),
    StartsAt datetime2(3) NULL, EndsAt datetime2(3) NULL,
    CHECK (EndsAt IS NULL OR StartsAt IS NULL OR EndsAt>=StartsAt)
);
CREATE TABLE classroom.Enrollments (
    ClassId bigint NOT NULL REFERENCES classroom.Classes(ClassId),
    UserId uniqueidentifier NOT NULL REFERENCES auth.Users(UserId),
    Status varchar(10) NOT NULL DEFAULT 'active' CHECK (Status IN ('active','completed','withdrawn')),
    EnrolledAt datetime2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    PRIMARY KEY (ClassId, UserId)
);
CREATE TABLE classroom.Assignments (
    AssignmentId bigint IDENTITY PRIMARY KEY,
    ClassId bigint NOT NULL REFERENCES classroom.Classes(ClassId),
    Title nvarchar(200) NOT NULL,
    Instructions nvarchar(max) NOT NULL,
    MinHanCount smallint NOT NULL DEFAULT 80 CHECK (MinHanCount>=0),
    MaxHanCount smallint NOT NULL DEFAULT 120,
    DueAt datetime2(3) NULL,
    Status varchar(10) NOT NULL DEFAULT 'draft' CHECK (Status IN ('draft','published','closed')),
    UNIQUE (AssignmentId, ClassId), CHECK (MaxHanCount>=MinHanCount)
);
CREATE TABLE classroom.Submissions (
    SubmissionId bigint IDENTITY PRIMARY KEY,
    AssignmentId bigint NOT NULL,
    ClassId bigint NOT NULL,
    UserId uniqueidentifier NOT NULL,
    AttemptNo smallint NOT NULL DEFAULT 1 CHECK (AttemptNo>0),
    Body nvarchar(max) NOT NULL DEFAULT N'',
    Status varchar(10) NOT NULL DEFAULT 'draft' CHECK (Status IN ('draft','submitted','returned','graded')),
    SubmittedAt datetime2(3) NULL,
    Version rowversion NOT NULL,
    FOREIGN KEY (AssignmentId, ClassId) REFERENCES classroom.Assignments(AssignmentId, ClassId),
    FOREIGN KEY (ClassId, UserId) REFERENCES classroom.Enrollments(ClassId, UserId),
    UNIQUE (AssignmentId, UserId, AttemptNo), UNIQUE (SubmissionId, UserId),
    CHECK ((Status='draft' AND SubmittedAt IS NULL) OR (Status<>'draft' AND SubmittedAt IS NOT NULL))
);
CREATE TABLE classroom.Grades (
    SubmissionId bigint NOT NULL PRIMARY KEY,
    UserId uniqueidentifier NOT NULL,
    GraderId uniqueidentifier NOT NULL REFERENCES auth.Users(UserId),
    Score decimal(5,2) NULL CHECK (Score BETWEEN 0 AND 100),
    Feedback nvarchar(4000) NOT NULL DEFAULT N'',
    PublishedAt datetime2(3) NULL,
    Version rowversion NOT NULL,
    FOREIGN KEY (SubmissionId, UserId) REFERENCES classroom.Submissions(SubmissionId, UserId),
    CHECK (PublishedAt IS NULL OR Score IS NOT NULL)
);
CREATE TABLE classroom.ConsultationRequests (
    RequestId bigint IDENTITY PRIMARY KEY,
    UserId uniqueidentifier NOT NULL REFERENCES auth.Users(UserId),
    TeacherId bigint NOT NULL REFERENCES classroom.Teachers(TeacherId),
    LevelDescription nvarchar(100) NOT NULL,
    Goal nvarchar(1000) NOT NULL,
    PreferredTime nvarchar(300) NOT NULL,
    ContactName nvarchar(100) NOT NULL,
    ContactEmail nvarchar(254) NOT NULL,
    ContactPhone nvarchar(40) NULL,
    Message nvarchar(1500) NULL,
    Status varchar(12) NOT NULL DEFAULT 'pending' CHECK (Status IN ('pending','contacted','scheduled','cancelled','closed')),
    CreatedAt datetime2(3) NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE TABLE content.Articles (
    ArticleId bigint IDENTITY PRIMARY KEY,
    Slug varchar(120) NOT NULL UNIQUE,
    Kind varchar(12) NOT NULL CHECK (Kind IN ('article','resource','help','about')),
    Title nvarchar(200) NOT NULL,
    Body nvarchar(max) NOT NULL,
    Status varchar(10) NOT NULL DEFAULT 'draft' CHECK (Status IN ('draft','published','archived')),
    PublishedAt datetime2(3) NULL,
    UpdatedAt datetime2(3) NOT NULL DEFAULT SYSUTCDATETIME()
);
-- Metadata only. API/object storage checks ownership and issues short-lived download URLs.
CREATE TABLE content.Assets (
    AssetId uniqueidentifier NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    UserId uniqueidentifier NOT NULL REFERENCES auth.Users(UserId),
    SubmissionId bigint NULL,
    StorageKey nvarchar(500) NOT NULL UNIQUE,
    OriginalName nvarchar(255) NOT NULL,
    MediaType varchar(100) NOT NULL,
    SizeBytes bigint NOT NULL CHECK (SizeBytes BETWEEN 1 AND 104857600),
    ScanStatus varchar(10) NOT NULL DEFAULT 'pending' CHECK (ScanStatus IN ('pending','clean','rejected')),
    FOREIGN KEY (SubmissionId, UserId) REFERENCES classroom.Submissions(SubmissionId, UserId)
);
CREATE TABLE content.Notifications (
    NotificationId bigint IDENTITY PRIMARY KEY,
    UserId uniqueidentifier NOT NULL REFERENCES auth.Users(UserId),
    Title nvarchar(200) NOT NULL,
    Body nvarchar(2000) NOT NULL,
    TargetPath nvarchar(300) NULL,
    CreatedAt datetime2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    ReadAt datetime2(3) NULL,
    CHECK (TargetPath IS NULL OR (LEFT(TargetPath,1)=N'/' AND LEFT(TargetPath,2)<>N'//'))
);
CREATE INDEX IX_NotificationsUser ON content.Notifications(UserId, CreatedAt DESC);
CREATE TABLE content.SupportRequests (
    RequestId bigint IDENTITY PRIMARY KEY,
    UserId uniqueidentifier NULL REFERENCES auth.Users(UserId),
    ContactName nvarchar(100) NOT NULL,
    ContactEmail nvarchar(254) NOT NULL,
    Category nvarchar(100) NOT NULL,
    Subject nvarchar(120) NOT NULL,
    Body nvarchar(1500) NOT NULL,
    Status varchar(12) NOT NULL DEFAULT 'open' CHECK (Status IN ('open','in_progress','resolved','closed')),
    CreatedAt datetime2(3) NOT NULL DEFAULT SYSUTCDATETIME()
);
INSERT dbo.SchemaMigrations(Version) VALUES ('001-schema');
COMMIT;
GO
