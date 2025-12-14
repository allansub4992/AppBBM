export default function PriceCardSkeleton() {
  return (
    <div className="brutalist-border brutalist-shadow bg-brutalist-charcoal p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 brutalist-border bg-brutalist-cream/20"></div>
          <div>
            <div className="h-8 w-24 bg-brutalist-cream/20 mb-2"></div>
            <div className="h-4 w-16 bg-brutalist-cream/10"></div>
          </div>
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <div className="h-12 w-32 bg-brutalist-cream/20"></div>
        <div className="h-6 w-8 bg-brutalist-cream/10"></div>
      </div>

      <div className="pt-4 border-t-2 border-brutalist-cream/20">
        <div className="h-3 w-24 bg-brutalist-cream/10"></div>
      </div>
    </div>
  );
}
