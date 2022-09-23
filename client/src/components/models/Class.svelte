<script lang="ts">
import { useNavigate } from "svelte-navigator";

import { createAndStoreDefaultModel } from "../../controller/model";
import type { IClass } from "../../models/class";
import type { ObjectID } from "../../models/objectId";
import { checkWriteAccess } from "../../repo/util";
import * as idStore from "../../store/idStore";
import Editor from "../editors/Editor.svelte";
import Condition from "./Condition.svelte";
import UpgradeSet from "./UpgradeSet.svelte";
import UpgradeSetCard from "./UpgradeSetCard.svelte";

export let classId: ObjectID;
export let editing: boolean = false;

let editable: boolean = false;
let _class: IClass;
let selectionId: ObjectID = undefined;

const sub = idStore.subscribeManger('class', classId, (model) => {
    _class = model;
}, editing);
$: sub(classId, editing);

// Deliberately only check this once, require a hard reload. We don't expect scope or user permissions to change frequently.
checkWriteAccess(_class.scope).then(hasAccess => { editable = hasAccess });

$: levelsFieldSync = idStore.fieldManualSync('class', classId, ['levels'], true);
const deleteSelectedUpgradeSet = () => {
    const newLevels = _class.levels.map(upgrades => {
        const newUpgrades = upgrades.filter(uid => uid !== selectionId);
        if (newUpgrades.length === 0) {
            // cannot delete the upgrade!
            return [selectionId];
        } else {
            return newUpgrades;
        }
    });

    selectionId = undefined;
    levelsFieldSync(newLevels);
};

const addUpgradeSetToLevel = async (i: number) => {
    const newLevels = _class.levels.slice();
    const newUpgradeSet = await createAndStoreDefaultModel('upgradeSet', _class.scope);
    newLevels[i] = [...newLevels[i], newUpgradeSet.id];
    levelsFieldSync(newLevels);
};

const navigate = useNavigate();

const toggleEdit = () => {
    if (editing) {
        // for classes the default behaviour is to save
        idStore.finishEditing('class', classId);
        navigate(`/class/${classId}`);
    } else {
        navigate(`/class/${classId}/edit`);
    }
};

const selectClass = () => {
    selectionId = undefined;
};

const selectUpgradeSet = (id: ObjectID) => {
    selectionId = id;
};

</script>

<div class="columns">
    <div class="column card">
        <div class="card-header">
            <div class="card-title" on:click={selectClass}>{_class.name}</div>
            {#if editable}
                <button class="toggle-edit" on:click={toggleEdit}>
                    {editing ? 'Stop Editing' : 'Start Editing'}
                </button>
            {/if}
        </div>
        <div class="levels">
            {#each Array(5) as _, i}
                <div class="level">
                    {#each _class.levels[i] as upgradeSetId}
                        <UpgradeSetCard upgradeSetId={upgradeSetId}
                                        selected={selectionId === upgradeSetId}
                                        on:click={() => selectUpgradeSet(upgradeSetId)}/>
                    {/each}
                    {#if editing}
                        <button class="add-upgrade" on:click={() => addUpgradeSetToLevel(i)}>Add Option</button>
                    {/if}
                </div>
            {/each}
        </div>
    </div>
    <div class="column">
        {#if selectionId === undefined && editing && editable}
            <Editor type="class" modelId={classId}/>
        {:else if selectionId === undefined}
            <div class="class-panel">
                <div class="class-title">
                    {`${_class.name} (Tier ${_class.tier})`}
                </div>
                <div class="class-description">
                    {_class.description}
                </div>
                <div class="requirements">
                    <div class="req-title">Requirements:</div>
                    <div class="req">
                        <Condition conditionId={_class.prerequisite}/>
                    </div>
                </div>
            </div>
        {:else if selectionId !== undefined && editing && editable}
            <Editor type="upgradeSet" modelId={selectionId} deletable on:delete={deleteSelectedUpgradeSet}/>
        {:else if selectionId !== undefined}
            <UpgradeSet upgradeSetId={selectionId}/>
        {/if}
    </div>
</div>

<style>
    .columns {
        display: flex;
        flex-direction: row;
    }

    .column {
        display: flex;
        flex-direction: column;
        flex: 1;
        padding: 10px;
        margin: 15px;
        background-color: #14141a;
    }

    .card {
        border: 1px solid #7f7f7f;
        border-radius: 15px;
        align-items: center;
    }

    .card-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-bottom: 15px;
        width: 100%;
    }

    .card-title {
        font-size: 1.5rem;
        font-weight: bold;
        cursor: pointer;
    }

    .card-title:hover {
        text-decoration: underline;
    }

    button {
        cursor: pointer;
        display: flex;
        flex-direction: row;
        border: 1px solid #bfbfbf;
        border-radius: 5px;
        padding: 3px 7px;
        margin: 0;
        font-size: 0.75rem;
        background-color: #090916;
        color: #cfcfcf;
    }

    .levels {
        width: 100%;
        display: flex;
        flex-direction: column;
    }

    .level {
        display: flex;
        flex-direction: row;
        flex: 1;
        margin-bottom: 5px;
        margin-top: 5px;
    }

    .class-panel {
        padding: 10px;
        display: flex;
        flex-direction: column;
    }

    .class-title {
        font-size: 1.5rem;
        font-weight: bold;
        width: 100%;
        padding-left: 5px;
        padding-bottom: 5px;
        border-bottom: 2px solid #4f4f4f;
    }

    .class-description {
        margin-top: 5px;
        padding: 5px;
    }

    .requirements {
        display: flex;
        flex-direction: column;
        padding: 5px;
    }

    .req-title {
        font-weight: bold;
    }

    .req {
        padding-left: 10px;
        display: flex;
        flex-direction: row;
    }
</style>