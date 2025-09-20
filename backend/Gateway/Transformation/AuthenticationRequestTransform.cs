using System.Net.Http.Headers;
using System.Threading.Tasks;
using Duende.AccessTokenManagement.OpenIdConnect;
using Light.GuardClauses;
using Microsoft.AspNetCore.Authentication;
using Yarp.ReverseProxy.Transforms;

namespace Gateway.Transformation;

public static class AuthenticationRequestTransform
{
    public static async ValueTask ApplyAsync(RequestTransformContext context)
    {
        var authenticateResult = context.HttpContext.Features.Get<IAuthenticateResultFeature>()?.AuthenticateResult;
        if (authenticateResult?.Ticket is null)
        {
            return;
        }

        switch (authenticateResult.Ticket.AuthenticationScheme)
        {
            case "Bearer":
                var accessToken = authenticateResult.Properties?.GetTokenValue("access_token");
                if (!accessToken.IsNullOrWhiteSpace())
                {
                    context.ProxyRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
                }

                break;

            case "Cookie":
                var result = await context.HttpContext.GetUserAccessTokenAsync(
                    ct: context.HttpContext.RequestAborted
                );
                if (result.WasSuccessful(out var userToken))
                {
                    context.ProxyRequest.Headers.Authorization =
                        new AuthenticationHeaderValue("Bearer", userToken.AccessToken);
                }

                break;
        }
    }
}
