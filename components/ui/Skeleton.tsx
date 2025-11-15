interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export function Skeleton({ className = "", width, height }: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded ${className}`}
      style={style}
    />
  );
}

// Country card skeleton (for country selection view)
export function CountryCardSkeleton() {
  return (
    <div className="flex flex-col items-center text-center bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/20 border-2 border-slate-200 shadow-md p-5 md:p-6 rounded-lg">
      {/* Flag */}
      <Skeleton className="w-16 h-16 md:w-20 md:h-20 mb-4 rounded-full" />
      
      {/* Country Name */}
      <Skeleton className="h-5 md:h-6 mb-1.5 w-24 md:w-32" />
      
      {/* Region */}
      <Skeleton className="h-3 md:h-4 w-16 md:w-20" />
    </div>
  );
}

// Plan card skeleton (for plan selection view)
export function PlanCardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Subtle accent bar */}
      <div className="h-1 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />

      <div className="p-7 flex flex-col flex-grow">
        {/* Price */}
        <div className="text-center mb-7">
          <Skeleton className="h-3 w-12 mx-auto mb-2" />
          <Skeleton className="h-9 w-32 mx-auto" />
        </div>

        {/* Data & Duration */}
        <div className="flex gap-4 mb-7">
          <div className="flex-1 text-center py-4 bg-slate-50 rounded-xl border border-slate-100">
            <Skeleton className="h-3 w-12 mx-auto mb-2" />
            <Skeleton className="h-6 w-16 mx-auto" />
          </div>
          <div className="flex-1 text-center py-4 bg-slate-50 rounded-xl border border-slate-100">
            <Skeleton className="h-3 w-16 mx-auto mb-2" />
            <Skeleton className="h-6 w-14 mx-auto" />
          </div>
        </div>

        {/* Features */}
        <div className="mb-7 flex-grow">
          <Skeleton className="h-4 w-24 mb-4" />
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Skeleton className="w-5 h-5 rounded-full mt-0.5 shrink-0" />
              <Skeleton className="h-4 flex-1" />
            </div>
            <div className="flex items-start gap-3">
              <Skeleton className="w-5 h-5 rounded-full mt-0.5 shrink-0" />
              <Skeleton className="h-4 flex-1" />
            </div>
            <div className="flex items-start gap-3">
              <Skeleton className="w-5 h-5 rounded-full mt-0.5 shrink-0" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        </div>

        {/* Button */}
        <Skeleton className="w-full h-12 rounded-xl mt-auto" />
      </div>
    </div>
  );
}

// Marketplace skeleton for country selection view
export function MarketplaceSkeleton() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-6">
        <Skeleton className="h-8 md:h-10 w-64 mb-2" />
        <Skeleton className="h-4 md:h-5 w-96 max-w-full" />
      </div>

      {/* Countries Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <CountryCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

// Marketplace skeleton for plan selection view (when country is selected)
export function MarketplacePlansSkeleton() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb Skeleton */}
      <div className="mb-4">
        <Skeleton className="h-5 w-32" />
      </div>

      {/* Country Header Skeleton */}
      <div className="text-center mb-8">
        <Skeleton className="h-12 md:h-16 w-64 mx-auto mb-2" />
        <Skeleton className="h-6 md:h-8 w-48 mx-auto mb-2" />
        <Skeleton className="h-5 w-40 mx-auto" />
      </div>

      {/* Filters Skeleton */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      {/* Plans Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, index) => (
          <PlanCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

