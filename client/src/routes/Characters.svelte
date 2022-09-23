<script lang="ts">
import { useNavigate } from "svelte-navigator";

import PaginatedView from "../components/pagination/PaginatedView.svelte";
import { createAndStoreDefaultModel } from "../controller/model";
import type { ObjectID } from "../models/objectId";
import type { IUser } from "../models/user";
import { deleteCharacter } from "../repo/character";
import * as me from "../store/me";

let user: IUser;
me.user.subscribe(model => { user = model; });

const sortMethods: { name: string, value: string }[] = [
    { name: "Name (Desc)", value: "-name" },
    { name: "Name (Asc)", value: "+name" },
];

const navigate = useNavigate();
const createNew = async () => {
    const character = await createAndStoreDefaultModel('character');
	navigate(`/charactermancer/${character.id}/`);
};

let session = 1;
const onDelete = async (e: CustomEvent<{ id: ObjectID }>) => {
    await deleteCharacter(e.detail.id);
    // increment session to force a refresh
    session++;
};

</script>

<PaginatedView session={session} type="character" limit={10} scopes={[{ type: "user", link: user.id }]} sortMethods={sortMethods} creatable on:create={createNew} deletable on:delete={onDelete}/>
