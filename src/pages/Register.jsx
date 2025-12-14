import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    setErrorMsg("");
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: email,
        votedElections: {},
      });

      navigate("/");
    } catch (error) {
      setErrorMsg(error.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center px-4 py-8 font-['Montserrat',sans-serif]">
      <div className="max-w-5xl w-full grid gap-8 lg:grid-cols-[1.1fr,1fr] items-center">
        {/* Left / hero side */}
        <div className="hidden lg:flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1 text-[11px] uppercase tracking-[0.7em] text-violet-200 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Secure Online Voting
          </div>
          <h1 className="text-3xl xl:text-4xl font-semibold leading-tight">
            Create your{" "}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              voter account
            </span>{" "}
            in seconds.
          </h1>
          <p className="text-sm text-slate-400 max-w-md">
            Sign up once and participate in institute elections with a simple,
            transparent and secure voting experience.
          </p>

          {/* <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center text-[11px] text-emerald-300">
                ✓
              </span>
              Encrypted & anonymous ballots
            </div>
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-violet-500/10 border border-violet-400/40 flex items-center justify-center text-[11px] text-violet-300">
                ✓
              </span>
              Firebase secured accounts
            </div>
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-indigo-500/10 border border-indigo-400/40 flex items-center justify-center text-[11px] text-indigo-300">
                ✓
              </span>
              One account for all elections
            </div>
          </div> */}
        </div>

        {/* Right / form card */}
        <div className="relative">
          <div className="pointer-events-none absolute -inset-0.5 bg-gradient-to-tr from-violet-500/40 via-transparent to-indigo-500/40 blur-3xl opacity-60" />

          <div className="relative rounded-3xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-violet-900/40 px-6 py-7 sm:px-8 sm:py-8">
            <div className="mb-6">
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
                Register
              </p>
              <h2 className="mt-1 text-xl sm:text-2xl font-semibold">
                Create account
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Use your institute email to sign up and access active elections.
              </p>
            </div>

            <div className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Email address
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm shadow-sm focus-within:border-violet-500 focus-within:shadow-[0_0_0_1px_rgba(129,140,248,0.6)] transition">
                  <svg
                    className="h-4 w-4 text-slate-400"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <path
                      d="m5 7 6.4 4.2a2 2 0 0 0 2.2 0L20 7"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                  <input
                    type="email"
                    className="flex-1 bg-transparent outline-none placeholder:text-slate-500 text-slate-100"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Password
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm shadow-sm focus-within:border-violet-500 focus-within:shadow-[0_0_0_1px_rgba(129,140,248,0.6)] transition">
                  <svg
                    className="h-4 w-4 text-slate-400"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <rect
                      x="5"
                      y="11"
                      width="14"
                      height="9"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <path
                      d="M9 11V8a3 3 0 0 1 6 0v3"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                  <input
                    type="password"
                    className="flex-1 bg-transparent outline-none placeholder:text-slate-500 text-slate-100"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Error */}
              {errorMsg && (
                <div className="rounded-2xl border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
                  {errorMsg}
                </div>
              )}

              {/* Button */}
              <button
                onClick={handleRegister}
                disabled={loading}
                className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-violet-900/40 transition hover:from-violet-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading && (
                  <span className="h-4 w-4 rounded-full border-2 border-slate-900/70 border-t-transparent animate-spin" />
                )}
                <span>{loading ? "Creating account..." : "Create account"}</span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 pt-1">
                <span className="h-px flex-1 bg-slate-800" />
                <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  Or
                </span>
                <span className="h-px flex-1 bg-slate-800" />
              </div>

              {/* Login link */}
              <p className="text-xs text-slate-400 text-center">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="text-violet-300 hover:text-violet-200 underline-offset-4 hover:underline transition"
                >
                  Login
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
