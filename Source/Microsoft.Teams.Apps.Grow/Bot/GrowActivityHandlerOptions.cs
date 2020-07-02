// <copyright file="GrowActivityHandlerOptions.cs" company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

namespace Microsoft.Teams.Apps.Grow.Bot
{
    /// <summary>
    /// This class provide options for the <see cref="GrowActivityHandler" /> bot.
    /// </summary>
    public sealed class GrowActivityHandlerOptions
    {
        /// <summary>
        /// Gets or sets application base URL used to return success or failure task module result.
        /// </summary>
        public string AppBaseUri { get; set; }

        /// <summary>
        /// Gets or sets entity id of static discover tab.
        /// </summary>
        public string DiscoverTabEntityId { get; set; }

        /// <summary>
        /// Gets or sets entity id of static acquired skills tab.
        /// </summary>
        public string AcquiredSkillsTabEntityId { get; set; }
    }
}