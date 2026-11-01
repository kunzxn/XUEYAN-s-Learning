using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;

public static class JwtAuthentication
{
    public const string ActorKey="xueyan.validated-actor";
    public static void AddXueyanAuthentication(this IServiceCollection services,JwtSettings settings){
        services.AddSingleton(settings);services.AddSingleton<IJwtTokens,JwtTokens>();
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options=>{
            options.MapInboundClaims=false;options.TokenValidationParameters=settings.Validation();
            options.Events=new JwtBearerEvents{
                OnMessageReceived=context=>{if(string.IsNullOrEmpty(context.Request.Headers.Authorization))context.Token=context.Request.Cookies["xueyan_session"];return Task.CompletedTask;},
                OnTokenValidated=async context=>{
                    var principal=context.Principal;
                    if(!Guid.TryParse(principal?.FindFirst("sid")?.Value,out var sessionId)||!Guid.TryParse(principal?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value,out var userId)){context.Fail("Invalid identity.");return;}
                    var session=await context.HttpContext.RequestServices.GetRequiredService<IAuthRepository>().FindSessionById(sessionId);
                    if(session==null||session.Actor.UserId!=userId||session.Actor.Role!=principal?.FindFirst("role")?.Value){context.Fail("Session revoked or role changed.");return;}
                    context.HttpContext.Items[ActorKey]=session.Actor;
                },
                OnChallenge=async context=>{context.HandleResponse();context.Response.StatusCode=401;await context.Response.WriteAsJsonAsync(new{error="Vui lòng đăng nhập lại hoặc làm mới phiên."});},
                OnForbidden=async context=>{context.Response.StatusCode=403;await context.Response.WriteAsJsonAsync(new{error="Bạn không có quyền truy cập không gian này."});}
            };
        });
        services.AddAuthorization(options=>{
            options.FallbackPolicy=new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
            options.AddPolicy("Learner",policy=>policy.RequireAuthenticatedUser().RequireRole("learner"));
            options.AddPolicy("Teacher",policy=>policy.RequireAuthenticatedUser().RequireRole("teacher"));
            options.AddPolicy("Admin",policy=>policy.RequireAuthenticatedUser().RequireRole("admin"));
        });
    }
}
