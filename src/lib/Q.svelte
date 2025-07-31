<script lang="ts">
	let qHovered = $state(false)

</script>

<div 
    on:mouseenter={() => {qHovered = true}}
    on:mouseleave={() => {qHovered = false}}
    class="q w-[5rem] h-[rem] grid text-3xl text-white border-0 hover:border-5 rounded-full aspect-[1/1] select-none hover:cursor-pointer">
    <div class="place-self-center text-5xl">?</div>
</div>
{#if qHovered}
    <div class="i w-full bg-black p-9 text-3xl border-4 h-[80%] border-white border-solid text-white z-99">
        <slot></slot>
    </div>
{/if}

<style lang="scss">
</style>
