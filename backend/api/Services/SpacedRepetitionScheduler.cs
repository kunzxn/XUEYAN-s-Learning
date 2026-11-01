using System.Text.Json;

public sealed record CardState(double Ease=2.5,int IntervalDays=0,int SuccessfulRepetitions=0);
public sealed record ScheduleResult(DateTime NextReviewAt,string Version,string State);
public interface ISpacedRepetitionScheduler {ScheduleResult Next(int rating,string? previousState,string? previousVersion,DateTime utcNow);}

// SM-2-inspired four-button adaptation, explicitly versioned rather than presented as FSRS.
// O(1), no network or database work; the repository saves its result with the review event.
public sealed class SpacedRepetitionScheduler:ISpacedRepetitionScheduler
{
    public const string Version="sm2-inspired-v1";
    private static readonly JsonSerializerOptions Json=new(JsonSerializerDefaults.Web);
    public ScheduleResult Next(int rating,string? previousState,string? previousVersion,DateTime utcNow) {
        if(rating is <1 or >4)throw new ArgumentOutOfRangeException(nameof(rating));
        if(utcNow.Kind!=DateTimeKind.Utc)throw new ArgumentException("Use UTC.",nameof(utcNow));
        var state=Read(previousState,previousVersion);
        var quality=rating switch{1=>0,2=>3,3=>4,_=>5};
        var delta=5-quality;
        var ease=Math.Clamp(state.Ease+0.1-delta*(0.08+delta*0.02),1.3,3.5);
        var streak=rating==1?0:Math.Min(state.SuccessfulRepetitions+1,100000);
        var interval=rating==1?0:state.SuccessfulRepetitions switch{0=>1,1=>6,_=>Math.Clamp((int)Math.Round(state.IntervalDays*state.Ease,MidpointRounding.AwayFromZero),1,3650)};
        var next=rating==1?utcNow.AddMinutes(10):utcNow.AddDays(interval);
        return new(next,Version,JsonSerializer.Serialize(new CardState(ease,interval,streak),Json));
    }
    private static CardState Read(string? json,string? version) {
        // Old simple-interval states remain valid history. Initialize the new scheduler once.
        if(version!=Version||string.IsNullOrEmpty(json))return new();
        try {
            var state=JsonSerializer.Deserialize<CardState>(json,Json);
            return state!=null&&double.IsFinite(state.Ease)&&state.Ease is >=1.3 and <=3.5&&state.IntervalDays is >=0 and <=3650&&state.SuccessfulRepetitions is >=0 and <=100000?state:new();
        }catch(JsonException){return new();}
    }
}
