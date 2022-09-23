import type { IChannel } from "../models/channel";
import type { ObjectID } from "../models/objectId";
import { loadChannelHistory, loadChannels, loadMyChannels } from "../repo/channel";
import * as chat from "../store/chat";
import { unique } from "../util/funcHelpers";
import { ensureCampaignsInStore } from "./campaign";
import { loadAndStoreMessageModels } from "./message";

export const loadAndStoreChannelModels = async (channels: IChannel[]) => {
    // load campaigns first since channels will load immediately after being stored
    await ensureCampaignsInStore(channels.map(c => c.campaignId).filter(cid => cid !== undefined));

    channels.forEach(channel => chat.registerChannel(channel));
};

export const loadAndStoreChannels = async (channelIds: ObjectID[]) => {
    const channels = await loadChannels(channelIds);
    loadAndStoreChannelModels(channels);
};

export const ensureChannelsInStore = async (channelIds: ObjectID[]) => {
    const missingIds = channelIds.filter(id => !chat.hasChannel(id));
    if (missingIds.length > 0) {
        await loadAndStoreChannels(unique(missingIds));
    }
};

export const loadAndStoreMyChannels = async () => {
    const channels = await loadMyChannels();
    loadAndStoreChannelModels(channels);
};

export const loadAndStoreChannelHistory = async (channelId: ObjectID, from: number, limit: number) => {
    const messages = await loadChannelHistory(channelId, from, limit);
    await loadAndStoreMessageModels(messages);
    return messages;
};
