/**
 * Wave Shader
 * Custom GLSL shaders for animated wave effect
 */

export const vertexShader = `
  uniform float uTime;
  uniform float uAmplitude;
  uniform float uFrequency;
  
  varying vec2 vUv;
  varying float vElevation;
  
  void main() {
    vUv = uv;
    
    vec3 pos = position;
    
    // Create wave pattern using sine and cosine
    float wave1 = sin(pos.x * uFrequency + uTime * 0.5) * cos(pos.y * uFrequency + uTime * 0.3);
    float wave2 = cos(pos.x * uFrequency * 0.7 - uTime * 0.4) * sin(pos.y * uFrequency * 0.8 + uTime * 0.6);
    
    // Combine waves
    float elevation = (wave1 + wave2) * uAmplitude;
    pos.z += elevation;
    
    vElevation = elevation;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

export const fragmentShader = `
  uniform vec3 uColorPrimary;
  uniform vec3 uColorSecondary;
  uniform float uTime;
  
  varying vec2 vUv;
  varying float vElevation;
  
  void main() {
    // Create gradient based on elevation and position
    float mixStrength = (vElevation + 1.0) * 0.5;
    mixStrength += sin(vUv.x * 3.0 + uTime * 0.2) * 0.1;
    mixStrength += cos(vUv.y * 3.0 - uTime * 0.15) * 0.1;
    mixStrength = clamp(mixStrength, 0.0, 1.0);
    
    vec3 color = mix(uColorPrimary, uColorSecondary, mixStrength);
    
    // Add subtle glow effect
    float glow = pow(1.0 - abs(vElevation), 2.0) * 0.3;
    color += vec3(glow * 0.1, glow * 0.5, glow * 0.5);
    
    gl_FragColor = vec4(color, 0.8);
  }
`

