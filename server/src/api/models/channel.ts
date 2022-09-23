import T, { DeepPartial, ModelType, Template } from "tsplate";
import { DBChannel, Channel, DBChannelProps } from "../../db/models/channel";
import { TIntString } from "./helpers/numberString";
import { TObjectId } from "./helpers/objectId";

export const TChannel = T.Object({
    id: T.Optional(TObjectId),
    name: T.Optional(T.String),
    campaignId: T.Optional(TObjectId),
    userId: T.Optional(TObjectId)
});
export const TPartialChannel = T.toPartial(TChannel);
export type IChannel = ModelType<typeof TChannel>;

export const TChannelHistoryFilters = T.Object({
    from: TIntString,
    limit: TIntString
});

const mapToApi = (channel: DBChannel): IChannel => {
    return {
        id: channel._id,
        name: channel.name,
        campaignId: channel.campaignId,
        userId: channel.userId
    }
};

const mapToDb = (channel: IChannel): DBChannel => {
    return new Channel({
        _id: channel.id,
        name: channel.name,
        campaignId: channel.campaignId,
        userId: channel.userId
    });
}

export const ChannelMap: Template<DBChannel, IChannel> = {
    valid: (t: any): t is IChannel => true,
    toModel: mapToDb,
    toTransit: mapToApi
};

export const mapChannelUpdate = (channel: DeepPartial<IChannel> | undefined): DeepPartial<DBChannelProps> | undefined => {
    return channel === undefined ? undefined : {
        name: channel.name,
        campaignId: channel.campaignId,
        userId: channel.userId
    };
};
