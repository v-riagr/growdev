// <copyright file="discover-api.ts" company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

import axios from "./axios-decorator";
import { getBaseUrl } from '../configVariables';

let baseAxiosUrl = getBaseUrl() + '/api';

/**
* Get discover posts for tab
* @param pageCount Current page count for which posts needs to be fetched
*/
export const getDiscoverPosts = async (pageCount: number): Promise<any> => {

    let url = `${baseAxiosUrl}/project?pageCount=${pageCount}`;
    return await axios.get(url);
}

/**
* Get user created projects
* @param pageCount Current page count for which projects needs to be fetched
*/
export const getMyCreatedProjects = async (pageCount: number): Promise<any> => {

    let url = `${baseAxiosUrl}/project/user-created-projects?pageCount=${pageCount}`;
    return await axios.get(url);
}

/**
* Get user created projects
* @param pageCount Current page count for which projects needs to be fetched
*/
export const getMyJoinedProjects = async (pageCount: number): Promise<any> => {

    let url = `${baseAxiosUrl}/project/user-joined-projects?pageCount=${pageCount}`;
    return await axios.get(url);
}

/**
* Get discover posts for tab in a team
* @param teamId Team Id for which discover posts needs to be fetched
* @param pageCount Current page count for which posts needs to be fetched
*/
export const getTeamDiscoverPosts = async (teamId: string, pageCount: number): Promise<any> => {

    let url = `${baseAxiosUrl}/teamproject/team-projects?teamId=${teamId}&pageCount=${pageCount}`;
    return await axios.get(url);
}

/**
* Get filtered discover posts for tab
* @param postTypes Selected post types separated by semicolon
* @param sharedByNames Selected author names separated by semicolon
* @param tags Selected tags separated by semicolon
* @param pageCount Current page count for which posts needs to be fetched
*/
export const getFilteredPosts = async (postTypes: string, sharedByNames: string, tags: string, pageCount: number): Promise<any> => {
    let url = `${baseAxiosUrl}/project/applied-filters-projects?status=${postTypes}&projectOwnerNames=${sharedByNames}
                &skills=${tags}&pageCount=${pageCount}`;
    return await axios.get(url);
}

/**
* Get filtered discover posts for tab
* @param postTypes Selected post types separated by semicolon
* @param sharedByNames Selected author names separated by semicolon
* @param tags Selected tags separated by semicolon
* @param teamId Team Id for which posts needs to be fetched
* @param pageCount Current page count for which posts needs to be fetched
*/
export const getFilteredTeamPosts = async (postTypes: string, sharedByNames: string, tags: string, teamId: string, pageCount: number): Promise<any> => {
    let url = `${baseAxiosUrl}/teamproject/applied-filters-projects?status=${postTypes}&projectOwnerNames=${sharedByNames}
                &skills=${tags}&pageCount=${pageCount}&teamId=${teamId}`;
    return await axios.get(url);
}

/**
* Get unique tags
*/
export const getTags = async (): Promise<any> => {
    let url = `${baseAxiosUrl}/project/unique-skills?searchText=*`;
    return await axios.get(url);
}

/**
* Update post content details
* @param postContent Post details object to be updated
*/
export const updatePostContent = async (postContent: any): Promise<any> => {

    let url = `${baseAxiosUrl}/project`;
    return await axios.patch(url, postContent);
}

/**
* Add new post
* @param postContent Post details object to be added
*/
export const addNewProjectContent = async (postContent: any): Promise<any> => {

    let url = `${baseAxiosUrl}/project`;
    return await axios.post(url, postContent);
}

/**
* Delete post from storage
* @param post Id of post to be deleted
*/
export const deletePost = async (project: any): Promise<any> => {

    let url = `${baseAxiosUrl}/project?projectId=${project.projectId}&userId=${project.createdByUserId}`;
    return await axios.delete(url);
}

/**
* Add user vote
* @param userVote Vote object to be added in storage
*/
export const addUserVote = async (userVote: any): Promise<any> => {

    let url = `${baseAxiosUrl}/uservote/vote`;
    return await axios.post(url, userVote);
}

/**
* delete user vote
* @param userVote Vote object to be deleted from storage
*/
export const deleteUserVote = async (userVote: any): Promise<any> => {

    let url = `${baseAxiosUrl}/uservote?projectId=` + userVote.postId;
    return await axios.delete(url);
}

/**
* Get list of authors
*/
export const getAuthors = async (): Promise<any> => {

    let url = `${baseAxiosUrl}/project/project-owners`;
    return await axios.get(url);
}

/**
* Get list of authors
*/
export const getTeamAuthors = async (teamId: string): Promise<any> => {

    let url = `${baseAxiosUrl}/teamproject/project-owners-for-team-skills?teamId=` + teamId;
    return await axios.get(url);
}

/**
* Add new post
* @param searchText Search text typed by user
* @param pageCount Current page count for which posts needs to be fetched
*/
export const filterTitleAndTags = async (searchText: string, pageCount: number): Promise<any> => {
    let url = baseAxiosUrl + `/project/search-projects?searchText=${searchText}&pageCount=${pageCount}`;
    return await axios.get(url);
}

/**
* Add new post
* @param searchText Search text typed by user
* @param teamId Team Id for which post needs to be filtered
* @param pageCount Current page count for which posts needs to be fetched
*/
export const filterTitleAndTagsTeam = async (searchText: string, teamId: string, pageCount: number): Promise<any> => {
    let url = baseAxiosUrl + `/teamproject/team-search-projects?searchText=${searchText}&teamId=${teamId}&pageCount=${pageCount}`;
    return await axios.get(url);
}

/**
* Add new post
* @param projectContent Search text typed by user
*/
export const joinProject = async (projectContent : any): Promise<any> => {
    let url = baseAxiosUrl + `/project-workflow/join-project`;
    return await axios.post(url, projectContent);
}


/**
* close projects
* @param participantDetails Search text typed by user
*/
export const closeProject = async (participantDetails: any): Promise<any> => {
    let url = baseAxiosUrl + `/project-workflow/close-project`;
    return await axios.post(url, participantDetails);
}

/**
* Get project details.
* @param projectId Project id to fetch details.
*/
export const getProjectDetailToJoin = async (projectId: string, createdByUserId: string): Promise<any> => {

    let url = `${baseAxiosUrl}/project/project-detail?projectId=${projectId}&createdByUserId=${createdByUserId}`;
    return await axios.get(url);
}