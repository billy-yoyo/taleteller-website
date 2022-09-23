<script lang="ts">
import { useNavigate } from "svelte-navigator";
import { get, writable } from "svelte/store";
import { ensureClassesInStore } from "../../controller/class";
import { createAndStoreCopy } from "../../controller/model";
import { createAndStoreUpgrade } from "../../controller/upgrade";
import { createAndStoreUpgradeSet, ensureUpgradeSetsInStore } from "../../controller/upgradeSet";
import { applyUpgradeSet } from "../../lib/upgrade";
import type { ICharacter } from "../../models/character";
import { IClassSortMethods } from "../../models/class";
import type { ObjectID } from "../../models/objectId";
import type { IScope } from "../../models/scope";
import { Abilities, Ability } from "../../models/unit";
import { isUpgradeType } from "../../models/upgrade";
import { IUpgradeSet, IUpgradeSetSortMethods } from "../../models/upgradeSet";
import { evaluate } from "../../rolling/roller";
import * as idStore from "../../store/idStore";
import { apiToTitle } from "../../util/textHelpers";
import Field from "../common/Field.svelte";
import PaginatedView from "../pagination/PaginatedView.svelte";
import Screen from "../screens/Screen.svelte";
import Screens from "../screens/Screens.svelte";
import PointBuySelection from "./PointBuySelection.svelte";
import UpgradeSelection from "./UpgradeSelection.svelte";
import UpgradeSetChoices from "./UpgradeSetChoices.svelte";

export let characterId: ObjectID;
let character: ICharacter;
let finishing = writable<boolean>(false);

const sub = idStore.subscribeManger('character', characterId, (char) => {
    character = char;
});
$: sub(characterId);

const navigate = useNavigate();

const name = writable<string>(character.name);
const hp = writable<number>(0);
const rerolls = writable<number>(2);

const abilityArray = writable<{[ability in Ability]: number}>(Object.fromEntries(Abilities.map(a => [a, 0])) as {[ability in Ability]: number});
const race = writable<ObjectID>();
const raceChoices = writable<{[id: ObjectID]: any}>({});
const raceChoicesFinished = writable<boolean>(false);
const background = writable<ObjectID[]>();
const backgroundChoices = writable<{[id: ObjectID]: any}>({});
const backgroundChoicesFinished = writable<{[id: ObjectID]: boolean}>({});
const _class = writable<ObjectID>();
const upgradeSet = writable<ObjectID>();
const upgradeChoices = writable<{[id: ObjectID]: any}>({});
const upgradeChoicesFinished = writable<boolean>(false);

const scopes: IScope[] = [{ type: "global" }];
const raceFilters = {
    tags: ["race"]
};
const backgroundFilters = {
    tags: ["background"]
};
const classFilters = {
    tiers: character.level < 5 ? [1] : (character.level < 10 ? [1, 2] : [1, 2, 3]),
    characterId
};

const abilityChanger = (ability: Ability) => {
    return (e: CustomEvent<{ value: string }>) => {
        abilityArray.update(arr => ({ ...arr, [ability]: e.detail.value }));
    };
};

const onNameChange = (e: CustomEvent<{ value: string }>) => {
    name.set(e.detail.value);
};

const onHPChange = (e: CustomEvent<{ value: number }>) => {
    hp.set(e.detail.value);
};

const onRollHP = () => {
    const dice = findHpDiceFromRace(get(race));

    if (get(rerolls) > 0) {
        rerolls.update(rolls => rolls - 1);
        hp.set(evaluate(character, dice, {}).value);
    }
};

const selectRace = async (e: CustomEvent<{ id: ObjectID }>) => {
    await ensureUpgradeSetsInStore([e.detail.id]);
    race.set(e.detail.id);
};

const selectRaceChoices = (e: CustomEvent<{ choices: {[id: ObjectID]: any} }>) => {
    raceChoices.set(e.detail.choices);
};

const finishRaceChoices = (e: CustomEvent<{ finished: boolean }>) => {
    raceChoicesFinished.set(e.detail.finished);
};

const selectBackground = async (e: CustomEvent<{ selected: ObjectID[] }>) => {
    await ensureUpgradeSetsInStore(e.detail.selected);
    background.set(e.detail.selected);
};

const selectBackgroundChoices = (e: CustomEvent<{ choices: {[id: ObjectID]: any} }>) => {
    backgroundChoices.update(choices => ({ ...choices, ...e.detail.choices }));
};

const backgroundChoiceFinisher = (upgradeSetId: ObjectID) => (e: CustomEvent<{ finished: boolean }>) => {
    backgroundChoicesFinished.update(finished => ({ ...finished, [upgradeSetId]: e.detail.finished }));
};

