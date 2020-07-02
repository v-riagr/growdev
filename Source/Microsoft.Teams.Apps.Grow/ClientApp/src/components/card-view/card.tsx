// <copyright file="card.tsx" company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

import * as React from "react";
import { Flex, Text, Loader, Label, EditIcon } from "@fluentui/react-northstar";
import PopupMoreMenu from "./popup-more-menu";
import Tag from "./tag";
import { IProjectDetails } from "./discover-wrapper-page";
import TypeLabel from "./type-label";
import Thumbnail from "./thumbnail";
import Upvotes from "./upvotes";
import Resources from "../../constants/resources";
import EditItemDialog from "../edit-project-dialog/edit-project-dialog";
import JoinProjectDialogTitle from "../join-project-dialog/join-project-dialog-wrapper-title";
import { getInitials } from "../../helpers/helper";
import { deletePost, addUserVote, deleteUserVote } from "../../api/discover-api";
import { WithTranslation, withTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { addNewPostContent, leaveProject, getUserPrivateListPosts } from "../../api/private-list-api";

import "../../styles/projects-cards.css";

interface ICardProps extends WithTranslation {
    cardDetails: IProjectDetails;
    projectDetails: Array<IProjectDetails>;
    index: number;
    showJoinProjectMenu: boolean; 
    onDeleteButtonClick: (projectId: string, isSuccess: boolean) => void;
    onCloseProjectButtonClick: (isSuccess: boolean, projectId: string) => void;
    onLeaveButtonClick: (projectId: string, isSuccess: boolean) => void;
    onAddPrivatePostClick: (isSuccess: boolean, message?: string) => void;
    onJoinMenuItemClick: (projectId: string, isSuccess: boolean) => void;
    onCardUpdate: (cardDetails: IProjectDetails, isSuccess: boolean) => void;
    onVoteClick: (isSuccess: boolean, isLiked: boolean) => void;
    loggedInUserId: string;
    showLeaveProjects: boolean;
}

interface ICardState {
    isVoteLoading: boolean;
    isMoreMenuLoading: boolean;
    cardDetails: IProjectDetails;
}

class Card extends React.Component<ICardProps, ICardState> {
    localize: TFunction;
    constructor(props: any) {
        super(props);

        this.localize = this.props.t;
        this.state = {
            isVoteLoading: false,
            isMoreMenuLoading: false,
            cardDetails: this.props.cardDetails
        }
    }

    componentWillReceiveProps(nextProps: ICardProps) {
        if (nextProps.cardDetails !== this.props.cardDetails) {
            this.setState({ cardDetails: nextProps.cardDetails })
        }
    }

	/**
    *Submits user vote information to API.
    */
    onVoteClick = async () => {
        let cardDetails = { ...this.state.cardDetails };
        this.setState({ isVoteLoading: true });
        if (!cardDetails.isJoinedByUser) {
            let response = await addUserVote({ postId: cardDetails.projectId });
            if (response.status === 200 && response.data) {
                cardDetails.isJoinedByUser = true;
                cardDetails.teamSize = cardDetails.teamSize + 1;
                this.setState({ cardDetails: cardDetails });
                this.props.onVoteClick(true, true);
            }
            else {
                this.props.onVoteClick(false, true);
            }
        }
        else {
            let response = await deleteUserVote({ postId: cardDetails.projectId });
            if (response.status === 200 || response.data) {
                cardDetails.isJoinedByUser = false;
                cardDetails.teamSize = cardDetails.teamSize - 1;
                this.setState({ cardDetails: cardDetails });
                this.props.onVoteClick(true, false);
            }
            else {
                this.props.onVoteClick(false, false);
            }
        }

        this.setState({ isVoteLoading: false });
    }

	/**
    *Deletes selected blog post from storage
    */
    handleDeleteButtonClick = async () => {
        this.setState({ isMoreMenuLoading: true });
        let response = await deletePost(this.state.cardDetails);
        if (response.status === 200 && response.data) {
            this.setState({ isMoreMenuLoading: false });
            this.props.onDeleteButtonClick(this.state.cardDetails.projectId, true);
        }
        else {
            this.setState({ isMoreMenuLoading: false });
            this.props.onDeleteButtonClick(this.state.cardDetails.projectId, false);
        }
    }

    /**
    *Deletes selected project from joined projects list
    */
    handleLeaveProjectButtonClick = async() => {
        this.setState({ isMoreMenuLoading: true });
        let response = await leaveProject(this.state.cardDetails);
        if (response.status === 200 && response.data) {
            this.setState({ isMoreMenuLoading: false });
            this.props.onLeaveButtonClick(this.state.cardDetails.projectId, true);
        }
        else {
            this.setState({ isMoreMenuLoading: false });
            this.props.onLeaveButtonClick(this.state.cardDetails.projectId, false);
        }
    }

    /**
    *Close selected project from joined projects list
    */
    handleCloseProjectButtonClick = async (isSuccess: boolean, projectId: string) => {
        this.setState({ isMoreMenuLoading: true });
        this.props.onCloseProjectButtonClick(isSuccess, projectId);
        this.setState({ isMoreMenuLoading: false });
    }

	/**
    * Fetch user's private list posts from API
    */
    getPrivateListPosts = async () => {
        let response = await getUserPrivateListPosts();
        if (response.status === 200 && response.data) {
            return response.data;
        }
    }

    handleAddToPrivateListButtonClick = async () => {
        this.setState({
            isMoreMenuLoading: true
        });

        let privateListPosts = await this.getPrivateListPosts();
        let blogPost = this.state.cardDetails;

        if (privateListPosts && privateListPosts.find((post: any) => { return post.postId === blogPost.projectId })) {
            this.props.onAddPrivatePostClick(false, this.localize("privatePostExistError"));
        }
        else if (privateListPosts && privateListPosts.length >= Resources.maxPrivateListPostCount) {
            this.props.onAddPrivatePostClick(false, this.localize("privatePostMaxCountError"));
        }
        else {
            let postContent = { postId: blogPost.projectId };
            let response = await addNewPostContent(postContent);

            if (response.status === 200 && response.data) {
                this.props.onAddPrivatePostClick(true);
            }
            else {
                this.props.onAddPrivatePostClick(false);
            }
        }

        this.setState({ isMoreMenuLoading: false });
    }

	/**
	*Invoked when item from more menu is clicked.
	*@param key Selected menu key
	*/
    onMenuItemClick = (key: number) => {
        if (key === 1) // add to user private list
        {
            this.handleAddToPrivateListButtonClick();
        }
        if (key === 3) // delete
        {
            this.handleDeleteButtonClick();
        }
        if (key === 4)
        {
            this.handleLeaveProjectButtonClick();
        }
    };

    /**
	*Invoked when card is updated.
    *@param cardDetails Post card details.
    *@param isSuccess  Success status.
	*/
    onUpdateCard = (cardDetails: IProjectDetails, isSuccess: boolean) => {
        this.setState({
            cardDetails: cardDetails
        });

        this.props.onCardUpdate(cardDetails, isSuccess);
    };

	/**
    * Renders the component
    */
    public render(): JSX.Element {
        let commaSeperatedTags = "";
        if (this.state.cardDetails.requiredSkills.split(";").length > 3) {
            let tags = this.state.cardDetails.requiredSkills.split(";");
            commaSeperatedTags = tags.slice(3, this.state.cardDetails.requiredSkills.split(";").length).join(',');
        }
        return (
            <div id={this.props.index.toString()} className="card-bg">
                <Flex gap="gap.smaller" vAlign="center">
                    <Thumbnail isVisible={false} imageUrl={this.state.cardDetails.supportDocuments} />
                </Flex>
                <div className="card-body">
                    <Flex gap="gap.smaller" column vAlign="start">
                        <Flex gap="gap.smaller" className="title-flex">
                            {this.props.cardDetails.isCurrentUserProject && this.props.cardDetails.status != 4 &&
                                <>
                                <Flex.Item grow>
                                    <EditItemDialog
                                        projectDetails={this.props.projectDetails}
                                        triggerComponent={<Text className="title-text" size="large" weight="bold" content={this.props.cardDetails.title} />}
                                        index={this.props.index}
                                        cardDetails={this.state.cardDetails}
                                        onSubmit={this.onUpdateCard}
                                        onCancel={() => { }}
                                    />
                                </Flex.Item>
                                <Flex.Item push>
                                    <div></div>
                                </Flex.Item>
                                <EditItemDialog
                                    projectDetails={this.props.projectDetails}
                                    triggerComponent={<EditIcon className="icon-hover" outline title="Edit project" />}
                                    index={this.props.index}
                                    cardDetails={this.state.cardDetails}
                                    onSubmit={this.onUpdateCard}
                                    onCancel={() => { }}
                                />
                                </>
                            }
                            {this.props.cardDetails.isCurrentUserProject && this.props.cardDetails.status == 4 &&
                                <JoinProjectDialogTitle
                                    index={this.props.index}
                                    cardDetails={this.props.cardDetails}
                                    onSubmit={this.props.onJoinMenuItemClick}
                                    onCancel={() => { }}
                                />
                            }
                            {this.props.showJoinProjectMenu && !this.props.cardDetails.isCurrentUserProject &&
                                <JoinProjectDialogTitle
                                    index={this.props.index}
                                    cardDetails={this.props.cardDetails}
                                    onSubmit={this.props.onJoinMenuItemClick}
                                    onCancel={() => { }}
                                />}
                            {this.props.showLeaveProjects && <JoinProjectDialogTitle
                                index={this.props.index}
                                cardDetails={this.props.cardDetails}
                                onSubmit={this.props.onJoinMenuItemClick}
                                onCancel={() => { }}
                            />}
                        </Flex>
                        <Flex gap="gap.smaller">
                            <TypeLabel postType={this.state.cardDetails.status.toString()} size="small" />
                        </Flex>
                        <Flex className="content-flex" gap="gap.small">
                            <Text size="small" className="content-text" title={this.state.cardDetails.description} content={this.state.cardDetails.description} />
                        </Flex>
                    </Flex>
                </div>
                <div className="footer-flex">
                    <Flex gap="gap.smaller" className="tags-flex" vAlign="center">
                        {
                            this.state.cardDetails.requiredSkills.split(";").length <= 3 ?

                                this.state.cardDetails.requiredSkills.split(";").map((value: string, index: number) => {
                                    if (value.trim().length > 0) {
                                        return <Tag index={index} tagContent={value.trim()} showRemoveIcon={false} />
                                    }
                                }) :
                                <>
                                    {this.state.cardDetails.requiredSkills.split(";").map((value: string, index: number) => {
                                        if (index <= 2) {
                                            return <Tag index={index} tagContent={value.trim()} showRemoveIcon={false} />
                                        }
                                    })}
                                    <Label
                                        content={"+" + (this.state.cardDetails.requiredSkills.split(";").length - 3)}
                                        title={commaSeperatedTags}
                                        circular
                                        className="tags-label-wrapper" />
                                </>

                        }
                    </Flex>
                    <Flex gap="gap.smaller" className="more-menu-bar" vAlign="center">
                        <Flex vAlign="center">
                            <div className="user-avatar-card" style={{ backgroundColor: this.state.cardDetails.avatarBackgroundColor }}>
                                <Text className="initials-color" content={getInitials(this.state.cardDetails.createdByName)} title={this.state.cardDetails.createdByName} />
                            </div>&nbsp;<Text className="author-name" title={this.state.cardDetails.createdByName} content={this.state.cardDetails.createdByName} /></Flex>
                        <Flex.Item push>
                            <div></div>
                        </Flex.Item>
                        {
                            this.state.isVoteLoading === false ?
                                <Upvotes
                                    onVoteClick={() => this.onVoteClick()}
                                    isSelected={this.state.cardDetails.isJoinedByUser === undefined ? false : this.state.cardDetails.isJoinedByUser}
                                    totalJoined={this.state.cardDetails.projectParticipantsUserIds === "" ? "0" : this.state.cardDetails.projectParticipantsUserIds.split(';').length.toString()}
                                    teamSize={this.state.cardDetails.teamSize.toString()} />
                                : <Loader size="small" />
                        }
                        <div className="more-menu-wrapper">
                            {
                                this.state.isMoreMenuLoading === false
                                    ? <PopupMoreMenu
                                        loggedInUserId={this.props.loggedInUserId}
                                        projectDetails={this.props.projectDetails}
                                        onJoinMenuItemClick={this.props.onJoinMenuItemClick}
                                        onCloseProjectButtonClick={this.handleCloseProjectButtonClick}
                                        showLeaveProjects={this.props.showLeaveProjects}
                                        showJoinProjectMenu={this.props.showJoinProjectMenu}
                                        onMenuItemClick={this.onMenuItemClick}
                                        onEditSubmit={this.onUpdateCard}
                                        cardDetails={this.state.cardDetails} />
                                    : <Loader size="small" className="more-menu-loader" />
                            }
                        </div>
                    </Flex>
                </div>
            </div>
        );
    }
}

export default withTranslation()(Card)