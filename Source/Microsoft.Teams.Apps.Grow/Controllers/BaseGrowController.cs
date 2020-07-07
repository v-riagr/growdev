// <copyright file="BaseGrowController.cs" company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

namespace Microsoft.Teams.Apps.Grow.Controllers
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net.Http.Headers;
    using System.Security.Claims;
    using System.Threading.Tasks;
    using Microsoft.ApplicationInsights;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Options;
    using Microsoft.Identity.Client;
    using Microsoft.Teams.Apps.Grow.Helpers;
    using Microsoft.Teams.Apps.Grow.Models;
    using Microsoft.Teams.Apps.Grow.Models.Configuration;

    /// <summary>
    /// Base controller to handle grow projects API operations.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class BaseGrowController : ControllerBase
    {
        /// <summary>
        /// Logs errors and information.
        /// </summary>
        private readonly ILogger logger;

        /// <summary>
        /// Instance of application insights telemetry client.
        /// </summary>
        private readonly TelemetryClient telemetryClient;

        /// <summary>
        /// Instance of IOptions to read data from azure application configuration.
        /// </summary>
        private readonly IOptions<AzureActiveDirectorySettings> azureAdOptions;

        /// <summary>
        /// Instance of token acquisition helper to access token.
        /// </summary>
        private TokenAcquisitionHelper tokenAcquisitionHelper;

        /// <summary>
        /// Instance of confidential client app to access web API.
        /// </summary>
        private IConfidentialClientApplication confidentialClientApp;

        /// <summary>
        /// Instance of graphUtilityHelper to access Microsoft Graph API.
        /// </summary>
        private GraphUtilityHelper graphUtilityHelper;

        /// <summary>
        /// Initializes a new instance of the <see cref="BaseGrowController"/> class.
        /// </summary>
        /// <param name="telemetryClient">The Application Insights telemetry client.</param>
        /// /// <param name="tokenAcquisitionHelper">Provides </param>
        /// <param name="azureAdOptions">Instance of IOptions to read data from application configuration.</param>
        /// <param name="confidentialClientApp">Instance of ConfidentialClientApplication class.</param>
        /// <param name="logger">Logs errors and information.</param>
        public BaseGrowController(
            TelemetryClient telemetryClient,
            IOptions<AzureActiveDirectorySettings> azureAdOptions,
            TokenAcquisitionHelper tokenAcquisitionHelper,
            IConfidentialClientApplication confidentialClientApp,
            ILogger<BaseGrowController> logger)
        {
            this.telemetryClient = telemetryClient;
            this.azureAdOptions = azureAdOptions;
            this.tokenAcquisitionHelper = tokenAcquisitionHelper;
            this.confidentialClientApp = confidentialClientApp;
            this.logger = logger;
        }

        /// <summary>
        /// Gets the user tenant id from the HttpContext.
        /// </summary>
        protected string UserTenantId
        {
            get
            {
                var tenantClaimType = "http://schemas.microsoft.com/identity/claims/tenantid";
                var claim = this.User.Claims.FirstOrDefault(p => tenantClaimType.Equals(p.Type, StringComparison.OrdinalIgnoreCase));
                if (claim == null)
                {
                    return null;
                }

                return claim.Value;
            }
        }

        /// <summary>
        /// Gets the user Azure Active Directory id from the HttpContext.
        /// </summary>
        protected string UserAadId
        {
            get
            {
                var oidClaimType = "http://schemas.microsoft.com/identity/claims/objectidentifier";
                var claim = this.User.Claims.FirstOrDefault(p => oidClaimType.Equals(p.Type, StringComparison.OrdinalIgnoreCase));
                if (claim == null)
                {
                    return null;
                }

                return claim.Value;
            }
        }

        /// <summary>
        /// Gets the user name from the HttpContext.
        /// </summary>
        protected string UserName
        {
            get
            {
                var claim = this.User.Claims.FirstOrDefault(p => "name".Equals(p.Type, StringComparison.OrdinalIgnoreCase));
                if (claim == null)
                {
                    return null;
                }

                return claim.Value;
            }
        }

        /// <summary>
        /// Gets the user principal name from the HttpContext.
        /// </summary>
        protected string UserPrincipalName
        {
            get
            {
                return this.User.FindFirst(ClaimTypes.Upn)?.Value;
            }
        }

        /// <summary>
        /// Records event data to Application Insights telemetry client.
        /// </summary>
        /// <param name="eventName">Name of the event.</param>
        public void RecordEvent(string eventName)
        {
            this.telemetryClient.TrackEvent(eventName, new Dictionary<string, string>
            {
                { "userId", this.UserAadId },
            });
        }

        /// <summary>
        /// Get user Azure AD access token.
        /// </summary>
        /// <returns>Access token with Graph scopes.</returns>
        protected async Task<string> GetAccessTokenAsync()
        {
            List<string> scopeList = this.azureAdOptions.Value.GraphScope.Split(new char[] { ' ' }, System.StringSplitOptions.RemoveEmptyEntries).ToList();

            try
            {
                // Gets user account from the accounts available in token cache.
                // https://docs.microsoft.com/en-us/dotnet/api/microsoft.identity.client.clientapplicationbase.getaccountasync?view=azure-dotnet
                // Concatenation of UserObjectId and TenantId separated by a dot is used as unique identifier for getting user account.
                // https://docs.microsoft.com/en-us/dotnet/api/microsoft.identity.client.accountid.identifier?view=azure-dotnet#Microsoft_Identity_Client_AccountId_Identifier
                var account = await this.confidentialClientApp.GetAccountAsync($"{this.UserAadId}.{this.azureAdOptions.Value.TenantId}");

                // Attempts to acquire an access token for the account from the user token cache.
                // https://docs.microsoft.com/en-us/dotnet/api/microsoft.identity.client.clientapplicationbase.acquiretokensilent?view=azure-dotnet
                AuthenticationResult result = await this.confidentialClientApp
                    .AcquireTokenSilent(scopeList, account)
                    .ExecuteAsync();
                return result.AccessToken;
            }
            catch (MsalUiRequiredException ex)
            {
                try
                {
                    // Getting new token using AddTokenToCacheFromJwtAsync as AcquireTokenSilent failed to load token from cache.
                    this.logger.LogInformation($"MSAL exception occurred and trying to acquire new token. MSAL exception details are found {ex}.");
                    var jwtToken = AuthenticationHeaderValue.Parse(this.Request.Headers["Authorization"].ToString()).Parameter;
                    return await this.tokenAcquisitionHelper.AddTokenToCacheFromJwtAsync(this.azureAdOptions.Value.GraphScope, jwtToken);
                }
                catch (MsalException msalex)
                {
                    this.logger.LogError(msalex, $"An error occurred in GetAccessTokenAsync: {msalex.Message}.");
                }

                throw;
            }
            catch (Exception ex)
            {
                this.logger.LogError(ex, $"An error occurred in fetching token : {ex.Message}.");
                throw;
            }
        }

        /// <summary>
        /// Get display name of user.
        /// </summary>
        /// <param name="userObjectIds">Azure Active Directory object ids of users separated by ';'.</param>
        /// <returns>Returns display name of user.</returns>
        protected async Task<IEnumerable<UserInformation>> GetUserDetailsAsync(string userObjectIds)
        {
            userObjectIds = userObjectIds ?? throw new ArgumentNullException(nameof(userObjectIds));

            var userObjecIds = userObjectIds.Split(';');
            string accessToken = await this.GetAccessTokenAsync();
            if (string.IsNullOrEmpty(accessToken))
            {
                this.logger.LogError("Token to access graph API is null.");
                return null;
            }

            this.graphUtilityHelper = new GraphUtilityHelper(accessToken);
            return await this.graphUtilityHelper.GetUserDetailsAsync(userObjecIds);
        }

        /// <summary>
        /// Get user information from graph API.
        /// </summary>
        /// <param name="userObjectId">Azure Active Directory object id of user.</param>
        /// <returns>Returns display name of user.</returns>
        protected async Task<UserInformation> GetUserDetailAsync(string userObjectId)
        {
            string accessToken = await this.GetAccessTokenAsync();
            if (string.IsNullOrEmpty(accessToken))
            {
                this.logger.LogError("Token to access graph API is null.");
                return null;
            }

            this.graphUtilityHelper = new GraphUtilityHelper(accessToken);
            return await this.graphUtilityHelper.GetUserDetailAsync(userObjectId);
        }
    }
}