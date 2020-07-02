// <copyright file="close-project-page.tsx" company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

import * as React from "react";
import { Input, Text, TextArea, Table, ItemLayout, Avatar, Flex } from "@fluentui/react-northstar";
import { Container, Col, Row } from "react-bootstrap";
import * as microsoftTeams from "@microsoft/teams-js";
import { ICloseProjectMemberDetails } from './close-project-wrapper';
import { IProjectDetails } from "../card-view/discover-wrapper-page"
import { getBaseUrl } from '../../configVariables';
import { WithTranslation, withTranslation } from "react-i18next";
import { TFunction } from "i18next";
import Resources from "../../constants/resources";
import Skills from "./skills";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../../styles/close-project.css";

interface ICloseProjectTableProps extends WithTranslation {
    errorMessage: string;
    errorIndex: number;
    showSkillCountError: boolean;
    emptySkillsCheck: Array<number>;
    projectMemberDetails: Array<ICloseProjectMemberDetails>;
    memberDetails: IProjectDetails;
    onSkillKeyDown: (event: number, index: number) => void;
    onSkillChange: (skill: string, index: number) => void;
    skillChangeIndex: number;
    onSkillRemoveClick: (index: number, projectMemberIndex: number) => void;
    inputValue: string;
    onDescriptionChange: (description: string, index: number) => void;
}

interface ICloseProjectTableState {

}

class CloseProjectTable extends React.Component<ICloseProjectTableProps, ICloseProjectTableState> {

    localize: TFunction;
    constructor(props: any) {
        super(props);
        this.localize = this.props.t;


        this.state = {

        }
    }

    /**
    * Used to initialize Microsoft Teams sdk
    */
    async componentDidMount() {
        microsoftTeams.initialize();
        microsoftTeams.getContext((context: microsoftTeams.Context) => {

        });
    }

    /**
* get initial of user names to show in avatar.
*/
    getInitials = (userPostName: string) => {
        let fullName = userPostName;
        let names = fullName.split(' '),
            initials = names[0].substring(0, 1).toUpperCase();

        if (names.length > 1) {
            initials += names[names.length - 1].substring(0, 1).toUpperCase();
        }
        return initials;
    }

    /**
    * Renders the component
    */
    public render(): JSX.Element {
        const privateListTableHeader = {
            key: "header",
            items: [
                { content: <Text weight="regular" content={this.localize("headerName")} />, key: "heading" },
                { content: <Text weight="regular" content={this.localize("skillsHeader")} />, key: "description" },
                { content: <Text weight="regular" content={this.localize("headerFeedback")} />, key: "user", className: "table-user-cell" },
            ],
        };

        let memberName = this.props.memberDetails.projectParticipantsUserMapping.split(';')
        let count = 0;

        let privateListTableRows = this.props.projectMemberDetails.map((teamMember: ICloseProjectMemberDetails, index: number) => (
            {
                key: index,
                items: [
                    {
                        content: <ItemLayout
                            className="project-members-heading"
                            media={<Avatar className="app-logo-container" name={teamMember.name} />}
                            header={<Text content={teamMember.name} weight="bold" />}
                            content={<Text className="app-dialog-heading" content="" weight="semibold" size="small" />}
                        />, truncateContent: true
                    },
                    {
                        content:
                            <>
                                {
                                    this.props.emptySkillsCheck.length > 0 ?
                                        this.props.emptySkillsCheck.map((value) => {
                                            if (index === value) {
                                                return (
                                                    <Flex key={index} gap="gap.smaller" vAlign="start">
                                                        <Text className="error-text" key={index} content={this.props.errorMessage} />
                                                    </Flex>
                                                );
                                            }
                                        })
                                        :
                                        this.props.showSkillCountError ?
                                            this.props.errorIndex === index ?
                                                <Flex key={index} gap="gap.smaller" vAlign="start">
                                                    <Text className="error-text" key={index} content={this.props.errorMessage} />
                                                </Flex> : <></> :
                                            <></>
                                }
                                <Input maxLength={Resources.closeProjectAcquiredSkillsMaxLength}
                                    value={this.props.skillChangeIndex === index ? this.props.inputValue : ""}
                                    onKeyDown={(event: any) => this.props.onSkillKeyDown(event.keyCode, index)}
                                    onChange={(event: any) => this.props.onSkillChange(event.target.value, index)}
                                    className="skills-input"
                                    placeholder="Please enter skills" />

                                <div className="skills-container">
                                    {
                                        teamMember.skillsList.map((value: string, skillIndex) => {
                                            if (value.trim().length > 0) {
                                                return <Skills
                                                    index={skillIndex}
                                                    projectMemberIndex={index}
                                                    skillContent={value.trim()}
                                                    showRemoveIcon={true}
                                                    onRemoveClick={this.props.onSkillRemoveClick} />
                                            }
                                        })
                                    }
                                </div>
                            </>
                    },
                    {
                        content: <TextArea maxLength={Resources.closeProjectFeedBackMaxLength} onChange={(event: any) => this.props.onDescriptionChange(event.target.value, index)} className="description-textarea" placeholder="Describe in less than 200 words" />, truncateContent: true
                    }
                ],
            }
        ));


        return (
            <>
                {this.props.memberDetails.projectParticipantsUserIds
                    ? <Table
                        variables={{ cellContentOverflow: 'wrap' }}
                        rows={privateListTableRows}
                        header={privateListTableHeader}
                        className="nonmobile-endorse-skill-list table-cell-content" />
                    : <Flex className="no-participant-joined"><Text content={this.localize("noParticpantJoinedProject")} /></Flex>}
            </>
        );
    }

}
export default withTranslation()(CloseProjectTable)