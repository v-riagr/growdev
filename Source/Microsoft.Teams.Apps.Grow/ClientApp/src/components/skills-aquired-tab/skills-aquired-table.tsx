// <copyright file="close-project-page.tsx" company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

import * as React from "react";
import { Text, Flex, Table, Avatar, Label } from "@fluentui/react-northstar";
import { Container, Col, Row } from "react-bootstrap";
import * as microsoftTeams from "@microsoft/teams-js";
import { IProjectSkillsAcquiredDetails } from './skills-aquired-wrapper';
import { WithTranslation, withTranslation } from "react-i18next";
import { TFunction } from "i18next";
import Resources from "../../constants/resources";
import Skills from "../close-project/skills";

import 'bootstrap/dist/css/bootstrap.min.css';
import "../../styles/close-project.css";

var moment = require('moment');

interface IAquiredSkillsTableProps extends WithTranslation {
    screenWidth: number,
    projectSkillsDetails: Array<IProjectSkillsAcquiredDetails>
}

class AcquiredSkillsTable extends React.Component<IAquiredSkillsTableProps> {
    localize: TFunction;
    constructor(props: any) {
        super(props);
        this.localize = this.props.t;
    }

    /**
    * Used to initialize Microsoft Teams sdk
    */
    async componentDidMount() {
        microsoftTeams.initialize();
        microsoftTeams.getContext((context: microsoftTeams.Context) => {

        });
    }

    removeSkills = () => {
        console.log("table");
    }

    /**
    * Renders the component
    */
    public render(): JSX.Element {
        const skillsAcquiredTableHeader = {
            key: "header",
            items: [
                { content: <Text weight="regular" content="Skills acquired" />, key: "skills", className: "skills-table-user-cell" },
                { content: <Text weight="regular" content="Project title" />, key: "title", className: "skills-table-user-cell" },
                { content: <Text weight="regular" content="Endorsed by" />, key: "user", className: "skills-table-user-cell" },
                { content: <Text weight="regular" content="Endorsed on" />, key: "date", className: "skills-table-user-cell" },
            ]
        };

        let skillsAcquiredTableRows = this.props.projectSkillsDetails.map((project: IProjectSkillsAcquiredDetails, index: number) => (
            {
                key: index,
                items: [

                    {
                        content:
                            <Flex gap="gap.smaller" className="skills-flex" vAlign="center">
                                {
                                    project.acquiredSkills.split(";").map((value: string, index: number) => {
                                        if (value.trim().length) {
                                            if (this.props.screenWidth <= Resources.screenWidthLarge && this.props.screenWidth > Resources.screenWidthSmall) {
                                                if (index <= 1) {
                                                    return <Skills index={index} skillContent={value.trim()} projectMemberIndex={0} showRemoveIcon={false} onRemoveClick={this.removeSkills}/>
                                                }
                                                else {
                                                    return (
                                                        <Label
                                                            key={index}
                                                            circular
                                                            content="+1"
                                                            title={value.trim()}
                                                            className="skills-label-wrapper"
                                                        />
                                                    )
                                                }
                                            }
                                            else if (this.props.screenWidth <= Resources.screenWidthSmall) {

                                                if (index <= 0) {
                                                    return <Skills index={index} skillContent={value.trim()} projectMemberIndex={0} showRemoveIcon={false} onRemoveClick={this.removeSkills} />
                                                }
                                                else {
                                                    if (index === 1) {
                                                        let tags = project.acquiredSkills.substring(project.acquiredSkills.indexOf(";") + 1);
                                                        let commaSeperatedTags = tags.replace(';', ',');
                                                        return (
                                                            <Label
                                                                key={index}
                                                                circular
                                                                content="+2"
                                                                title={commaSeperatedTags}
                                                                className="skills-label-wrapper"
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
                                                return <Skills index={index} skillContent={value.trim()} projectMemberIndex={0} showRemoveIcon={false} onRemoveClick={this.removeSkills} />
                                            }

                                        }
                                    })
                                }
                            </Flex>, className: "skills-table-user-cell"
                    },
                    { content: <Text className="project-title" title={project.projectTitle} content={project.projectTitle} />, truncateContent: true, className: "skills-table-user-cell" },
                    {
                        content: <><Avatar className="avatar-container" name={project.projectOwnerName} /> <Text
                            key={index}
                            content={project.projectOwnerName}
                            title={project.projectOwnerName}
                            className="project-endorsee"
                        /></>, truncateContent: true, className: "skills-table-user-cell"
                    },
                    { content: <Text content={moment.utc(project.projectClosedDate).local().format("MM-DD-YYYY hh:mm A")} title={moment.utc(project.projectClosedDate).local().format("MM-DD-YYYY hh:mm A")} />, truncateContent: true, className: "skills-table-user-cell" }
                ],
            }
        ));

        return (
            <>
                <Flex gap="gap.smaller" className="skills-acquired-header" vAlign="center">
                    <Text content="Skills Acquired" />
                </Flex>
                
                <Table variables={{
                    cellContentOverflow: 'wrap',
                }} header={skillsAcquiredTableHeader} rows={skillsAcquiredTableRows}
                    className="nonmobile-acquired-skill-list table-rows table-cell-content" />
            </>
        );
    }

}
export default withTranslation()(AcquiredSkillsTable)