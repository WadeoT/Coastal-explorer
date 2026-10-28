// Explicit imports keep the single-file distribution small and share the loader's Babylon instance.
export { Engine } from '@babylonjs/core/Engines/engine.js';
export { Scene } from '@babylonjs/core/scene.js';
export { FreeCamera } from '@babylonjs/core/Cameras/freeCamera.js';
export { Vector3, Matrix, Quaternion } from '@babylonjs/core/Maths/math.vector.js';
export { Color3, Color4 } from '@babylonjs/core/Maths/math.color.js';
export { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
export { Mesh } from '@babylonjs/core/Meshes/mesh.js';
export { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
export { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
export { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
export { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight.js';
export { DirectionalLight } from '@babylonjs/core/Lights/directionalLight.js';
export { Ray } from '@babylonjs/core/Culling/ray.js';
export { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData.js';
export { PerformanceConfigurator } from '@babylonjs/core/Engines/performanceConfigurator.js';
export { DracoCompression } from '@babylonjs/core/Meshes/Compression/dracoCompression.js';
export { TilesRenderer } from '3d-tiles-renderer/babylonjs';
export { GoogleCloudAuthPlugin } from '3d-tiles-renderer/core/plugins';
import '@babylonjs/core/Culling/ray.js';
import '@babylonjs/core/Rendering/edgesRenderer.js';
import '@babylonjs/core/Rendering/outlineRenderer.js';
import '@babylonjs/core/Materials/Textures/Loaders/ktxTextureLoader.js';

export {default as earcut} from "earcut";

export { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator.js";
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent.js";

export {decompressSync, strFromU8} from "fflate";
export { Viewport } from '@babylonjs/core/Maths/math.viewport.js';
export { SpotLight } from '@babylonjs/core/Lights/spotLight.js';
export { FresnelParameters } from '@babylonjs/core/Materials/fresnelParameters.js';
export { Layer } from '@babylonjs/core/Layers/layer.js';
