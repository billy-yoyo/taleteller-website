<script lang="ts">
import type { IActionMod } from "../../models/actionMod";

import type { ObjectID } from "../../models/objectId";

import { isUpgradeType, IUpgrade, UpgradeType } from "../../models/upgrade";
import { buildRollStringFromValue } from "../../rolling/roller";
import { buildRollString } from "../../rolling/rollrepr";
import * as idStore from "../../store/idStore";
import { apiToTitle, titleCase } from "../../util/textHelpers";

export let upgradeId: ObjectID;
let upgrade: IUpgrade<UpgradeType>;
let unsub: () => void;
let submodel;

const sub = idStore.subscribeManger('upgrade', upgradeId, (model) => {
    upgrade = model;
    if (unsub) {
        unsub();
        unsub = undefined;
    }
    if (isUpgradeType(upgrade, 'addAction')) {
        unsub = idStore.subscribe('action', upgrade.data.actionId, (m) => { submodel = m; });
    } else if (isUpgradeType(upgrade, 'addFeature')) {
        unsub = idStore.subscribe('feature', upgrade.data.featureId, (m) => { submodel = m; });
    } else if (isUpgradeType(upgrade, 'addItem')) {
        unsub = idStore.subscribe('item', upgrade.data.itemId, (m) => { submodel = m; });
    } else if (isUpgradeType(upgrade, 'addActionMod')) {
        unsub = idStore.subscribe('actionMod', upgrade.data.actionModId, (m) => { submodel = m; });
    } else if (isUpgradeType(upgrade, 'selectActionToUpgrade')) {
        unsub = idStore.subscribe('actionMod', upgrade.data.actionModId, (m) => { submodel = m; });
    }
});
$: sub(upgradeId);

const changeText = (amount: number, name: string) => {
    return `${amount < 0 ? 'Decrease' : 'Increase'} ${name} by ${amount}`;
}

const actionModText = (header: string,mod: IActionMod) => {
    const start = `Change ${header} by: `;
    const changes = [];
    mod.costModifiers.forEach(cost => {
        const costText = cost.variable ? `${cost.amount}x` : cost.amount;
        if (cost.makeFree) {
            changes.push(`changing the ${cost.resourceShortName} cost to 0`)
        } else {
            changes.push(`changing the ${cost.resourceShortName} cost by ${costText}`);
        }
    });
    if (mod.critModifier) {
        changes.push(`changing the crit range by ${mod.critModifier}`);
    }
    if (mod.damageModifier) {
        changes.push(`changing the damage modifier by ${mod.damageModifierOriginalRoll}`);
    }
    if (mod.hitModifier) {
        changes.push(`changing the hit modifier by ${mod.hitModifierOriginalRoll}`);
    }
    return `${start}${changes.join('; ')}`
}

</script>

<div class="upgrade">
    {#if isUpgradeType(upgrade, 'changeLevel')}
        {changeText(upgrade.data.amount, 'level')}
    {:else if isUpgradeType(upgrade, 'changeAbility')}
        {changeText(upgrade.data.amount, apiToTitle(upgrade.data.ability))}
    {:else if isUpgradeType(upgrade, 'changeSkill')}
        {changeText(upgrade.data.amount, apiToTitle(upgrade.data.skill)) + (upgrade.data.max !== undefined ? ` up to a max of ${upgrade.data.max}` : '')}
    {:else if isUpgradeType(upgrade, 'changeHp')}
        {changeText(upgrade.data.amount, 'max health')}
    {:else if isUpgradeType(upgrade, 'changeResource')}
        {changeText(upgrade.data.amount, `resource ${upgrade.data.name} (${upgrade.data.shortName})`)}
    {:else if isUpgradeType(upgrade, 'changeAC')}
        {changeText(upgrade.data.amount, 'armour class')}
    {:else if isUpgradeType(upgrade, 'changeHitmod')}
        {changeText(upgrade.data.amount, 'hit mod')}
    {:else if isUpgradeType(upgrade, 'changeMovespeed')}
        {changeText(upgrade.data.amount, 'movespeed')}
    {:else if isUpgradeType(upgrade, 'changeHitDice')}
        {`Change hit dice to ${buildRollStringFromValue(upgrade.data.dice)}`}
    {:else if isUpgradeType(upgrade, 'addAction')}
        {`Add action ${submodel.name}`}
    {:else if isUpgradeType(upgrade, 'addFeature')}
        {`Add feature ${submodel.name}`}
    {:else if isUpgradeType(upgrade, 'addItem')}
        {`Add item ${submodel.name}`}
    {:else if isUpgradeType(upgrade, 'addActionMod')}
        {actionModText(`actions with tags [${submodel.targetTags.map(titleCase).join(', ')}]`, submodel)}
    {:else if isUpgradeType(upgrade, 'changeSelectedAbility')}
        {changeText(upgrade.data.amount, 'Selected Ability')}
    {:else if isUpgradeType(upgrade, 'changeSelectedSkill')}
        {changeText(upgrade.data.amount, 'Selected Skill') + (upgrade.data.max !== undefined ? ` up to a max of ${upgrade.data.max}` : '')}
    {:else if isUpgradeType(upgrade, 'selectUpgradeSetById')}
        {`Select upgrade from a list of subupgrades`}
    {:else if isUpgradeType(upgrade, 'selectFeaturesByTag')}
        {`Select ${upgrade.data.amount} features with tags [${upgrade.data.featureTags.map(titleCase).join(', ')}]`}
    {:else if isUpgradeType(upgrade, 'selectActionToUpgrade')}
        {actionModText(`a selected action`, submodel)}
    {:else if isUpgradeType(upgrade, 'selectActionsByTag')}
        {`Select ${upgrade.data.amount} actions with tags [${upgrade.data.actionTags.map(titleCase).join(', ')}]`}
    {/if}
</div>
