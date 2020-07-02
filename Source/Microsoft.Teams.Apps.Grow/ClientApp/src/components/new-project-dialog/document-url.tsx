// <copyright file="tag.tsx" company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

import * as React from "react";
import { Label, Text } from "@fluentui/react-northstar";
import { TrashCanIcon } from "@fluentui/react-icons-northstar";

interface IDocumentUrlProps {
    urlContent: string;
    index: number;
    showDeleteIcon: boolean;
    onRemoveClick?: (index: number) => void
}

const DocumentUrl: React.FunctionComponent<IDocumentUrlProps> = props => {

    /**
    *Invoked when 'X' icon is clicked of the label and passes control back to parent component.
    */
    const navigateDocument = () => {
        window.open(props.urlContent, "_blank");
    }

	/**
    *Invoked when 'X' icon is clicked of the label and passes control back to parent component.
    */
    const onRemoveClick = () => {
        props.onRemoveClick!(props.index);
    }
    if (props.showDeleteIcon) {
        return (
            <Label
                content={<Text className="document-url-text-form" onClick={navigateDocument} content={props.urlContent} title={props.urlContent} size="large" />}
                className="document-url-label-wrapper"
                icon={<TrashCanIcon key={props.index}
                    onClick={onRemoveClick} />}
            />
        );
    }
    else {
        return (
            <Label
                content={<Text className="document-url-text-form" onClick={navigateDocument} content={props.urlContent} title={props.urlContent} size="large" />}
                className="document-url-label-wrapper"
            />
        );
    }
}

export default React.memo(DocumentUrl);