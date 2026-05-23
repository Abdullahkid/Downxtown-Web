import { ShimmerCard } from '@/components/shared'

export default function StoreLoading() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-4">
        <div className="space-y-4">
          <ShimmerCard className="h-44 w-full rounded-[28px]" />
          <div className="flex items-start gap-4">
            <ShimmerCard className="h-24 w-24 rounded-[24px]" />
            <div className="flex-1 space-y-3 pt-2">
              <ShimmerCard width="38%" height={28} className="rounded-xl" />
              <ShimmerCard width="24%" height={18} className="rounded-lg" />
              <ShimmerCard width="68%" height={18} className="rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="space-y-2 rounded-2xl border border-gray-100 bg-white p-2.5">
                <ShimmerCard className="aspect-square w-full rounded-xl" />
                <ShimmerCard width="72%" height={14} className="rounded-lg" />
                <ShimmerCard width="48%" height={12} className="rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
