export default function Loading() {
  return (
    <div className="flex flex-col min-h-[60vh] items-center justify-center">
      <div
        role="status"
        aria-live="polite"
        className="size-4 animate-spin rounded-full border-2 border-surface1 border-t-overlay0"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
