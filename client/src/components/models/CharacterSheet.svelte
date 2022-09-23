<script lang="ts">
import type { ICharacter } from "../../models/character";
import { Abilities, Skills, UnitID } from "../../models/unit";
import { apiToTitle } from "../../util/textHelpers";
import TabView from "../tab/TabView.svelte";
import Tab from "../tab/Tab.svelte";
import TabList from "../tab/TabList.svelte";
import Tabs from "../tab/Tabs.svelte";
import Field from "../common/Field.svelte";
import Action from "./ActionCard.svelte";
import Feature from "./FeatureCard.svelte";
import Item from "./ItemRow.svelte";
import * as idStore from "../../store/idStore";
import Resource from "./Resource.svelte";
import { sum, unique } from "../../util/funcHelpers";
import { getRollForAbility } from "../../rolling/roller";
import Skill from "./Skill.svelte";
import type { ObjectID } from "../../models/objectId";
import { link } from "svelte-navigator";
import { spawnCreater } from "../../store/editors";
import { createAndStoreCopy } from "../../controller/model";
import { spawnYesNoDialogAndWaitForAnswer } from "../../store/dialogs";

export let characterId: ObjectID;
let character: ICharacter;
let itemTotals: { weight: number, equipLoad: number } = { weight: 0, equipLoad: 0 };
let classNames: string;
let unsubItemTotals: () => void;
let unsubClassNames: () => void;
let maxEquipLoad: number;

const sub = idStore.subscribeManger('character', characterId, (char) => {
    character = char;
    maxEquipLoad = character.equipLoadMod + Math.max(0, character.abilities.might * 2);

    if (unsubItemTotals) {
        unsubItemTotals();
    }
    unsubItemTotals = idStore.deriveIdSet('item', character.items, (items) => {
        return {
            weight: sum(items, i => i.weight),
            equipLoad: sum(items.filter(i => i.equipped), i => i.equipLoad)
        };
    }).subscribe((model) => {
        itemTotals = model;
    });

    if (unsubClassNames) {
        unsubClassNames();
    }
    unsubClassNames = idStore.deriveIdSet('class', character.classes, (classes) => {
        return classes.map(cls => cls.name).join(', ');
    }).subscribe((model) => {
        classNames = model;
    });
});
$: sub(characterId);

$: deriver = idStore.deriver('character', characterId);
$: fieldSync = (field: keyof ICharacter, ...fields: string[]) => idStore.fieldSync('character', characterId, [field, ...fields]);

const unitId: UnitID = {
    type: 'character',
    id: characterId
};

let actionTagFilters: string[] = [];
let actionNameFilter: string = "";
const updateActionTagFilters = (e: CustomEvent<{ value: string[] }>) => {
    actionTagFilters = unique(e.detail.value).map(x => x.toLowerCase());
};
const updateActionNameFilter = (e: CustomEvent<{ value: string }>) => {
    actionNameFilter = e.detail.value;
};

let itemNameFilter: string = "";
const updateItemNameFilter = (e: CustomEvent<{ value: string }>) => {
    itemNameFilter = e.detail.value;
};

let featureNameFilter: string = "";
const updateFeatureNameFilter = (e: CustomEvent<{ value: string }>) => {
    featureNameFilter = e.detail.value;
};

$: actionsFieldSync = idStore.fieldManualSync('character', characterId, ['actions']);
const addAction = () => {
    spawnCreater({
        type: 'action',
        scope: { type: 'character', link: character.id },
        searchScopes: [{ type: 'global' }],
        onSelect: async (selected) => {
            const action = idStore.getModel('action', selected);
            let actionId = action.id;

            if (action.scope.type !== 'character' || action.scope.link !== character.id) {
                const actionCopy = await createAndStoreCopy('action', action, {}, { type: 'character', link: character.id });
                actionId = actionCopy.id;
            }

            actionsFieldSync([...character.actions, actionId]);

            return actionId;
        },
        onDelete: (modelId) => actionsFieldSync(character.actions.filter(aid => aid !== modelId))
    });
};

const deleteAction = async (e: CustomEvent<{ modelId: string, name: string }>) => {
    const deleteConfirmed = await spawnYesNoDialogAndWaitForAnswer(
        `Delete Action from Character?`,
        `Are you sure you want to remove the Action '${e.detail.name}' from character '${character.name}'?`
    );
    if (deleteConfirmed) {
        actionsFieldSync(character.actions.filter(aid => aid !== e.detail.modelId));
    }
};

