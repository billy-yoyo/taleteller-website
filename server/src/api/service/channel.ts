import { ObjectId } from "mongodb";
import { Channel, DBChannel } from "../../db/models/channel";
import { ChannelMap, mapChannelUpdate, TChannel, TPartialChannel } from "../models/channel";
import { TObjectId } from "../models/helpers/objectId";
import { getCampaignModelResponseByIds } from "./campaign";
import { ModelResponse } from "./lib/modelResponseBuilder";
import { modelUpdater } from "./lib/updater";
import { modelCreator } from "./lib/creator";
import { modelGetter } from "./lib/getter";
import { Campaign } from "../../db/models/campaign";
import { modelDeleter } from "./lib/deleter";

export const getChannelModelResponseByIds = async (ids: ObjectId[], parent?: ModelResponse): Promise<ModelResponse[]> => {
    const filteredIds = parent !== undefined ? ids.filter(id => parent.has('channel', TObjectId.toTransit(id))) : ids;
    if (filteredIds.length > 0) {
        const channels = await Channel.find({ _id: { $in: filteredIds } });
        return await Promise.all(channels.map(channel => getChannelModelResponse(channel, parent)));
    } else {
        return [];
    }
};

export const getChannelModelResponse = async (channel: DBChannel, parent?: ModelResponse): Promise<ModelResponse> => {
    const response = new ModelResponse('channel', TChannel.toTransit(ChannelMap.toTransit(channel)), parent);

    if (channel.campaignId) {
        const campaign = await getCampaignModelResponseByIds([channel.campaignId], response);
        response.addAllChildren(campaign);
    }

    return response;
};

export const getChannelsForUser = async (userId: ObjectId): Promise<any> => {
    const campaigns = await Campaign.find({ users: { $elemMatch: { id: userId } } });
    const campaignIds = campaigns.map(c => new ObjectId(c._id));
    const channels = await Channel.find({ $or: [ { userId }, { campaignId: { $in: campaignIds } } ] });
    const modelResponses = await Promise.all(channels.map(channel => getChannelModelResponse(channel)));
    return ModelResponse.merge(modelResponses).build();
};

export const getChannels = modelGetter(getChannelModelResponseByIds);
export const createChannel = modelCreator(TChannel, ChannelMap);
export const updateChannel = modelUpdater(TPartialChannel, Channel, mapChannelUpdate);
export const deleteChannel = modelDeleter(Channel);
