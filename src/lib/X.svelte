<script>
    import {scene} from "$lib/store"

</script>

<div 
    on:click={() => {$scene = 'none'}}
    class="x w-[5rem] h-[rem] grid text-3xl text-white border-0 hover:border-5 rounded-full aspect-[1/1] select-none hover:cursor-pointer">
    <div class="place-self-center text-5xl">x</div>
</div>

<style lang="scss">
	.x {
		grid-column-start: main-start;
		grid-row-start: main-start;
		grid-row-end: content-start;
	}
</style>
