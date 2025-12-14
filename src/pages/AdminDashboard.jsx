import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [name, setName] = useState("");
  const [party, setParty] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [votingEnabled, setVotingEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [electionId, setElectionId] = useState("");


  const navigate = useNavigate();

  // Fetch candidates
  const fetchCandidates = async () => {
    const snapshot = await getDocs(collection(db, "candidates"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCandidates(data);
  };

  // Fetch voting status
  const fetchVotingStatus = async () => {
    const snap = await getDoc(doc(db, "settings", "voting"));
    if (snap.exists()) {
      setVotingEnabled(snap.data().enabled);
      setElectionId(snap.data().electionId);
    }
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchCandidates(), fetchVotingStatus()]);
      setLoading(false);
    };
    load();
  }, []);

  //new election function
  const startNewElection = async () => {
  const newElectionId = `election-${Date.now()}`;

  await updateDoc(doc(db, "settings", "voting"), {
    enabled: true,
    electionId: newElectionId,
  });

  setElectionId(newElectionId);
  setVotingEnabled(true);

  alert("New election started");
};


  // Add candidate
  const addCandidate = async () => {
    if (!name || !party) {
      alert("Please enter candidate name and party");
      return;
    }

    try {
      setSaving(true);
      await addDoc(collection(db, "candidates"), {
        name,
        party,
        votes: 0,
      });

      setName("");
      setParty("");
      await fetchCandidates();
      alert("Candidate added");
    } finally {
      setSaving(false);
    }
  };

  // Delete candidate
  const deleteCandidate = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this candidate?"
    );
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "candidates", id));
    await fetchCandidates();
  };

  // Enable / Disable voting
  const toggleVoting = async () => {
    await updateDoc(doc(db, "settings", "voting"), {
      enabled: !votingEnabled,
    });
    setVotingEnabled(!votingEnabled);
  };

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const totalVotes = candidates.reduce(
    (sum, c) => sum + (c.votes || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-950 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 px-4 py-8 md:px-8 font-['Montserrat',sans-serif]">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1 text-[11px] uppercase tracking-[0.2em] text-violet-200 w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Admin control panel
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Manage{" "}
                <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                  elections & candidates
                </span>
                .
              </h1>
              <p className="mt-1 text-sm text-slate-400 max-w-xl">
                Add or remove candidates, control when voting is live, and keep
                an eye on participation.
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-medium text-rose-100 shadow-sm hover:bg-rose-500/20 hover:border-rose-400 transition"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            Logout
          </button>
        </header>

        {/* Top stats */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-violet-500/40 bg-gradient-to-br from-violet-600/40 via-slate-900 to-slate-950 p-4 shadow-lg shadow-violet-900/40">
            <p className="text-xs text-violet-100/80">Total candidates</p>
            <p className="mt-2 text-2xl font-semibold">
              {candidates.length}
            </p>
            <p className="mt-1 text-[11px] text-violet-100/70">
              All candidates participating in this election.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
            <p className="text-xs text-slate-400">Total votes cast</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-300">
              {totalVotes}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Sum of votes across all candidates.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
            <p className="text-xs text-slate-400">Voting status</p>
            <p
              className={`mt-2 text-2xl font-semibold ${
                votingEnabled ? "text-emerald-300" : "text-amber-300"
              }`}
            >
              {votingEnabled ? "Enabled" : "Disabled"}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Control whether voters can currently submit ballots.
            </p>
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="inline-flex items-center gap-3 rounded-full border border-violet-500/40 bg-slate-900/80 px-5 py-2 text-xs text-slate-200">
              <span className="h-4 w-4 rounded-full border-2 border-violet-400/70 border-t-transparent animate-spin" />
              Loading admin data...
            </div>
          </div>
        ) : (
          <>
            {/* Add Candidate */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900/80 px-6 py-6 shadow-md space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-slate-50">
                  Add candidate
                </h2>
                <span className="text-[11px] text-slate-500">
                  Provide basic details to register a new candidate.
                </span>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs text-slate-300">
                    Candidate name
                  </label>
                  <input
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-violet-500 focus:shadow-[0_0_0_1px_rgba(129,140,248,0.6)]"
                    placeholder="Enter candidate name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs text-slate-300">Party</label>
                  <input
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-violet-500 focus:shadow-[0_0_0_1px_rgba(129,140,248,0.6)]"
                    placeholder="Enter party / panel name"
                    value={party}
                    onChange={(e) => setParty(e.target.value)}
                  />
                </div>
              </div>

              <button
                onClick={addCandidate}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-2.5 text-xs font-semibold text-slate-950 shadow-md shadow-violet-900/40 transition hover:from-violet-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving && (
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-900/70 border-t-transparent animate-spin" />
                )}
                <span>{saving ? "Adding..." : "Add candidate"}</span>
              </button>
            </section>

            {/* Candidate List */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900/80 px-6 py-6 shadow-md space-y-4">
              <h2 className="text-sm font-semibold text-slate-50">
                Candidates
              </h2>

              {candidates.length === 0 ? (
                <p className="text-xs text-slate-400">
                  No candidates added yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {candidates.map((c) => (
                    <article
                      key={c.id}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm shadow-sm transition hover:border-violet-500/50 hover:shadow-violet-900/40 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <h3 className="text-sm font-semibold text-slate-50">
                          {c.name}
                        </h3>
                        <p className="text-xs text-violet-300">{c.party}</p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          Votes:{" "}
                          <span className="font-semibold text-emerald-300">
                            {c.votes ?? 0}
                          </span>
                        </p>
                      </div>

                      <button
                        className="inline-flex items-center justify-center rounded-full border border-rose-400/70 bg-rose-500/10 px-4 py-1.5 text-xs font-medium text-rose-100 hover:bg-rose-500/20 transition"
                        onClick={() => deleteCandidate(c.id)}
                      >
                        Remove
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* Voting Control */}
<section className="rounded-3xl border border-slate-800 bg-slate-900/80 px-6 py-6 shadow-md flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h2 className="text-sm font-semibold text-slate-50">
      Voting control
    </h2>
    <p className="mt-1 text-xs text-slate-400 max-w-md">
      Toggle whether voters can currently submit ballots or start a fresh
      election. <br />This updates the live voting status immediately.
    </p>
    {electionId && (
      <p className="mt-2 text-[11px] text-slate-500">
        Current election ID:{" "}
        <span className="text-slate-200 font-medium">{electionId}</span>
      </p>
    )}
  </div>

  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
    {/* Toggle switch */}
    <button
      type="button"
      onClick={toggleVoting}
      className="group relative inline-flex items-center rounded-full px-1 py-1 bg-slate-800 border border-slate-700 transition-colors duration-200 hover:border-violet-400"
    >
      <span
        className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-full transition-colors ${
          votingEnabled
            ? "text-slate-900 bg-emerald-400"
            : "text-slate-400 bg-transparent"
        }`}
      >
        Live
      </span>
      <span
        className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-full transition-colors ${
          !votingEnabled
            ? "text-slate-900 bg-amber-300"
            : "text-slate-400 bg-transparent"
        }`}
      >
        Closed
      </span>
    </button>

    {/* Start new election */}
    <button
      type="button"
      onClick={startNewElection}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-2.5 text-xs font-semibold text-slate-950 shadow-md shadow-violet-900/40 transition hover:from-violet-400 hover:to-indigo-400"
    >
      <span className="h-2 w-2 rounded-full bg-slate-900" />
      Start new election
    </button>
  </div>
</section>

          </>
        )}
      </div>
    </div>
  );
}
 