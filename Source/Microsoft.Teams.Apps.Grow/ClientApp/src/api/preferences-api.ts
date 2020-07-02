// <copyright file="preferences-api.ts" company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

import axios from "./axios-decorator";
import { getBaseUrl } from '../configVariables';

let baseAxiosUrl = getBaseUrl() + '/api';

/**
* Submit user selected configuration preferences to API
* @param postContent User selected configuration object
*/
export const submitConfigurePreferences = async (postContent: any): Promise<any> => {
    let url = `${baseAxiosUrl}/teampreference`;
    return await axios.post(url, postContent);
}

/**
* Get preferences tags for configure preferences
* @param teamId Team Id for which user configured tags needs to be fetched
*/
export const getPreferencesTags = async (teamId: string): Promise<any> => {
    let url = `${baseAxiosUrl}/teampreference?teamId=${teamId}`;
    return await axios.get(url);
}

/**
* Filter tags as per user search input
* @param searchText Search text entered by user for filtering tags
*/
export const filterTags = async (searchText: string): Promise<any> => {
    let url = `${baseAxiosUrl}/project/unique-skills?searchText=${searchText}`;
    return await axios.get(url);
}