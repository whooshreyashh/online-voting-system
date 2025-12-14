import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [totalVotes, setTotalVotes] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [activeElections, setActiveElections] = useState(1); // adjust later if you store this

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const snap = await getDocs(collection(db, "candidates"));
        const data = snap.docs.map((d) => d.data());
        const sum = data.reduce((acc, c) => acc + (c.votes || 0), 0);
        setTotalVotes(sum);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 px-4 py-8 md:px-8 font-['Montserrat',sans-serif]">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Topbar / heading */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1 text-[11px] uppercase tracking-[0.2em] text-violet-200 w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Voter Dashboard
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Welcome to your{" "}
                <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                  voting space
                </span>
                .
              </h1>
              <p className="mt-1 text-sm text-slate-400 max-w-xl">
                View active elections, cast your vote, and check results from a
                single, secure dashboard.
              </p>
            </div>
          </div>

          {/* <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-medium text-rose-100 shadow-sm hover:bg-rose-500/20 hover:border-rose-400 transition"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            Logout / Switch account
          </button> */}
        </header>

        {/* Quick stats */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-violet-500/40 bg-gradient-to-br from-violet-600/40 via-slate-900 to-slate-950 p-4 shadow-lg shadow-violet-900/40">
            <p className="text-xs text-violet-100/80">Active elections</p>
            <p className="mt-2 text-2xl font-semibold">{activeElections}</p>
            <p className="mt-1 text-[11px] text-violet-100/70">
              Elections currently open for voting.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
            <p className="text-xs text-slate-400">Total votes cast</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-300">
              {loadingStats ? "…" : totalVotes}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Sum of all votes recorded for current candidates.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
            <p className="text-xs text-slate-400">Upcoming deadlines</p>
            <p className="mt-2 text-2xl font-semibold text-amber-300">Today</p>
            <p className="mt-1 text-[11px] text-slate-400">
              At least one election ends today. Do not miss it.
            </p>
          </div>
        </section>

        {/* Main actions */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-100">
              What would you like to do?
            </h2>
            <span className="text-[11px] text-slate-500">
              All actions are recorded securely, votes stay anonymous.
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Vote card */}
            <article className="group relative flex flex-col justify-between rounded-3xl border border-violet-500/40 bg-slate-900/80 px-4 py-4 shadow-md shadow-violet-900/40 hover:shadow-violet-700/60 hover:border-violet-400 transition">
              <div className="space-y-3">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-200">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 11.5 11.5 14l4-5M5 12.5v5.25A1.25 1.25 0 0 0 6.25 19h11.5A1.25 1.25 0 0 0 19 17.75V9.25A1.25 1.25 0 0 0 17.75 8h-4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-50">
                    Cast your vote
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    View ongoing elections and submit your ballot securely.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/vote")}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-violet-900/40 transition group-hover:from-violet-400 group-hover:to-indigo-400"
              >
                Go to voting page
              </button>
            </article>

            {/* Results card */}
            <article className="group relative flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/80 px-4 py-4 shadow-md hover:border-emerald-400/60 hover:shadow-emerald-800/40 transition">
              <div className="space-y-3">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-200">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 13.5 9 17l10-10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-50">
                    View results
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Check published election outcomes and your participation
                    history.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/results")}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-400/60 bg-emerald-500/15 px-4 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-400/25 transition"
              >
                Open results
              </button>
            </article>

            {/* Logout card */}
            <article className="group relative flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/80 px-4 py-4 shadow-md hover:border-rose-400/60 hover:shadow-rose-900/40 transition">
              <div className="space-y-3">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-200">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M10 7V5.75A1.75 1.75 0 0 1 11.75 4h6.5A1.75 1.75 0 0 1 20 5.75v12.5A1.75 1.75 0 0 1 18.25 20h-6.5A1.75 1.75 0 0 1 10 18.25V17"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M4 12h9m0 0-2.5-2.5M13 12 10.5 14.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-50">
                    Logout
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Safely sign out of your account or switch to a different
                    user.
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-rose-400/70 bg-rose-500/15 px-4 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-500/25 transition"
              >
                Logout
              </button>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
