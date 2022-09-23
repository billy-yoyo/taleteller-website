import { get } from "svelte/store";
import type { IAction } from "../models/action";
import { EffectType, IEffect, isEffectType } from "../models/effect";
import type { IMessageSection, MessageSectionType } from "../models/message";
import type { UnitID } from "../models/unit";
import { sendAndStoreMessage } from "../controller/chat";
import { evaluate } from "../rolling/roller";
import { getHitType } from "../rolling/rollrepr";
import * as chat from "../store/chat";
import * as idStore from "../store/idStore";
import type { IActionMod } from "../models/actionMod";
import { sum } from "../util/funcHelpers";
import { spawnDialogAndWaitForAnswer } from "../store/dialogs";
import type { IResource } from "../models/resource";
import type { IResourceCost } from "../models/resourceCost";
import { isValueType } from "../rolling/rollast";

const executeEffect = (unitId: UnitID, effect: IEffect<EffectType>, params: string[], mods: IActionMod[]): IMessageSection<MessageSectionType> | undefined => {
    const unit = idStore.getModel(unitId.type, unitId.id)
    if (isEffectType(effect, 'roll')) {
        let rollAst = effect.data.roll;
        let extraAst;
        if (effect.data.options.category === 'check') {
            extraAst = mods.map(m => m.hitModifier).filter(x => x);
        } else if (effect.data.options.category === 'damage') {
            extraAst = mods.map(m => m.damageModifier).filter(x => x);
        } else {
            extraAst = [];
        }

        if (extraAst.length > 0) {
            if (isValueType(rollAst, 'sum')) {
                rollAst.data.values = [...rollAst.data.values, ...extraAst];
            } else {
                rollAst = {
                    type: 'sum',
                    data: {
                        values: [rollAst, ...extraAst]
                    }
                };
            }
        }

        const roll = evaluate(unit, rollAst, effect.data.options);
        const hit = getHitType(roll.repr);
        params.push(`hit:${hit}`);
        return {
            type: 'roll',
            data: {
                roll,
                options: effect.data.options
            }
        };
    } else if (isEffectType(effect, 'button')) {
        return {
            type: 'button',
            data: { actionId: effect.data.actionId, owner: unit }
        };
    } else if (isEffectType(effect, 'addParam')) {
        params.push(effect.data.param);
    } else if (isEffectType(effect, 'ifParam')) {
        if (params.includes(effect.data.param)) {
            if (effect.data.thenEffectId !== undefined) {
                return executeEffect(unitId, idStore.getModel('effect', effect.data.thenEffectId), params, mods);
            }
        } else {
            if (effect.data.elseEffectId !== undefined) {
                return executeEffect(unitId, idStore.getModel('effect', effect.data.elseEffectId), params, mods);
            }
        }
    }
}

export const executeEffects = async (unitId: UnitID, name: string, description: string | undefined, effects: IEffect<EffectType>[], initialParams: string[], mods: IActionMod[]) => {

    const sections: IMessageSection<MessageSectionType>[] = [];
    const channelId = get(chat.selectedChannel);
    const params = initialParams.slice();

    sections.push({
        type: 'title',
        data: { content: name }
    });

    if (description) {
        sections.push({
            type: 'text',
            data: { content: description }
        });
    }

    effects.forEach(effect => {
        const section = executeEffect(unitId, effect, params, mods);
        if (section) {
            sections.push(section);
        }
    });

    return await sendAndStoreMessage(channelId, sections, true);
};

export const actionModIsActive = (action: IAction, actionMod: IActionMod): boolean => {
    if (actionMod.targetTags.length > 0) {
        if (actionMod.targetTags.some(tag => !action.tags.includes(tag))) {
            return false;
        }
    }
    return true;
};

export const canAffordActionSub = async (unitId: UnitID, action: IAction) => {

};

export const executeAction = async (unitId: UnitID, action: IAction, withCost: boolean, initialParams: string[]): Promise<boolean> => {
    const unit = idStore.getModel(unitId.type, unitId.id);
    const resources: {[shortName: string]: IResource} = {};

    unit.resources.forEach(resourceId => {
        const resource = idStore.getModel('resource', resourceId);
        resources[resource.shortName] = resource;
    });

    const unitMods = unit.actionMods.map(actionModId => idStore.getModel('actionMod', actionModId));
    const activeMods = unitMods.filter(actionMod => actionModIsActive(action, actionMod));

    if (withCost) {
        const cannotAfford = action.cost.some(cost => {
            const costMods = activeMods.map(mod => mod.costModifiers.filter(c => c.resourceShortName === cost.resourceShortName)).flat();
            if (!cost.variable && costMods.every(c => !c.variable)) {
                if (cost.makeFree || costMods.some(c => c.makeFree)) {
                    return false;
                }
                let numericCost = cost === undefined ? 0 : cost.amount;
                numericCost += sum(costMods, cost => cost.amount);
                if (numericCost > resources[cost.resourceShortName]?.amount ?? 0) {
                    return true;
                }
            } else {
                // you're not allowed variable with free costs
                if (cost.makeFree || costMods.some(c => c.makeFree)) {
                    return true;
                }
                return false;
            }
        });

        if (cannotAfford) {
            return false;
        }
    }

    let variableCosts: {[shortName: string]: number} = {};
    const variablesToRequest: [string, number, number][] = action.cost.map(cost => {
        const costMods = activeMods.map(mod => mod.costModifiers.filter(c => c.resourceShortName === cost.resourceShortName)).flat();
        if (cost.variable || costMods.some(c => c.variable)) {
            let flatAmount = 0;
            let totalVarAmount = 0;
            let maxVarAmount = 0;
            if (cost.variable) {
                maxVarAmount = cost.amount;
                totalVarAmount += cost.amount;
            } else {
                flatAmount += cost.amount;
            }

            costMods.forEach(c => {
                if (c.variable) {
                    if (c.amount > maxVarAmount) {
                        maxVarAmount = c.amount;
                    }
                    totalVarAmount += c.amount
                } else {
                    flatAmount += c.amount; 
                }
            });

            const min = maxVarAmount;
            const max = withCost ? Math.floor((resources[cost.resourceShortName].amount - flatAmount) / totalVarAmount) : undefined;

            return [cost.resourceShortName, min, max];
        } else {
            return undefined;
        }
    }).filter(x => x) as [string, number, number][];

    if (withCost && variablesToRequest.some(([shortName, min, max]) => max < min)) {
        return false;
    }

    if (variablesToRequest.length > 0) {
        const response = await spawnDialogAndWaitForAnswer(
            'Choose Variable Costs',
            'Please select a valid resource cost for the following variable cost resource(s)',
            ['Done'],
            variablesToRequest.map(([shortName, min, max]) => {
                return {
                    key: shortName,
                    props: {
                        title: "Tier",
                        type: "number",
                        fixedValue: min,
                        editable: true,
                        min,
                        max
                    }
                }
            })
        );

        variableCosts = response.data;
    }

    if (withCost) {
        const getAmount = (cost: IResourceCost): number => {
            if (cost.variable) {
                return variableCosts[cost.resourceShortName] ?? cost.amount
            } else {
                return cost.amount;
            }
        };

        unit.resources.forEach(resourceId => {
            idStore.updateAndSaveIfChanged('resource', resourceId, (resource) => {
                const cost = action.cost.find(rc => rc.resourceShortName === resource.shortName);
                const costMods = activeMods.map(mod => mod.costModifiers.filter(c => c.resourceShortName === resource.shortName)).flat();

                let numericCost = cost === undefined ? 0 : getAmount(cost);
                numericCost += sum(costMods, cost => getAmount(cost));

                if (cost?.makeFree || costMods.some(mod => mod.makeFree)) {
                    numericCost = 0;
                }

                if (numericCost !== 0) {
                    return [true, {
                        ...resource,
                        amount: resource.amount - numericCost
                    }]
                } else {
                    return [false, resource];
                }
            });
        });
    }

    await executeEffects(
        unitId,
        action.name,
        action.description,
        action.effects.map(eid => idStore.getModel('effect', eid)),
        initialParams,
        activeMods
    );
    return true;
};
