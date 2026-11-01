using Microsoft.Extensions.Caching.Memory;

public interface IPublishedWordCache
{
    Task<IReadOnlyList<WordDto>> Get(Func<Task<IReadOnlyList<WordDto>>> loader);
    void Invalidate();
}
public sealed class PublishedWordCache:IPublishedWordCache,IDisposable
{
    private readonly MemoryCache cache=new(new MemoryCacheOptions{SizeLimit=500});
    private readonly SemaphoreSlim gate=new(1,1);
    private readonly TimeSpan lifetime;
    private long generation;
    public PublishedWordCache(TimeSpan? lifetime=null){this.lifetime=lifetime??TimeSpan.FromMinutes(5);if(this.lifetime<=TimeSpan.Zero)throw new ArgumentOutOfRangeException(nameof(lifetime));}
    public async Task<IReadOnlyList<WordDto>> Get(Func<Task<IReadOnlyList<WordDto>>> loader){
        while(true){
            var key=Volatile.Read(ref generation);
            if(cache.TryGetValue<IReadOnlyList<WordDto>>(key,out var hit))return hit!;
            await gate.WaitAsync();
            try{
                key=Volatile.Read(ref generation);
                if(cache.TryGetValue<IReadOnlyList<WordDto>>(key,out hit))return hit!;
                var rows=await loader();
                // A committed CRUD invalidation during the query cannot repopulate a stale generation.
                if(key!=Volatile.Read(ref generation))continue;
                IReadOnlyList<WordDto> snapshot=Array.AsReadOnly(rows.ToArray());
                cache.Set(key,snapshot,new MemoryCacheEntryOptions{AbsoluteExpirationRelativeToNow=lifetime,Size=Math.Max(1,snapshot.Count)});
                return snapshot;
            }finally{gate.Release();}
        }
    }
    public void Invalidate(){var previous=Interlocked.Increment(ref generation)-1;cache.Remove(previous);}
    public void Dispose(){cache.Dispose();gate.Dispose();}
}
