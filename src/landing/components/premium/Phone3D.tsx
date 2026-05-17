// @ts-nocheck — @react-three/fiber 8.x JSX types are incompatible with React 19's JSX namespace.
// The component works correctly at runtime; type errors are suppressed here.
"use client"

import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { useRef, useEffect, useState, Suspense } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'

// Register GSAP plugin
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
}

interface PhoneModelProps {
    mousePosition: { x: number; y: number }
}

function PhoneModel({ mousePosition }: PhoneModelProps) {
    const gltf = useLoader(GLTFLoader, '/landing/models/iphone.glb')
    const modelRef = useRef<THREE.Group>(null)
    const rotationRef = useRef({ y: 0, x: 0, z: 0 })

    useEffect(() => {
        if (modelRef.current && typeof window !== 'undefined') {
            // GSAP ScrollTrigger for smooth scroll-based rotation
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: '.hero-phone-container',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1,
                }
            })

            tl.to(rotationRef.current, {
                y: Math.PI * 2, // Full 360° rotation
            })

            // Subtle z-axis movement on scroll
            gsap.to(modelRef.current.position, {
                z: -1,
                scrollTrigger: {
                    trigger: '.hero-phone-container',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1,
                }
            })
        }
    }, [])

    useFrame((state) => {
        if (modelRef.current) {
            // Mouse movement rotation (parallax effect)
            const targetRotationY = mousePosition.x * 0.3
            const targetRotationX = -mousePosition.y * 0.2

            // Apply scroll rotation + mouse parallax
            modelRef.current.rotation.y = rotationRef.current.y + targetRotationY
            modelRef.current.rotation.x = targetRotationX

            // Subtle floating animation
            modelRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15
        }
    })

    return (
        <primitive
            ref={modelRef}
            object={gltf.scene}
            scale={2.2}
            position={[0, 0, 0]}
        />
    )
}

function LoadingPlaceholder() {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="relative">
                <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-brand-cyan"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs">
                    Loading...
                </div>
            </div>
        </div>
    )
}

export function Phone3D() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 2 - 1,
                y: (e.clientY / window.innerHeight) * 2 - 1
            })
        }

        window.addEventListener('mousemove', handleMouseMove)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
        }
    }, [])

    return (
        <div className="hero-phone-container h-full w-full relative">
            <Canvas
                camera={{ position: [0, 0, 5], fov: 50 }}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: 'high-performance'
                }}
            >
                {/* Premium lighting setup matching Downxtown brand */}
                <ambientLight intensity={0.4} />

                {/* Key light */}
                <spotLight
                    position={[10, 10, 10]}
                    angle={0.3}
                    penumbra={1}
                    intensity={1.5}
                    castShadow
                />

                {/* Fill light */}
                <pointLight position={[-10, 0, -10]} intensity={0.5} />

                {/* Rim light (cyan accent matching brand) */}
                <pointLight position={[0, 5, -5]} intensity={0.8} color="#00FFFF" />

                {/* Bottom light (subtle teal) */}
                <pointLight position={[0, -5, 0]} intensity={0.3} color="#008080" />

                <Suspense fallback={null}>
                    <PhoneModel mousePosition={mousePosition} />
                </Suspense>
            </Canvas>

            {/* Optional: Gradient overlay for premium feel */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/10" />
        </div>
    )
}

