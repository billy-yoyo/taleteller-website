import { ScopeMap } from "../api/models/scope";
import { Campaign } from "../db/models/campaign";
import { Channel } from "../db/models/channel";
import { DBScope } from "../db/models/scope";
import { EventType, IEvent, TEvent } from "./models/event";
import { sendToTargets } from "./targets";

export const getTargetsForScope = async (scope: DBScope): Promise<string[]> => {
    if (!scope) {
        return [];
    } else if (scope.type === 'global') {
        return [];
    } else if (scope.type === 'campaign') {
        // TODO: should be everyone within a campaign
        return [];
    } else if (scope.type === 'character') {
        // TODO: should be everyone with read access to the character
        return [];
    } else if (scope.type === 'user') {
        return scope.link === undefined ? [] : [scope.link.toHexString()];
    } else if (scope.type === 'channel' || scope.type === 'message') {
        const channel = await Channel.findById(scope.link);
        if (channel) {
            if (channel.campaignId !== undefined) {
                const campaign = await Campaign.findById(channel.campaignId);
                if (campaign) {
                    return campaign.users.map(user => user.id.toHexString());
                } else {
                    return [];
                }
            } else if (channel.userId !== undefined) {
                return [channel.userId.toHexString()];
            } else {
                return [];
            }
        } else {
            return [];
        }
    } else {
        return [];
    }
};

export const sendEvent = async (event: IEvent<EventType>) => {
    const scope = ScopeMap.toModel(event.scope);
    const targets = await getTargetsForScope(scope);
    sendToTargets(targets, JSON.stringify(TEvent.toTransit(event)));
};
