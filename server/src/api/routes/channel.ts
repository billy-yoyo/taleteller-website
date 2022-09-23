import * as express from "express";
import { userHasReadAccess } from "../lib/permissions";
import { TChannelHistoryFilters } from "../models/channel";
import { TObjectId } from "../models/helpers/objectId";
import { createChannel, deleteChannel, getChannels, updateChannel } from "../service/channel";
import { loadMessageHistory } from "../service/message";

export const channelRouter = express.Router();
channelRouter.use(express.json());

channelRouter.get("/", async (req: express.Request<{ ids: string }>, res) => {
    await getChannels(req, res, (model) => ({ type: 'channel', link: model.id }));
});

channelRouter.post("/", async (req, res) => {
    await createChannel(req, res, (model) => ({ type: 'channel', link: model.id }));
});

channelRouter.put("/:id", async (req, res) => {
    await updateChannel(req, res, (model) => ({ type: 'channel', link: model.id }));
});

channelRouter.get("/:id/history", async (req, res) => {
    if (req.params.id && TObjectId.valid(req.params.id)) {
        const channelId = TObjectId.toModel(req.params.id);
        if (TChannelHistoryFilters.valid(req.query)) {
            const filters = TChannelHistoryFilters.toModel(req.query);
            
            const hasAccess = await userHasReadAccess(req.auth.user, { type: 'channel', link: channelId });
            if (hasAccess) {
                const response = await loadMessageHistory(channelId, filters.from, filters.limit);
                res.status(200).json(response.build());
            } else {
                res.status(404).send('Failed to find any of those ids');
            }
        } else {
            res.status(400).send(`Invalid history filter query parameters`);
        }
    } else {
        res.status(400).send(`Invalid id parameter`);
    }
});

channelRouter.delete("/:id", async (req, res) => {
    await deleteChannel(req, res, (model) => ({ type: 'channel', link: model.id }));
});

