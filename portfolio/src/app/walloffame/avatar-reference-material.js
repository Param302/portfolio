import * as THREE from "three";

// The image contains its own studio lighting. Preserve it exactly in the front
// view; add only a soft relative light change as the solid sculpture turns.
export function createReferenceMaterial(texture) {
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: texture },
      turnAmount: { value: 0 },
    },
    vertexShader: `
      varying vec2 referenceUV;
      varying vec3 surfaceNormal;
      varying vec3 referenceNormal;
      void main() {
        referenceUV = uv;
        surfaceNormal = normalize(mat3(modelMatrix) * normal);
        referenceNormal = normal;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform float turnAmount;
      varying vec2 referenceUV;
      varying vec3 surfaceNormal;
      varying vec3 referenceNormal;
      void main() {
        vec4 source = texture2D(map, referenceUV);
        if (source.a < 0.05) discard;
        vec3 light = normalize(vec3(-0.35, 0.5, 0.8));
        float current = 0.68 + 0.32 * max(0.0, dot(normalize(surfaceNormal), light));
        float original = 0.68 + 0.32 * max(0.0, dot(normalize(referenceNormal), light));
        float lighting = mix(1.0, clamp(current / original, 0.72, 1.16), turnAmount);
        gl_FragColor = vec4(source.rgb * lighting, 1.0);
        #include <colorspace_fragment>
      }
    `,
    toneMapped: false,
    side: THREE.DoubleSide,
  });
}
