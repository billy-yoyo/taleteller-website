<script lang="ts">
import { useNavigate } from "svelte-navigator";

import PaginatedView from "../components/pagination/PaginatedView.svelte";
import { createAndStoreDefaultModel } from "../controller/model";
import type { ObjectID } from "../models/objectId";
import { deleteAction } from "../repo/action";

const sortMethods: { name: string, value: string }[] = [
    { name: "Name (Desc)", value: "-name" },
    { name: "Name (Asc)", value: "+name" },
];

const spellFilters = {
    tags: ["spell"]
};

const navigate = useNavigate();
const createNew = async () => {
    const model = await createAndStoreDefaultModel('action', { type: 'global' }, { tags: ['spell'] });
    navigate(`/action/${model.id}`);
};

let session = 1;
const onDelete = async (e: CustomEvent<{ id: ObjectID }>) => {
    await deleteAction(e.detail.id);
    // increment session to force a refresh
    session++;
};

</script>
    
<PaginatedView session={session} type="action" limit={10} scopes={[{ type: "global" }]} sortMethods={sortMethods}
               baseFilters={spellFilters} creatable on:create={createNew} deletable on:delete={onDelete}/>
