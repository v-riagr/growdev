// <copyright file="ProjectStatusHelper.cs" company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

namespace Microsoft.Teams.Apps.Grow.Helpers
{
    using Microsoft.Extensions.Localization;
    using Microsoft.Teams.Apps.Grow.Models;

    /// <summary>
    ///  Class that handles the project status.
    /// </summary>
    public class ProjectStatusHelper
    {
        /// <summary>
        /// The current cultures' string localizer.
        /// </summary>
        private readonly IStringLocalizer<Strings> localizer;

        /// <summary>
        /// Initializes a new instance of the <see cref="ProjectStatusHelper"/> class.
        /// </summary>
        /// <param name="localizer">The current cultures' string localizer.</param>
        public ProjectStatusHelper(IStringLocalizer<Strings> localizer)
        {
            this.localizer = localizer;
        }

        /// <summary>
        /// Valid post types.
        /// </summary>
        public enum StatusEnum
        {
            /// <summary>
            /// No status.
            /// </summary>
            None = 0,

            /// <summary>
            /// Project not yet started.
            /// </summary>
            NotStarted = 1,

            /// <summary>
            /// Project is active.
            /// </summary>
            Active = 2,

            /// <summary>
            /// Project is blocked.
            /// </summary>
            Blocked = 3,

            /// <summary>
            /// Project is closed.
            /// </summary>
            Closed = 4,
        }

        /// <summary>
        /// Get the status using its id.
        /// </summary>
        /// <param name="key">Status id value.</param>
        /// <returns>Returns a localized status from the id value.</returns>
        public ProjectStatus GetStatus(int key)
        {
            return key switch
            {
                (int)StatusEnum.NotStarted =>
                    new ProjectStatus { StatusName = this.localizer.GetString("NotStartedStatusType"), IconName = "notStartedStatusDot.png", StatusId = 1 },

                (int)StatusEnum.Active =>
                    new ProjectStatus { StatusName = this.localizer.GetString("ActiveStatusType"), IconName = "activeStatusDot.png", StatusId = 2 },

                (int)StatusEnum.Blocked =>
                    new ProjectStatus { StatusName = this.localizer.GetString("BlockedStatusType"), IconName = "blockedStatusDot.png", StatusId = 3 },

                (int)StatusEnum.Closed =>
                    new ProjectStatus { StatusName = this.localizer.GetString("ClosedStatusType"), IconName = "closedStatusDot.png", StatusId = 4 },

                _ => null,
            };
        }
    }
}
