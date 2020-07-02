// <copyright file="private-list.tsx" company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

import * as React from "react";
import { Loader, Alert } from "@fluentui/react-northstar";
import PrivateListTable from "./private-list-table";
import { getUserPrivateListPosts, deletePrivatePostContent } from "../../api/private-list-api";
import NoPrivatePost from '../card-view/filter-no-post-content-page';
import { IProjectDetails } from "../card-view/discover-wrapper-page";
import { WithTranslation, withTranslation } from "react-i18next";
import { TFunction } from "i18next";
import NotificationMessage from "../notification-message/notification-message";

import 'bootstrap/dist/css/bootstrap.min.css';
import "../../styles/site.css";

interface IPrivateListState {
    isLoading: boolean;
    projectDetails: Array<IProjectDetails>;
    alertMessage: string;
    alertType: number;
    showAlert: boolean;
    screenWidth: number;
}

class PrivateListWrapperPage extends React.Component<WithTranslation, IPrivateListState> {
    localize: TFunction;

    constructor(props: any) {
        super(props);
        this.localize = this.props.t;
        window.addEventListener("resize", this.update);

        this.state = {
            isLoading: true,
            projectDetails: [],
            alertMessage: "",
            alertType: 0,
            showAlert: false,
            screenWidth: 0
        }
    }

    /**
   *Sets state for showing alert notification.
   *@param content Notification message
   *@param type Boolean value indicating 1- Success 2- Error
   */
    showAlert = (content: string, type: number) => {
        this.setState({ alertMessage: content, alertType: type, showAlert: true }, () => {
            setTimeout(() => {
                this.setState({ showAlert: false })
            }, 4000);
        });
    }

    /**
    *Sets state for hiding alert notification.
    */
    hideAlert = () => {
        this.setState({ showAlert: false })
    }

    /**
    * Used to initialize Microsoft Teams sdk
    */
    async componentDidMount() {
        this.setState({ isLoading: true });
        this.getUserPrivateListPosts();
        this.update();
    }

    /**
    * get screen width real time
    */
    update = () => {
        this.setState({
            screenWidth: window.innerWidth
        });
    };

    /**
    * Fetch posts for user private list tab from API
    */
    getUserPrivateListPosts = async () => {
        let response = await getUserPrivateListPosts();
        if (response.status === 200 && response.data) {
            this.setState({
                projectDetails: response.data
            });
        }

        this.setState({
            isLoading: false
        });
    }

    /**
    * Delete the post from private post list.
    * @param postId Id of the post
    */
    handleDeletePrivatePost = async (postId: string) => {
        let selectedBlogPost = this.state.projectDetails.filter((blogPost: IProjectDetails) => {
            return blogPost.projectId === postId;
        });

        if (selectedBlogPost && selectedBlogPost.length) {
            let postContent = {
                postId: selectedBlogPost[0].projectId,
                userId: selectedBlogPost[0].createdByUserId
            };
            let response = await deletePrivatePostContent(postContent);

            if (response.status === 200 && response.data) {
                let filteredBlogPosts = this.state.projectDetails.filter((blogPost: IProjectDetails) => {
                    return blogPost.projectId !== postId;
                });
                this.setState({
                    projectDetails: filteredBlogPosts
                });

                this.showAlert(this.localize("deletePostFromPrivateListSuccess"), 1);
            }
            else {
                this.showAlert(this.localize("postDeletedError"), 2);
            }
        }
    }

    /**
     * Private list tab, hyperlink on title field.
     * @param contentUrl redirect url of the post.
     */
    ontitleClick(contentUrl: string) {
        window.open(contentUrl, "_blank");
    }

    /**
    * Renders the component
    */
    public render(): JSX.Element {
        return (
            <div className="container-div">
                <NotificationMessage onClose={this.hideAlert} showAlert={this.state.showAlert} content={this.state.alertMessage} notificationType={this.state.alertType} />
                <div className="container-subdiv">
                    {this.getWrapperPage()}
                </div>
            </div>
        );
    }

    /**
    *Get wrapper for page which acts as container for all child components
    */
    private getWrapperPage = () => {
        if (this.state.isLoading) {
            return (
                <div className="container-div">
                    <div className="container-subdiv">
                        <div className="loader">
                            <Loader />
                        </div>
                    </div>
                </div>
            );
        } else {
            return this.state.projectDetails.length ?
                <PrivateListTable
                    screenWidth={this.state.screenWidth}
                    onTitleClick={this.ontitleClick}
                    privateListData={this.state.projectDetails}
                    onDeleteButtonClick={this.handleDeletePrivatePost} />
                : <NoPrivatePost />
        }
    }
}

export default withTranslation()(PrivateListWrapperPage)