const selectClass = async (e: CustomEvent<{ id: ObjectID }>) => {
    await ensureClassesInStore([e.detail.id]);
    _class.set(e.detail.id);
};

const selectUpgradeSet = async (e: CustomEvent<{ id: ObjectID }>) => {
    await ensureUpgradeSetsInStore([e.detail.id]);
    upgradeSet.set(e.detail.id);
};

const selectUpgradeChoices = (e: CustomEvent<{ choices: {[id: ObjectID]: any} }>) => {
    upgradeChoices.set(e.detail.choices);
}

const finishUpgradeChoices = (e: CustomEvent<{ finished: boolean }>) => {
    upgradeChoicesFinished.set(e.detail.finished);
};

const findHpDiceFromRace = (race: ObjectID | undefined) => {
    if (race) {
        const upgradeSet = idStore.getModel('upgradeSet', race);
        for (let upgradeId of upgradeSet.upgrades) {
            const upgrade = idStore.getModel('upgrade', upgradeId);
            if (isUpgradeType(upgrade, 'changeHitDice')) {
                return upgrade.data.dice;
            }
        }
    } else if (character.hitDice) {
        return character.hitDice;
    }
};

const updateCharacter = (updater: (char: ICharacter) => ICharacter) => {
    idStore.update('character', characterId, updater, true);
};

const copyUpgradeSet = async (upgradeSetId: ObjectID, choices: {[id: ObjectID]: any}) => {
    const upgradeSet = idStore.getModel('upgradeSet', upgradeSetId);
    // copy all of the upgrades
    const upgradeCopies = await Promise.all(upgradeSet.upgrades.map(upgradeId => {
        const upgrade = idStore.getModel('upgrade', upgradeId);
        const dataWithChoices = choices && choices[upgrade.id] !== undefined ? { ...upgrade.data, ...choices[upgrade.id] } : upgrade.data;
        return createAndStoreCopy('upgrade', upgrade, { data: dataWithChoices }, { type: 'character', link: characterId })
    }));
    const defaults: Partial<IUpgradeSet> = {
        upgrades: upgradeCopies.map(upgrade => upgrade.id)
    };

    const upgradeSetCopy = await createAndStoreCopy('upgradeSet', idStore.getModel('upgradeSet', upgradeSetId), defaults, { type: 'character', link: characterId });

    updateCharacter(char => ({ ...char, upgradeSets: [ ...char.upgradeSets, upgradeSetCopy.id ] }));
    await applyUpgradeSet(idStore.getModel('character', characterId, true), upgradeSetCopy, ['character']);

    return upgradeSetCopy;
}

const finish = async () => {
    finishing.set(true);

    idStore.startEditing('character', characterId);

    const levelUpgrade = await createAndStoreUpgrade({
        id: undefined,
        type: 'changeLevel',
        data: { amount: 1 },
        scope: { type: 'character', link: characterId }
    });

    const hpUpgrade = await createAndStoreUpgrade({
        id: undefined,
        type: 'changeHp',
        data: { amount: get(hp) ?? 0 },
        scope: { type: 'character', link: characterId }
    });

    const upgrades = [levelUpgrade.id, hpUpgrade.id];

    if (character.level === 0) {
        const actionResourceUpgrade = await createAndStoreUpgrade({
            id: undefined,
            type: 'changeResource',
            data: {
                name: 'Action',
                shortName: 'A',
                amount: 1
            },
            scope: { type: 'character', link: characterId }
        });

        const reactionResourceUpgrade = await createAndStoreUpgrade({
            id: undefined,
            type: 'changeResource',
            data: {
                name: 'Reaction',
                shortName: 'R',
                amount: 1
            },
            scope: { type: 'character', link: characterId }
        });

        const abilityValueMap = get(abilityArray);
        const abilityUpgrades = await Promise.all(
            Abilities.map(ability => createAndStoreUpgrade({
                id: undefined,
                type: 'changeAbility',
                data: {
                    ability,
                    amount: abilityValueMap[ability]
                },
                scope: { type: 'character', link: characterId }
            }))
        );

        upgrades.push(actionResourceUpgrade.id, reactionResourceUpgrade.id, ...abilityUpgrades.map(u => u.id));
    }

    const levelUpgradeSet = await createAndStoreUpgradeSet({
        id: undefined,
        name: `Level ${character.level + 1}`,
        apiName: `level_${character.level}`,
        description: '',
        tags: ['level', `level_${character.level}`],
        upgrades,
        scope: { type: 'character', link: characterId },
        cost: 0
    });
    character.upgradeSets = [ ...character.upgradeSets, levelUpgradeSet.id ];
    await applyUpgradeSet(character, levelUpgradeSet, ['character']);

    if (get(name) !== undefined) {
        updateCharacter(char => ({ ...char, name: get(name) }));
    }
    if (get(race) !== undefined) {
        await ensureUpgradeSetsInStore([get(race)]);
        const raceCopy = await copyUpgradeSet(get(race), get(raceChoices));
        updateCharacter(char => ({ ...char, race: raceCopy.name }));
    }
    if (get(background) !== undefined) {
        await ensureUpgradeSetsInStore(get(background));
        await Promise.all(get(background).map(upgradeSetId => copyUpgradeSet(upgradeSetId, get(backgroundChoices))));
    }
    if (get(_class) !== undefined) {
        updateCharacter(char => ({ ...char, classes: [ ...char.classes, get(_class) ], hitMod: char.hitMod + 1 }));
    }
    if (get(upgradeSet) !== undefined) {
        await ensureUpgradeSetsInStore([get(upgradeSet)]);
        await copyUpgradeSet(get(upgradeSet), get(upgradeChoices));
    }
    
    await idStore.finishEditing('character', characterId);
    finishing.set(false);
    
    navigate(`/character/${characterId}`);
};

