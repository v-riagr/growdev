// <copyright file="upvotes.tsx" company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

import * as React from "react";
import { Text, Label } from "@fluentui/react-northstar";
import { LikeIcon, TeamsIcon } from "@fluentui/react-icons-northstar";

interface IUpvotesProps {
    totalJoined: string;
    teamSize: string;
    isSelected: boolean;
    onVoteClick: () => void;
}

const Upvotes: React.FunctionComponent<IUpvotesProps> = props => {

    return (
        //<div className="like-count-wrapper" onClick={() => props.onVoteClick()}>
        //    <Text className="like-count-text" content={props.upvoteCount} title={props.upvoteCount} size="small" />
        //    {!props.isSelected ? <LikeIcon outline={true} className="vote-icon" /> : <LikeIcon outline={false} className=" vote-icon-filled" />}
        //</div>

        <Label
            circular
            icon={<TeamsIcon outline={false} className=" vote-icon-filled" />}
            iconPosition={"start"}
            content={<div className="tag-text-card"><Text className="tag-text-card" content={props.totalJoined + "/" + props.teamSize} size="small" /></div>}
            className="total-projects-label-wrapper"
        />
    );
}

export default React.memo(Upvotes);