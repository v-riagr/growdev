// <copyright file="UserInformation.cs" company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

namespace Microsoft.Teams.Apps.Grow.Models
{
    /// <summary>
    /// Class which holds user information received from graph API.
    /// </summary>
    public class UserInformation
    {
        /// <summary>
        /// Gets or sets AAD object id of user.
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Gets or sets display name of user.
        /// </summary>
        public string DisplayName { get; set; }
    }
}
