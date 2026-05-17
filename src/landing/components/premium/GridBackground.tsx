"use client"

import { motion } from "framer-motion"

export function GridBackground() {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <motion.div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(10, 186, 181, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(10, 186, 181, 0.05) 1px, transparent 1px)
          `,
                    backgroundSize: '60px 60px',
                }}
                initial={{ opacity: 0.3 }}
                animate={{
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-ink via-transparent to-ink" />
        </div>
    )
}

