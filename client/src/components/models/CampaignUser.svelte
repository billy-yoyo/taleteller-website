<script lang="ts">
import { createEventDispatcher } from "svelte";

import type { ICampaignUser } from "../../models/campaign";
import type { IUser } from "../../models/user";
import * as idStore from "../../store/idStore";
import Checkbox from "../common/Checkbox.svelte";
import Tag from "../common/Tag.svelte";

export let campaignUser: ICampaignUser;
export let editable: boolean;

let user: IUser;
const sub = idStore.subscribeManger('user', campaignUser.id, (model) => {
    user = model;
});
$: sub(campaignUser.id);

const dispatch = createEventDispatcher();

const onChangeAdmin = (e: CustomEvent<{ value: boolean }>) => {
    dispatch('changeAdmin', { id: campaignUser.id, admin: e.detail.value });
};

const onDelete = () => {
    dispatch('delete', { id: campaignUser.id });
}

</script>

<div class="campaign-user">
    <div class="name">
        {user.name}
    </div>
    {#if campaignUser.type === 'admin' && !editable}
        <Tag tag="Admin" />
    {:else if editable}
        <div class="admin-option">
            <Checkbox checked={campaignUser.type === 'admin'} on:change={onChangeAdmin}/>
            <div>
                Admin
            </div>
        </div>
        <button class="delete" on:click={onDelete}>
            Remove
        </button>
    {/if}
</div>

<style>
    .campaign-user {
        background-color: #15151f;
        border-style: solid;
        border-width: 1px;
        border-color: #efefef;

        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 5px 7px;
    }

    .admin-option {
        border-style: solid;
        border-width: 1px;
        border-color: #efefef;
        padding: 3px 4px;
        margin-left: 10px;
        display: inline-flex;
        flex-direction: row;
        align-items: center;
    }

    .delete {
        border-style: solid;
        border-width: 1px;
        border-color: #efefef;
        padding: 3px 4px;
        margin-left: 10px;
        display: inline-flex;
        flex-direction: row;
        align-items: center;
    }
</style>