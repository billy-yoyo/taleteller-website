<script lang="ts">
import { createEventDispatcher } from "svelte";
    import { ensureActionsInStore } from "../../controller/action";
    import { ensureActionModsInStore } from "../../controller/actionMod";
    import { ensureFeaturesInStore } from "../../controller/feature";
    import { ensureItemsInStore } from "../../controller/item";
import { ensureUpgradeSetsInStore } from "../../controller/upgradeSet";
import type { ObjectID } from "../../models/objectId";

import { Abilities, Skills } from "../../models/unit";

import { isUpgradeType, IUpgrade, UpgradeType, UpgradeTypeOptions } from "../../models/upgrade";
import { parse } from "../../rolling/rollparse";
import { spawnEditorIfNotExists } from "../../store/editors";
import * as idStore from "../../store/idStore";
import { createChangeCounter } from "../../util/changeCounter";
import { unique } from "../../util/funcHelpers";
import { apiToTitle } from "../../util/textHelpers";
import Field from "../common/Field.svelte";
import UpgradeSetCard from "../models/UpgradeSetCard.svelte";

export let upgradeId: ObjectID;
let upgrade: IUpgrade<UpgradeType>;

const dispatch = createEventDispatcher();
const countChange = createChangeCounter(dispatch);

const sub = idStore.subscribeManger('upgrade', upgradeId, (model) => {
    upgrade = model;
    countChange();
}, true);
$: sub(upgradeId);

$: deriver = idStore.deriver('upgrade', upgradeId, true);
$: fieldSync = (field: keyof IUpgrade<UpgradeType>, ...fields: string[]) => idStore.fieldSync('upgrade', upgradeId, [field, ...fields], true);

$: typeSync = fieldSync('type');
$: dataSync = idStore.fieldUpdater('upgrade', upgradeId, ['data'], true);
const setupTypeAndSync = async (e: CustomEvent<{ value: string }>) => {
    const type: UpgradeType = e.detail.value as UpgradeType;
    if (type === 'changeAbility') {
        if (!(upgrade.data as any).ability) {
            dataSync({ ability: 'agility', ...upgrade.data });
        }
    } else if (type === 'changeSkill') {
        if (!(upgrade.data as any).skill) {
            dataSync({ skill: 'arcana', ...upgrade.data });
        }
    } else if (type === 'selectActionToUpgrade') {
        if (!(upgrade.data as any).actionTags) {
            dataSync({ actionTags: [], ...upgrade.data });
        }
    } else if (type === 'selectActionsByTag') {
        if (!(upgrade.data as any).actionTags) {
            dataSync({ actionTags: [], ...upgrade.data });
        }
    } else if (type === 'selectFeaturesByTag') {
        if (!(upgrade.data as any).featureTags) {
            dataSync({ featureTags: [], ...upgrade.data });
        }
    } else if (type === 'selectUpgradeSetById') {
        if (!(upgrade.data as any).upgradeSets) {
            dataSync({ upgradeSets: [], ...upgrade.data });
        } 
    }
    typeSync(e);
};

const AbilityOptions = Abilities.map(ability => ({ value: ability, name: apiToTitle(ability) }));
const SkillOptions = Skills.map(skill => ({ value: skill, name: apiToTitle(skill) }));

const deleteUpgradeSet = (upgradeSetId: ObjectID) => {
    const data: IUpgrade<'selectUpgradeSetById'>['data'] = (upgrade as IUpgrade<'selectUpgradeSetById'>).data;
    dataSync({
        ...data,
        upgradeSets: data.upgradeSets.filter(id => upgradeSetId !== id)
    });
};

const upgradeSetEditorOpener = (upgradeSetId: ObjectID) => {
    return () => {
        spawnEditorIfNotExists({
            type: 'upgradeSet',
            modelId: upgradeSetId,
            onDelete: () => {
                deleteUpgradeSet(upgradeSetId);
            }
        });
    };
};

const addUpgradeSet = (e: CustomEvent<{ value: ObjectID }>) => {
    const data: IUpgrade<'selectUpgradeSetById'>['data'] = (upgrade as IUpgrade<'selectUpgradeSetById'>).data;
    dataSync({
        ...data,
        upgradeSets: unique([...data.upgradeSets, e.detail.value])
    });
};

let isValid: boolean = true;
$: diceFieldUpdater = idStore.fieldUpdater('upgrade', upgradeId, ['data', 'dice'], true);
$: originalDiceFieldSync = fieldSync('data', 'originalRoll');
const diceFieldSync = (event: CustomEvent<{ value: string }>) => {
    const rollString = event.detail.value;
    try {
        const roll = parse(rollString);
        isValid = true;
        diceFieldUpdater(roll);
        originalDiceFieldSync(event);
        dispatch('valid', true);
    } catch {
        isValid = false;
        dispatch('valid', false);
    }
};


</script>

