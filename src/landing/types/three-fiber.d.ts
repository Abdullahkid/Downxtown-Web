/// <reference types="@react-three/fiber" />

// Extend React JSX namespace for Three.js elements used by @react-three/fiber
// This is needed because React 19 changed the JSX namespace from JSX.IntrinsicElements
// to React.JSX.IntrinsicElements, and @react-three/fiber 8.x targets React 18.
import type { ThreeElements } from '@react-three/fiber'

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
