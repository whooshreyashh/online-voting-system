import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function Results() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const snapshot = await getDocs(collection(db, "candidates"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // sort by votes descending
        data.sort((a, b) => (b.votes || 0) - (a.votes || 0));
        setCandidates(data);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const totalVotes = candidates.reduce(
    (sum, c) => sum + (c.votes || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-950 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 px-4 py-8 md:px-8 font-['Montserrat',sans-serif]">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-200 w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Results overview
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Live{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  voting results
                </span>
                .
              </h1>
              <p className="mt-1 text-sm text-slate-400 max-w-xl">
                See how each candidate is performing. Numbers update as more
                votes are counted.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-xs text-slate-300">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Total votes recorded
            </p>
            <p className="mt-1 text-lg font-semibold">
              {totalVotes}
              <span className="ml-1 text-xs font-normal text-slate-400">
                votes
              </span>
            </p>
          </div>
        </header>

        {/* Loading / empty states */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="inline-flex items-center gap-3 rounded-full border border-emerald-500/40 bg-slate-900/80 px-5 py-2 text-xs text-slate-200">
              <span className="h-4 w-4 rounded-full border-2 border-emerald-400/70 border-t-transparent animate-spin" />
              Loading results...
            </div>
          </div>
        ) : candidates.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 px-6 py-10 text-center text-sm text-slate-400">
            No candidates found. Results will appear here once voting starts.
          </div>
        ) : (
          <section className="space-y-4">
  {candidates.map((candidate, index) => {
    const votes = candidate.votes || 0;
    const percentage =
      totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

    const isLeading = index === 0 && votes > 0;

    return (
      <article
        key={candidate.id}
        className="group rounded-3xl border border-slate-800 bg-slate-900/80 px-4 py-4 shadow-md transition hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-900/40"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Image + Info */}
          <div className="flex items-start gap-3">
            {/* Candidate Image */}
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-slate-700 bg-slate-800">
              <img
                src={candidate.imageUrl}
                alt={candidate.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://ui-avatars.com/api/?background=064e3b&color=d1fae5&name=" +
                    encodeURIComponent(candidate.name);
                }}
              />
            </div>

            {/* Name, Party, Description */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-50">
                  {candidate.name}
                </h2>
                {isLeading && (
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-200 border border-emerald-400/60">
                    Leading
                  </span>
                )}
              </div>

              <p className="text-xs text-emerald-300">
                {candidate.party}
              </p>

              {candidate.description && (
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {candidate.description}
                </p>
              )}
            </div>
          </div>

          {/* Right: Votes & Percentage */}
          <div className="text-right space-y-1">
            <p className="text-lg font-semibold text-emerald-300">
              {votes}
              <span className="ml-1 text-xs text-slate-400 font-normal">
                votes
              </span>
            </p>
            <p className="text-[11px] text-slate-400">
              {percentage}% of total
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </article>
    );
  })}
</section>
        )}
      </div>
    </div>
  );
}
