using Microsoft.Data.SqlClient;
using System.Data;

public sealed class Database(IConfiguration configuration)
{
    public async Task<SqlConnection> Open(Actor? actor = null)
    {
        var connection = new SqlConnection(configuration.GetConnectionString("Database") ?? throw new InvalidOperationException("Database connection is not configured."));
        try {
        await connection.OpenAsync();
        await Execute(connection, "SET QUOTED_IDENTIFIER ON; SET ANSI_NULLS ON; SET ARITHABORT ON; SET ANSI_WARNINGS ON; SET NUMERIC_ROUNDABORT OFF;");
        if (actor != null)
        {
            // No pool is used for impersonated connections: contexts cannot leak to another request.
            if (new SqlConnectionStringBuilder(connection.ConnectionString).Pooling) { await connection.DisposeAsync(); throw new InvalidOperationException("Runtime connections must use Pooling=false."); }
            var principal = actor.Role switch {"admin"=>"xueyan_api_admin","learner"=>"xueyan_api_learner","teacher"=>"xueyan_api_teacher",_=>throw new ApiError(403,"Vai trò không hợp lệ.")};
            await Execute(connection, $"EXECUTE AS USER = '{principal}'; EXEC sys.sp_set_session_context @key=N'session_token_hash', @value=@hash;", ("hash", actor.Hash));
        }
        
        return connection;
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
public sealed record Actor(Guid UserId, string Role, string Name, byte[] Hash);
public sealed class ApiError(int status, string message, Dictionary<string,string[]>? fields=null) : Exception(message) { public int Status { get; } = status; public Dictionary<string,string[]>? Fields { get; } = fields; }