<div class="upgrade-editor">
    <Field title="Type" type="select" derivation={deriver('type')} grow editable on:change={setupTypeAndSync} options={UpgradeTypeOptions}/>
    {#if isUpgradeType(upgrade, 'changeLevel')}
        <Field title="Amount" type="number" derivation={deriver('data', 'amount')} grow editable on:change={fieldSync('data', 'amount')}/>
    {:else if isUpgradeType(upgrade, 'changeAC')}
        <Field title="Amount" type="number" derivation={deriver('data', 'amount')} grow editable on:change={fieldSync('data', 'amount')}/>
    {:else if isUpgradeType(upgrade, 'changeHitmod')}
        <Field title="Amount" type="number" derivation={deriver('data', 'amount')} grow editable on:change={fieldSync('data', 'amount')}/>
    {:else if isUpgradeType(upgrade, 'changeMovespeed')}
        <Field title="Amount" type="number" derivation={deriver('data', 'amount')} grow editable on:change={fieldSync('data', 'amount')}/>
    {:else if isUpgradeType(upgrade, 'changeHp')}
        <Field title="Amount" type="number" derivation={deriver('data', 'amount')} grow editable on:change={fieldSync('data', 'amount')}/>
    {:else if isUpgradeType(upgrade, 'changeAbility')}
        <Field title="Ability" type="select" derivation={deriver('data', 'ability')} grow editable on:change={fieldSync('data', 'ability')} options={AbilityOptions}/>
        <Field title="Amount" type="number" derivation={deriver('data', 'amount')} grow editable on:change={fieldSync('data', 'amount')}/>
    {:else if isUpgradeType(upgrade, 'changeSkill')}
        <Field title="Skill" type="select" derivation={deriver('data', 'skill')} grow editable on:change={fieldSync('data', 'skill')} options={SkillOptions}/>
        <Field title="Amount" type="number" derivation={deriver('data', 'amount')} grow editable on:change={fieldSync('data', 'amount')}/>
        <Field title="Up to max" type="number" derivation={deriver('data', 'max')} grow editable nullable on:change={fieldSync('data', 'max')}/>
    {:else if isUpgradeType(upgrade, 'changeHitDice')}
        <Field title="Roll" type="string" derivation={deriver('data', 'dice')} grow editable on:change={diceFieldSync} max={70} error={!isValid} topmargin/>
    {:else if isUpgradeType(upgrade, 'changeResource')}
        <Field title="Resource Name" type="string" derivation={deriver('data', 'name')} grow editable on:change={fieldSync('data', 'name')} max={70}/>
        <Field title="Resource Short Name" type="string" derivation={deriver('data', 'shortName')} grow editable on:change={fieldSync('data', 'shortName')} max={70}/>
        <Field title="Amount" type="number" derivation={deriver('data', 'amount')} grow editable on:change={fieldSync('data', 'amount')}/>
    {:else if isUpgradeType(upgrade, 'addAction')}
        <Field title="Action" type="model" modelType="action" scope={upgrade.scope} derivation={deriver('data', 'actionId')} grow editable on:change={fieldSync('data', 'actionId')} topmargin/>
    {:else if isUpgradeType(upgrade, 'addFeature')}
        <Field title="Feature" type="model" modelType="feature" scope={upgrade.scope} derivation={deriver('data', 'featureId')} grow editable on:change={fieldSync('data', 'featureId')} topmargin/>
    {:else if isUpgradeType(upgrade, 'addItem')}
        <Field title="Item" type="model" modelType="item" scope={upgrade.scope} derivation={deriver('data', 'itemId')} grow editable on:change={fieldSync('data', 'itemId')} topmargin/>
    {:else if isUpgradeType(upgrade, 'addActionMod')}
        <Field title="Action Modifier" type="model" modelType="actionMod" scope={upgrade.scope} derivation={deriver('data', 'actionModId')} grow editable on:change={fieldSync('data', 'actionModId')} topmargin/>
    {:else if isUpgradeType(upgrade, 'changeSelectedAbility')}
        <Field title="Amount" type="number" derivation={deriver('data', 'amount')} grow editable on:change={fieldSync('data', 'amount')}/>
    {:else if isUpgradeType(upgrade, 'changeSelectedSkill')}
        <Field title="Amount" type="number" derivation={deriver('data', 'amount')} grow editable on:change={fieldSync('data', 'amount')}/>
        <Field title="Up to max" type="number" derivation={deriver('data', 'max')} grow editable nullable on:change={fieldSync('data', 'max')}/>
    {:else if isUpgradeType(upgrade, 'selectActionToUpgrade')}
        <Field title="Action Tags" type="array" derivation={deriver('data', 'actionTags')} grow editable on:change={fieldSync('data', 'actionTags')} titlecase max={70}/>
        <Field title="Action Modifier" type="model" modelType="actionMod" scope={upgrade.scope} derivation={deriver('data', 'actionModId')} grow editable on:change={fieldSync('data', 'actionModId')} topmargin/>
    {:else if isUpgradeType(upgrade, 'selectActionsByTag')}
        <Field title="Amount" type="number" derivation={deriver('data', 'amount')} grow editable on:change={fieldSync('data', 'amount')}/>
        <Field title="Action Tags" type="array" derivation={deriver('data', 'actionTags')} grow editable on:change={fieldSync('data', 'actionTags')} titlecase max={70}/>
    {:else if isUpgradeType(upgrade, 'selectFeaturesByTag')}
        <Field title="Amount" type="number" derivation={deriver('data', 'amount')} grow editable on:change={fieldSync('data', 'amount')}/>
        <Field title="Feature Tags" type="array" derivation={deriver('data', 'featureTags')} grow editable on:change={fieldSync('data', 'featureTags')} titlecase max={70}/>
    {:else if isUpgradeType(upgrade, 'selectUpgradeSetById')}
        <div class="upgrade-sets">
            {#each upgrade.data.upgradeSets as upgradeSetId}
                <UpgradeSetCard upgradeSetId={upgradeSetId} on:click={upgradeSetEditorOpener(upgradeSetId)}/>
            {/each}
            <Field title="Add Upgrade Set" type="model" modelType="upgradeSet" scope={upgrade.scope} grow editable on:change={addUpgradeSet} topmargin></Field> 
        </div>
    {/if}
</div>

<style>
    .upgrade-sets {
        display: flex;
        flex-direction: column;
    }
</style>