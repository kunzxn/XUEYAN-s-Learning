public interface ILearningService
{
    Task<object> Words(Actor actor);
    Task<object> Progress(Actor actor);
    Task<object> Due(Actor actor);
    Task<object> Overview(Actor actor);
    Task<object> Queue(Actor actor,string ids);
    Task<object> Results(Actor actor,string events);
    Task Review(Actor actor,ReviewRequest request);
}
public sealed class LearningService(ILearningRepository repository,IEfReadRepository reads,IPublishedWordCache cache):ILearningService
{
    public async Task<object> Words(Actor actor)=>await cache.Get(()=>reads.Words(actor));
    public Task<object> Progress(Actor actor)=>repository.Progress(actor);
    public Task<object> Due(Actor actor)=>repository.Due(actor);
    public Task<object> Overview(Actor actor)=>repository.Overview(actor);
    public Task<object> Queue(Actor actor,string ids)=>repository.Queue(actor,ids);
    public Task<object> Results(Actor actor,string events)=>repository.Results(actor,events);
    public Task Review(Actor actor,ReviewRequest request){
        RequestValidation.Review(request);
        return repository.Save(actor,request);
    }
}
