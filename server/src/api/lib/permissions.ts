import { Character } from "../../db/models/character";
import { Campaign } from "../../db/models/campaign";
import { DBScope } from "../../db/models/scope";
import { DBUser } from "../../db/models/user";
import { Channel } from "../../db/models/channel";

export const userHasReadAccess = async (user: DBUser, scope: DBScope): Promise<boolean> => {
    if (!scope) {
        return true;
    } else if (scope.type === 'global') {
        return true;
    } else if (scope.type === 'campaign') {
        // is the user part of the campaign
        const campaign = await Campaign.findById(scope.link);
        if (campaign) {
            return campaign.users.find(campaignUser => campaignUser.id.equals(user._id)) !== undefined;
        } else {
            return false;
        }
    } else if (scope.type === 'character') {
        const character = await Character.findById(scope.link);
        if (character) {
            if (character.owner.equals(user._id)) {
                return true;
            } else {
                const campaigns = await Campaign.find({ characters: character._id });
                return campaigns.some(campaign => {
                    return campaign.users.find(campaignUser => campaignUser.id.equals(user._id) && campaignUser.type === "admin");
                });
            }
        } else {
            return false;
        }
    } else if (scope.type === 'user') {
        return scope.link !== undefined && scope.link.equals(user._id);
    } else if (scope.type === 'channel' || scope.type === 'message') {
        const channel = await Channel.findById(scope.link);
        if (channel) {
            if (channel.campaignId !== undefined) {
                const campaign = await Campaign.findById(channel.campaignId);
                return campaign !== undefined && campaign !== null && campaign.users.find(cu => cu.id.equals(user._id)) !== undefined;
            } else if (channel.userId !== undefined) {
                return channel.userId.equals(user._id);
            } else {
                return false;
            }
        } else {
            return false;
        }
    } else {
        return false;
    }
};

export const userHasReadAccessToAll = async (user: DBUser, scopes: DBScope[]): Promise<boolean> => {
    if (scopes.length === 0) {
        return false;
    }

    for (let scope of scopes) {
        const hasAccess = await userHasReadAccess(user, scope);
        if (!hasAccess) {
            return false;
        }
    }
    return true;
};

export const userHasWriteAccess = async (user: DBUser, scope: DBScope | undefined): Promise<boolean> => {
    return true;
    /*
    if (!scope) {
        return false;
    } else if (scope.type === 'global') {
        return user.admin;
    } else if (scope.type === 'campaign') {
        // is the user an admin of the campaign
        const campaign = await Campaign.findById(scope.link);
        if (campaign) {
            return campaign.users.find(campaignUser => campaignUser.id.equals(user._id) && campaignUser.type === "admin") !== undefined;
        } else {
            // the campaign doesn't exist, so the user is allowed since this must be the creation of a new campaign
            return true;
        }
    } else if (scope.type === 'character') {
        const character = await Character.findById(scope.link);
        if (character) {
            if (character.owner.equals(user._id)) {
                return true;
            } else {
                const campaigns = await Campaign.find({ characters: character._id });
                return campaigns.some(campaign => {
                    return campaign.users.find(campaignUser => campaignUser.id.equals(user._id) && campaignUser.type === "admin");
                });
            }
        } else {
            // the character doesn't exist, so the user is allowed since this must be the creation of a new character
            return true;
        }
    } else if (scope.type === 'user') {
        return user.admin || user._id.equals(scope.link);
    } else if (scope.type === 'channel') {
        const channel = await Channel.findById(scope.link);
        if (channel) {
            if (channel.campaignId !== undefined) {
                const campaign = await Campaign.findById(channel.campaignId);
                return campaign !== undefined && campaign !== null && campaign.users.find(cu => cu.id.equals(user._id) && cu.type === 'admin') !== undefined;
            } else if (channel.userId !== undefined) {
                return channel.userId.equals(user._id);
            } else {
                return user.admin;
            }
        } else {
            return user.admin;
        }
    } else if (scope.type === 'message') {
        const channel = await Channel.findById(scope.link);
        if (channel) {
            if (channel.campaignId !== undefined) {
                const campaign = await Campaign.findById(channel.campaignId);
                return campaign !== undefined && campaign !== null && campaign.users.find(cu => cu.id.equals(user._id)) !== undefined;
            } else if (channel.userId !== undefined) {
                return channel.userId.equals(user._id);
            } else {
                return user.admin;
            }
        } else {
            return user.admin;
        }
    } else {
        return false;
    }*/
};
