import { ShimmerCard } from '@/components/shared'

export default function ProductLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-5">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          <div className="space-y-3">
            <ShimmerCard className="aspect-square w-full rounded-[28px]" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }, (_, index) => (
                <ShimmerCard key={index} className="aspect-square w-full rounded-2xl" />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <ShimmerCard width="22%" height={14} className="rounded-full" />
            <ShimmerCard width="82%" height={34} className="rounded-xl" />
            <ShimmerCard width="64%" height={34} className="rounded-xl" />
            <div className="flex items-center gap-3 pt-2">
              <ShimmerCard width={120} height={34} className="rounded-xl" />
              <ShimmerCard width={88} height={20} className="rounded-lg" />
            </div>
            <ShimmerCard width="100%" height={54} className="rounded-2xl" />
            <ShimmerCard width="100%" height={54} className="rounded-2xl" />
            <ShimmerCard width="100%" height={120} className="rounded-[24px]" />
          </div>
        </div>
      </div>
    </main>
  )
}
