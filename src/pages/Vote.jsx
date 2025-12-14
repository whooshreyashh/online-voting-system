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
      // fetch candidates
      const candSnap = await getDocs(collection(db, "candidates"));
      setCandidates(candSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      // fetch voting status + election id
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

    // ✅ check per election
    if (votedElections[electionId]) {
      setMessage("You have already voted in this election.");
      setSubmittingId(null);
      return;
    }

    const cand = candidates.find((c) => c.id === id);
    if (!cand) {
      setMessage("Candidate not found. Please refresh.");
      setSubmittingId(null);
      return;
    }

    // increment candidate votes
    await updateDoc(doc(db, "candidates", id), {
      votes: (cand.votes || 0) + 1,
    });

    // mark user as voted for THIS election
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
    <div className="min-h-screen bg-slate-950 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 px-4 py-8 md:px-8 font-['Montserrat',sans-serif]">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1 text-[11px] uppercase tracking-[0.2em] text-violet-200 w-fit">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  enabled ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                }`}
              />
              {enabled ? "Voting live" : "Voting closed"}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Cast your{" "}
                <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                  secure vote
                </span>
                .
              </h1>
              <p className="mt-1 text-sm text-slate-400 max-w-xl">
                Review each candidate carefully. You can vote only once, and
                your vote will remain anonymous.
              </p>
            </div>
          </div>
        </header>

        {/* Info / status message */}
        {message && (
          <div className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-xs text-slate-200">
            {message}
          </div>
        )}

        {/* Loading state */}
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
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
  {candidates.map((c) => (
    <article
      key={c.id}
      className="group relative flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/80 px-4 py-4 shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-violet-500/70 hover:bg-slate-900 hover:shadow-xl hover:shadow-violet-900/50"
    >
      {/* Top section */}
      <div className="space-y-4">
        {/* Header with image */}
        <div className="flex items-center gap-3">
          {/* Candidate Image */}
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-slate-700 bg-slate-800">
            <img
              src={c.imageUrl}
              alt={c.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.src =
                  "https://ui-avatars.com/api/?background=1e293b&color=c7d2fe&name=" +
                  encodeURIComponent(c.name);
              }}
            />
          </div>

          {/* Name + Party */}
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-50 transition-colors group-hover:text-violet-200">
              {c.name}
            </h3>
            <p className="text-xs text-violet-300 transition-colors group-hover:text-violet-200/90">
              {c.party}
            </p>
          </div>

          {/* Badge */}
          <div className="rounded-full border border-slate-700 bg-slate-900/60 px-2 py-0.5 text-[10px] text-slate-400">
            Candidate
          </div>
        </div>

        {/* Optional description */}
        {c.description && (
          <p className="text-xs text-slate-400 line-clamp-3">
            {c.description}
          </p>
        )}
      </div>

      {/* Action section */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          onClick={() => vote(c.id)}
          disabled={!enabled || submittingId === c.id}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-violet-900/40 transition group-hover:from-violet-400 group-hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submittingId === c.id && (
            <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-900/70 border-t-transparent animate-spin" />
          )}
          <span>
            {!enabled
              ? "Voting closed"
              : submittingId === c.id
              ? "Submitting..."
              : "Vote for candidate"}
          </span>
        </button>

        <span className="text-[11px] text-slate-500">
          Votes:{" "}
          <span className="text-slate-200">
            {c.votes ?? 0}
          </span>
        </span>
      </div>
    </article>
  ))}
</section>
        )}
      </div>
    </div>
  );
}
