export default function SkeletonCard() {
  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 animate-pulse">
      <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
      <div className="h-6 bg-gray-300 rounded w-3/4"></div>
    </div>
  );
}