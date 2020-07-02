// <copyright file="private-list-api.ts" company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

import axios from "./axios-decorator";
import { getBaseUrl } from '../configVariables';

let baseAxiosUrl = getBaseUrl() + '/api';

/**
* Get discover posts for tab
*/
export const getUserPrivateListPosts = async (): Promise<any> => {
    let url = `${baseAxiosUrl}/acquiredskill/acquired-skills`;
    return await axios.get(url);
}

/**
* Add post to user private list
* @param post Post details data to be added
*/
export const addNewPostContent = async (post: any): Promise<any> => {

    let url = `${baseAxiosUrl}/userprivatepost`;
    return await axios.post(url, post);
}

/**
* Delete post selected by user
* @param post Post details data to be deleted
*/
export const deletePrivatePostContent = async (post: any): Promise<any> => {

    let url = `${baseAxiosUrl}/userprivatepost?postId=${post.postId}&userId=${post.userId}`;
    return await axios.delete(url);
}

/**
* Delete post selected by user
* @param post Post details data to be deleted
*/
export const leaveProject = async (project: any): Promise<any> => {

    let url = `${baseAxiosUrl}/project-workflow/leave-project?projectId=${project.projectId}&createdByUserId=${project.createdByUserId}`;
    return await axios.delete(url);
}

