<script lang="ts">
import { createEventDispatcher } from "svelte";


export let title: string;
export let closeable: boolean = false;
let top: number = window.innerHeight / 2;
let left: number = window.innerWidth / 2;
let moving: boolean = false;

const onMouseDown = () => { moving = true; }
window.addEventListener('mouseup', () => { moving = false; });
window.addEventListener('mousemove', (e: MouseEvent) => {
    if (moving) {
        top += e.movementY;
        left += e.movementX;
    }
});

const dispatch = createEventDispatcher();
const close = (e: MouseEvent) => {
    e.preventDefault();
    dispatch('close');
};
</script>

<div class="window" style={`top: ${top}px; left: ${left}px;`}>
    <div class="header" on:mousedown={onMouseDown}>
        <span>
            {title}
        </span>
        {#if closeable}
            <button class="close" on:click={close}>
                x
            </button>
        {/if}
    </div>
    <div class="content">
        <slot></slot>
    </div>
</div>

<style>
    .window {
        z-index: 100;
        border: 1px solid #efefef;
        border-radius: 5px;
        background-color: #0d0d15;
        position: absolute;
        max-width: 80%;
        max-height: 80%;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
    }

    .content {
        overflow: auto;
        scrollbar-width: thin;
        padding-right: 8px;
    }

    .header {
        flex: 1;
        width: 100%;
        box-sizing: border-box;
        border-bottom: 1px solid #efefef;
        cursor: move;
        user-select: none;
        font-size: 1.25rem;
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .header span {
        flex: 1;
        padding: 5px 7px;
    }

    .close {
        justify-self: flex-end;
        margin: 0;
        margin-left: 10px;
        border: none;
        border-left: 1px solid #efefef;
        background: none;
        height: 100%;
        padding: 4px 0.9rem;
        padding-top: 2px;
        cursor: pointer;
        font-size: 1.5rem;
        color: #efefef;
        display: flex;
        justify-content: center;
        align-items: center;
        vertical-align: middle;
    }

    .close:hover {
        background-color: #13131c;
    }
</style>
