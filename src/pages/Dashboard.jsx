import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [totalVotes, setTotalVotes] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [activeElections, setActiveElections] = useState(1); // adjust later

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
    <div className="min-h-screen bg-slate-950 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 px-5 py-10 md:px-10 font-['Montserrat',sans-serif] animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Topbar / heading */}
        <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between animate-fade-in-up">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-500/10 px-5 py-1.5 text-[11px] uppercase tracking-[0.22em] text-violet-200 w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Voter Dashboard
            </div>
            <div className="space-y-1.5">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Welcome to your{" "}
                <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                  voting space
                </span>
                .
              </h1>
              <p className="text-sm md:text-base text-slate-400 max-w-xl">
                View active elections, cast your vote, and check results from a
                single, secure dashboard.
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/10 px-5 py-2.5 text-xs font-medium text-rose-100 shadow-sm hover:bg-rose-500/20 hover:border-rose-400 transition-all duration-200 hover:-translate-y-0.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            Logout / Switch account
          </button>
        </header>

        {/* Quick stats */}
        <section className="grid gap-5 md:grid-cols-3 animate-fade-in-up delay-100">
          <div className="rounded-3xl border border-violet-500/40 bg-gradient-to-br from-violet-600/45 via-slate-900 to-slate-950 px-5 py-5 shadow-lg shadow-violet-900/40 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-900/60">
            <p className="text-xs text-violet-100/80">Active elections</p>
            <p className="mt-3 text-3xl font-semibold">{activeElections}</p>
            <p className="mt-2 text-[11px] md:text-xs text-violet-100/70">
              Elections currently open for voting.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/75 px-5 py-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-900/40">
            <p className="text-xs text-slate-400">Total votes cast</p>
            <p className="mt-3 text-3xl font-semibold text-emerald-300">
              {loadingStats ? "…" : totalVotes}
            </p>
            <p className="mt-2 text-[11px] md:text-xs text-slate-400">
              Sum of all votes recorded for current candidates.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/75 px-5 py-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-900/40">
            <p className="text-xs text-slate-400">Upcoming deadlines</p>
            <p className="mt-3 text-3xl font-semibold text-amber-300">Today</p>
            <p className="mt-2 text-[11px] md:text-xs text-slate-400">
              At least one election ends today. Do not miss it.
            </p>
          </div>
        </section>

        {/* Main actions */}
        <section className="space-y-4 animate-fade-in-up delay-150">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <h2 className="text-sm md:text-base font-medium text-slate-100">
              What would you like to do?
            </h2>
            {/* <span className="text-[11px] text-slate-500">
              All actions are recorded securely, votes stay anonymous.
            </span> */}
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {/* Vote card */}
            <article className="group relative flex flex-col justify-between rounded-3xl border border-violet-500/40 bg-slate-900/80 px-5 py-5 shadow-md shadow-violet-900/40 animate-scale-in transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-900/60">
              <div className="space-y-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/25 text-violet-200">
                  <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none">
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
                  <h3 className="text-[15px] font-semibold text-slate-50">
                    Cast your vote
                  </h3>
                  <p className="mt-1.5 text-xs md:text-[13px] text-slate-400">
                    View ongoing elections and submit your ballot securely.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/vote")}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-2.5 text-xs font-semibold text-slate-950 shadow-md shadow-violet-900/40 transition-all duration-200 group-hover:from-violet-400 group-hover:to-indigo-400 group-hover:-translate-y-0.5"
              >
                Go to voting page
              </button>
            </article>

            {/* Results card */}
            <article className="group relative flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/80 px-5 py-5 shadow-md animate-scale-in delay-75 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-emerald-400/60 hover:shadow-xl hover:shadow-emerald-800/50">
              <div className="space-y-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-200">
                  <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none">
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
                  <h3 className="text-[15px] font-semibold text-slate-50">
                    View results
                  </h3>
                  <p className="mt-1.5 text-xs md:text-[13px] text-slate-400">
                    Check published election outcomes and your participation
                    history.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/results")}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-400/60 bg-emerald-500/15 px-5 py-2.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-400/25 transition-all duration-200 hover:-translate-y-0.5"
              >
                Open results
              </button>
            </article>

            {/* Logout card */}
            <article className="group relative flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/80 px-5 py-5 shadow-md animate-scale-in delay-100 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-rose-400/60 hover:shadow-xl hover:shadow-rose-900/50">
              <div className="space-y-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-200">
                  <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none">
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
                  <h3 className="text-[15px] font-semibold text-slate-50">
                    Logout
                  </h3>
                  <p className="mt-1.5 text-xs md:text-[13px] text-slate-400">
                    Safely sign out of your account or switch to a different
                    user.
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-rose-400/70 bg-rose-500/15 px-5 py-2.5 text-xs font-semibold text-rose-100 hover:bg-rose-500/25 transition-all duration-200 hover:-translate-y-0.5"
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
