import axios from "axios";
import { useState, useContext } from "react";
import { UserContext } from "./UserContext.jsx";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { setUsername: setLoggedInUserName, setId } = useContext(UserContext);
  const [mode, setMode] = useState("register");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const url = mode === "register" ? "register" : "login";
    try {
      const res = await axios.post(url, { username, password });
      setLoggedInUserName(username);
      setId(res.data.id);
    } catch (err) {
      setError(err?.response?.data?.error || "request failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="h-screen w-full flex bg-ink-800 text-cream-50">
      {/* Left hero */}
      <div className="hidden md:flex flex-1 relative overflow-hidden p-14 flex-col justify-between border-r border-ink-700 grain">
        <div className="font-display text-[28px] leading-none tracking-tight rise">
          Letter<span className="text-ember-400">.</span>
        </div>

        <div className="rise" style={{ animationDelay: "120ms" }}>
          <div className="font-sans text-[10px] tracking-editorial uppercase text-muted mb-5">
            Vol.&nbsp;01 &nbsp;·&nbsp; A quiet place to talk
          </div>
          <h1 className="font-display text-[72px] leading-[0.95] tracking-tight max-w-[14ch]">
            Slow conversations,{" "}
            <em className="font-display italic text-ember-400">
              delivered fast.
            </em>
          </h1>
          <p className="text-cream-200/80 max-w-md mt-7 leading-relaxed text-[15px]">
            A small, opinionated chat for two—or two hundred—friends, lovers,
            conspirators. No notifications. No algorithm. Just letters, in real
            time.
          </p>
        </div>

        <div className="flex items-end justify-between rise" style={{ animationDelay: "240ms" }}>
          <div className="text-[10px] tracking-editorial uppercase text-muted">
            Established 2026
          </div>
          <div className="font-display italic text-cream-200/60 text-sm">
            — for the slowly-typed
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-8">
        <form onSubmit={handleSubmit} className="w-full max-w-sm rise">
          <div className="font-display text-[44px] leading-none tracking-tight mb-3">
            {mode === "register" ? "Begin." : "Welcome back."}
          </div>
          <div className="text-muted mb-12 text-[15px]">
            {mode === "register"
              ? "Choose a name. Choose a passphrase."
              : "Pick up where you left off."}
          </div>

          <label className="block">
            <span className="text-[10px] tracking-editorial uppercase text-muted">
              Name
            </span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              autoComplete="off"
              className="block w-full bg-transparent border-b border-ink-500 focus:border-ember-400 outline-none py-3 text-xl font-display transition-colors"
            />
          </label>

          <label className="block mt-8">
            <span className="text-[10px] tracking-editorial uppercase text-muted">
              Passphrase
            </span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="off"
              className="block w-full bg-transparent border-b border-ink-500 focus:border-ember-400 outline-none py-3 text-xl font-display transition-colors"
            />
          </label>

          <div className="h-6 mt-3 text-ember-400 text-sm font-display italic">
            {error && <span>— {error}</span>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 w-full bg-ember-400 hover:bg-ember-300 disabled:opacity-60 disabled:cursor-not-allowed text-ink-900 font-display tracking-tight text-lg py-3 transition-colors"
          >
            {submitting
              ? mode === "register"
                ? "Opening…"
                : "Signing in…"
              : mode === "register"
              ? "Open an account →"
              : "Sign in →"}
          </button>

          <div className="mt-10 text-sm text-muted text-center">
            {mode === "register" ? (
              <>
                Already a member?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="text-cream-50 underline underline-offset-4 decoration-ember-400 hover:text-ember-300 transition-colors"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                New here?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className="text-cream-50 underline underline-offset-4 decoration-ember-400 hover:text-ember-300 transition-colors"
                >
                  Create an account
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
