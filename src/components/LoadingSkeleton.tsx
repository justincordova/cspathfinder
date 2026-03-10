import { cn } from "@/utils/cn";

interface LoadingSkeletonProps {
  className?: string;
}

export default function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return <div className={cn("animate-pulse bg-surface0 rounded", className)} aria-hidden="true" />;
}

export function SchoolCardSkeleton() {
  return (
    <div className="p-5 bg-mantle rounded-lg border border-surface0 space-y-3">
      <div className="flex items-start gap-4">
        <LoadingSkeleton className="w-12 h-12 rounded-lg shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <LoadingSkeleton className="w-8 h-4 rounded" />
            <LoadingSkeleton className="w-48 h-5 rounded" />
          </div>
          <LoadingSkeleton className="w-32 h-4 rounded" />
          <div className="flex gap-2 mt-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <LoadingSkeleton key={i} className="w-12 h-6 rounded" />
            ))}
          </div>
        </div>
        <div className="text-right space-y-2 shrink-0">
          <LoadingSkeleton className="w-24 h-4 rounded" />
          <LoadingSkeleton className="w-24 h-4 rounded" />
          <LoadingSkeleton className="w-20 h-4 rounded" />
        </div>
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="bg-surface0 px-3 py-2 rounded-lg">
      <div className="space-y-2">
        <LoadingSkeleton className="w-64 h-4 rounded" />
        <LoadingSkeleton className="w-48 h-4 rounded" />
        <LoadingSkeleton className="w-56 h-4 rounded" />
      </div>
    </div>
  );
}
