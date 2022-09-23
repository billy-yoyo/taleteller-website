<script lang="ts">
import { IMessageSection, isMessageSectionType, MessageSectionType } from "../../models/message";
import ActionButton from "../models/ActionButton.svelte";
import RollResult from "./RollResult.svelte";
import type { ObjectID } from "../../models/objectId";

export let messageId: ObjectID;
export let section: IMessageSection<MessageSectionType>;

</script>

{#if isMessageSectionType(section, 'text')}
    <div class="text">
        {section.data.content}
    </div>
{:else if isMessageSectionType(section, 'title')}
    <div class="title">
        {section.data.content}
    </div>
{:else if isMessageSectionType(section, 'roll')}
    <div class="roll">
        <RollResult sectionId={section.id} messageId={messageId} result={section.data.roll} options={section.data.options} />    
    </div>
{:else if isMessageSectionType(section, 'button')}
    <div class="button">
        <ActionButton ownerId={section.data.owner} actionId={section.data.actionId} light grow/>
    </div>
{/if}

<style>
    .title {
        font-size: 1.25rem;
        font-weight: bold
    }
</style>