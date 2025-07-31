<script lang="ts">
	import '../app.css';
	import { game, sleep, scene, gameLoaded } from '$lib/store';
	import Polaroid from '$lib/Polaroid.svelte'
	import * as THREE from "three/webgpu"
	import { tick } from 'svelte'
	import Drag from '$lib/Drop.svelte'
	import X from '$lib/X.svelte'
	import Q from '$lib/Q.svelte'

	let { children } = $props();

	const addScene = (dataBaseItemID, i) => {
		polaroids[i] = database[dataBaseItemID].data
	}

	let enabledRaindrops = $state(0)
	let enabledRaindropsMin = 0
	let enabledRaindropsMax = $state(0)

	$effect(() => {
		if ($gameLoaded && enabledRaindropsMax == 0) {
			enabledRaindropsMax = $game.raindropsN.value
			enabledRaindrops = $game.raindropEnabledN.value
		}
	})

	$effect(() => {
		if ($gameLoaded) {
			$game.raindropEnabledN.value = enabledRaindrops
		}
	})

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

	let inventorySelected = $state(0)

	let xHovered = $state(false)

	function getDate(date: Date) {
		return [`${date.getMonth() + 1}.${date.getDate()}.${date.getFullYear().toString().slice(-2)}`, `${date.getHours() > 12 ? date.getHours() - 12 : date.getHours()}:${date.getMinutes().toString().padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`]
	}

	function handleKeyDown(e: KeyboardEvent) {
		switch (e.code) {
			case 'KeyF': {
				if ($scene != 'camera') {
					return
				}
				const [date, time] = getDate(new Date())
				const imageData = $game.renderer.domElement.toDataURL('image/jpeg')
				database.push({
					name: `photo\n${time}`,
					data: {
						date: date,
						time: time,
						pitch: $game.playerPitch,
						yaw: $game.playerYaw,
						position: $game.camera.position.clone(),
						imageData: imageData,
						enabledRaindrops: enabledRaindrops,
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
				$scene = 'none'
				break
			}
			case 'Digit1': {
				$scene = 'camera'
				break
			}
			case 'Digit3': {
				$scene = 'umbrella'
				break
			}
			case 'Digit4': {
				$scene = 'album'
				break
			}
			case 'Escape': {
				$scene = 'none'
				break
			}
		}
	}

	const polaroids = $state({
		0: {
			fake: false,
			date: "1.1.99",
			time: "1:00 AM",
			imageData: "Default",
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

	{#if $scene === 'none'}
	{:else if $scene === 'camera'}
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

		<Q>
			Welcome to the Camera. <br><br>

			Press 'alt' to show the mouse! <br><br>

			'f' to take a picture! <br><br>

			Press 'esc' to cancel! <br><br>
		</Q>
		<X/>
	{:else if $scene == 'album'}
		<Q>
			Welcome to the Album. <br><br>

			Press 'alt' to show the mouse! <br><br>

			Drag and drop your polaroids (5 & 6) <br><br>

			Press 'esc' to cancel! <br><br>
		</Q>
		<X/>

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
								enabledRaindrops = d.enabledRaindrops
							}}
							/>
						{:else}
							<Drag i={i + albumPage * 4} addScene={addScene}></Drag>
						{/if}
					{/each}
				</div>
			{/each}
		</div>
	{:else if $scene == 'umbrella'}
		<Q></Q>
		<div class="i h-[80%] flex w-full items-center gap-4 rounded-lg bg-neutral-900 p-4 bg-transparent">
			<input
				type="range"
				bind:value={enabledRaindrops}
				min={enabledRaindropsMin}
				max={enabledRaindropsMax}
				style="--p: {enabledRaindrops}%"
				on:mousedown={(e) => {e.stopPropagation()}}
				class="
				h-2 w-full cursor-pointer appearance-none border border-white
				
				bg-[linear-gradient(to_right,theme(colors.white)_var(--p),theme(colors.black)_var(--p))]

				[&::-webkit-slider-thumb]:h-5
				[&::-webkit-slider-thumb]:w-5
				[&::-webkit-slider-thumb]:appearance-none
				[&::-webkit-slider-thumb]:border-2
				[&::-webkit-slider-thumb]:border-white
				[&::-webkit-slider-thumb]:bg-black

				[&::-moz-range-track]:border-white
				[&::-moz-range-track]:bg-black
				
				[&::-moz-range-progress]:bg-white
				
				[&::-moz-range-thumb]:h-5
				[&::-moz-range-thumb]:w-5
				[&::-moz-range-thumb]:appearance-none
				[&::-moz-range-thumb]:rounded-none
				[&::-moz-range-thumb]:border-2
				[&::-moz-range-thumb]:border-white
				[&::-moz-range-thumb]:bg-black
				"
			/>
			<span class="w-8 text-right font-mono text-white">{enabledRaindrops}</span>
		</div>
		<X></X>
	{/if}

	{#if $scene !== 'camera'}
		<div class="text-white inventory flex gap-20 select-none">
			{#each inventory as databaseItemID, idx}
				<div class="grid gap-1 grid-rows-[50%_50%]">
					{#if databaseItemID === 0}
						<div class="bg-white aspect-[1/1] w-[1rem] place-self-center rotate-45"></div>
				{:else}
						<div 
							draggable={true} 
							on:mousedown={(e) =>{ 
								e.stopPropagation()
								const name = database[databaseItemID].name
								if (name !== ''
									&& !name.includes('photo')
								) {
									$scene = database[databaseItemID].name
								}
							}}
							on:dragstart={(e) => {
								if (idx == 4 || idx == 5) {
									// e.dataTransfer.setData("text/plain", JSON.stringify(inventory[idx].data))
									e.dataTransfer.setData("text/plain", `${databaseItemID}`)
									e.dataTransfer.effectAllowed = "move";
								}
							}}
							class={`flex-1 grid border border-white ${inventorySelected == idx ? 'border-3' : ''} rotate-45 aspect-[1/1] border-5 w-[5rem] hover:bg-white hover:cursor-pointer hover:text-black relative`} 
						>
							{#if database[databaseItemID].name === $scene}
								<div class="absolute -top-2 -left-2 border border-white border-5 w-[calc(100%+1rem)] h-[calc(100%+1rem)] rotate-45"></div>
							{/if}
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

</style>