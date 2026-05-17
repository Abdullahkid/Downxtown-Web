"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import Image from "next/image"
import { useEffect, useState } from "react"

interface PhoneClusterProps {
    mainImage: string
    leftImage: string
    rightImage: string
}

export function PhoneCluster({ mainImage, leftImage, rightImage }: PhoneClusterProps) {
    const [hoveredPhone, setHoveredPhone] = useState<"left" | "right" | "center" | null>(null)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth) - 0.5
            const y = (e.clientY / window.innerHeight) - 0.5
            mouseX.set(x)
            mouseY.set(y)
        }
        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [mouseX, mouseY])

    const springConfig = { damping: 30, stiffness: 100, mass: 1 }
    const smoothX = useSpring(mouseX, springConfig)
    const smoothY = useSpring(mouseY, springConfig)

    const sideX = useTransform(smoothX, [-0.5, 0.5], [15, -15])
    const sideY = useTransform(smoothY, [-0.5, 0.5], [15, -15])

    const centerX = useTransform(smoothX, [-0.5, 0.5], [-20, 20])
    const centerY = useTransform(smoothY, [-0.5, 0.5], [-20, 20])

    const centerRotateX = useTransform(smoothY, [-0.5, 0.5], [8, -8])
    const centerRotateY = useTransform(smoothX, [-0.5, 0.5], [-8, 8])

    return (
        <div style={{ perspective: 1200 }} className="relative w-full max-w-[520px] h-[520px] flex items-end justify-center pointer-events-none">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue/15 blur-[80px] rounded-full z-0" />

            {/* Left Phone */}
            <motion.div
                className="absolute left-0 bottom-0 w-[175px] origin-bottom"
                style={{ zIndex: hoveredPhone === 'left' ? 40 : 10 }}
                initial={{ opacity: 0, x: 30, rotate: 0 }}
                animate={{ opacity: 1, x: 0, rotate: -9 }}
                transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
            >
                <motion.div
                    onMouseEnter={() => setHoveredPhone('left')}
                    onMouseLeave={() => setHoveredPhone(null)}
                    animate={{
                        x: hoveredPhone === 'left' ? 70 : 0,
                        y: hoveredPhone === 'left' ? -35 : 0,
                        rotate: hoveredPhone === 'left' ? 9 : 0, // counteract the parent's -9
                        scale: hoveredPhone === 'left' ? 1.25 : 1,
                        opacity: hoveredPhone === 'right' || hoveredPhone === 'center' ? 0.4 : 1,
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="pointer-events-auto cursor-pointer"
                >
                    <motion.div
                        style={{ x: sideX, y: sideY }}
                        className="rounded-[28px] overflow-hidden border-2 border-zinc-700 bg-black shadow-[0_30px_80px_rgba(0,0,0,0.8)] transition-colors duration-300 hover:border-blue/60"
                    >
                        <Image
                            src={leftImage}
                            alt="Store profile screen"
                            width={175}
                            height={378}
                            className="w-full h-auto opacity-85 hover:opacity-100 transition-opacity"
                            style={{ display: "block" }}
                        />
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* Right Phone */}
            <motion.div
                className="absolute right-0 bottom-0 w-[175px] origin-bottom"
                style={{ zIndex: hoveredPhone === 'right' ? 40 : 10 }}
                initial={{ opacity: 0, x: -30, rotate: 0 }}
                animate={{ opacity: 1, x: 0, rotate: 9 }}
                transition={{ duration: 1, delay: 1.0, ease: "easeOut" }}
            >
                <motion.div
                    onMouseEnter={() => setHoveredPhone('right')}
                    onMouseLeave={() => setHoveredPhone(null)}
                    animate={{
                        x: hoveredPhone === 'right' ? -70 : 0,
                        y: hoveredPhone === 'right' ? -35 : 0,
                        rotate: hoveredPhone === 'right' ? -9 : 0, // counteract the parent's +9
                        scale: hoveredPhone === 'right' ? 1.25 : 1,
                        opacity: hoveredPhone === 'left' || hoveredPhone === 'center' ? 0.4 : 1,
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="pointer-events-auto cursor-pointer"
                >
                    <motion.div
                        style={{ x: sideX, y: sideY }}
                        className="rounded-[28px] overflow-hidden border-2 border-zinc-700 bg-black shadow-[0_30px_80px_rgba(0,0,0,0.8)] transition-colors duration-300 hover:border-blue/60"
                    >
                        <Image
                            src={rightImage}
                            alt="Discovery feed screen"
                            width={175}
                            height={378}
                            className="w-full h-auto opacity-85 hover:opacity-100 transition-opacity"
                            style={{ display: "block" }}
                        />
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* Center Phone (Front, largest) */}
            <motion.div
                className="relative w-[215px] mb-2"
                style={{ zIndex: 20 }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.7, ease: "easeOut" }}
            >
                <motion.div
                    onMouseEnter={() => setHoveredPhone('center')}
                    onMouseLeave={() => setHoveredPhone(null)}
                    animate={{
                        y: hoveredPhone === 'left' || hoveredPhone === 'right' ? 30 : 0,
                        scale: hoveredPhone === 'left' || hoveredPhone === 'right' ? 0.9 : 1,
                        opacity: hoveredPhone === 'left' || hoveredPhone === 'right' ? 0.5 : 1,
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="pointer-events-auto cursor-pointer relative"
                >
                    <motion.div
                        style={{
                            x: centerX,
                            y: centerY,
                            rotateX: centerRotateX,
                            rotateY: centerRotateY
                        }}
                        className="rounded-[32px] overflow-hidden border-2 border-zinc-600 bg-black shadow-[0_50px_140px_rgba(0,0,0,0.9),0_0_80px_rgba(10,186,181,0.15)] transition-colors duration-300 hover:border-blue/60"
                    >
                        <Image
                            src={mainImage}
                            alt="Fashion feed screen"
                            width={215}
                            height={464}
                            className="w-full h-auto"
                            style={{ display: "block" }}
                            priority
                        />
                    </motion.div>
                    {/* Under-phone glow */}
                    <motion.div
                        style={{ x: centerX }}
                        className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[140px] h-[50px] bg-blue/25 blur-2xl rounded-full"
                    />
                </motion.div>
            </motion.div>
        </div>
    )
}