</script>


<div class="header">
    Charactermancer
</div>
<div class="body">

{#if $finishing}
    Finishing, please wait...
{:else if character.level === 0}
<Screens>
    <Screen>
        <div class="subtitle">
            Choose your character's name
        </div>
        <Field title="Name" fixedValue={$name} grow editable on:change={onNameChange} max={70}/>
    </Screen>
    <Screen>
        <div class="subtitle">
            Choose your character's ability array
        </div>
        <div class="abilities">
            {#each Abilities as ability}
                <Field title={apiToTitle(ability)} fixedValue={$abilityArray[ability]} type="number" centered grow editable on:change={abilityChanger(ability)} big/>
            {/each}
        </div>
    </Screen>
    <Screen finished={$race !== undefined}>
        <div class="subtitle">
            Choose your character's race
        </div>
        {#if $race !== undefined}
            <div class="selection">
                Selected race: {idStore.getModel('upgradeSet', $race).name}
            </div>
        {/if}
        <PaginatedView type="upgradeSet" limit={10} scopes={scopes} sortMethods={IUpgradeSetSortMethods} baseFilters={raceFilters} selected={[$race]} customclick on:click={selectRace}/>
    </Screen>
    <Screen finished={$raceChoicesFinished}>
        {#if $race !== undefined}
            <UpgradeSetChoices characterId={characterId} upgradeSetId={$race} scopes={scopes} on:choices={selectRaceChoices} on:finished={finishRaceChoices}/>
        {/if}
    </Screen>
    <Screen finished={$background !== undefined}>
        <div class="subtitle">
            Choose your character's background
        </div>
        {#if $background !== undefined}
            <div class="selection">
                Selected backgrounds: {$background.map(id => idStore.getModel('upgradeSet', id).name)}
            </div>
        {/if}
        <PointBuySelection type="upgradeSet" maxPoints={5} scopes={scopes} sortMethods={IUpgradeSetSortMethods} baseFilters={backgroundFilters} on:select={selectBackground}/>
    </Screen>
    <Screen finished={Object.keys($backgroundChoicesFinished).length > 0 && Object.values($backgroundChoicesFinished).every(x => x)}>
        {#if $background !== undefined}
            {#each $background as upgradeSetId}
                <UpgradeSetChoices characterId={characterId} upgradeSetId={upgradeSetId} scopes={scopes} on:choices={selectBackgroundChoices} on:finished={backgroundChoiceFinisher(upgradeSetId)}/>
            {/each}
        {/if}
    </Screen>
    <Screen finished={$hp !== undefined}>
        <div class="subtitle">
            Roll your character's health
        </div>
        {#if findHpDiceFromRace($race)}
            <Field title="Health Gain" type="number" fixedValue={$hp} editable on:change={onHPChange} centered big/>
            <div class="health-roller">
                <button class="roll-hp" on:click={onRollHP}>Roll HP</button>
                <div class="remaining">{`${$rerolls} reroll(s) remaining`}</div>
            </div>
        {:else}
            You don't get any health this level.
        {/if}
    </Screen>
    <Screen finished={$_class !== undefined}>
        <div class="subtitle">
            Choose your character's first class card
        </div>
        {#if $_class !== undefined}
            <div class="selection">
                Selected class: {idStore.getModel('class', $_class).name}
            </div>
        {/if}
        <PaginatedView type="class" limit={10} scopes={scopes} sortMethods={IClassSortMethods} baseFilters={classFilters} selected={[$_class]} customclick on:click={selectClass}/>
    </Screen>
    <Screen finished={$upgradeSet !== undefined}>
        <div class="subtitle">
            Choose which class upgrade you want this level:
        </div>
        {#if $upgradeSet !== undefined}
            <div class="selection">
                Selected upgrade: {idStore.getModel('upgradeSet', $upgradeSet).name}
            </div>
        {/if}
        {#if $_class !== undefined}
            <UpgradeSelection classId={$_class} classLevel={0} on:select={selectUpgradeSet}/>
        {/if}
    </Screen>
    <Screen finished={$upgradeChoicesFinished} on:done={finish}>
        {#if $upgradeSet !== undefined}
            <UpgradeSetChoices characterId={characterId} upgradeSetId={$upgradeSet} scopes={scopes} on:choices={selectUpgradeChoices} on:finished={finishUpgradeChoices}/>
        {/if}
    </Screen>
</Screens>

{:else if character.level % 5 === 0}

<Screens>
    <Screen finished={$hp !== undefined}>
        <div class="subtitle">
            Roll your character's health
        </div>
        {#if findHpDiceFromRace($race)}
            <div class="health-roller">
                <button on:click={onRollHP}>Roll HP</button>
                <div class="remaining">{`${$rerolls} reroll(s) remaining`}</div>
                <Field title="HP Gain" fixedValue={$hp} editable on:change={onHPChange}/>
            </div>
        {:else}
            You don't get any health this level.
        {/if}
    </Screen>
    <Screen finished={$_class !== undefined}>
        <div class="subtitle">
            Choose a new class card for your character
        </div>
        {#if $_class !== undefined}
            <div class="selection">
                Selected class: {idStore.getModel('class', $_class).name}
            </div>
        {/if}
        <PaginatedView type="class" limit={10} scopes={scopes} sortMethods={IClassSortMethods} baseFilters={classFilters} selected={[$_class]} customclick on:click={selectClass}/>
    </Screen>
    <Screen finished={$upgradeSet !== undefined}>
        <div class="subtitle">
            Choose which class upgrade you want this level:
        </div>
        {#if $upgradeSet !== undefined}
            <div class="selection">
                Selected upgrade: {idStore.getModel('upgradeSet', $upgradeSet).name}
            </div>
        {/if}
        {#if $_class !== undefined}
            <UpgradeSelection classId={$_class} classLevel={0} on:select={selectUpgradeSet}/>
        {/if}
    </Screen>
    <Screen finished={$upgradeChoicesFinished} on:done={finish}>
        {#if $upgradeSet !== undefined}
            <UpgradeSetChoices characterId={characterId} upgradeSetId={$upgradeSet} scopes={scopes} on:choices={selectUpgradeChoices} on:finished={finishUpgradeChoices}/>
        {/if}
    </Screen>
</Screens>

{:else}

<Screens>
    <Screen finished={$hp !== undefined}>
        <div class="subtitle">
            Roll your character's health
        </div>
        {#if findHpDiceFromRace($race)}
            <div class="health-roller">
                <button on:click={onRollHP}>Roll HP</button>
                <div class="remaining">{`${$rerolls} reroll(s) remaining`}</div>
                <Field title="HP Gain" fixedValue={$hp} editable on:change={onHPChange}/>
            </div>
        {:else}
            You don't get any health this level.
        {/if}
    </Screen>
    <Screen finished={$upgradeSet !== undefined}>
        <div class="subtitle">
            Choose which class upgrade you want this level:
        </div>
        {#if $upgradeSet !== undefined}
            <div class="selection">
                Selected upgrade: {idStore.getModel('upgradeSet', $upgradeSet).name}
            </div>
        {/if}
        <UpgradeSelection classId={character.classes[character.classes.length - 1]} classLevel={character.level % 5} on:select={selectUpgradeSet}/>
    </Screen>
    <Screen finished={$upgradeChoicesFinished} on:done={finish}>
        {#if $upgradeSet !== undefined}
            <UpgradeSetChoices characterId={characterId} upgradeSetId={$upgradeSet} scopes={scopes} on:choices={selectUpgradeChoices} on:finished={finishUpgradeChoices}/>
        {/if}
    </Screen>
</Screens>

{/if}
</div>

<style>
    .header {
        font-size: 1.5rem;
        margin-top: 10px;
        margin-left: 10px;
        font-weight: bold;
    }

    .subtitle {
        font-size: 1rem;
        font-weight: bold;
        margin-left: 5px;
        margin-bottom: 10px;
    }

    .selection {
        font-size: 0.75rem;
        margin-bottom: 10px;
    }

    .health-roller {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        margin-top: 15px;
    }

    .roll-hp {
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
    }

    .remaining {
        vertical-align: middle;
    }

    .abilities {
        display: flex;
        flex-direction: row;
    }
</style>