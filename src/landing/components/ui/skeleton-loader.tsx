/**
 * Skeleton Loader Components
 * Used as loading states for premium components
 */

import { cn } from "@/landing/lib/utils"

interface SkeletonProps {
    className?: string
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-white/5",
                className
            )}
        />
    )
}

export function GlobeSkeleton() {
    return (
        <div className="flex items-center justify-center w-full h-full min-h-[400px]">
            <div className="relative">
                <Skeleton className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-brand-cyan/50 text-sm">Loading globe...</div>
                </div>
            </div>
        </div>
    )
}

export function WaveSkeleton() {
    return (
        <div className="absolute inset-0 bg-gradient-to-b from-black via-brand-dark-gray to-black">
            <div className="absolute inset-0 opacity-20">
                <Skeleton className="w-full h-full" />
            </div>
        </div>
    )
}

export function CardsSkeleton() {
    return (
        <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    style={{
                        transform: `translateY(${i * 20}px) scale(${1 - i * 0.05})`,
                    }}
                >
                    <Skeleton className="w-full h-[200px] rounded-2xl" />
                </div>
            ))}
        </div>
    )
}


export default Skeleton

