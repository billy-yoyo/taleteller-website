<script lang="ts">
import { useNavigate } from "svelte-navigator";
import PaginatedView from "../components/pagination/PaginatedView.svelte";
import { createAndStoreDefaultModel } from "../controller/model";
import type { ObjectID } from "../models/objectId";
import { deleteFeature } from "../repo/feature";

const sortMethods: { name: string, value: string }[] = [
    { name: "Name (Desc)", value: "-name" },
    { name: "Name (Asc)", value: "+name" },
];

const navigate = useNavigate();
const createNew = async () => {
    const model = await createAndStoreDefaultModel('feature', { type: 'global' });
    navigate(`/feature/${model.id}`);
};

let session = 1;
const onDelete = async (e: CustomEvent<{ id: ObjectID }>) => {
    await deleteFeature(e.detail.id);
    // increment session to force a refresh
    session++;
};

</script>
    
<PaginatedView session={session} type="feature" limit={10} scopes={[{ type: "global" }]} sortMethods={sortMethods}
               creatable on:create={createNew} deletable on:delete={onDelete}/>
