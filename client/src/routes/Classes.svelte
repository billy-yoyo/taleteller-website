<script lang="ts">
import { useNavigate } from "svelte-navigator";

import PaginatedView from "../components/pagination/PaginatedView.svelte";
import { createAndStoreDefaultModel } from "../controller/model";
import { IClassSortMethods } from "../models/class";
import type { ObjectID } from "../models/objectId";
import { deleteClass } from "../repo/class";

const navigate = useNavigate();
const createNew = async () => {
    const model = await createAndStoreDefaultModel('class', { type: 'global' });
    navigate(`/class/${model.id}`);
};

let session = 1;
const onDelete = async (e: CustomEvent<{ id: ObjectID }>) => {
    await deleteClass(e.detail.id);
    // increment session to force a refresh
    session++;
};

</script>
    
<PaginatedView session={session} type="class" limit={10} scopes={[{ type: "global" }]} sortMethods={IClassSortMethods}
               creatable on:create={createNew} deletable on:delete={onDelete}/>
