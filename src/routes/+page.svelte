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
		playerForwardDefault: THREE.Vector3
		playerUp: THREE.Vector3
		inputAcceptedKeys: string[]
		inputKeysHeld: any
		inputMouseDown: boolean
		playerPitch: number
		playerYaw: number
		input: any
		inputEventToListenerList: any
		raindropConstHeightGround: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		raindropConstGravity: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		raindropSpawnHeightAverage: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		raindropSpawnHeightVariance: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		raindropWidthAverage: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		raindropWidthVariance: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		raindropAngleOfAttackAverage: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		raindropAngleOfAttackVariance: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		raindropLengthAverage: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		raindropLengthVariance: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		raindropMassAverage: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		raindropMassVariance: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		waveletInnerRadiusOverTimeAverage: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		waveletInnerRadiusOverTimeVariance: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		waveletOuterRadiusOverTimeAverage: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		waveletOuterRadiusOverTimeVariance: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		waveletMaxLifetimeAverage: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		waveletMaxLifetimeVariance: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		raindropStruct: THREE.TSL.Struct
		waveletStruct: THREE.TSL.Struct
		waveletMinOpacityAverage: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		waveletMinOpacityVariance: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		waveletOpacityOverTimeAverage: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		waveletOpacityOverTimeVariance: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		raindropN: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		raindrops: THREE.TSL.ShaderNodeObject<THREE.StorageBufferNode>
		wavelets: THREE.TSL.ShaderNodeObject<THREE.StorageBufferNode>
		raindropEnabledN: THREE.TSL.ShaderNodeObject<THREE.UniformNode<any>>
		raindropsVerticesSBA: THREE.StorageBufferAttribute
		raindropsMeshGeometry: THREE.BufferGeometry<
			THREE.NormalBufferAttributes,
			THREE.BufferGeometryEventMap
		>
		raindropsMeshMaterial: THREE.MeshBasicMaterial
		raindropsMesh: THREE.Mesh
		planeW: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		planeH: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		initRaindrops: THREE.TSL.ShaderNodeObject<THREE.ComputeNode>

		constructor() {
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
			// add controls
			{
				// TODO can replace with logic for manipulating camera i've done it 1000 times
				// this.controls = new OrbitControls(this.camera, this.renderer.domElement)
				// this.controls.enabled = false
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
				this.planeW = uniform(1)
				this.planeH = uniform(1)
				const geometry = new THREE.PlaneGeometry(
					this.planeW.value,
					this.planeH.value,
					this.planeNVX.value,
					this.planeNVY.value
				)
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
				this.inputMouseDown = false

				// setup listeners
				{
					this.inputEventToListenerList = {
						resize: this.onWindowResize,
						keydown: this.handleKeyDown,
						keyup: this.handleKeyUp,
						mousedown: this.handleMouseDown,
						mouseup: this.handleMouseUp,
						mousemove: this.handleMouseMove
					}
					Object.entries(this.inputEventToListenerList).forEach(([v, k]) =>
						(window as any).addEventListener(v, k)
					)
				}
			}
			// ======================================================
			// =                                                    =
			// =                  INIT PLAYER                       =
			// =                                                    =
			// =                                                    =
			// ======================================================
			// region player
			{
				this.playerVelocity = new THREE.Vector3(0, 0, 0)
				this.playerForwardDefault = new THREE.Vector3(0, 1, 0)
				this.playerForward = new THREE.Vector3(0, 1, 0)
				this.playerRight = new THREE.Vector3(1, 0, 0)
				this.playerUp = new THREE.Vector3(0, 0, 1)
				this.playerPitch = 0
				this.playerYaw = 0
			}
			// ======================================================
			// =                                                    =
			// =                  INIT BUFFERS                      =
			// =                                                    =
			// =                                                    =
			// ======================================================
			this.raindropN = uniform(50)
			this.raindropEnabledN = uniform(this.raindropN.value)
			this.raindropConstHeightGround = uniform(0.0)
			this.raindropConstGravity = uniform(9.8)
			this.raindropSpawnHeightAverage = uniform(6) // low for debugging purposes
			this.raindropSpawnHeightVariance = uniform(3)

			this.raindropWidthAverage = uniform(0.01)
			this.raindropWidthVariance = uniform(0.05)
			this.raindropAngleOfAttackAverage = uniform(15) // in degrees
			this.raindropAngleOfAttackVariance = uniform(5)
			// the length might have to be modified with time as well but we'll see
			this.raindropLengthAverage = uniform(0.1) // in m
			this.raindropLengthVariance = uniform(0.08)
			this.raindropMassAverage = uniform(0.001) // in kg
			this.raindropMassVariance = uniform(0.0001)

			// TODO: need to have very fine grain control over the radius over time... the radius over time of the our radius must converge to less than the inner radius growth at some point

			this.waveletInnerRadiusOverTimeAverage = uniform(0.01) // in m / s
			this.waveletInnerRadiusOverTimeVariance = uniform(0.005) // can be a function of time, but this is currently not easily modifiable via the gui so will have to keep as const for now
			this.waveletOuterRadiusOverTimeAverage = uniform(0.02) // can be a function of time
			this.waveletOuterRadiusOverTimeVariance = uniform(0.01)
			this.waveletMaxLifetimeAverage = uniform(1) // in seconds
			this.waveletMaxLifetimeVariance = uniform(0.5)

			this.waveletMinOpacityAverage = uniform(0.3)
			this.waveletMinOpacityVariance = uniform(0.1)
			this.waveletOpacityOverTimeAverage = uniform(-0.1)
			this.waveletOpacityOverTimeVariance = uniform(0.05)

			this.raindropStruct = struct({
				position: { type: 'vec3' },
				velocity: { type: 'vec3' },
				width: 'float',
				length: 'float',
				angleOfAttack: 'float',
				mass: 'float'
			})

			this.waveletStruct = struct({
				position: { type: 'vec3' },
				innerRadius: 'float',
				innerRadiusGrowthRate: 'float',
				outerRadius: 'float',
				outerRadiusGrowthRate: 'float',
				lifetime: 'float',
				maxLifeTime: 'float',
				opacity: 'float',
				opacityGrowthRate: 'float'
			})

			this.raindrops = instancedArray(this.raindropN.value, this.raindropStruct)
			this.wavelets = instancedArray(this.raindropN.value, this.waveletStruct)
			// holds the geometry for the raindrop
			{
				this.raindropsVerticesSBA = new THREE.StorageBufferAttribute(this.raindropN.value * 4, 3)
				// initialize mesh indices
				const raindropsMeshIndices = new Uint32Array(this.raindropN.value * 6)
				// going to do it on cpu for now, could optimize this later
				for (let i = 0; i < this.raindropN.value; i++) {
					// HOMETOWNMD 1
					raindropsMeshIndices[i * 6] = i * 4
					raindropsMeshIndices[i * 6 + 1] = i * 4 + 1
					raindropsMeshIndices[i * 6 + 2] = i * 4 + 2
					raindropsMeshIndices[i * 6 + 3] = i * 4 + 1
					raindropsMeshIndices[i * 6 + 4] = i * 4 + 2
					raindropsMeshIndices[i * 6 + 5] = i * 4 + 3
				}
				const raindropsMeshIndicesSBA = new THREE.StorageBufferAttribute(raindropsMeshIndices, 1)

				this.raindropsMeshGeometry = new THREE.BufferGeometry()
				this.raindropsMeshGeometry.setAttribute('position', this.raindropsVerticesSBA)
				this.raindropsMeshGeometry.setIndex(raindropsMeshIndicesSBA)
				this.raindropsMeshMaterial = new THREE.MeshBasicMaterial()
				this.raindropsMeshMaterial.color = new THREE.Color(1, 1, 1)

				this.raindropsMesh = new THREE.Mesh(this.raindropsMeshGeometry, this.raindropsMeshMaterial)

				this.scene.add(this.raindropsMesh)

				const n1P1 = (seed: THREE.TSL.ShaderNodeObject<THREE.Node>) => {
					// converts [0, 1] to [-1, 1]
					return hash(seed).mul(2).sub(1)
				}

				// inside each raindrop's compute cell:
				//   update the 4 vertices associated with the raindrop
				//     specifically, this.raindropsVertices
				this.initRaindrops = Fn(() => {
					// by default, allocate ~20 random seeds for each and every
					// raindrop
					// after the initializer, time will act as a seed

					const baseSeedIndex = instanceIndex.mul(20)

					// determine position
					//   determine spawn height
					const z = this.raindropSpawnHeightAverage
					    .add(
						    n1P1(baseSeedIndex)
							.mul(this.raindropSpawnHeightVariance))

					//   determine x y position
					const x = this.planeW.mul(
						n1P1(baseSeedIndex.add(1)).div(2))
					const y = this.planeH.mul(
						n1P1(baseSeedIndex.add(2)).div(2))
					// determine angle of attack
					const theta = this.raindropAngleOfAttackAverage.add(
						this.raindropAngleOfAttackVariance.mul(
							n1P1(baseSeedIndex.add(3)).div(2))
					)
					// determine width
					const width = this.raindropWidthAverage.add(
						this.raindropWidthVariance.mul(
							n1P1(baseSeedIndex.add(4)).div(2))
					)
					// determine length
					const length = this.raindropLengthAverage.add(
						this.raindropLengthVariance.mul(
							n1P1(baseSeedIndex.add(5)).div(2))
					)
					// determine mass
					const mass = this.raindropMassAverage.add(
						this.raindropMassVariance.mul(
							n1P1(baseSeedIndex.add(6)).div(2))
					)

					const raindrop = this.raindrops.element(instanceIndex)
					raindrop.get('position')
						.assign(vec3(x, y, z))
					raindrop.get('velocity')
						.assign(0)
					raindrop.get('width')
						.assign(width)
					raindrop.get('length')
						.assign(length)
					raindrop.get('angleOfAttack')
					
					
				})().compute(this.raindropN.value)
			}
		}
		// ======================================================
		// =                                                    =
		// =                  HANDLER FUNCTIONS                 =
		// =                                                    =
		// =                                                    =
		// ======================================================
		// region handlers
		handleMouseUp = (e: MouseEvent) => {
			this.inputMouseDown = false
		}

		handleMouseDown = (e: MouseEvent) => {
			this.inputMouseDown = true
		}

		handleMouseMove = (e: MouseEvent) => {
			const pitchYawConversionFactor = 0.2
			if (this.inputMouseDown) {
				this.playerPitch = mClamp(
					this.playerPitch - e.movementY * pitchYawConversionFactor,
					-90,
					90
				)
				this.playerYaw = this.playerYaw - e.movementX * pitchYawConversionFactor
			}
		}

		handleKeyUp = (e: KeyboardEvent) => {
			if (this.inputAcceptedKeys.includes(e.code)) {
				this.inputKeysHeld[e.code] = false
			}
		}
		handleKeyDown = (e: KeyboardEvent) => {
			if (this.inputAcceptedKeys.includes(e.code)) {
				this.inputKeysHeld[e.code] = true
			}
		}
		handleHeldKeys = () => {
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
			// ======================================================
			// =                                                    =
			// =                CLEANUP HOT RELOAD                  =
			// =                                                    =
			// =                                                    =
			// ======================================================
			if (import.meta.hot) {
				import.meta.hot.dispose(() => {
					Object.entries(this.inputEventToListenerList).forEach(([v, k]) =>
						(window as any).removeEventListener(v, k)
					)
				})
			}
		}
		onWindowResize = () => {
			// Update the camera's aspect ratio and the renderer's size to reflect
			// the new screen dimensions upon a browser window resize.
			this.camera.aspect = window.innerWidth / window.innerHeight
			this.camera.updateProjectionMatrix()
			this.renderer.setSize(window.innerWidth, window.innerHeight)
		}
		// ======================================================
		// =                                                    =
		// =                  TICK                              =
		// =                                                    =
		// =                                                    =
		// ======================================================
		// region tick
		tick = async () => {
			// update player
			{
				// ================== [ COMPUTE CAM VECTORS ] ==================
				const eulerPitch = new THREE.Euler(mRadians(this.playerPitch), 0, 0)
				// keep in mind that this could change if player is picking
				// the right or the left
				const eulerYaw = new THREE.Euler(0, 0, mRadians(this.playerYaw))
				this.playerForward = this.playerForwardDefault.clone().applyEuler(eulerPitch)
				this.playerForward.applyEuler(eulerYaw)
				this.playerRight.crossVectors(this.playerForward, this.playerUp)
				this.camera.lookAt(this.camera.position.clone().add(this.playerForward))

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

		// ======================================================
		// =                                                    =
		// =                  render                            =
		// =                                                    =
		// =                                                    =
		// ======================================================
		// region render
		render = async () => {
			await this.renderer.render(this.scene, this.camera)
		}

		gameLoop = async () => {
			await this.tick()
			await this.render()
		}

		// ======================================================
		// =                                                    =
		// =                  init                              =
		// =                                                    =
		// =                                                    =
		// ======================================================
		init = async () => {
			await this.renderer.computeAsync(this.initRaindrops)

			// region init
			await this.renderer.setAnimationLoop(this.gameLoop)
		}
	}

	const mClamp = (n: number, a: number, b: number) => Math.min(Math.max(n, a), b)

	const mRadians = (deg: number) => (deg * Math.PI) / 180

	let game: Game | null = null
	onMount(async () => {
		game = new Game()
		await game.init()
	})
</script>