$: itemsFieldSync = idStore.fieldManualSync('character', characterId, ['items']);
const addItem = () => {
    spawnCreater({
        type: 'item',
        scope: { type: 'character', link: character.id },
        searchScopes: [{ type: 'global' }],
        onSelect: async (selected) => {
            const item = idStore.getModel('item', selected);
            let itemId = item.id;

            if (item.scope.type !== 'character' || item.scope.link !== character.id) {
                const itemCopy = await createAndStoreCopy('item', item, {}, { type: 'character', link: character.id });
                itemId = itemCopy.id;
            }

            itemsFieldSync([...character.items, itemId]);

            return itemId;
        },
        onDelete: (modelId) => itemsFieldSync(character.items.filter(iid => iid !== modelId))
    });
};

const deleteItem = async (e: CustomEvent<{ modelId: string, name: string }>) => {
    const deleteConfirmed = await spawnYesNoDialogAndWaitForAnswer(
        `Delete Item from Character?`,
        `Are you sure you want to remove the Item '${e.detail.name}' from character '${character.name}'?`
    );
    if (deleteConfirmed) {
        itemsFieldSync(character.items.filter(iid => iid !== e.detail.modelId));
    }
};

$: featuresFieldSync = idStore.fieldManualSync('character', characterId, ['features']);
const addFeature = () => {
    spawnCreater({
        type: 'feature',
        scope: { type: 'character', link: character.id },
        searchScopes: [{ type: 'global' }],
        onSelect: async (selected) => {
            const feature = idStore.getModel('feature', selected);
            let featureId = feature.id;

            if (feature.scope.type !== 'character' || feature.scope.link !== character.id) {
                const featureCopy = await createAndStoreCopy('feature', feature, {}, { type: 'character', link: character.id });
                featureId = featureCopy.id;
            }

            featuresFieldSync([...character.features, featureId]);

            return featureId;
        },
        onDelete: (modelId) => featuresFieldSync(character.features.filter(fid => fid !== modelId))
    });
};

const deleteFeature = async (e: CustomEvent<{ modelId: string, name: string }>) => {
    const deleteConfirmed = await spawnYesNoDialogAndWaitForAnswer(
        `Delete Feature from Character?`,
        `Are you sure you want to remove the Feature '${e.detail.name}' from character '${character.name}'?`
    );
    if (deleteConfirmed) {
        featuresFieldSync(character.features.filter(fid => fid !== e.detail.modelId));
    }
};

</script>

