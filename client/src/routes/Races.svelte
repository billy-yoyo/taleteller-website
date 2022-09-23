<script lang="ts">
import { useNavigate } from "svelte-navigator";
import PaginatedView from "../components/pagination/PaginatedView.svelte";
import { createAndStoreDefaultModel } from "../controller/model";
import { IFeatureSortMethods } from "../models/feature";
import type { ObjectID } from "../models/objectId";
import { deleteUpgradeSet } from "../repo/upgradeSet";

const raceFilters = {
    tags: ["race"]
};

const navigate = useNavigate();
const createNew = async () => {
    const model = await createAndStoreDefaultModel('upgradeSet', { type: 'global' }, { tags: ['race'] });
    navigate(`/upgradeSet/${model.id}`);
};

let session = 1;
const onDelete = async (e: CustomEvent<{ id: ObjectID }>) => {
    await deleteUpgradeSet(e.detail.id);
    // increment session to force a refresh
    session++;
};

</script>
    
<PaginatedView session={session} type="upgradeSet" limit={10} scopes={[{ type: "global" }]} sortMethods={IFeatureSortMethods}
               baseFilters={raceFilters} creatable on:create={createNew} deletable on:delete={onDelete}/>
