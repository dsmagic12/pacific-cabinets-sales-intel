import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from "lucide-react";

export default function CatalogLoading() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-amber" />
          Product Catalog
        </h1>
        <Skeleton className="h-4 w-56 mt-1" />
      </div>

      <Skeleton className="h-10 w-full rounded-lg mb-4" />

      <div className="flex gap-2 flex-wrap mb-3">
        {[80, 60, 72, 100, 76].map((w, i) => (
          <Skeleton key={i} className="h-8 rounded-full" style={{ width: w }} />
        ))}
      </div>

      <div className="space-y-2 mb-5">
        <div className="flex gap-2 flex-wrap">
          {[64, 56, 76, 60, 72, 80, 68].map((w, i) => (
            <Skeleton key={i} className="h-7 rounded-full" style={{ width: w }} />
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {[64, 60, 72, 84, 100, 96].map((w, i) => (
            <Skeleton key={i} className="h-7 rounded-full" style={{ width: w }} />
          ))}
        </div>
      </div>

      <Skeleton className="h-4 w-48 mb-4" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-border rounded-xl p-5 flex flex-col">
      <div className="flex items-start gap-3 mb-3">
        <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-4 w-40 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full flex-shrink-0" />
      </div>

      <div className="flex gap-1 mb-3 flex-wrap">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>

      <div className="space-y-1.5 mb-3 flex-1">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>

      <div className="flex items-end justify-between pt-3 border-t border-border">
        <Skeleton className="h-3 w-24" />
        <div className="text-right">
          <Skeleton className="h-6 w-16 mb-1" />
          <Skeleton className="h-3 w-12 ml-auto" />
        </div>
      </div>
    </div>
  );
}
