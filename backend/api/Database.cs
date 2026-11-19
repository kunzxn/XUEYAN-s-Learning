using Microsoft.Data.SqlClient;
using System.Data;

public sealed class PooledConnection(SqlConnection inner, bool impersonated) : IAsyncDisposable, IDisposable
{
    public SqlConnection Connection => inner;
    public static implicit operator SqlConnection(PooledConnection pooled) => pooled.Connection;
    public SqlTransaction BeginTransaction() => inner.BeginTransaction();
    public SqlTransaction BeginTransaction(IsolationLevel isolationLevel) => inner.BeginTransaction(isolationLevel);
    public ConnectionState State => inner.State;

    public async ValueTask DisposeAsync()
    {
        if (impersonated && inner.State == ConnectionState.Open)
        {
            try { await Database.Execute(inner, "REVERT; EXEC sys.sp_set_session_context @key=N'session_token_hash', @value=NULL;"); }
            catch { SqlConnection.ClearPool(inner); }
        }
        await inner.DisposeAsync();
    }

    public void Dispose() => DisposeAsync().AsTask().GetAwaiter().GetResult();
}

public sealed class Database
{
    private readonly string connectionString;
    private long lastWarmupTicks;

    public Database(IConfiguration configuration)
    {
        var raw = configuration.GetConnectionString("Database") ?? throw new InvalidOperationException("Database connection is not configured.");
        connectionString = new SqlConnectionStringBuilder(raw) { Pooling = true, MinPoolSize = 1, MaxPoolSize = 100 }.ConnectionString;
    }

    public void Warmup()
    {
        var now = Environment.TickCount64;
        var previous = Interlocked.Read(ref lastWarmupTicks);
        if (previous != 0 && now - previous < 30_000) return;
        if (Interlocked.CompareExchange(ref lastWarmupTicks, now, previous) != previous) return;
        _ = Task.Run(async () =>
        {
            try { await using var connection = await Open(); }
            catch { Interlocked.Exchange(ref lastWarmupTicks, 0); }
        });
    }

    public async Task<PooledConnection> Open(Actor? actor = null)
    {
        var connection = new SqlConnection(connectionString);
        try {
        for (var attempt = 1; ; attempt++) {
            try { await connection.OpenAsync(); break; }
            catch (SqlException ex) when (attempt < 5 && ex.Number is 40613 or 40197 or 40501 or 49918 or 49919 or 49920 or -2) {
                await Task.Delay(TimeSpan.FromSeconds(5));
            }
        }
        if (actor != null)
        {
            var principal = actor.Role switch {"admin"=>"xueyan_api_admin","learner"=>"xueyan_api_learner","teacher"=>"xueyan_api_teacher",_=>throw new ApiError(403,"Vai trò không hợp lệ.")};
            await Execute(connection, $"SET QUOTED_IDENTIFIER ON; SET ANSI_NULLS ON; SET ARITHABORT ON; SET ANSI_WARNINGS ON; SET NUMERIC_ROUNDABORT OFF; EXECUTE AS USER = '{principal}'; EXEC sys.sp_set_session_context @key=N'session_token_hash', @value=@hash;", ("hash", actor.Hash));
        }

        return new PooledConnection(connection, actor != null);
        } catch {await connection.DisposeAsync();throw;}
    }
    public static SqlCommand Command(SqlConnection connection, string sql, params (string, object?)[] values)
    {
        var command = connection.CreateCommand(); command.CommandText = sql; command.CommandTimeout = 20;
        foreach (var (name, value) in values) command.Parameters.AddWithValue("@"+name, value ?? DBNull.Value);
        return command;
    }
    public static async Task<int> Execute(SqlConnection connection, string sql, params (string, object?)[] values)
    { using var command = Command(connection, sql, values); return await command.ExecuteNonQueryAsync(); }
    public static async Task<List<Dictionary<string, object?>>> Query(SqlConnection connection, string sql, params (string, object?)[] values)
    {
        using var command = Command(connection, sql, values); using var reader = await command.ExecuteReaderAsync();
        var rows = new List<Dictionary<string, object?>>();
        while (await reader.ReadAsync())
        {
            var row = new Dictionary<string, object?>();
            for (var i=0; i<reader.FieldCount; i++) row[char.ToLowerInvariant(reader.GetName(i)[0])+reader.GetName(i)[1..]] = reader.IsDBNull(i)?null:reader.GetValue(i);
            rows.Add(row);
        }
        return rows;
    }
}
public sealed record Actor(Guid UserId, string Role, string Name, byte[] Hash, string? AvatarVersion = null, bool ShowPinyin = true, string? TargetLevelCode = null);
public sealed class ApiError(int status, string message, Dictionary<string,string[]>? fields=null) : Exception(message) { public int Status { get; } = status; public Dictionary<string,string[]>? Fields { get; } = fields; }
