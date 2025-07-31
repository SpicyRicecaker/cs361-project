<script lang="ts">
    import {game} from '$lib/store'
	import * as THREE from 'three/webgpu'

    let {d, loadScene} = $props()
</script>

<div>
    <div 
        on:click={(e) => { loadScene(d)}}
        class="bg-black p-9 text-3xl border-4 h-[80%] border-white border-solid text-white z-99 select-none grid grid-cols-2 grid-rows-2 hover:cursor-pointer hover:bg-white">
    </div>
    <div class="text-white">{d.dateString}</div>
</div>