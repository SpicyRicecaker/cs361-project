<script lang="ts">
	import { onMount } from 'svelte'
	// script.js
	import * as THREE from 'three/webgpu'
	import {
		FirstPersonControls,
		FlyControls,
		FontLoader,
		OrbitControls
	} from 'three/examples/jsm/Addons.js'

	import { GUI } from 'three/addons/libs/lil-gui.module.min.js'

	import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'

	import {
		atomicAdd,
		atomicStore,
		bool,
		cameraPosition,
		cameraProjectionMatrix,
		cameraViewMatrix,
		color,
		cos,
		distance,
		Fn,
		hash,
		If,
		instancedArray,
		instanceIndex,
		int,
		ivec2,
		length,
		Loop,
		modelViewMatrix,
		modelViewPosition,
		modelWorldMatrix,
		modelWorldMatrixInverse,
		radians,
		shapeCircle,
		sin,
		sqrt,
		storage,
		struct,
		time,
		uint,
		uniform,
		uv,
		uvec2,
		varying,
		varyingProperty,
		vec3,
		vec4,
		vertexIndex,
		wgslFn
	} from 'three/tsl'
	import { lightPosition, positionGeometry } from 'three/src/nodes/TSL.js'

	class Game {
		camera: THREE.PerspectiveCamera
		scene: THREE.Scene
		renderer: THREE.Renderer
		initGPUSushiPlate: THREE.TSL.ShaderNodeObject<THREE.ComputeNode>
		updateGpuSushiPlate: THREE.TSL.ShaderNodeObject<THREE.ComputeNode>
		updateGPUSushiPlate: THREE.TSL.ShaderNodeObject<THREE.ComputeNode>
		gui: GUI
		ticks: number
		planeNVX: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		planeNVY: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		controls: any
		playerVelocity: THREE.Vector3
		playerForward: THREE.Vector3
		playerRight: THREE.Vector3
		playerUp: THREE.Vector3
        inputAcceptedKeys: string[]
		inputKeysHeld: any

		constructor() {
			this.gameLoop = this.gameLoop.bind(this)
			this.onWindowResize = this.onWindowResize.bind(this)
			this.handleHeldKeys = this.handleHeldKeys.bind(this)
			this.handleKeyDown = this.handleKeyDown.bind(this)
			this.handleKeyUp = this.handleKeyUp.bind(this)
			this.tick = this.tick.bind(this)
			this.render = this.render.bind(this)
			// ======================================================
			// =                                                    =
			// =                  CREATE GUI                        =
			// =                                                    =
			// =                                                    =
			// ======================================================
			this.gui = new GUI()
			this.ticks = 0
			this.gui.add(this, 'ticks').listen()
			// ======================================================
			// =                                                    =
			// =                  CREATE CAMERA                     =
			// =                                                    =
			// =                                                    =
			// ======================================================
			this.camera = new THREE.PerspectiveCamera(
				70,
				window.innerWidth / window.innerHeight,
				0.00001,
				100
			)
			this.camera.position.z = 1.8
			this.camera.up = new THREE.Vector3(0, 0, 1)
			this.camera.lookAt(0, 1, 1.8)
			// ======================================================
			// =                                                    =
			// =                  CREATE RENDERER                   =
			// =                                                    =
			// =                                                    =
			// ======================================================
			this.renderer = new THREE.WebGPURenderer({ antialias: false })
			// Set the renderer's pixel ratio.
			this.renderer.setPixelRatio(window.devicePixelRatio)
			// Set size of the renderer to cover the full size of the window.
			this.renderer.setSize(window.innerWidth, window.innerHeight)
			// cleanup old renderers
			this.renderer.domElement.id = 'renderer'
			document.getElementById('renderer')?.remove()
			document.body.appendChild(this.renderer.domElement)
			// setup listeners
			window.addEventListener('keydown', this.handleKeyDown)
			window.addEventListener('keyup', this.handleKeyUp)
			// add controls
			{
				// TODO can replace with logic for manipulating camera i've done it 1000 times
				// this.controls = new OrbitControls(this.camera, this.renderer.domElement)
			}
			// ======================================================
			// =                                                    =
			// =                  CREATE SCENE                      =
			// =                                                    =
			// =                                                    =
			// ======================================================
			this.scene = new THREE.Scene()
			this.scene.background = new THREE.Color(0x000000)
			// add debug plane geometry
			{
				this.planeNVX = uniform(50)
				this.planeNVY = uniform(50)
				const geometry = new THREE.PlaneGeometry(1, 1, this.planeNVX.value, this.planeNVY.value)
				const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })
				material.color = new THREE.Color(0.3, 0, 0)
				const mesh = new THREE.Mesh(geometry, material)
				this.scene.add(mesh)
			}
			// add debug axis
			{
				const axesHelper = new THREE.AxesHelper(5)
				this.scene.add(axesHelper)
			}
			// init input
			{
                this.inputAcceptedKeys = ['KeyW', 'KeyS', 'KeyA', 'KeyD', 'ShiftLeft', 'Space']
				this.inputKeysHeld = {}
				this.inputAcceptedKeys.forEach((el) => {
					this.inputKeysHeld[el] = false
				})
			}
			// init player
			{
				this.playerVelocity = new THREE.Vector3(0, 0, 0)
				this.playerForward = new THREE.Vector3(0, 1, 0)
				this.playerRight = new THREE.Vector3(1, 0, 0)
				this.playerUp = new THREE.Vector3(0, 0, 1)
			}
		}
		handleKeyUp(e: KeyboardEvent) {
			if (this.inputAcceptedKeys.includes(e.code)) {
				this.inputKeysHeld[e.code] = false
			}
		}
		handleKeyDown(e: KeyboardEvent) {
			if (this.inputAcceptedKeys.includes(e.code)) {
				this.inputKeysHeld[e.code] = true
			}
		}
		handleHeldKeys() {
			const walkVelocity = 0.01
			if (this.inputKeysHeld['KeyW']) {
				this.playerVelocity.add(this.playerForward.clone().multiplyScalar(walkVelocity))
			}
			if (this.inputKeysHeld['KeyS']) {
				this.playerVelocity.sub(this.playerForward.clone().multiplyScalar(walkVelocity))
			}
			if (this.inputKeysHeld['KeyA']) {
				this.playerVelocity.sub(this.playerRight.clone().multiplyScalar(walkVelocity))
			}
			if (this.inputKeysHeld['KeyD']) {
				this.playerVelocity.add(this.playerRight.clone().multiplyScalar(walkVelocity))
			}
			if (this.inputKeysHeld['Space']) {
				this.playerVelocity.add(this.playerUp.clone().multiplyScalar(walkVelocity))
			}
			if (this.inputKeysHeld['ShiftLeft']) {
				this.playerVelocity.sub(this.playerUp.clone().multiplyScalar(walkVelocity))
			}
		}
		onWindowResize() {
			// Update the camera's aspect ratio and the renderer's size to reflect
			// the new screen dimensions upon a browser window resize.
			this.camera.aspect = window.innerWidth / window.innerHeight
			this.camera.updateProjectionMatrix()
			this.renderer.setSize(window.innerWidth, window.innerHeight)
		}

		async tick() {
			// update player
			{
				this.playerVelocity.set(0, 0, 0)
				this.handleHeldKeys()
				// recalculate forward
				// recalculate right
				this.camera.position.set(
					this.camera.position.x + this.playerVelocity.x,
					this.camera.position.y + this.playerVelocity.y,
					this.camera.position.z + this.playerVelocity.z
				)
			}
		}

		async render() {
			// region animate
			await this.renderer.render(this.scene, this.camera)
		}

		async gameLoop() {
			await this.tick()
			await this.render()
		}

		async init() {
			// region init
			await this.renderer.setAnimationLoop(this.gameLoop)
		}
	}

	let game: Game | null = null
	onMount(async () => {
		game = new Game()
		await game.init()
	})
</script>
