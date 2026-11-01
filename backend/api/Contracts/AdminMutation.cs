public sealed record ContentMutation(string Resource,string Slug,string Status,Dictionary<string,object?> Fields,byte[]? Version);
