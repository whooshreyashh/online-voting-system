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
        data.sort((a, b) => (b.votes || 0) - (a.votes || 0));
        setCandidates(data);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const totalVotes = candidates.reduce((sum, c) => sum + (c.votes || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 px-5 py-10 md:px-10 font-['Montserrat',sans-serif] animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between animate-fade-in-up">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-5 py-1.5 text-[11px] uppercase tracking-[0.22em] text-emerald-200 w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Results overview
            </div>
            <div className="space-y-1.5">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Live{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  voting results
                </span>
                .
              </h1>
              <p className="mt-1 text-sm md:text-base text-slate-400 max-w-xl">
                See how each candidate is performing. Numbers update as more
                votes are counted.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 px-5 py-4 text-xs text-slate-300 animate-fade-in-up delay-100">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Total votes recorded
            </p>
            <p className="mt-2 text-xl font-semibold">
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
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {candidates.map((candidate, index) => {
              const votes = candidate.votes || 0;
              const percentage =
                totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

              const isLeading = index === 0 && votes > 0;

              return (
                <article
                  key={candidate.id}
                  className="group relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-emerald-900/40 animate-fade-in-up transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_25px_80px_rgba(16,185,129,0.5)] hover:border-emerald-500/70"
                  style={{ animationDelay: `${70 * index}ms` }}
                >
                  {/* Top image section: banner style, slightly shifted up */}
                  <div className="relative h-40 sm:h-48 w-full overflow-hidden">
                    <img
                      src={candidate.imageUrl}
                      alt={candidate.name}
                      className="h-full w-full object-cover object-[50%_35%] transition-transform duration-700 ease-out group-hover:scale-105"
                      onError={(e) => {
                        e.target.src =
                          "https://ui-avatars.com/api/?background=064e3b&color=d1fae5&size=256&name=" +
                          encodeURIComponent(candidate.name || "Candidate");
                      }}
                    />

                    {/* Gradient overlay */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

                    {/* Circular avatar overlay */}
                    <div className="absolute -bottom-7 left-5 h-16 w-16 rounded-full border-2 border-slate-900 overflow-hidden shadow-lg shadow-slate-900/80 bg-slate-800">
                      <img
                        src={candidate.imageUrl}
                        alt={candidate.name}
                        className="h-full w-full object-cover object-[50%_35%]"
                        onError={(e) => {
                          e.target.src =
                            "https://ui-avatars.com/api/?background=10b981&color=ecfdf5&size=256&name=" +
                            encodeURIComponent(candidate.name || "Candidate");
                        }}
                      />
                    </div>

                    {/* Leading badge */}
                    {isLeading && (
                      <span className="absolute top-3 right-3 rounded-full bg-emerald-500 text-[10px] font-semibold uppercase tracking-widest px-3 py-1 text-slate-950 shadow-lg shadow-emerald-900/60">
                        Leading
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="pt-9 px-5 pb-5 space-y-4">
                    {/* Name + meta */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h2 className="text-base sm:text-lg font-semibold text-slate-50">
                          {candidate.name}
                        </h2>
                        {candidate.party && (
                          <p className="text-xs font-medium text-emerald-300 uppercase tracking-widest">
                            {candidate.party}
                          </p>
                        )}
                        {candidate.position && (
                          <p className="text-[11px] text-slate-400">
                            Contesting for{" "}
                            <span className="text-slate-200">
                              {candidate.position}
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Stats chip */}
                      <div className="rounded-2xl bg-slate-900/80 border border-slate-700 px-3 py-2 text-right">
                        <p className="text-sm font-semibold text-emerald-300">
                          {votes}
                          <span className="ml-1 text-[11px] text-slate-400 font-normal">
                            votes
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {percentage}% of total
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    {candidate.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-3">
                        {candidate.description}
                      </p>
                    )}

                    {/* Progress + mini stats */}
                    <div className="space-y-2">
                      <div className="h-2.5 w-full rounded-full bg-slate-800/90 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>
                          Share of votes:{" "}
                          <span className="text-slate-200">
                            {percentage}%
                          </span>
                        </span>
                        {totalVotes > 0 && (
                          <span>
                            {votes}/{totalVotes} total ballots
                          </span>
                        )}
                      </div>
                    </div>
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
