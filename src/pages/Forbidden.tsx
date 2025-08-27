export default function Forbidden() {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-900 text-slate-100">
        <div className="text-center">
          <div className="text-6xl font-bold">403</div>
          <p className="mt-2 text-slate-400">You don't have access to this page.</p>
          <a href="/dashboard" className="mt-4 inline-block rounded-md border border-slate-700 px-4 py-2 hover:bg-slate-800">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }