<script lang="ts">
import { Skill, SkillsToAbilities, UnitID } from "../../models/unit";
import ClickRollText from "../common/ClickRollText.svelte";
import * as idStore from "../../store/idStore";
import { apiToTitle } from "../../util/textHelpers";
import { getRollForSkill } from "../../rolling/roller";

export let unitId: UnitID;
export let skill: Skill;
let skillMod;
let abilityMod;

const sub = idStore.subscribeManger(unitId.type, unitId.id, (model) => {
    skillMod = model.skills[skill];
    abilityMod = Math.max(...SkillsToAbilities[skill].map(ability => model.abilities[ability]));
});
$: sub(unitId.id);

$: roll = getRollForSkill(skill)

</script>

<div class="skill-row">
    <ClickRollText roll={roll}
                       rollCategory="check"
                       rollTitle={`${apiToTitle(skill)} Check`}
                       proficiencyDerivation={idStore.deriver(unitId.type, unitId.id)('skills', skill)}
                       roller={unitId}>
        <div class="skill-text">
            <div class="skill-title"> 
                {apiToTitle(skill)}
            </div>
            <div class="skill">
                <span>{skillMod + abilityMod}</span> 
            </div>
        </div>
    </ClickRollText>
</div> 

<style>
.skill-row {
    height: 100%;
    width: 100%;
    padding-bottom: 5px;
    border-bottom: #9f9f9f solid 1px;
}

.skill-text {
    display: flex;
    flex-direction: row;
}

.skill {
    box-sizing: border-box;
    border-style: none;
    border-width: 1px;
    border-color: #efefef;
    border-radius: 5px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin-right: 10px;
    padding: 3px 13px;
    margin-right: 0;
}

.skill-title {
    width: 100%;
    flex: 1;
    margin-right: 10px;
    display: flex;
    align-items: center;
}
</style>

