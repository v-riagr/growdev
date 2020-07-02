// <copyright file="private-list-table.tsx" company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

import * as React from "react";
import { Table, Text, Dialog, Button, Flex, Label, List } from "@fluentui/react-northstar";
import { TrashCanIcon } from "@fluentui/react-icons-northstar";
import { useTranslation } from 'react-i18next';
import Resources from "../../constants/resources";
import Tag from "../card-view/tag";
import TypeLabel from "../card-view/type-label";
import UserAvatar from "./user-avatar";

import "../../styles/card.css";
import "../../styles/private-list.css";

interface IUserPrivatePost {
    createdByName: string;
    title: string;
    description: string;
    projectId: string;
    supportDocuments: string;
    status: number;
    requiredSkills: string;
}

interface IPrivateListTableProps {
    privateListData: IUserPrivatePost[],
    onDeleteButtonClick: (postId: string) => void;
    onTitleClick: (contentUrl: string) => void;
    screenWidth: number;
}

const PrivateListTable: React.FunctionComponent<IPrivateListTableProps> = props => {
    const localize = useTranslation().t;

    const privateListTableHeader = {
        key: "header",
        items: [
            { content: <Text weight="regular" content={localize("headingFormLabel")} />, key: "heading" },
            { content: <Text weight="regular" content={localize("descriptionText")} />, key: "description" },
            { content: <Text weight="regular" content={localize("sharedBy")} />, key: "user", className: "table-user-cell" },
            { content: <Text weight="regular" content={localize("tags")} />, key: "Tags" },
            { content: <Text weight="regular" content={localize("postType")} />, key: "Type", className: "table-posttype-cell" },
            { content: <div />, key: "delete-action", className: "table-delete-cell" }
        ],
    };

    let privateListTableRows = props.privateListData.map((userPost: IUserPrivatePost, index: number) => (
        {
            key: index,
            items: [
                { content: <Text className="user-heading" onClick={() => props.onTitleClick(userPost.supportDocuments)} title={userPost.title} content={userPost.title} />, truncateContent: true },
                { content: <Text content={userPost.description} title={userPost.description} />, truncateContent: true, },
                {
                    content: <UserAvatar showFullName={true} postType="Not started" content={userPost.createdByName} title={userPost.createdByName} />, truncateContent: true, className: "table-user-cell"
                },
                {
                    content:
                        <Flex gap="gap.smaller" className="tags-flex" vAlign="center">
                            {
                                userPost.requiredSkills.split(";").map((value: string, index: number) => {
                                    console.log(index);
                                    if (value.trim().length) {
                                        if (props.screenWidth <= Resources.screenWidthLarge && props.screenWidth > Resources.screenWidthSmall) {
                                            if (index <= 1) {
                                                return <Tag index={index} tagContent={value.trim()} showRemoveIcon={false} />
                                            }
                                            else {
                                                return (
                                                    <Label
                                                        key={index}
                                                        circular
                                                        content="+1"
                                                        title={value.trim()}
                                                        className="tags-label-wrapper"
                                                    />
                                                )
                                            }
                                        }
                                        else if (props.screenWidth <= Resources.screenWidthSmall) {

                                            if (index <= 0) {
                                                return <Tag index={index} tagContent={value.trim()} showRemoveIcon={false} />
                                            }
                                            else {
                                                if (index === 1) {
                                                    let tags = userPost.requiredSkills.substring(userPost.requiredSkills.indexOf(";") + 1);
                                                    let commaSeperatedTags = tags.replace(';', ',');
                                                    return (
                                                        <Label
                                                            key={index}
                                                            circular
                                                            content="+2"
                                                            title={commaSeperatedTags}
                                                            className="tags-label-wrapper"
                                                        />
                                                    )
                                                }
                                                else {
                                                    return (
                                                        <></>
                                                    )
                                                }
                                            }
                                        }
                                        else {
                                            return <Tag index={index} tagContent={value.trim()} showRemoveIcon={false} />
                                        }

                                    }
                                })
                            }
                        </Flex>
                },
                {
                    content: <TypeLabel postType="Not started" size="medium" />,
                    className: "table-posttype-cell"
                },
                {
                    content: <Dialog
                        cancelButton={localize("cancel")}
                        confirmButton={localize("confirm")}
                        content={localize("deleteConfirmBodyText")}
                        header={localize("deleteConfirmTitleText")}
                        trigger={<Button primary icon={<TrashCanIcon />} content={localize("confirm")} text className="delete-button" />}
                        onConfirm={() => { props.onDeleteButtonClick("Not started") }}
                    />, truncateContent: true, className: "table-delete-cell"
                },
            ],
        }
    ));

    let privateListListViewItems = props.privateListData.map((userPost: IUserPrivatePost, index: number) => (
        {
            key: index,
            media: <UserAvatar showFullName={false} postType="Not started" content={userPost.createdByName} title={userPost.createdByName} />,
            header: <Text className="user-heading" onClick={() => props.onTitleClick(userPost.supportDocuments)} title={userPost.title} content={userPost.title} />,
            headerMedia: <Dialog
                className="dialog-container-private-list"
                cancelButton={localize("cancel")}
                confirmButton={localize("confirm")}
                content={localize("deleteConfirmBodyText")}
                header={localize("deleteConfirmTitleText")}
                trigger={<TrashCanIcon />}
                onConfirm={() => { props.onDeleteButtonClick("Not started") }}
            />,
            contentMedia: <></>,
            content: <Text className="content-text" content={userPost.description} title={userPost.description} />,
            className: "list-item"
        }
    ));

    return (
        <>
            <List className="mobile-private-list" items={privateListListViewItems} />
            <Table rows={privateListTableRows}
                header={privateListTableHeader} className="nonmobile-private-list table-cell-content" />
        </>
    );
}

export default PrivateListTable;