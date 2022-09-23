<script lang="ts">
import type { RollOptions } from "../../../rolling/roller";

export let options: RollOptions;
export let variable: string;
</script>

<span>{options.variables !== undefined ? (options.variables[variable] ?? 0) : 0}</span>
