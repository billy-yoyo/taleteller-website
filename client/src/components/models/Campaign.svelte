<script lang="ts">
import type { ICampaign, ICampaignUser } from "../../models/campaign";
import type { ObjectID } from "../../models/objectId";
import type { IUser } from "../../models/user";
import * as idStore from "../../store/idStore";
import PaginatedView from "../pagination/PaginatedView.svelte";
import Tab from "../tab/Tab.svelte";
import TabList from "../tab/TabList.svelte";
import Tabs from "../tab/Tabs.svelte";
import TabView from "../tab/TabView.svelte";
import * as me from "../../store/me";
import CampaignUser from "./CampaignUser.svelte";
import ModelPicker from "../common/ModelPicker.svelte";

export let campaignId: ObjectID;
let campaign: ICampaign;

const sub = idStore.subscribeManger('campaign', campaignId, (model) => {
    campaign = model;
});
$: sub(campaignId);

let user: IUser;
me.user.subscribe(model => { user = model; });

const editable = campaign.users.find(u => u.id === user.id)?.type === 'admin';

const sortMethods: { name: string, value: string }[] = [
    { name: 'Name (Asc)', value: '+name' },
    { name: 'Name (Desc)', value: '-name' },
];

$: usersFieldSync = idStore.fieldManualSync('campaign', campaignId, ['users']);
const addCampaignUser = (e: CustomEvent<{ value: ObjectID }>) => {
    if (!campaign.users.find(u => u.id === e.detail.value)) {
        const users: ICampaignUser[] = [
            ...campaign.users,
            { id: e.detail.value, type: 'player' }
        ];
        usersFieldSync(users);
    }
};

const deleteCampaignUser = (e: CustomEvent<{ id: ObjectID }>) => {
    const users = campaign.users.filter(u => u.id !== e.detail.id);
    usersFieldSync(users);
};

const changeAdmin = (e: CustomEvent<{ id: ObjectID, admin: boolean }>) => {
    const users = campaign.users.map(u => {
        if (u.id === e.detail.id) {
            const user: ICampaignUser = { id: u.id, type: e.detail.admin ? 'admin' : 'player' };
            return user;
        } else {
            return u;
        }
    });
    usersFieldSync(users);
};

$: charactersFieldSync = idStore.fieldManualSync('campaign', campaignId, ['characters']);
const addCharacter = (e: CustomEvent<{ value: ObjectID }>) => {
    if (!campaign.characters.includes(e.detail.value)) {
        charactersFieldSync([ ...campaign.characters, e.detail.value ]);
    }
};

const deleteCharacter = (e: CustomEvent<{ value: ObjectID }>) => {
    charactersFieldSync(campaign.characters.filter(c => c !== e.detail.value));
};

</script>

<div class="campaign">
    <div class="title">
        <div class="title-text">
            {campaign.name}
        </div>
    </div>
    <Tabs>
        <TabList>
            <Tab>Users</Tab>
            <Tab>Characters</Tab>
        </TabList>

        <TabView>
            {#each campaign.users as user}
                <CampaignUser campaignUser={user} editable={editable} on:changeAdmin={changeAdmin} on:delete={deleteCampaignUser}/>
            {/each}
            {#if editable}
                <ModelPicker type="user" modelId={undefined} scope={{ type: 'campaign', link: campaignId }} searchonly nolink on:change={addCampaignUser}/>
            {/if}
        </TabView>

        <TabView>
            <PaginatedView type="character" sortMethods={sortMethods} scopes={[{ type: 'campaign', link: campaignId }]} limit={10} deletable on:delete={deleteCharacter}/>
            {#if editable}
                <ModelPicker type="character" modelId={undefined} scope={{ type: 'campaign', link: campaignId }} searchonly nolink on:change={addCharacter}/>
            {/if}
        </TabView>
    </Tabs>
</div>
