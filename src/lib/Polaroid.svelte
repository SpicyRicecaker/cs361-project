<script lang="ts">
    import {game} from '$lib/store'
	import * as THREE from 'three/webgpu'

    let {d, loadScene} = $props()
</script>

<div>
    <div 
        on:click={(e) => { loadScene(d)}}
        class="bg-black text-base border-4 h-[80%] border-white border-solid text-white z-99 select-none hover:cursor-pointer hover:bg-white hover:border-8 grid">
        {#if d.imageData === 'Default'}
        <div class="place-self-center">
            [default scene]
        </div>
        {:else}
            <img draggable="false" class="w-full h-full object-cover" src={d.imageData}>
        {/if}

    </div>
    <div class="text-white text-xl">{d.date} {d.time}</div>
</div>