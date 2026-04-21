import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

export default function CustomersLoading() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
          <Users className="w-6 h-6 text-amber" />
          My Customers
        </h1>
        <Skeleton className="h-4 w-48 mt-1" />
      </div>

      <div className="mb-6 space-y-3">
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="flex gap-2 flex-wrap">
          {[16, 20, 24, 20, 16, 20, 24, 20, 16].map((w, i) => (
            <Skeleton key={i} className={`h-7 w-${w} rounded-full`} />
          ))}
        </div>
      </div>

      <Skeleton className="h-4 w-40 mb-4" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CustomerCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function CustomerCardSkeleton() {
  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          <div>
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <Skeleton className="h-3 w-20 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div>
          <Skeleton className="h-3 w-16 mb-1" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>

      <div className="flex gap-1 mb-3">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
    </div>
  );
}
