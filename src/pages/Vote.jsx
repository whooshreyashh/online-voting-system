import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

export default function Vote() {
  const [candidates, setCandidates] = useState([]);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [message, setMessage] = useState("");
  const [electionId, setElectionId] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const candSnap = await getDocs(collection(db, "candidates"));
        setCandidates(candSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        const settingsSnap = await getDoc(doc(db, "settings", "voting"));
        if (settingsSnap.exists()) {
          setEnabled(settingsSnap.data().enabled);
          setElectionId(settingsSnap.data().electionId);
        }
      } catch (e) {
        setMessage("Failed to load voting data. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const totalVotes = candidates.reduce(
    (sum, c) => sum + (c.votes || 0),
    0
  );

  const vote = async (id) => {
    setMessage("");

    if (!enabled) {
      setMessage("Voting is currently closed.");
      return;
    }

    if (!electionId) {
      setMessage("Election is not properly initialized.");
      return;
    }

    try {
      setSubmittingId(id);

      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setMessage("User record not found.");
        setSubmittingId(null);
        return;
      }

      const userData = userSnap.data();
      const votedElections = userData.votedElections || {};

      if (votedElections[electionId]) {
        setMessage("You have already voted in this election.");
        setSubmittingId(null);
        return;
      }

      const cand = candidates.find((c) => c.id === id);
      if (!cand || cand.active === false) {
        setMessage("This candidate is not available for voting.");
        setSubmittingId(null);
        return;
      }

      await updateDoc(doc(db, "candidates", id), {
        votes: (cand.votes || 0) + 1,
      });

      await updateDoc(userRef, {
        [`votedElections.${electionId}`]: true,
      });

      setMessage("Your vote has been submitted successfully.");
    } catch (e) {
      setMessage("Failed to submit vote. Please try again.");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 px-5 py-10 md:px-10 font-['Montserrat',sans-serif] animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between animate-fade-in-up">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-5 py-1.5 text-[11px] uppercase tracking-[0.22em] text-violet-200 w-fit">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  enabled ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                }`}
              />
              {enabled ? "Voting live" : "Voting closed"}
            </div>
            <div className="space-y-1.5">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Cast your{" "}
                <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                  secure vote
                </span>
                .
              </h1>
              <p className="text-sm md:text-base text-slate-400 max-w-xl">
                Review each candidate carefully. You can vote only once, and
                your vote will remain anonymous.
              </p>
            </div>
          </div>
        </header>

        {/* Info / status message */}
        {message && (
          <div className="rounded-2xl border border-slate-700 bg-slate-900/80 px-5 py-3 text-xs text-slate-200 animate-fade-in-up">
            {message}
          </div>
        )}

        {/* Loading / empty */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="inline-flex items-center gap-3 rounded-full border border-violet-500/40 bg-slate-900/80 px-5 py-2 text-xs text-slate-200">
              <span className="h-4 w-4 rounded-full border-2 border-violet-400/70 border-t-transparent animate-spin" />
              Loading candidates...
            </div>
          </div>
        ) : candidates.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 px-6 py-10 text-center text-sm text-slate-400">
            No candidates are available right now. Please check back later.
          </div>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2">
            {candidates.map((c, idx) => {
              const votes = c.votes || 0;
              const percentage =
                totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

              const disabled = c.active === false;

              return (
                <article
                  key={c.id}
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/80 px-6 py-6 shadow-md animate-fade-in-up transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-violet-500/70 hover:bg-slate-900 hover:shadow-xl hover:shadow-violet-900/50"
                  style={{ animationDelay: `${80 * idx}ms` }}
                >
                  {/* Top section */}
                  <div className="space-y-4">
                    {/* Header with bigger image */}
                    <div className="flex items-center gap-4">
                      {/* Candidate Image */}
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border border-slate-700 bg-slate-800 shadow-md shadow-slate-900/60">
                        <img
                          src={c.imageUrl}
                          alt={c.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              "https://ui-avatars.com/api/?background=1e293b&color=c7d2fe&name=" +
                              encodeURIComponent(c.name || "Candidate");
                          }}
                        />
                      </div>

                      {/* Name + Party */}
                      <div className="flex-1">
                        <h3 className="text-[15px] font-semibold text-slate-50 transition-colors group-hover:text-violet-200">
                          {c.name}
                        </h3>
                        <p className="text-xs md:text-[13px] text-violet-300 transition-colors group-hover:text-violet-200/90">
                          {c.party}
                        </p>
                      </div>

                      {/* Badge */}
                      <div
                        className={`rounded-full px-3 py-1 text-[10px] border ${
                          disabled
                            ? "border-amber-400/70 bg-amber-500/10 text-amber-200"
                            : "border-slate-700 bg-slate-900/60 text-slate-400"
                        }`}
                      >
                        {disabled ? "Disabled" : "Candidate"}
                      </div>
                    </div>

                    {/* Optional description */}
                    {c.description && (
                      <p className="text-xs md:text-[13px] text-slate-400 line-clamp-3">
                        {c.description}
                      </p>
                    )}

                    {/* Progress bar only (no numbers) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Current support</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-400 via-indigo-400 to-emerald-400 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action section */}
                  <div className="mt-5 flex items-center justify-between gap-4">
                    <button
                      onClick={() => vote(c.id)}
                      disabled={!enabled || submittingId === c.id || disabled}
                      className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold shadow-md transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70 ${
                        disabled
                          ? "bg-slate-700 text-slate-400"
                          : "bg-gradient-to-r from-violet-500 to-indigo-500 text-slate-950 shadow-violet-900/40 group-hover:from-violet-400 group-hover:to-indigo-400 group-hover:-translate-y-0.5"
                      }`}
                    >
                      {submittingId === c.id && !disabled && (
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-900/70 border-t-transparent animate-spin" />
                      )}
                      <span>
                        {disabled
                          ? "Disabled for voting"
                          : !enabled
                          ? "Voting closed"
                          : submittingId === c.id
                          ? "Submitting..."
                          : "Vote for candidate"}
                      </span>
                    </button>
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
