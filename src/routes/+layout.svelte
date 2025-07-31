<script lang="ts">
	import '../app.css';
	import { game, noAction, sleep } from '$lib/store';
	import Polaroid from '$lib/Polaroid.svelte'
	import * as THREE from "three/webgpu"
	import { tick } from 'svelte'
	import Drag from '$lib/Drop.svelte'

	let { children } = $props();

	const addScene = (dataBaseItemID, i) => {
		polaroids[i] = database[dataBaseItemID].data
	}

	const database = $state([
		{
			name: ""
		},
		{
			name: "camera"
		},
		{
			name: "ipod"
		},
		{
			name: "umbrella"
		},
		{
			name: "album"
		}
	] as any)

	const inventory = $state([
		1, 2, 3, 4, 0, 0
	])

	let scene = $state("album")
	let inventorySelected = $state(0)

	let qHovered = $state(false)
	let xHovered = $state(false)

	function getDate(date: Date) {
		return `${date.getMonth() + 1}.${date.getDate()}.${date.getFullYear().toString().slice(-2)} ${date.getHours() > 12 ? date.getHours() - 12 : date.getHours()}:${date.getMinutes().toString().padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.code == 'KeyF') {
			const dateString = getDate(new Date())
			database.push({
				name: `photo\n${dateString.slice(-9)}`,
				data: {
					dateString: dateString,
					pitch: $game.playerPitch,
					yaw: $game.playerYaw,
					position: $game.camera.position.clone(),
					fake: false
				}
			})
			if (inventory[4] == 0) {
				inventory[4] = database.length - 1
			} else if(inventory[5] == 0) {
				inventory[5] = database.length - 1
			} else {
				const t = inventory[4]
				inventory[4] = database.length - 1
				inventory[5] = t
			}
			// determine if we can replace current database with 
			scene = 'none'
		}
		if (e.code == 'Digit1') {
			scene = 'camera'
		}
	}

	const polaroids = $state({
		0: {
			fake: false,
			dateString: "Default",
			pitch: 0, 
			yaw: 0,
			position: new THREE.Vector3(0, 0, 0.5)
		}
	})

	const polaroidsReadable = $derived(
		Array(8)
			.fill()
			.map((_, i) => i in polaroids 
				? polaroids[i]
				: {fake: true}
	))

	$effect(() => {
		$inspect(polaroidsReadable)
	})

</script>

<svelte:window on:keydown={(e) => handleKeyDown(e)}></svelte:window>

<div class="wrapper p-8 relative">
	{@render children()}

	{#if scene === 'none'}
	{:else if scene === 'camera'}
		<div class="select-none l-shape w-32 h-32 absolute top-[calc(50%-1.2rem)] left-[calc(50%-1.2rem)]">
			<!-- Vertical part of L -->
			<div class="w-4 h-12 bg-white absolute left-0 top-0"></div>
			<!-- Horizontal part of L -->
			<div class="w-12 h-4 bg-white absolute left-0 top-0"></div>
		</div>

		<div class="select-none l-shape w-32 h-32 absolute top-[calc(50%-7rem-1.2rem)] left-[calc(50%-7rem-1.2rem)] -rotate-180">
			<!-- Vertical part of L -->
			<div class="w-4 h-12 bg-white absolute left-0 top-0"></div>
			<!-- Horizontal part of L -->
			<div class="w-12 h-4 bg-white absolute left-0 top-0"></div>
		</div>

		<div 
			on:click={() => {scene = 'none'}}
			class="x w-[5rem] h-[rem] grid text-3xl text-white border-0 hover:border-5 rounded-full aspect-[1/1] select-none hover:cursor-pointer">
			<div class="place-self-center text-5xl">x</div>
		</div>
		<div 
			on:mouseenter={() => {qHovered = true}}
			on:mouseleave={() => {qHovered = false}}
			class="q w-[5rem] h-[rem] grid text-3xl text-white border-0 hover:border-5 rounded-full aspect-[1/1] select-none hover:cursor-pointer">
			<div class="place-self-center text-5xl">?</div>
		</div>
		{#if qHovered}
			<div class="i w-full bg-black p-9 text-3xl border-4 h-[80%] border-white border-solid text-white z-99">
				Welcome to the Camera. <br><br>

				Press 'alt' to show the mouse! <br><br>

				'f' to take a picture! <br><br>

				Press 'esc' to cancel! <br><br>
			</div>
		{/if}
	{:else if scene == 'album'}
		<div class="i w-full grid grid-cols-2 gap-1">
			{#each {length: 2}, albumPage}
				<div
					class="bg-black p-9 text-3xl border-4 h-[80%] border-white border-solid text-white z-99 select-none grid grid-cols-2 grid-rows-2 gap-3"
				>
					{#each polaroidsReadable.slice(albumPage * 4, (albumPage + 1) * 4) as polaroid, i}
						{#if !polaroid.fake}
							<Polaroid d={polaroid} loadScene={(d) => {
								$game.camera.position.setX(d.position.x)
								$game.camera.position.setY(d.position.y)
								$game.camera.position.setZ(d.position.z)
								$game.playerYaw = d.yaw
								$game.playerPitch = d.pitch
							}}
							/>
						{:else}
							<Drag i={i + albumPage * 4} addScene={addScene}></Drag>
						{/if}
					{/each}
				</div>
			{/each}
	</div>
	{/if}

	{#if scene !== 'camera'}
		<div class="text-white inventory flex gap-20 select-none">
			{#each inventory as databaseItemID, idx}
				<div class="grid gap-1 grid-rows-[50%_50%]">
					{#if databaseItemID === 0}
						<div class="bg-white aspect-[1/1] w-[1rem] place-self-center rotate-45"></div>
				{:else}
						<div 
							draggable={true} 
							
							on:dragstart={(e) => {
								if (idx == 4 || idx == 5) {
									// e.dataTransfer.setData("text/plain", JSON.stringify(inventory[idx].data))
									e.dataTransfer.setData("text/plain", `${databaseItemID}`)
									e.dataTransfer.effectAllowed = "move";
								}
							}}
							
							class={`flex-1 grid border border-white ${inventorySelected == idx ? 'border-3' : ''} rotate-45 aspect-[1/1] border-5 w-[5rem] hover:bg-white hover:cursor-pointer hover:text-black`} 
							
							on:mousedown={(e) => {
							const name = database[databaseItemID].name
							if (name !== ''
								&& !name.includes('photo')
							) {
								scene = database[databaseItemID].name
							}}}
							>

							<div class="place-self-center -rotate-45 whitespace-pre-line">{database[databaseItemID].name}</div>
						</div>
					{/if}
					<div class="grid grid-cols-1">
						<div class="flex items-end justify-center">{idx + 1}</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style lang="scss">

	.wrapper {
		width: 100vw;
		height: 100vh;
		display: grid;
		// d: don't care
		// i: inventory
		// x: close
		// q: question
		// r: real-estate for 3d graphics
		// grid-template-areas: 
		// 	"x d d d q"
		// 	"d i i i d"
		// 	"d i i i d"
		// 	"d i i i d"
		// 	"ft ft ft ft   ft   ft   ft   ft   ft";
		grid-template-columns: [main-start] 1fr [content-start] 5fr [content-end] 1fr [main-end];
		grid-template-rows: [main-start] 1fr [content-start] 5fr [content-end] 1fr [main-end];
	}

	.x {
		grid-column-start: main-start;
		grid-row-start: main-start;
		grid-row-end: content-start;
	}

	.q {
		grid-column-start: content-end;
		grid-row-start: main-start;
		grid-row-end: content-start;
	}

	.i {
		grid-column-start: content-start;
		grid-row-start: content-start;
		grid-row-end: content-end;
	}

	.inventory {
		grid-column-start: content-start;
		grid-row-start: content-end;
		grid-row-end: main-end;
	}
</style>