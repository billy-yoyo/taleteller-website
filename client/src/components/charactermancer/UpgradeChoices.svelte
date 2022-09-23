<script lang="ts">
import { createEventDispatcher } from "svelte";

import { get, writable } from "svelte/store";
import { IActionSortMethods } from "../../models/action";
import { IFeatureSortMethods } from "../../models/feature";

import type { ObjectID } from "../../models/objectId";
import type { IScope } from "../../models/scope";
import { Abilities, Skills } from "../../models/unit";
import { isUpgradeType, IUpgrade, UpgradeType } from "../../models/upgrade";
import { IUpgradeSetSortMethods } from "../../models/upgradeSet";
import * as idStore from "../../store/idStore";
import { apiToTitle } from "../../util/textHelpers";
import Field from "../common/Field.svelte";
import PaginatedView from "../pagination/PaginatedView.svelte";
import PointBuySelection from "./PointBuySelection.svelte";

export let upgradeId: ObjectID;
export let characterId: ObjectID;
export let scopes: IScope[];

const dispatch = createEventDispatcher();

const getRequiredChoices = (upgrade: IUpgrade<UpgradeType>): string[] => {
    if (isUpgradeType(upgrade, 'changeSelectedAbility')) {
        return ['chosenAbility'];
    } else if (isUpgradeType(upgrade, 'changeSelectedSkill')) {
        return ['chosenSkill'];
    } else if (isUpgradeType(upgrade, 'selectActionToUpgrade')) {
        return ['chosenAction'];
    } else if (isUpgradeType(upgrade, 'selectActionsByTag')) {
        return ['chosenActions'];
    } else if (isUpgradeType(upgrade, 'selectFeaturesByTag')) {
        return ['chosenFeatures'];
    } else if (isUpgradeType(upgrade, 'selectUpgradeSetById')) {
        return ['chosenUpgradeSets'];
    } else {
        setTimeout(() => dispatch('done', { id: upgradeId, done: true }), 0);
        return [];
    }
};

const getMaxSelections = (upgrade: IUpgrade<UpgradeType>): number => {
    if (isUpgradeType(upgrade, 'selectActionsByTag')) {
        return upgrade.data.amount
    } else if (isUpgradeType(upgrade, 'selectFeaturesByTag')) {
        return upgrade.data.amount;
    } else if (isUpgradeType(upgrade, 'selectUpgradeSetById')) {
        return upgrade.data.amount;
    } else {
        return 0;
    }
};

let upgrade: IUpgrade<UpgradeType>;
let requiredChoices;
let maxSelections;
const sub = idStore.subscribeManger('upgrade', upgradeId, (model) => {
    upgrade = model;
    requiredChoices = getRequiredChoices(upgrade);
    maxSelections = getMaxSelections(upgrade);
});
$: sub(upgradeId);

const choices = writable<any>({});

const AbilityOptions = Abilities.map(ability => ({ value: ability, name: apiToTitle(ability) }));
const SkillOptions = Skills.map(skill => ({ value: skill, name: apiToTitle(skill) }));

const choiceUpdater = (key: string) => {
    return (e: CustomEvent<{ value: any }>) => {
        choices.update(data => ({ ...data, [key]: e.detail.value }));
        dispatch('select', { id: upgradeId, choices: get(choices) });

        if (requiredChoices.every(required => get(choices)[required] !== undefined)) {
            dispatch('done', { id: upgradeId, done: true });
        }
    };
};

const choiceSelector = (key: string) => {
    return (e: CustomEvent<{ id: any }>) => {
        choices.update(data => ({ ...data, [key]: e.detail.id }));
        dispatch('select', { id: upgradeId, choices: get(choices) });

        if (requiredChoices.every(required => get(choices)[required] !== undefined)) {
            dispatch('done', { id: upgradeId, done: true });
        }
    };
};

const onSelect = (key: string) => {
    return (e: CustomEvent<{ selected: ObjectID[] }>) => {
        choices.update(data => ({ ...data, [key]: e.detail.selected }));
        dispatch('select', { id: upgradeId, choices: get(choices) });

        if (requiredChoices.every(required => get(choices)[required] !== undefined)) {
            dispatch('done', { id: upgradeId, done: true });
        }
    }
}
</script>

<div class="choices">
    {#if isUpgradeType(upgrade, 'changeSelectedAbility')}
        <Field title={`Select Ability To Change By ${upgrade.data.amount}`} type="select" fixedValue={$choices.chosenAbility} grow editable on:change={choiceUpdater('chosenAbility')} options={AbilityOptions}/>
    {:else if isUpgradeType(upgrade, 'changeSelectedSkill')}
        <Field title={`Select Skill To Change By ${upgrade.data.amount}`} type="select" fixedValue={$choices.chosenSkill} grow editable on:change={choiceUpdater('chosenSkill')} options={SkillOptions}/>
    {:else if isUpgradeType(upgrade, 'selectActionToUpgrade')}
        <PaginatedView type="action" limit={10} scopes={[{ type: 'character', link: characterId }]} baseFilters={{ tags: upgrade.data.actionTags }}
                       sortMethods={IActionSortMethods} selected={[$choices.chosenAction]} customclick on:click={choiceSelector('chosenAction')} />
    {:else if isUpgradeType(upgrade, 'selectActionsByTag')}
        <PointBuySelection type="action" scopes={scopes} maxPoints={maxSelections} baseFilters={{ tags: upgrade.data.actionTags }} sortMethods={IActionSortMethods} on:select={onSelect('chosenActions')} />
    {:else if isUpgradeType(upgrade, 'selectFeaturesByTag')}
        <PointBuySelection type="feature" scopes={scopes} maxPoints={maxSelections} baseFilters={{ tags: upgrade.data.featureTags }} sortMethods={IFeatureSortMethods} on:select={onSelect('chosenFeatures')} />
    {:else if isUpgradeType(upgrade, 'selectUpgradeSetById')}
        <PointBuySelection type="upgradeSet" scopes={scopes} maxPoints={maxSelections} sortMethods={IUpgradeSetSortMethods} on:select={onSelect('chosenUpgradeSets')} />
    {/if}
</div>
