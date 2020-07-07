// <copyright file="GraphUtilityHelper.cs" company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

namespace Microsoft.Teams.Apps.Grow.Helpers
{
    using System;
    using System.Collections.Generic;
    using System.Net.Http.Headers;
    using System.Threading.Tasks;
    using Microsoft.Graph;
    using Microsoft.Teams.Apps.Grow.Models;

    /// <summary>
    /// Implements the methods that are defined in <see cref="GraphUtilityHelper"/>.
    /// </summary>
    public class GraphUtilityHelper
    {
        /// <summary>
        /// Instance of graphServiceClient.
        /// </summary>
        private readonly GraphServiceClient graphClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="GraphUtilityHelper"/> class.
        /// </summary>
        /// <param name="accessToken">User access token with Graph scopes.</param>
        public GraphUtilityHelper(
            string accessToken)
        {
            this.graphClient = new GraphServiceClient(
            new DelegateAuthenticationProvider(
            requestMessage =>
            {
                requestMessage.Headers.Authorization = new AuthenticationHeaderValue(
                    "Bearer",
                    accessToken);
                return Task.CompletedTask;
            }));
        }

        /// <summary>
        /// Get users information from graph API.
        /// </summary>
        /// <param name="userObjectIds">Collection of AAD Object ids of users.</param>
        /// <returns>A task that returns collection of user information.</returns>
        public async Task<IEnumerable<UserInformation>> GetUserDetailsAsync(IEnumerable<string> userObjectIds)
        {
            userObjectIds = userObjectIds ?? throw new ArgumentNullException(nameof(userObjectIds));

            List<string> batchIds = new List<string>();
            List<UserInformation> userDetails = new List<UserInformation>();

            var batchRequestContent = new BatchRequestContent();
            foreach (string userObjectId in userObjectIds)
            {
                var request = this.graphClient
                    .Users[userObjectId]
                    .Request();

                batchIds.Add(batchRequestContent.AddBatchRequestStep(request));
            }

            var response = await this.graphClient.Batch.Request().PostAsync(batchRequestContent);
            for (int i = 0; i < batchIds.Count; i++)
            {
                userDetails.Add(await response.GetResponseByIdAsync<UserInformation>(batchIds[i]));
            }

            return userDetails;
        }

        /// <summary>
        /// Get user display name.
        /// </summary>
        /// <param name="userObjectId">AAD Object id of user.</param>
        /// <returns>A task that returns user information.</returns>
        public async Task<UserInformation> GetUserDetailAsync(string userObjectId)
        {
            UserInformation userInfo = new UserInformation();

            var userDetail = await this.graphClient
                .Users[userObjectId]
                .Request()
                .GetAsync();

            if (userDetail != null)
            {
                userInfo.Id = userDetail.Id;
                userInfo.DisplayName = userDetail.DisplayName;
            }

            return userInfo;
        }
    }
}
