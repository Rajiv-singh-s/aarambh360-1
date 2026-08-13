export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <div className="text-6xl font-extrabold text-indigo-500 mb-4">404</div>
      <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
      <p className="text-slate-400 max-w-md mb-6 text-sm">
        The administration module or resource you are looking for does not exist or has been moved.
      </p>
      <a
        href="/"
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition"
      >
        Return to Overview
      </a>
    </div>
  );
}
