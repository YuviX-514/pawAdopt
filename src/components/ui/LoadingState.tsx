export default function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-gray-50 px-4">
      <div className="flex flex-col items-center gap-3 text-gray-600">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
        <p className="text-sm font-medium">{label}</p>
      </div>
    </div>
  );
}
