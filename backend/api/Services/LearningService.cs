public interface ILearningService
{
    Task<object> Words(Actor actor);
    Task<object> Progress(Actor actor);
    Task<object> Due(Actor actor);
    Task Review(Actor actor,ReviewRequest request);
}
public sealed class LearningService(ILearningRepository repository,IEfReadRepository reads,IPublishedWordCache cache):ILearningService
{
    public async Task<object> Words(Actor actor)=>await cache.Get(()=>reads.Words(actor));
    public Task<object> Progress(Actor actor)=>repository.Progress(actor);
    public Task<object> Due(Actor actor)=>repository.Due(actor);
    public Task Review(Actor actor,ReviewRequest request){
        RequestValidation.Review(request);
        return repository.Save(actor,request);
    }
}
