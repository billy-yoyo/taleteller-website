import * as express from "express";
import { createCampaign, deleteCampaign, getCampaigns, searchCampaigns, updateCampaign } from "../service/campaign";

export const campaignRouter = express.Router();
campaignRouter.use(express.json());

campaignRouter.get("/", async (req: express.Request<{ ids: string }>, res) => {
    await getCampaigns(req, res, (model) => ({ type: 'campaign', link: model.id }));
});

campaignRouter.get("/search", async (req, res) => {
    await searchCampaigns(req, res);
});

campaignRouter.post("/", async (req, res) => {
    await createCampaign(req, res, (model) => ({ type: 'campaign', link: model._id }));
});

campaignRouter.put("/:id", async (req, res) => {
    await updateCampaign(req, res, (model) => ({ type: 'campaign', link: model._id }));
});

campaignRouter.delete("/:id", async (req, res) => {
    await deleteCampaign(req, res, (model) => ({ type: 'campaign', link: model._id }));
});

