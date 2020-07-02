// <copyright file="add-new-dialog-content.tsx" company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

import * as React from "react";
import { Button, Flex, Text, Input, TextArea, Dropdown, ItemLayout, Image, Provider } from "@fluentui/react-northstar";
import { CloseIcon, AddIcon, InfoIcon } from "@fluentui/react-icons-northstar";
import * as microsoftTeams from "@microsoft/teams-js";
import Tag from "../card-view/tag";
import { IProjectDetails } from "../card-view/discover-wrapper-page";
import { addNewProjectContent } from "../../api/discover-api";
import { WithTranslation, withTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { getLocalizedPostTypes } from "../../helpers/helper";
import { IPostType } from "../../constants/resources";
import Resources from "../../constants/resources";

import "../../styles/edit-dialog.css";

interface IAddNewDialogContentProps extends WithTranslation {
    onSubmit: (isSuccess: boolean, getSubmittedPost: IProjectDetails) => void;
    changeDialogOpenState: (isOpen: boolean) => void;
}

export interface ITagValidationParameters {
    isEmpty: boolean;
    isExisting: boolean;
    isLengthValid: boolean;
    isTagsCountValid: boolean;
}

interface IAddNewDialogContentState {
    projectDetails: IProjectDetails;
    tagsList: Array<string>;
    typeList: Array<IPostType>;
    tag: string;
    isEditDialogOpen: boolean;
    isTitleValid: boolean;
    isDescriptionValid: boolean;
    isTypeValid: boolean;
    isLinkValid: boolean;
    isLoading: boolean;
    tagValidation: ITagValidationParameters;
}

class AddNewItemDialogContent extends React.Component<IAddNewDialogContentProps, IAddNewDialogContentState> {
    localize: TFunction;
    teamId = "";
    constructor(props: any) {
        super(props);

        this.localize = this.props.t;
        let localizedPostTypes = getLocalizedPostTypes(this.localize);
        this.state = {
            tagsList: [],
            typeList: localizedPostTypes,
            projectDetails: {
                supportDocuments: "",
                createdByName: "",
                createdDate: new Date(),
                description: "",
                projectId: "",
                requiredSkills: "",
                title: "",
                teamSize: 0,
                projectStartDate: "",
                projectEndDate: "",
                status: 1,
                updatedDate: new Date(),
                createdByUserId: "",
                isJoinedByUser: undefined,
                isRemoved: false,
                avatarBackgroundColor: "#ffffff",
                projectParticipantsUserMapping: "",
                projectParticipantsUserIds: ""
            },
            tag: "",
            isEditDialogOpen: false,
            isTitleValid: true,
            isTypeValid: true,
            isDescriptionValid: true,
            isLinkValid: true,
            tagValidation: { isEmpty: false, isExisting: false, isLengthValid: true, isTagsCountValid: true },
            isLoading: false
        }
    }

    componentDidMount() {
        microsoftTeams.initialize();
        microsoftTeams.getContext((context: microsoftTeams.Context) => {
            this.teamId = context.teamId!;
        });
    }

	/**
	*Close the dialog and pass back card properties to parent component.
	*/
    onSubmitClick = async () => {
        if (this.checkIfSubmitAllowed()) {
            this.setState({
                isLoading: true
            });
            let projectDetails = this.state.projectDetails;
            projectDetails.requiredSkills = this.state.tagsList.join(";");
            projectDetails.isRemoved = false;
            let response = await addNewProjectContent(projectDetails);
            if (response.status === 200 && response.data) {
                if (response.data !== false) {
                    this.props.onSubmit(true, response.data);
                    this.props.changeDialogOpenState(false);
                }
            }
            else {
                this.props.onSubmit(false, response.data);
            }

            this.setState({
                isLoading: false
            });
        }
    }


	/**
	*Sets description state.
	*@param description Description string
	*/
    onDescriptionChange = (description: string) => {
        let cardDetails = this.state.projectDetails;
        cardDetails.description = description;
        this.setState({ projectDetails: cardDetails, isDescriptionValid: true });
    }

	/**
	*Sets heading state.
	*@param headingText Heading string
	*/
    onHeadingChange = (headingText: string) => {
        let cardDetails = this.state.projectDetails;
        cardDetails.title = headingText;
        this.setState({ projectDetails: cardDetails, isTitleValid: true });
    }

	/**
	*Sets link state.
	*@param link Link string
	*/
    onLinkChange = (link: string) => {
        let cardDetails = this.state.projectDetails;
        cardDetails.supportDocuments = link;
        this.setState({ projectDetails: cardDetails });
    }

	/**
	*Sets tag state.
	*@param tag Tag string
	*/
    onTagChange = (tag: string) => {
        this.setState({ tag: tag })
    }

	/**
	*Sets state of tagsList by adding new tag.
	*/
    onTagAddClick = () => {
        if (this.checkIfTagIsValid()) {
            this.setState((prevState: IAddNewDialogContentState) => ({ tagsList: [...prevState.tagsList, this.state.tag.toLowerCase()], tag: "" }));
        }
    }

	/**
	*Check if tag is valid
	*/
    checkIfTagIsValid = () => {
        let validationParams: ITagValidationParameters = { isEmpty: false, isLengthValid: true, isExisting: false, isTagsCountValid: false };
        if (this.state.tag.trim() === "") {
            validationParams.isEmpty = true;
        }

        if (this.state.tag.length > Resources.tagMaxLength) {
            validationParams.isLengthValid = false;
        }

        let tags = this.state.tagsList;
        let isTagExist = tags.find((tag: string) => {
            if (tag.toLowerCase() === this.state.tag.toLowerCase()) {
                return tag;
            }
        });

        if (isTagExist) {
            validationParams.isExisting = true;
        }

        if (this.state.tagsList.length < Resources.tagsMaxCount) {
            validationParams.isTagsCountValid = true;
        }

        this.setState({ tagValidation: validationParams });

        if (!validationParams.isEmpty && !validationParams.isExisting && validationParams.isLengthValid && validationParams.isTagsCountValid) {
            return true;
        }
        return false;
    }

	/**
	*Sets state of tagsList by removing tag using its index.
	*@param index Index of tag to be deleted.
	*/
    onTagRemoveClick = (index: number) => {
        let tags = this.state.tagsList;
        tags.splice(index, 1);
        this.setState({ tagsList: tags });
    }

	/**
	* Checks whether all validation conditions are matched before user submits edited post content
	*/
    checkIfSubmitAllowed = () => {
        let postValidationStatus = { isTypeValid: true, isTitleValid: true, isDescriptionValid: true, isLinkValid: false };

        if (this.state.projectDetails.title.trim() === "" || this.state.projectDetails.title.length > Resources.postTitleMaxLength) {
            postValidationStatus.isTitleValid = false;
        }

        if (this.state.projectDetails.description.trim() === "" ||
            this.state.projectDetails.description.length > Resources.postDesriptionMaxLength ||
            this.state.projectDetails.description.length < Resources.postDesriptionMinLength) {
            postValidationStatus.isDescriptionValid = false;
        }

        if (this.state.projectDetails.supportDocuments.trim() === "" || this.state.projectDetails.supportDocuments.length > Resources.postContentUrlMaxLength) {
            postValidationStatus.isLinkValid = false;
        }
        else {
            let expression = Resources.urlValidationRegEx;
            let regex = new RegExp(expression);
            if (this.state.projectDetails.supportDocuments.match(regex)) {
                postValidationStatus.isLinkValid = true;
            }
            else {
                postValidationStatus.isLinkValid = false;
            }
        }
        this.setState({ isLinkValid: postValidationStatus.isLinkValid, isDescriptionValid: postValidationStatus.isDescriptionValid, isTitleValid: postValidationStatus.isTitleValid, isTypeValid: postValidationStatus.isTypeValid });
        if (postValidationStatus.isTitleValid && postValidationStatus.isDescriptionValid && postValidationStatus.isLinkValid && postValidationStatus.isTypeValid) {
            return true;
        }
        else {
            return false;
        }
    }

	/**
    *Returns text component containing error message for failed post type field validation
    */
    private getTypeError = () => {
        if (!this.state.isTypeValid) {
            return (<Text content={this.localize("invalidTypeError")} className="field-error-message" error size="medium" />);
        }
        return (<></>);
    }

	/**
    *Returns text component containing error message for failed title field validation
    */
    private getTitleError = () => {
        if (!this.state.isTitleValid) {
            if (this.state.projectDetails.title.trim() === "") {
                return (<Text content={this.localize("emptyTitleError")} className="field-error-message" error size="medium" />);
            }
            if (this.state.projectDetails.title.length > Resources.postTitleMaxLength) {
                return (<Text content={this.localize("maxCharactersTitleError")} className="field-error-message" error size="medium" />);
            }
        }
        return (<></>);
    }

	/**
    *Returns text component containing error message for failed description field validation
    */
    private getDescriptionError = () => {
        if (!this.state.isDescriptionValid) {
            if (this.state.projectDetails.description.trim() === "") {
                return (<Text content={this.localize("emptyDescriptionError")} className="field-error-message" error size="medium" />);
            }

            if (this.state.projectDetails.description.length < 150) {
                return (<Text content={this.localize("minLengthDescriptionError")} className="field-error-message" error size="medium" />);
            }

            if (this.state.projectDetails.description.length > Resources.postDesriptionMaxLength) {
                return (<Text content={this.localize("maxCharactersDescriptionError")} className="field-error-message" error size="medium" />);
            }
        }
        return (<></>);
    }

	/**
    *Returns text component containing error message for failed link field validation
    */
    private getLinkError = () => {
        if (!this.state.isLinkValid) {
            if (this.state.projectDetails.supportDocuments.trim() === "") {
                return (<Text content={this.localize("emptyLinkError")} className="field-error-message" error size="medium" />);
            }
            if (this.state.projectDetails.supportDocuments.length > Resources.postContentUrlMaxLength) {
                return (<Text content={this.localize("maxCharacterLinkError")} className="field-error-message" error size="medium" />);
            }
            return (<Text content={this.localize("invalidLinkError")} className="field-error-message" error size="medium" />);
        }
        return (<></>);
    }

	/**
    *Returns text component containing error message for empty tag input field.
    */
    private getTagError = () => {
        if (this.state.tagValidation.isEmpty) {
            return (<Text content={this.localize("emptyTagError")} className="field-error-message" error size="medium" />);
        }
        else if (!this.state.tagValidation.isLengthValid) {
            return (<Text content={this.localize("tagLengthError")} className="field-error-message" error size="medium" />);
        }
        else if (this.state.tagValidation.isExisting) {
            return (<Text content={this.localize("sameTagExistsError")} className="field-error-message" error size="medium" />);
        }
        else if (!this.state.tagValidation.isTagsCountValid) {
            return (<Text content={this.localize("tagsCountError")} className="field-error-message" error size="medium" />);
        }
        return (<></>);
    }

	/**
	* Adds tag when enter key is pressed
	* @param event Object containing event details
	*/
    onTagKeyDown = (event: any) => {
        if (event.key === 'Enter') {
            this.onTagAddClick();
        }
    }

	/**
	* Renders the component
	*/
    public render(): JSX.Element {

        const onTypeSelection = {
            onAdd: item => {
                this.setState((prevState: IAddNewDialogContentState) => ({ projectDetails: { ...prevState.projectDetails, type: item!.key.toString() } }));
                return "";
            },
        };

        return (
            <Provider className="dialog-provider-wrapper">
                <Flex>
                    <Flex.Item grow>
                        <ItemLayout
                            className="app-name-container"
                            media={<Image className="app-logo-container" src="/Artifacts/applicationLogo.png" />}
                            header={<Text content={this.localize("dialogTitleAppName")} weight="bold" />}
                            content={<Text content={this.localize("addNewPostDialogHeader")} weight="semibold" size="small" />}
                        />
                    </Flex.Item>
                    <CloseIcon className="icon-hover" onClick={() => this.props.changeDialogOpenState(false)} />
                </Flex>
                <Flex>
                    <div className="dialog-body">
                        <Flex gap="gap.smaller">
                            <Text content={"*" + this.localize("type")} /><InfoIcon className="info-icon" size="small" title={this.localize("type")} />
                            <Flex.Item push>
                                {this.getTypeError()}
                            </Flex.Item>
                        </Flex>
                        <Flex gap="gap.smaller" className="input-label-space-between">
                            <div className="type-dropdown-wrapper">
                                <Dropdown
                                    fluid
                                    items={this.state.typeList.map((value: IPostType) => { return { key: value.id, header: value.name } })}
                                    placeholder={this.localize("typePlaceholder")}
                                    getA11ySelectionMessage={onTypeSelection}
                                />
                            </div>
                        </Flex>

                        <Flex gap="gap.smaller" className="input-fields-margin-between-add-post">
                            <Text content={"*" + this.localize("headingFormLabel")} /><InfoIcon className="info-icon" size="small" title={this.localize("headingFormLabel")} />
                            <Flex.Item push>
                                {this.getTitleError()}
                            </Flex.Item>
                        </Flex>
                        <Flex gap="gap.smaller" className="input-label-space-between">
                            <Flex.Item>
                                <Input maxLength={Resources.postTitleMaxLength} placeholder={this.localize("titlePlaceholder")} fluid value={this.state.projectDetails.title} onChange={(event: any) => this.onHeadingChange(event.target.value)} />
                            </Flex.Item>
                        </Flex>

                        <Flex gap="gap.smaller" className="input-fields-margin-between-add-post">
                            <Text content={"*" + this.localize("descriptionFormLabel")} /><InfoIcon className="info-icon" size="small" title={this.localize("descriptionFormLabel")} />
                            <Flex.Item push>
                                {this.getDescriptionError()}
                            </Flex.Item>
                        </Flex>
                        <Flex gap="gap.smaller" className="text-area input-label-space-between">
                            <Flex.Item>
                                <TextArea maxLength={Resources.postDesriptionMaxLength} placeholder={this.localize("descriptionPlaceholder")} fluid className="text-area" value={this.state.projectDetails.description} onChange={(event: any) => this.onDescriptionChange(event.target.value)} />
                            </Flex.Item>
                        </Flex>

                        <Flex gap="gap.smaller" className="input-fields-margin-between-add-post">
                            <Text content={"*" + this.localize("linkFormLabel")} /><InfoIcon className="info-icon" size="small" title={this.localize("linkFormLabel")} />
                            <Flex.Item push>
                                {this.getLinkError()}
                            </Flex.Item>
                        </Flex>
                        <Flex gap="gap.smaller" className="input-label-space-between">
                            <Flex.Item>
                                <Input maxLength={Resources.postContentUrlMaxLength} placeholder={this.localize("linkPlaceholder")} fluid value={this.state.projectDetails.supportDocuments} onChange={(event: any) => this.onLinkChange(event.target.value)} />
                            </Flex.Item>
                        </Flex>

                        <Flex gap="gap.smaller" className="input-fields-margin-between-add-post">
                            <Text content={this.localize("tagsFormLabel")} /><InfoIcon className="info-icon" size="small" title={this.localize("tagsFormLabel")} />
                            <Flex.Item push>
                                <div>
                                    {this.getTagError()}
                                </div>
                            </Flex.Item>
                        </Flex>
                        <Flex gap="gap.smaller" vAlign="center" className="input-label-space-between">
                            <Input maxLength={Resources.tagMaxLength} placeholder={this.localize("tagPlaceholder")} fluid value={this.state.tag} onKeyDown={this.onTagKeyDown} onChange={(event: any) => this.onTagChange(event.target.value)} />
                            <Flex.Item push>
                                <div></div>
                            </Flex.Item>
                            <AddIcon key="search" onClick={this.onTagAddClick} className="add-icon icon-hover" />
                        </Flex>
                        <Flex gap="gap.smaller" className="tags-flex" vAlign="center">
                            <div>
                                {
                                    this.state.tagsList.map((value: string, index) => {
                                        if (value.trim().length > 0) {
                                            return <Tag index={index} tagContent={value.trim()} showRemoveIcon={true} onRemoveClick={this.onTagRemoveClick} />
                                        }
                                    })
                                }
                            </div>
                        </Flex>
                    </div>
                </Flex>
                <Flex className="dialog-footer-wrapper">
                    <Flex gap="gap.smaller" className="dialog-footer input-fields-margin-between-add-post">
                        <Flex.Item push>
                            <Button content={this.localize("cancel")} disabled={this.state.isLoading} onClick={(e) => this.props.changeDialogOpenState(false)} />
                        </Flex.Item>
                        <Button content={this.localize("submit")} primary loading={this.state.isLoading} disabled={this.state.isLoading} onClick={this.onSubmitClick} />
                    </Flex>
                </Flex>
            </Provider>
        );
    }
}

export default withTranslation()(AddNewItemDialogContent)