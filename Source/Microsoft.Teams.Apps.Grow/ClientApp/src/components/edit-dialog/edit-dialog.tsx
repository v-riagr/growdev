// <copyright file="edit-dialog.tsx" company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

import * as React from "react";
import { Dialog, Text, Flex } from "@fluentui/react-northstar";
import { EditIcon } from "@fluentui/react-icons-northstar";
import EditItemDialogContent from "./edit-dialog-content";
import { IProjectDetails } from "../card-view/discover-wrapper-page";
import { WithTranslation, withTranslation } from "react-i18next";
import { TFunction } from "i18next";

import "../../styles/edit-dialog.css";

interface IEditItemProps extends WithTranslation {
	index: number;
	cardDetails: IProjectDetails;
	onSubmit: (editedCardDetails: IProjectDetails, isSuccess: boolean) => void;
	onCancel: () => void;
}

interface IEditDialogStateState {
	editDialogOpen: boolean;
}

class EditItemDialog extends React.Component<IEditItemProps, IEditDialogStateState> {
	localize: TFunction;
	constructor(props: any) {
		super(props);

		this.localize = this.props.t;
		this.state = {
			editDialogOpen: false
		}
	}

	/**
	*Changes dialog open state to show and hide dialog.
	*@param isOpen Boolean indication whether to show dialog
	*/
	changeDialogOpenState = (isOpen: boolean) => {
		this.setState({ editDialogOpen: isOpen })
	}

	/**
	*Invoked while closing dialog. Set state to original values.
	*/
	onCancel = () => {
		this.props.onCancel();
		this.changeDialogOpenState(false);
	}

	/**
    * Renders the component
    */
	public render(): JSX.Element {
		return (
			<Dialog
				className="dialog-container"
				content={
					<EditItemDialogContent
						onSubmit={this.props.onSubmit}
						onCancel={this.onCancel}
						cardDetails={this.props.cardDetails}
						changeDialogOpenState={this.changeDialogOpenState}
					/>
				}
				open={this.state.editDialogOpen}
				onOpen={() => this.setState({ editDialogOpen: true })}
				trigger={
					<Flex vAlign="center" className="menu-items-wrapper" onClick={() => this.changeDialogOpenState(true)}>
						<EditIcon outline /> <Text className="trigger-text" content={this.localize("edit")} />
					</Flex>}
			/>
		);
	}
}
export default withTranslation()(EditItemDialog)