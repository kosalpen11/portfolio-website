import { Cache, TextureLoader } from 'three';
import { DRACOLoader, GLTFLoader } from 'three-stdlib';

// Enable caching for all loaders
Cache.enabled = true;

const dracoLoader = new DRACOLoader();
const gltfLoader = new GLTFLoader();
dracoLoader.setDecoderPath('/draco/');
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * GLTF model loader configured with draco decoder
 */
export const modelLoader = gltfLoader;
export const textureLoader = new TextureLoader();

/**
 * Detect if WebGL is supported in the current environment
 */
export const isWebGLAvailable = () => {
  if (typeof window === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true }) ||
      canvas.getContext('experimental-webgl');

    if (!gl) return false;

    const loseContext = gl.getExtension('WEBGL_lose_context');
    loseContext?.loseContext();

    // If we could create a WebGL context the environment supports WebGL

    return true;
  } catch {
    return false;
  }
};

/**
 * Clean up a scene's materials and geometry
 */
export const cleanScene = scene => {
  scene?.traverse(object => {
    if (!object.isMesh) return;

    object.geometry.dispose();

    if (object.material.isMaterial) {
      cleanMaterial(object.material);
    } else {
      for (const material of object.material) {
        cleanMaterial(material);
      }
    }
  });
};

/**
 * Clean up and dispose of a material
 */
export const cleanMaterial = material => {
  material.dispose();

  for (const key of Object.keys(material)) {
    const value = material[key];
    if (value && typeof value === 'object' && 'minFilter' in value) {
      value.dispose();

      // Close GLTF bitmap textures
      value.source?.data?.close?.();
    }
  }
};

/**
 * Clean up and dispose of a renderer
 */
export const cleanRenderer = renderer => {
  if (!renderer) return;
  renderer.dispose();
  renderer.forceContextLoss?.();
  renderer = null;
};

/**
 * Clean up lights by removing them from their parent
 */
export const removeLights = lights => {
  for (const light of lights) {
    light.parent.remove(light);
  }
};

/**
 * Get child by name
 */
export const getChild = (name, object) => {
  let node;

  object.traverse(child => {
    if (child.name === name) {
      node = child;
    }
  });

  return node;
};
