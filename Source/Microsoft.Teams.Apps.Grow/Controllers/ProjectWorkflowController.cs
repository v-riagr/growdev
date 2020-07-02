// <copyright file="ProjectWorkflowController.cs" company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

namespace Microsoft.Teams.Apps.Grow.Controllers
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Microsoft.ApplicationInsights;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Logging;
    using Microsoft.Teams.Apps.Grow.Common.Interfaces;
    using Microsoft.Teams.Apps.Grow.Helpers;
    using Microsoft.Teams.Apps.Grow.Models;

    /// <summary>
    /// Controller to handle project API operations.
    /// </summary>
    [ApiController]
    [Route("api/project-workflow")]
    [Authorize]
    public class ProjectWorkflowController : BaseGrowController
    {
        /// <summary>
        /// Logs errors and information.
        /// </summary>
        private readonly ILogger logger;

        /// <summary>
        /// Provides methods for add, update and delete project operations from database.
        /// </summary>
        private readonly IProjectStorageProvider projectStorageProvider;

        /// <summary>
        /// Provides methods for acquired skills operations from database.
        /// </summary>
        private readonly IAcquiredSkillStorageProvider acquiredSkillStorageProvider;

        /// <summary>
        /// Project search service for fetching project with search criteria and filters.
        /// </summary>
        private readonly IProjectSearchService projectSearchService;

        /// <summary>
        /// Provides methods to send notifications to users.
        /// </summary>
        private readonly NotificationHelper notificationHelper;

        /// <summary>
        /// Initializes a new instance of the <see cref="ProjectWorkflowController"/> class.
        /// </summary>
        /// <param name="logger">Logs errors and information.</param>
        /// <param name="telemetryClient">The Application Insights telemetry client.</param>
        /// <param name="projectStorageProvider">Provides methods for add, update and delete project operations from database.</param>
        /// <param name="acquiredSkillStorageProvider">Provides methods for acquired skills operations from database.</param>
        /// <param name="projectSearchService">Project search service for fetching project with search criteria and filters.</param>
        /// <param name="notificationHelper">Provides methods to send notifications to users.</param>
        public ProjectWorkflowController(
            ILogger<ProjectController> logger,
            TelemetryClient telemetryClient,
            IProjectStorageProvider projectStorageProvider,
            IAcquiredSkillStorageProvider acquiredSkillStorageProvider,
            IProjectSearchService projectSearchService,
            NotificationHelper notificationHelper)
            : base(telemetryClient)
        {
            this.logger = logger;
            this.projectStorageProvider = projectStorageProvider;
            this.acquiredSkillStorageProvider = acquiredSkillStorageProvider;
            this.projectSearchService = projectSearchService;
            this.notificationHelper = notificationHelper;
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
        /// Post call to join a project.
        /// </summary>
        /// <param name="projectEntity">Represents project entity.</param>
        /// <returns>Returns true for successful operation.</returns>
        [HttpPost("join-project")]
        public async Task<IActionResult> JoinProjectAsync([FromBody] ProjectEntity projectEntity)
        {
            this.logger.LogInformation("call to add project in user's joined project list.");

            try
            {
                if (string.IsNullOrEmpty(projectEntity?.ProjectId))
                {
                    this.logger.LogError("ProjectId is found null or empty while joining the project.");
                    return this.BadRequest("ProjectId cannot be null or empty.");
                }

                var projectDetails = await this.projectStorageProvider.GetProjectAsync(projectEntity.CreatedByUserId, projectEntity.ProjectId);

                // Allow user to join project which has status 'Active' and 'Not started'.
                if (projectDetails != null && !projectDetails.IsRemoved && (projectDetails.Status == (int)StatusEnum.NotStarted || projectDetails.Status == (int)StatusEnum.Active))
                {
                    // If there no existing participants
                    if (string.IsNullOrEmpty(projectDetails.ProjectParticipantsUserIds))
                    {
                        projectDetails.ProjectParticipantsUserIds = this.UserAadId;
                        projectDetails.ProjectParticipantsUserMapping = $"{this.UserAadId}:{this.UserName}";
                    }
                    else
                    {
                        // Get number of people who already joined the project.
                        var joinedUsers = projectDetails.ProjectParticipantsUserIds.Split(';').Where(participant => !string.IsNullOrEmpty(participant));

                        // Check if user's joined project count is reached to maximum team size.
                        if (projectDetails.TeamSize == joinedUsers.Count())
                        {
                            this.logger.LogError($"Project max member count reached for {projectDetails.ProjectId}.");
                            return this.BadRequest("Project max member count reached.");
                        }

                        if (joinedUsers.Contains(this.UserAadId))
                        {
                            this.logger.LogError($"User {this.UserAadId} has already joined project {projectDetails.ProjectId}.");
                            return this.BadRequest("Already part of participants for project.");
                        }

                        projectDetails.ProjectParticipantsUserIds += $";{this.UserAadId}";
                        projectDetails.ProjectParticipantsUserMapping += $";{this.UserAadId}:{this.UserName}";
                    }

                    // Update the project status.
                    var isUpdated = await this.projectStorageProvider.UpsertProjectAsync(projectDetails);

                    if (isUpdated)
                    {
                        this.RecordEvent("User joined project successfully.");
                        await this.projectSearchService.RunIndexerOnDemandAsync();
                        this.logger.LogInformation($"User {this.UserAadId} joined project {projectEntity.ProjectId} successfully.");

                        try
                        {
                            // Send Notification to owner when any user joins project.
                            await this.notificationHelper.SendProjectJoinedNotificationAsync(
                                projectEntity,
                                this.UserName,
                                this.UserPrincipalName);

                            this.RecordEvent("Notification to project owner has sent successfully.");
                        }
#pragma warning disable CA1031 // Catching general exception occurred while sending notification to user to log error and continue to execute code
                        catch (Exception ex)
#pragma warning restore CA1031 // Catching general exception occurred while sending notification to user to log error and continue to execute code
                        {
                            this.logger.LogError(ex, $"Error while sending notification to project owner for joined user {this.UserAadId} and project {projectEntity.ProjectId}.");
                        }

                        return this.Ok(isUpdated);
                    }
                    else
                    {
                        this.logger.LogInformation($"Error while updating the project: {projectEntity.ProjectId} for new joining.");
                        return this.Ok(false);
                    }
                }

                this.logger.LogError($"Cannot find project {projectEntity?.ProjectId} to join.");
                return this.NotFound($"Cannot find project to join.");
            }
            catch (Exception ex)
            {
                this.logger.LogError(ex, "Error while joining a project by user.");
                throw;
            }
        }

        /// <summary>
        /// Post call to close a project.
        /// </summary>
        /// <param name="closeProjectModel">Represents a close project model.</param>
        /// <returns>Returns true for successful operation.</returns>
        [HttpPost("close-project")]
        public async Task<IActionResult> CloseProjectAsync([FromBody] CloseProjectModel closeProjectModel)
        {
            this.logger.LogInformation("call to close a project.");

            try
            {
                var projectDetails = await this.projectStorageProvider.GetProjectAsync(this.UserAadId, closeProjectModel.ProjectId);

                // Only projects with 'Active' status are allowed to close.
                if (projectDetails == null && projectDetails.IsRemoved && projectDetails.Status == (int)StatusEnum.Active)
                {
                    this.logger.LogError($"Project {closeProjectModel.ProjectId} does not exists.");
                    this.RecordEvent("Close project - HTTP Post call failed");

                    return this.NotFound($"Project does not exists.");
                }

                // Check if any participants has joined project
                if (!string.IsNullOrEmpty(projectDetails.ProjectParticipantsUserIds))
                {
                    // Get participants
                    var projectMembers = projectDetails.ProjectParticipantsUserIds.Split(';');

                    // Get participant names
                    var projectMemberNames = projectDetails.ProjectParticipantsUserMapping.Split(';');

                    // If client app fails to send participants list with acquired skills return bad request error.
                    if (closeProjectModel.ProjectParticipantDetails == null)
                    {
                        this.logger.LogInformation($"Project participants for project {projectDetails.ProjectId} does not match while changing status to closed.");
                        return this.BadRequest(new { message = "Project participants does not match." });
                    }

                    // Verify if participants sent by client app matches with participants in storage.
                    var verifyMembers = closeProjectModel.ProjectParticipantDetails.Select(participants => participants.UserId).Intersect(projectMembers).Count() == projectMembers.Length;

                    if (!verifyMembers)
                    {
                        this.logger.LogInformation($"Project participants for project {projectDetails.ProjectId} does not match while changing status to closed.");
                        return this.BadRequest(new { message = "Project participants does not match." });
                    }

                    // Save user acquired skills for a project in storage for all user's who joined this project.
                    foreach (var participant in closeProjectModel.ProjectParticipantDetails)
                    {
                        var user = projectMemberNames.Where(member => member.Split(':')[0] == participant.UserId).First();
                        var acquiredSkillEntity = new AcquiredSkillsEntity()
                        {
                            ProjectId = projectDetails.ProjectId,
                            UserId = participant.UserId,
                            AcquiredSkills = participant.AcquiredSkills,
                            CreatedByName = user.Split(':')[1],
                            CreatedDate = DateTime.UtcNow,
                            Feedback = participant.Feedback,
                            ProjectClosedDate = DateTime.UtcNow,
                            ProjectOwnerName = projectDetails.CreatedByName,
                            ProjectTitle = projectDetails.Title,
                        };

                        // Save user acquired skills for a project in storage for all user's who joined this project.
                        var updatedSkillResult = await this.acquiredSkillStorageProvider.UpsertAcquiredSkillAsync(acquiredSkillEntity);

                        if (updatedSkillResult)
                        {
                            this.logger.LogInformation($"User: {participant.UserId} skills added successfully.");
                        }
                        else
                        {
                            this.logger.LogInformation($"Error while adding skills for a user: {participant.UserId}.");
                        }
                    }
                }

                projectDetails.ProjectClosedDate = DateTime.UtcNow;
                projectDetails.Status = (int)StatusEnum.Closed;

                // Update the project status as closed.
                var isProjectClosed = await this.projectStorageProvider.UpsertProjectAsync(projectDetails);

                if (isProjectClosed)
                {
                    await this.projectSearchService.RunIndexerOnDemandAsync();
                    this.RecordEvent("Closed project - HTTP Get call succeeded.");
                    this.logger.LogInformation($"Project {projectDetails.ProjectId} closed successfully.");

                    // Send notification to users on project closure.
                    await this.notificationHelper.SendProjectClosureNotificationAsync(closeProjectModel);

                    return this.Ok(isProjectClosed);
                }
                else
                {
                    this.logger.LogInformation($"Error while closing the project {projectDetails.ProjectId}.");
                }

                return this.Ok(false);
            }
            catch (Exception ex)
            {
                this.logger.LogError(ex, "Error while closing project.");
                throw;
            }
        }

        /// <summary>
        /// Call to leave a particular project joined by user.
        /// </summary>
        /// <param name="projectId">Id of the project to be deleted.</param>
        /// <param name="createdByUserId">Azure Active Directory id of project owner.</param>
        /// <returns>Returns true for successful operation.</returns>
        [HttpDelete("leave-project")]
        public async Task<IActionResult> LeaveProjectAsync(string projectId, string createdByUserId)
        {
            this.logger.LogInformation("Call to leave a project already joined by participant.");

            if (string.IsNullOrEmpty(projectId))
            {
                this.logger.LogError("Argument projectId is either null or empty.");
                return this.BadRequest("Argument projectId is either null or empty.");
            }

            if (string.IsNullOrEmpty(createdByUserId))
            {
                this.logger.LogError("Argument createdByUserId is either null or empty.");
                return this.BadRequest("Argument createdByUserId is either null or empty.");
            }

            try
            {
                var projectEntity = await this.projectStorageProvider.GetProjectAsync(createdByUserId, projectId);

                if (projectEntity == null && projectEntity.IsRemoved)
                {
                    this.logger.LogInformation($"Project {projectId} not found for user {createdByUserId}.");
                    return this.BadRequest($"Project not found.");
                }

                if (string.IsNullOrEmpty(projectEntity.ProjectParticipantsUserIds))
                {
                    this.logger.LogInformation($"Leave project operation failed for user {createdByUserId} and project {projectId}.");
                    return this.NotFound(new { message = "Project not found" });
                }

                // Remove user from joined project list.
                var updatedUserIds = new List<string>();

                foreach (var participantAadObjectId in projectEntity.ProjectParticipantsUserIds.Split(";"))
                {
                    if (participantAadObjectId != this.UserAadId)
                    {
                        updatedUserIds.Add(participantAadObjectId);
                    }
                }

                // Remove user mapping from joined project list.
                var updatedUserMappings = new List<string>();

                foreach (var userMapping in projectEntity.ProjectParticipantsUserMapping.Split(";"))
                {
                    if (userMapping.Split(':')[0] != this.UserAadId)
                    {
                        updatedUserMappings.Add(userMapping);
                    }
                }

                // Update project participants list, if leave a project.
                projectEntity.ProjectParticipantsUserIds = string.Join(";", updatedUserIds);
                projectEntity.ProjectParticipantsUserMapping = string.Join(";", updatedUserMappings);

                var leaveResult = await this.projectStorageProvider.UpsertProjectAsync(projectEntity);

                if (leaveResult)
                {
                    await this.projectSearchService.RunIndexerOnDemandAsync();
                    this.RecordEvent("Leave a project - HTTP leave call succeeded.");
                    return this.Ok(leaveResult);
                }
                else
                {
                    this.logger.LogInformation($"Failed to update project for leave request of user {this.UserAadId} and project {projectEntity.ProjectId}.");
                    return this.Ok(false);
                }
            }
            catch (Exception ex)
            {
                this.logger.LogError(ex, $"Error while leaving a project {projectId} by user {this.UserAadId}.");
                throw;
            }
        }
    }
}