<article>
    <section>
        <div class="flex-column">
            <Field title="Name" derivation={deriver('name')} grow editable on:change={fieldSync('name')} max={70}/>
            <div class="grow row">
                <Field title="Level" centered derivation={deriver('level')}  />
                <Field title="Race" derivation={deriver('race')}  grow />
                <a href={`/charactermancer/${characterId}`} class="mancer" use:link>Level Up</a>
            </div>
        </div>
        <div class="row">
            <Field title="Classes" fixedValue={classNames} grow />
        </div>
    </section>
    <section>
        <div class="flex-column">
            <div class="row grow">
                {#each Abilities as ability}
                    <Field title={apiToTitle(ability)} derivation={deriver('abilities', ability)} type="number" centered grow big editable on:change={fieldSync('abilities', ability)}
                        roll={getRollForAbility(ability)} rollCategory="check" rollTitle={`${apiToTitle(ability)} Check`} roller={unitId}/>
                {/each}
            </div>

            <div class="row grow">
                <div class="box grow">
                    <div class="row">
                        <Field title="Current" derivation={deriver('health')} secondDerivation={deriver('maxHealth')} hideSecond secondIsMax
                            type="number" editable grow centered nomargin on:change={fieldSync('health')}/>
                        <div class="bigtext mhorz">/</div>
                        <Field title="Maximum" derivation={deriver('maxHealth')} type="number" grow centered nomargin editable on:change={fieldSync('maxHealth')}/>
                        <div class="bigtext mhorz">{"("}</div>
                        <Field title="Shield" derivation={deriver('tempHealth')} type="number" min={0} editable grow centered nomargin
                            on:change={fieldSync('tempHealth')}/>
                        <div class="bigtext mleft">{")"}</div>
                    </div>
                </div>
                <div class="row grow">
                    <div class="box grow">
                        <Field title="Armour" derivation={deriver('armourClass')} type="number" grow centered nomargin editable on:change={fieldSync('armourClass')}/>
                    </div>
                    <div class="box grow">
                        <Field title="Speed" derivation={deriver('speed')} type="number" grow centered nomargin editable on:change={fieldSync('speed')}/>
                    </div>
                    <div class="box grow">
                        <Field title="Hit Mod" derivation={deriver('hitMod')} type="number" grow centered nomargin editable on:change={fieldSync('hitMod')}/>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <section>
        <div class="row fullwidth mainview">
            <div class="column v-spaced box">
                {#each Skills as skill}
                    <Skill unitId={unitId} skill={skill} />
                {/each}
            </div>
            <div class="column fullheight grow mleft">
                <div class="row fullwidth mbot justify-start">
                    {#each character.resources as resourceId}
                        <Resource resourceId={resourceId}/>
                    {/each}
                </div>
                <div class="row fullwidth zeroheight grow">
                    <Tabs>
                        <TabList>
                            <Tab>Actions</Tab>
                            <Tab>Inventory</Tab>
                            <Tab>Features</Tab>
                        </TabList>

                        <TabView>
                            <Field title="Name Filter" type="string" fixedValue={actionNameFilter} grow on:change={updateActionNameFilter} editable max={70} topmargin />
                            <Field title="Tag Filter" type="array" fixedValue={actionTagFilters} grow on:change={updateActionTagFilters} editable titlecase topmargin/>
                            {#each character.actions as actionId}
                                <Action actionId={actionId} ownerId={unitId} tagFilters={actionTagFilters} nameFilter={actionNameFilter} deletable on:delete={deleteAction}/>
                            {/each}
                            <button class="add-button" on:click={addAction}>Add Action</button>
                        </TabView>

                        <TabView>
                            <div class="inventory-header row">
                                <div class="money row">
                                    <Field title="Money" derivation={deriver('money')} type="number" centered editable on:change={fieldSync('money')}/>
                                </div>
                                <Field title="Name Filter" fixedValue={itemNameFilter} grow on:change={updateItemNameFilter} editable max={70}/>
                                <div class="totals row">
                                    <Field title="weight" fixedValue={itemTotals.weight} type="number" centered/>
                                    <Field title="load" fixedValue={itemTotals.equipLoad} secondFixedValue={maxEquipLoad} type="number" centered/>
                                </div>
                            </div>

                            {#each character.items as itemId}
                                <Item itemId={itemId} nameFilter={itemNameFilter} deletable on:delete={deleteItem}/>
                            {/each}
                            <button class="add-button" on:click={addItem}>Add Item</button>
                        </TabView>

                        <TabView>
                            <Field title="Name Filter" fixedValue={featureNameFilter} grow on:change={updateFeatureNameFilter} editable max={70}/>
                            {#each character.features as featureId}
                                <Feature featureId={featureId} nameFilter={featureNameFilter} deletable on:delete={deleteFeature}/>
                            {/each}
                            <button class="add-button" on:click={addFeature}>Add Feature</button>
                        </TabView>
                    </Tabs>
                </div>
            </div>
        </div>
    </section>

</article>

<style>
    article {
        padding: 10px;
    }

    section {
        margin-bottom: 30px;
    }

    .row {
        display: flex;
        flex-direction: row;
    }

    .column {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .box {
        box-sizing: border-box;
        border-style: solid;
        border-width: 1px;
        border-color: #efefef;
        border-radius: 5px;
        padding: 12px 12px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 10px;
    }

    .flex-column {
        display: flex;
        flex-direction: row;
        align-items: baseline;
    }

    @media only screen and (max-width: 1080px) {
        .flex-column {
            width: 100%;
            flex-direction: column;
        }

        .flex-column > :global(*) {
            width: 100%;
            flex: 1;
            margin-top: 10px;
        }
    }

    .grow {
        flex: 1;
    }

    .bigtext {
        height: 100%;
        vertical-align: middle;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 1.75rem;
    }

    .mleft {
        margin-left: 10px;
    }

    .mhorz {
        margin-left: 10px;
        margin-right: 10px;
    }

    .mbot {
        margin-bottom: 10px;
    }

    .v-spaced {
        padding: 13px 15px;
    }

    .v-spaced > :global(*) {
        margin-bottom: 10px;
    }

    .v-spaced > :global(:last-child) {
        margin-bottom: 0;
    }

    .fullwidth {
        width: 100%;
    }

    .fullheight {
        height: 100%;
    }

    .zeroheight {
        height: 0;
    }

    .justify-start {
        justify-content: start;
    }

    .mainview {
        height: 648px;
    }

    .inventory-header {
        padding-bottom: 5px;
        margin-bottom: 10px;
        border-bottom-style: solid;
        border-width: 2px;
        border-color: #2f2f2f;
    }

    .mancer {
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
        margin-right: 5px;
        align-items: center;
        vertical-align: middle;
    }

    .add-button {
        cursor: pointer;
        display: flex;
        flex-direction: row;
        border: 1px solid #bfbfbf;
        border-radius: 5px;
        padding: 3px 7px;
        margin: 0;
        margin-top: 8px;
        font-size: 0.75rem;
        background-color: #090916;
        color: #cfcfcf;
        margin-right: 5px;
    }
</style>