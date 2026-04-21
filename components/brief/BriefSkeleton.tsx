import { Skeleton } from "@/components/ui/skeleton";

export default function BriefSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-48" />
      </div>
      {[
        "Executive Summary",
        "Key Talking Points",
        "Recent Activity",
        "Products to Mention",
      ].map((label) => (
        <div key={label} className="border border-border rounded-lg p-4 bg-white">
          <Skeleton className="h-5 w-40 mb-3" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/6" />
          </div>
        </div>
      ))}
    </div>
  );
}
