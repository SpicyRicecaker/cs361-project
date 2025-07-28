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
		cameraProjectionMatrixInverse,
		cameraViewMatrix,
		color,
		cos,
		distance,
		float,
		Fn,
		hash,
		If,
		instancedArray,
		instanceIndex,
		int,
		ivec2,
		length,
		Loop,
		mat4,
		modelViewMatrix,
		modelViewPosition,
		modelWorldMatrix,
		modelWorldMatrixInverse,
		radians,
		rotate,
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
		vec2,
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
		raindropPitchAverage: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		raindropPitchVariance: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
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
		raindropsN: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
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
		raindropsInit: THREE.TSL.ShaderNodeObject<THREE.ComputeNode>
		raindropsComputeMeshGeometry: THREE.TSL.ShaderNodeObject<THREE.ComputeNode>
		raindropsMeshVertexNode: THREE.TSL.ShaderNodeObject<THREE.TSL.ShaderCallNodeInternal>
		rawGPUSushiPlate: Float32Array<ArrayBuffer>
		gpuSushiPlate: THREE.TSL.ShaderNodeObject<THREE.StorageBufferNode>
		debugRaindropsMaterial: THREE.SpriteNodeMaterial
		debugRaindropRadius: any
		debugRaindrops: THREE.Sprite<THREE.Object3DEventMap>
		cameraViewMatrix: THREE.TSL.ShaderNodeObject<THREE.UniformNode<THREE.Matrix4>>
		debugRaindrops2Material: THREE.SpriteNodeMaterial
		debugRaindrop2Radius: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		debugRaindrops2: THREE.Sprite<THREE.Object3DEventMap>
		cameraProjectionMatrix: THREE.TSL.ShaderNodeObject<THREE.UniformNode<THREE.Matrix4>>
		raindropsComputePhysics: THREE.TSL.ShaderNodeObject<THREE.ComputeNode>
		lastTimeStamp: number | null
		dtS: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		raindropSpeedHorizontalAverage: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		raindropSpeedHorizontalVariance: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		raindropSpeedVerticalAverage: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		raindropSpeedVerticalVariance: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		raindropYawAverage: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		raindropYawVariance: THREE.TSL.ShaderNodeObject<THREE.UniformNode<number>>
		raindropColor: THREE.TSL.ShaderNodeObject<THREE.UniformNode<THREE.Color>>
		rainColor: void
		playerProjectXY: THREE.Matrix3
		playerForwardXY: any
		raindropsGenerateFromCloud: (i: THREE.TSL.ShaderNodeObject<THREE.Node>) => void
		n1P1: any
		waveletsVerticesSBA: THREE.StorageBufferAttribute
		waveletsMeshGeometry: THREE.BufferGeometry<THREE.NormalBufferAttributes, THREE.BufferGeometryEventMap>
		waveletsMeshMaterial: THREE.MeshBasicMaterial
		waveletsMesh: THREE.Mesh<any, any, THREE.Object3DEventMap>
		waveletsGenerateFromRain: (i: THREE.TSL.ShaderNodeObject<THREE.Node>, t: any) => void

		constructor() {
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
				1000
			)
			this.camera.position.z = 1.8
			this.camera.up = new THREE.Vector3(0, 0, 1)
			this.camera.lookAt(0, 1, 1.8)
			// update camera
			// region camera
			this.cameraViewMatrix = uniform(this.camera.matrixWorldInverse)
			this.cameraProjectionMatrix = uniform(this.camera.projectionMatrix)

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

			// region scene
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
				this.playerProjectXY = new THREE.Matrix3(1, 0, 0, 0, 1, 0, 0, 0 ,0)
				this.playerForwardXY = this.playerForward.clone().applyMatrix3(this.playerProjectXY).normalize()
				this.playerRight = new THREE.Vector3(1, 0, 0)
				this.playerUp = new THREE.Vector3(0, 0, 1)
				this.playerPitch = -75
				this.playerYaw = 0
			}
			// ======================================================
			// =                                                    =
			// =                  INIT BUFFERS                      =
			// =                                                    =
			// =                                                    =
			// ======================================================
			this.raindropsN = uniform(50)
			this.raindropEnabledN = uniform(this.raindropsN.value)
			this.raindropConstHeightGround = uniform(0.0)
			this.raindropConstGravity = uniform(9.8)
			this.raindropSpawnHeightAverage = uniform(6) // low for debugging purposes
			this.raindropSpawnHeightVariance = uniform(3)
			this.raindropColor = uniform(new THREE.Color(0, 0, 1))

			this.raindropWidthAverage = uniform(0.001)
			this.raindropWidthVariance = uniform(0.0001)
			this.raindropPitchAverage = uniform(-90) // in degrees
			this.raindropPitchVariance = uniform(0)
			this.raindropYawAverage = uniform(180) // in degrees
			this.raindropYawVariance = uniform(2)
			// the length might have to be modified with time as well but we'll see
			this.raindropSpeedHorizontalAverage = uniform(0.1)
			this.raindropSpeedHorizontalVariance = uniform(0.05)
			this.raindropSpeedVerticalAverage = uniform(1.5)
			this.raindropSpeedVerticalVariance = uniform(0.05)

			this.raindropLengthAverage = uniform(0.3) // in m
			this.raindropLengthVariance = uniform(0.1)
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
				mass: 'float',
				generatedWavelet: 'uint'
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

			this.raindrops = instancedArray(this.raindropsN.value, this.raindropStruct)
			this.wavelets = instancedArray(this.raindropsN.value, this.waveletStruct)


			// ======================================================
			// =                                                    =
			// =                  RAINDROP STUFF                    =
			// =                                                    =
			// =                                                    =
			// ======================================================
			// holds the geometry for the raindrop
			{
				this.raindropsVerticesSBA = new THREE.StorageBufferAttribute(this.raindropsN.value * 4, 4)
				// initialize mesh indices
				const raindropsMeshIndices = new Uint32Array(this.raindropsN.value * 6)
				// going to do it on cpu for now, could optimize this later
				for (let i = 0; i < this.raindropsN.value; i++) {
					// HOMETOWNMD 1
					raindropsMeshIndices[i * 6] = i * 4
					raindropsMeshIndices[i * 6 + 1] = i * 4 + 1
					raindropsMeshIndices[i * 6 + 2] = i * 4 + 2
					raindropsMeshIndices[i * 6 + 3] = i * 4 + 1
					raindropsMeshIndices[i * 6 + 4] = i * 4 + 3
					raindropsMeshIndices[i * 6 + 5] = i * 4 + 2
				}
				const raindropsMeshIndicesSBA = new THREE.StorageBufferAttribute(raindropsMeshIndices, 1)

				this.raindropsMeshGeometry = new THREE.BufferGeometry()
				this.raindropsMeshGeometry.setAttribute('position', this.raindropsVerticesSBA)
				this.raindropsMeshGeometry.setIndex(raindropsMeshIndicesSBA)
				this.raindropsMeshMaterial = new THREE.MeshBasicMaterial()
				this.raindropsMeshMaterial.color = new THREE.Color(1, 1, 1)

				this.raindropsMesh = new THREE.Mesh(this.raindropsMeshGeometry, this.raindropsMeshMaterial)
				this.raindropsMesh.frustumCulled = false

				this.scene.add(this.raindropsMesh)

				this.n1P1 = (seed: THREE.TSL.ShaderNodeObject<THREE.Node>) => {
					// converts [0, 1] to [-1, 1]
					return hash(seed).mul(2).sub(1)
				}

				// inside each raindrop's compute cell:
				//   update the 4 vertices associated with the raindrop
				//     specifically, this.raindropsVertices

				// ======================================================
				// =                                                    =
				// =                  RAIN INITIALIZER                  =
				// =                                                    =
				// =                                                    =
				// ======================================================
				// region init raindrops 
				this.raindropsGenerateFromCloud = (i: THREE.TSL.ShaderNodeObject<THREE.Node>, t) => {
					// by default, allocate ~20 random seeds for each and every
					// raindrop
					// after the initializer, time will act as a seed

					const baseSeedIndex = i.add(int(float(100000).mul(t))).mul(20)

					// determine position
					//   determine spawn height
					const z = this.raindropSpawnHeightAverage
					    .add(
						    this.n1P1(baseSeedIndex)
							.mul(this.raindropSpawnHeightVariance))

					//   determine x y position
					const x = this.planeW.mul(
						this.n1P1(baseSeedIndex.add(1)).div(2))
					const y = this.planeH.mul(
						this.n1P1(baseSeedIndex.add(2)).div(2))

					// determine width
					const width = this.raindropWidthAverage.add(
						this.raindropWidthVariance.mul(
							this.n1P1(baseSeedIndex.add(3)))
					)
					// determine length
					const length = this.raindropLengthAverage.add(
						this.raindropLengthVariance.mul(
							this.n1P1(baseSeedIndex.add(4)))
					)
					// determine mass
					const mass = this.raindropMassAverage.add(
						this.raindropMassVariance.mul(
							this.n1P1(baseSeedIndex.add(5)))
					)

					// determine yaw
					const yaw = this.raindropYawAverage.add(
						this.raindropYawVariance.mul(
							this.n1P1(baseSeedIndex.add(6)))
					)

					// determine pitch
					const pitch = this.raindropPitchAverage.add(
						this.raindropPitchVariance.mul(
							this.n1P1(baseSeedIndex.add(7)))
						// 0
					)

					// determine horizontal speed
					const speedHorizontal = this.raindropSpeedHorizontalAverage.add(
						this.raindropSpeedHorizontalVariance.mul(
							this.n1P1(baseSeedIndex.add(8))
						)
					)

					// determine vertical speed
					const speedVertical = this.raindropSpeedVerticalAverage.add(
						this.raindropSpeedVerticalVariance.mul(
							this.n1P1(baseSeedIndex.add(9))
						)
					)

					// generate a velocity based off of pitch, yaw, horizontal,
					// and vertical velocity
					// const dir = rotate(
					// 		rotate(vec3(1, 0, 0), vec3(0, pitch, 0)), 
					// 		vec3(0, 0, yaw))
					// const vXY = dir.xy.mul(speedHorizontal)
					// const vZ = dir.z.mul(speedVertical).negate()
					// const velocity = vec3(vXY.x, vXY.y, vZ)

					const yawDir = rotate(vec2(1, 0), radians(yaw))
					const pitchDir = rotate(vec3(1, 0, 0), vec3(0, radians(pitch), 0))
					const vYaw = vec3(yawDir.mul(speedHorizontal), 0)
					const vPitch = pitchDir.mul(speedVertical)

					const velocity = vYaw.add(vPitch)

					const raindrop = this.raindrops.element(i)
					raindrop.get('position')
						.assign(vec3(x, y, z))
					raindrop.get('velocity')
						.assign(velocity)
					raindrop.get('width')
						.assign(width)
					raindrop.get('length')
						.assign(length)
					raindrop.get('mass')
						.assign(mass)
					raindrop.get('generatedWavelet')
						.assign(0)
				}

				this.raindropsInit = Fn(() => {
					this.raindropsGenerateFromCloud(instanceIndex, 0)
				})().compute(this.raindropsN.value)

				// ======================================================
				// =                                                    =
				// =                  RAIN MESH COMPUTE                 =
				// =                                                    =
				// =                                                    =
				// ======================================================

				// region rain mesh compute
				this.raindropsComputeMeshGeometry = Fn(() => {
					// // 0, 0, 1 
					// // vvv 
					// //  0 ----- 2 ^ 
					// //  |       | | 1 m
					// //  |       | |
					// //  1 ----- 3 v
					// // ^^^      ^^^
					// // 0,0,0    1,0,0

					// const raindropsVertices = storage(
					// 	this.raindropsVerticesSBA,
					// 	'vec4',
					// 	this.raindropsVerticesSBA.count);
					// raindropsVertices.element(0).assign(vec3(0, 0, 1))
					// raindropsVertices.element(1).assign(vec3(0, 0, 0))
					// raindropsVertices.element(2).assign(vec3(1, 0, 1))
					// raindropsVertices.element(3).assign(vec3(1, 0, 0))

					const raindrop = this.raindrops.element(instanceIndex)

					const pos = raindrop.get('position')
					// const cameraSpacePos = a.mul(cameraViewMatrix)
					// construct a 2d vector of length pointing to +x
					const length = raindrop.get('length')
					// const width = raindrop.get('width')
					const width = this.raindropWidthAverage
					const velocity = raindrop.get('velocity')

					const aPrev = pos
					const bPrev = pos.add(velocity.normalize().negate().mul(length))

					const a3D = vec4(aPrev, 1).mul(this.cameraViewMatrix.transpose())
					const b3D = vec4(bPrev, 1).mul(this.cameraViewMatrix.transpose())

					const a = a3D.xy
					const b = b3D.xy

					//     | <- b
					//    |
					//   |
					//  |
					// | <- a

					// 0 --- 2
					// |   / |
					// |  /  |
					// |/    |
					// 1 --- 3

					const left = vec2(-1, 0).mul(width)
					const right = vec2(1, 0).mul(width)
					// for the first coordinate
					//   push to the left (literally (-1, 0, 0)), multiply by width, and assign to 1
					//   push to the right (literally (-1, 0, 0)), multiply by width, and assign to 3
					const p1 = a.add(left)
					const p3 = a.add(right)
					

					// for the second coordinate
					//   push to the left (literally (-1, 0, 0)), multiply by width, and assign to 0
					//   push to the right (literally (-1, 0, 0)), multiply by width, and assign to 2
					const p0 = b.add(left)
					const p2 = b.add(right)

					const raindropsMeshGeometry = storage(
						this.raindropsVerticesSBA,
						'vec4',
						this.raindropsVerticesSBA.count);
					
					raindropsMeshGeometry
						.element(instanceIndex.mul(4).add(1))
						.assign(vec4(p1.x, p1.y, a3D.z, a3D.w))

					raindropsMeshGeometry
						.element(instanceIndex.mul(4).add(3))
						.assign(vec4(p3.x, p3.y, a3D.z, a3D.w))

					raindropsMeshGeometry
						.element(instanceIndex.mul(4).add(0))
						.assign(vec4(p0.x, p0.y, b3D.z, b3D.w))

					raindropsMeshGeometry
						.element(instanceIndex.mul(4).add(2))
						.assign(vec4(p2.x, p2.y, b3D.z, b3D.w))
					// 4 vertices per vertex index
				})().compute(this.raindropsN.value)

				// region raindrops vertex
				this.raindropsMeshVertexNode = Fn(() => {
					return vec4(positionGeometry, 1).mul(cameraProjectionMatrix.transpose())

					// return vec4(positionGeometry, 1).mul(this.cameraViewMatrix).mul(this.cameraProjectionMatrix)
					
					// mul(cameraProjectionMatrix)
					// return vec4(positionGeometry, 1)
				})()

				this.raindropsMeshMaterial.vertexNode = this.raindropsMeshVertexNode

				this.dtS = uniform(0)
				// region rain physics
				this.raindropsComputePhysics = Fn(({t = time}) => {
					const raindrop = this.raindrops.element(instanceIndex)
					const position = raindrop.get('position')
					const velocity = raindrop.get('velocity')
					const length = raindrop.get('length')
					const changeInPos = velocity.mul(this.dtS)

					const newPos = position.add(changeInPos)

					const generatedWavelet = raindrop.get('generatedWavelet')

					If (generatedWavelet.equal(0), () => {
						If(newPos.z.lessThanEqual(this.raindropConstHeightGround), () => {
							this.waveletsGenerateFromRain(instanceIndex, 0)
							generatedWavelet.assign(1)
						})
					})

					// the z component of length
					const lengthZ = velocity.normalize().mul(length).z
					
					If(newPos.z.lessThanEqual(this.raindropConstHeightGround.add(lengthZ)), () => {
						this.raindropsGenerateFromCloud(instanceIndex, t)
					}).Else(() => {
						position.assign(newPos)
					})

				})().compute(this.raindropsN.value)

				// region debug spheres
				// {
				// 	this.debugRaindropsMaterial = new THREE.SpriteNodeMaterial()
				// 	this.debugRaindropsMaterial.colorNode = color(0, 0, 0.7)
				// 	this.debugRaindropsMaterial.positionNode = Fn(() => {
				// 		// const raindropsMeshGeometry = storage(
				// 		// this.raindropsVerticesSBA,
				// 		// 'vec3',
				// 		// this.raindropsVerticesSBA.count)
				// 		// return raindropsMeshGeometry.element(instanceIndex)
				// 		// const raindropsMeshGeometry = 
				// 		// storage(
				// 		// this.raindropsVerticesSBA,
				// 		// 'vec3',
				// 		// this.raindropsVerticesSBA.count)
				// 		// raindropsMeshGeometry.element(instanceIndex)
						
				// 		return this.raindrops.element(instanceIndex).get('position')
				// 		// const a = new Float32Array(6)
				// 		// a[0] = 0
				// 		// a[1] = 0
				// 		// a[2] = 0
				// 		// a[3] = .2
				// 		// a[4] = 0
				// 		// a[5] = 0
				// 		// return instancedArray(a, 'vec3').toAttribute()
				// 	})()
				// 	// this.raindropsVerticesSBA
				// 	this.debugRaindropRadius = uniform(0.01)
				// 	this.debugRaindropsMaterial.scaleNode = this.debugRaindropRadius
				// 	// TODO I have no idea what this opacityNode does lol
				// 	this.debugRaindropsMaterial.opacityNode = shapeCircle()

				// 	this.debugRaindrops = new THREE.Sprite(this.debugRaindropsMaterial)
				// 	this.debugRaindrops.frustumCulled = false
				// 	this.debugRaindrops.count = this.raindropN.value
				// 	// this.debugRaindrops.count = 2
				// 	this.scene.add(this.debugRaindrops)
				// }
				// region debug spheres 2
				// {
				// 	this.debugRaindrops2Material = new THREE.SpriteNodeMaterial()
				// 	this.debugRaindrops2Material.colorNode = color(0, 0, 0.7)
				// 	this.debugRaindrops2Material.positionNode = Fn(() => {
				// 		const raindropsMeshGeometry = storage(
				// 		this.raindropsVerticesSBA,
				// 		'vec4',
				// 		this.raindropsVerticesSBA.count)
				// 		return vec3(
				// 			raindropsMeshGeometry.element(instanceIndex).x,
				// 			0,
				// 			raindropsMeshGeometry.element(instanceIndex).y
				// 		)

				// 		// const a = new Float32Array(6)
				// 		// a[0] = 0
				// 		// a[1] = 0
				// 		// a[2] = 0
				// 		// a[3] = .2
				// 		// a[4] = 0
				// 		// a[5] = 0
				// 		// return instancedArray(a, 'vec3').toAttribute()
				// 	})()
				// 	// this.raindropsVerticesSBA
				// 	this.debugRaindrop2Radius = uniform(0.01)
				// 	this.debugRaindrops2Material.scaleNode = this.debugRaindropRadius
				// 	// TODO I have no idea what this opacityNode does lol
				// 	this.debugRaindrops2Material.opacityNode = shapeCircle()

				// 	this.debugRaindrops2 = new THREE.Sprite(this.debugRaindrops2Material)
				// 	this.debugRaindrops2.frustumCulled = false
				// 	this.debugRaindrops2.count = this.raindropN.value
				// 	// this.debugRaindrops.count = 2
				// 	this.scene.add(this.debugRaindrops2)
				// }
			}
			// region wavelets
			// ======================================================
			// =                                                    =
			// =                  CREATE WAVELETS                   =
			// =                                                    =
			// =                                                    =
			// ======================================================
			{
				this.waveletsVerticesSBA = new THREE.StorageBufferAttribute(this.raindropsN.value * 4, 4)
				// initialize mesh indices
				const waveletMeshIndices = new Uint32Array(this.raindropsN.value * 6)
				// going to do it on cpu for now, could optimize this later
				for (let i = 0; i < this.raindropsN.value; i++) {
					// HOMETOWNMD 1
					waveletMeshIndices[i * 6] = i * 4
					waveletMeshIndices[i * 6 + 1] = i * 4 + 1
					waveletMeshIndices[i * 6 + 2] = i * 4 + 2
					waveletMeshIndices[i * 6 + 3] = i * 4 + 1
					waveletMeshIndices[i * 6 + 4] = i * 4 + 3
					waveletMeshIndices[i * 6 + 5] = i * 4 + 2
				}
				const waveletMeshIndicesSBA = new THREE.StorageBufferAttribute(waveletMeshIndices, 1)

				// initialize the ids
				const waveletIDs = new Uint32Array(this.raindropsN.value * 4)
				for (let i = 0; i < this.raindropsN.value; i++) {
					waveletIDs[i * 4    ] = i
					waveletIDs[i * 4 + 1] = i
					waveletIDs[i * 4 + 2] = i
					waveletIDs[i * 4 + 3] = i
				}
				const waveletIDsBA = new THREE.BufferAttribute(waveletIDs, 1)

				this.waveletsMeshGeometry = new THREE.BufferGeometry()
				this.waveletsMeshGeometry.setAttribute('position', this.waveletsVerticesSBA)
				this.waveletsMeshGeometry.setAttribute('waveletID', waveletIDsBA)
				this.waveletsMeshGeometry.setIndex(waveletMeshIndicesSBA)

				this.waveletsMeshMaterial = new THREE.MeshBasicMaterial()
				this.waveletsMeshMaterial.color = new THREE.Color(1, 1, 1)

				this.waveletsMesh = new THREE.Mesh(this.waveletsMeshGeometry, this.waveletsMeshMaterial)
				this.waveletsMesh.frustumCulled = false

				this.scene.add(this.waveletsMesh)

				// inside each raindrop's compute cell:
				//   update the 4 vertices associated with the raindrop
				//     specifically, this.raindropsVertices

				// ======================================================
				// =                                                    =
				// =                  RAIN INITIALIZER                  =
				// =                                                    =
				// =                                                    =
				// ======================================================
				// region init raindrops 
				this.waveletsGenerateFromRain = (i: THREE.TSL.ShaderNodeObject<THREE.Node>, t) => {
					// by default, allocate ~20 random seeds for each and every
					const baseSeedIndex = i.add(int(float(100000).mul(t))).mul(20)

					const raindrop = this.raindrops.element(i)

					const innerRadiusGrowthRate = this.waveletInnerRadiusOverTimeAverage.add(
						this.waveletInnerRadiusOverTimeVariance.mul(
							this.n1P1(baseSeedIndex.add(0)))
					)

					const outerRadiusGrowthRate = this.waveletOuterRadiusOverTimeAverage.add(
						this.waveletOuterRadiusOverTimeVariance.mul(
							this.n1P1(baseSeedIndex.add(1)))
					)

					const maxLifeTime = this.waveletMaxLifetimeAverage.add(
						this.waveletMaxLifetimeVariance.mul(
							this.n1P1(baseSeedIndex.add(2)))
					)

					const minOpacity = this.waveletMinOpacityAverage.add(
						this.waveletMinOpacityVariance.mul(
							this.n1P1(baseSeedIndex.add(3)))
					)

					const opacityGrowthRate = this.waveletOpacityOverTimeAverage.add(
						this.waveletOpacityOverTimeVariance.mul(
							this.n1P1(baseSeedIndex.add(4)))
					)

					const pos = raindrop.get('position')

					const wavelet = this.wavelets.element(i)
					wavelet.get('position')
						.assign(pos)
					wavelet.get('innerRadius')
						.assign(0)
					wavelet.get('innerRadiusGrowthRate')
						.assign(innerRadiusGrowthRate)
					wavelet.get('outerRadius')
						.assign(0)
					wavelet.get('outerRadiusGrowthRate')
						.assign(outerRadiusGrowthRate)
					wavelet.get('lifetime')
						.assign(0)
					wavelet.get('maxLifeTime')
						.assign(maxLifeTime)
					wavelet.get('opacity')
						.assign(minOpacity)
					wavelet.get('opacityGrowthRate')
						.assign(opacityGrowthRate)

					// ======================================================
					// =                                                    =
					// =                  WAVELETS MESH COMPUTE             =
					// =                                                    =
					// =                                                    =
					// ======================================================
					{
						// 0 --- 2
						// |   / |
						// |  c  |
						// |/    |
						// 1 --- 3

						// create a 0.5x0.5 wavelet puddle centered around the wavelet
						// lift the quad above the plane to make sure it's visible
						const c = vec3(pos.x, pos.y, 0.01)

						// could make these uniforms later
						const w = 0.5
						const dw = vec3(0.05, 0, 0)
						const h = 0.5
						const dh = vec3(0, 0.05, 0)

						const p0 = c
									.sub(dw)
									.add(dh)

						const p1 = c
									.sub(dw)
									.sub(dh)

						const p2 = c
									.add(dw)
									.add(dh)

						const p3 = c
									.add(dw)
									.sub(dh)

						const waveletsMeshGeometry = storage(
							this.waveletsVerticesSBA,
							'vec3',
							this.waveletsVerticesSBA.count);

						waveletsMeshGeometry
							.element(instanceIndex.mul(4).add(0))
							.assign(p0)

						waveletsMeshGeometry
							.element(instanceIndex.mul(4).add(1))
							.assign(p1)

						waveletsMeshGeometry
							.element(instanceIndex.mul(4).add(2))
							.assign(p2)

						waveletsMeshGeometry
							.element(instanceIndex.mul(4).add(3))
							.assign(p3)
					}
				}

				// // region raindrops vertex
				// this.raindropsMeshVertexNode = Fn(() => {
				// 	return vec4(positionGeometry, 1).mul(cameraProjectionMatrix.transpose())
					

				// 	// return vec4(positionGeometry, 1).mul(this.cameraViewMatrix).mul(this.cameraProjectionMatrix)
					
				// 	// mul(cameraProjectionMatrix)
				// 	// return vec4(positionGeometry, 1)
				// })()

				// this.raindropsMeshMaterial.vertexNode = this.raindropsMeshVertexNode

				// region rain physics
				this.waveletsComputePhysics = Fn(({t = time}) => {
				})().compute(this.raindropsN.value)

				// region debug spheres
				// {
				// 	this.debugRaindropsMaterial = new THREE.SpriteNodeMaterial()
				// 	this.debugRaindropsMaterial.colorNode = color(0, 0, 0.7)
				// 	this.debugRaindropsMaterial.positionNode = Fn(() => {
				// 		// const raindropsMeshGeometry = storage(
				// 		// this.raindropsVerticesSBA,
				// 		// 'vec3',
				// 		// this.raindropsVerticesSBA.count)
				// 		// return raindropsMeshGeometry.element(instanceIndex)
				// 		// const raindropsMeshGeometry = 
				// 		// storage(
				// 		// this.raindropsVerticesSBA,
				// 		// 'vec3',
				// 		// this.raindropsVerticesSBA.count)
				// 		// raindropsMeshGeometry.element(instanceIndex)
						
				// 		return this.raindrops.element(instanceIndex).get('position')
				// 		// const a = new Float32Array(6)
				// 		// a[0] = 0
				// 		// a[1] = 0
				// 		// a[2] = 0
				// 		// a[3] = .2
				// 		// a[4] = 0
				// 		// a[5] = 0
				// 		// return instancedArray(a, 'vec3').toAttribute()
				// 	})()
				// 	// this.raindropsVerticesSBA
				// 	this.debugRaindropRadius = uniform(0.01)
				// 	this.debugRaindropsMaterial.scaleNode = this.debugRaindropRadius
				// 	// TODO I have no idea what this opacityNode does lol
				// 	this.debugRaindropsMaterial.opacityNode = shapeCircle()

				// 	this.debugRaindrops = new THREE.Sprite(this.debugRaindropsMaterial)
				// 	this.debugRaindrops.frustumCulled = false
				// 	this.debugRaindrops.count = this.raindropN.value
				// 	// this.debugRaindrops.count = 2
				// 	this.scene.add(this.debugRaindrops)
				// }
				// region debug spheres 2
				// {
				// 	this.debugRaindrops2Material = new THREE.SpriteNodeMaterial()
				// 	this.debugRaindrops2Material.colorNode = color(0, 0, 0.7)
				// 	this.debugRaindrops2Material.positionNode = Fn(() => {
				// 		const raindropsMeshGeometry = storage(
				// 		this.raindropsVerticesSBA,
				// 		'vec4',
				// 		this.raindropsVerticesSBA.count)
				// 		return vec3(
				// 			raindropsMeshGeometry.element(instanceIndex).x,
				// 			0,
				// 			raindropsMeshGeometry.element(instanceIndex).y
				// 		)

				// 		// const a = new Float32Array(6)
				// 		// a[0] = 0
				// 		// a[1] = 0
				// 		// a[2] = 0
				// 		// a[3] = .2
				// 		// a[4] = 0
				// 		// a[5] = 0
				// 		// return instancedArray(a, 'vec3').toAttribute()
				// 	})()
				// 	// this.raindropsVerticesSBA
				// 	this.debugRaindrop2Radius = uniform(0.01)
				// 	this.debugRaindrops2Material.scaleNode = this.debugRaindropRadius
				// 	// TODO I have no idea what this opacityNode does lol
				// 	this.debugRaindrops2Material.opacityNode = shapeCircle()

				// 	this.debugRaindrops2 = new THREE.Sprite(this.debugRaindrops2Material)
				// 	this.debugRaindrops2.frustumCulled = false
				// 	this.debugRaindrops2.count = this.raindropN.value
				// 	// this.debugRaindrops.count = 2
				// 	this.scene.add(this.debugRaindrops2)
				// }
			}

			// region gui
			// ======================================================
			// =                                                    =
			// =                  CREATE GUI                        =
			// =                                                    =
			// =                                                    =
			// ======================================================
			this.gui = new GUI()
			this.ticks = 0
			this.gui.add(this, 'ticks').listen()
			this.gui.add(this.raindropWidthAverage, 'value', 0, 0.01, 0.001)

			// region gpu
			this.rawGPUSushiPlate = null
			this.gpuSushiPlate = instancedArray(3, 'vec3')
			this.initGPUSushiPlate = Fn(() => {
				this.gpuSushiPlate.element(instanceIndex).assign(vec3(0, 0, 0))
			})().compute(3)
			this.updateGPUSushiPlate = Fn(() => {
				this.gpuSushiPlate.element(0).assign(this.raindrops.element(0).get('position'))
			})().compute(1)
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
					-89.99,
					89.99
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
				this.playerVelocity.add(this.playerForwardXY.clone().multiplyScalar(walkVelocity))
			}
			if (this.inputKeysHeld['KeyS']) {
				this.playerVelocity.sub(this.playerForwardXY.clone().multiplyScalar(walkVelocity))
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
					this.renderer.setAnimationLoop(() => {})
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
		tick = async (dtMs: number) => {
			// update uniform
			this.dtS.value = dtMs / 1000

			// update player
			{
				// ================== [ COMPUTE CAM VECTORS ] ==================
				const eulerPitch = new THREE.Euler(mRadians(this.playerPitch), 0, 0)
				// keep in mind that this could change if player is picking
				// the right or the left
				const eulerYaw = new THREE.Euler(0, 0, mRadians(this.playerYaw))
				this.playerForward = this.playerForwardDefault.clone().applyEuler(eulerPitch)
				this.playerForward.applyEuler(eulerYaw)
				this.playerRight.crossVectors(this.playerForward, this.playerUp).normalize()
				this.playerForwardXY = this.playerForward.clone().applyMatrix3(this.playerProjectXY).normalize()
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
			// update physics
			await this.renderer.computeAsync(this.raindropsComputePhysics)
			// update camera projections
			this.cameraViewMatrix.value = this.camera.matrixWorldInverse
			this.cameraProjectionMatrix.value = this.camera.projectionMatrix
			// update the raindropsMeshGeometry
			await this.renderer.computeAsync(this.raindropsComputeMeshGeometry)

			// await this.renderer.computeAsync(this.updateGPUSushiPlate)

			// // inside animate, update gpuSushiPlate -> rawGPUSushiPlate
			// {
			// 	// run the async buffer update code
			// 	this.rawGPUSushiPlate = new Float32Array(
			// 		await this.renderer.getArrayBufferAsync(this.gpuSushiPlate.value)
			// 	)
			// 	console.log(this.rawGPUSushiPlate)
			// }
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

		gameLoop = async (time: DOMHighResTimeStamp) => {
			if (!this.lastTimeStamp) {
				this.lastTimeStamp = time
			}
			const dtMs = time - this.lastTimeStamp
			this.lastTimeStamp = time
			await this.tick(dtMs)
			await this.render()
		}

		// ======================================================
		// =                                                    =
		// =                  init                              =
		// =                                                    =
		// =                                                    =
		// ======================================================
		init = async () => {
			await this.renderer.computeAsync(this.raindropsInit)

			await this.renderer.computeAsync(this.initGPUSushiPlate)

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
