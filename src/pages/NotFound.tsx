export default function NotFound() {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-900 text-slate-100">
        <div className="text-center">
          <div className="text-6xl font-bold">404</div>
          <p className="mt-2 text-slate-400">Page not found</p>
          <a href="/dashboard" className="mt-4 inline-block rounded-md border border-slate-700 px-4 py-2 hover:bg-slate-800">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }
  