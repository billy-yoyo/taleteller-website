<script lang="ts">
    import Feature from "../components/models/Feature.svelte";
    import { ensureFeaturesInStore } from "../controller/feature";
    import type { ObjectID } from "../models/objectId";
    
    export let id: ObjectID;
    export let editing: boolean = false;
    
    </script>
    
    {#await ensureFeaturesInStore([id])}
        <p>Loading...</p>
    {:then}
        <Feature featureId={id} editing={editing}/>
    {:catch error}
        <p color="red">Failed to load: <br> {error}</p>
    {/await}
    