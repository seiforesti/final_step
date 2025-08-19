import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";

function AppLogo() {
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-800 text-white shadow mr-2">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="6" rx="8" ry="3" fill="#fff" fillOpacity="0.8" />
        <ellipse cx="12" cy="6" rx="8" ry="3" stroke="#fff" strokeWidth="1.5" />
        <path
          d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6"
          stroke="#fff"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"
          stroke="#fff"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    </span>
  );
}

function GoogleSVG() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <g>
        <path
          fill="#4285F4"
          d="M44.5 20H24v8.5h11.7C34.6 32.9 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.5l6.4-6.4C34.3 5.1 29.4 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.3-.1-2.7-.3-4z"
        />
        <path
          fill="#34A853"
          d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13 24 13c2.7 0 5.2.9 7.2 2.5l6.4-6.4C34.3 5.1 29.4 3 24 3c-7.2 0-13.4 4.1-16.7 10.1z"
        />
        <path
          fill="#FBBC05"
          d="M24 45c5.4 0 10.3-1.8 14.1-4.9l-6.5-5.3C29.9 36.8 27 38 24 38c-5.7 0-10.5-3.7-12.2-8.8l-7 5.4C7.7 41.1 15.3 45 24 45z"
        />
        <path
          fill="#EA4335"
          d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.1 5.5-7.7 5.5-2.2 0-4.2-.7-5.8-2l-7 5.4C17.5 41.1 20.6 43 24 43c6.6 0 12-5.4 12-12 0-.8-.1-1.6-.2-2.5z"
        />
      </g>
    </svg>
  );
}

function MicrosoftSVG() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <rect fill="#F35325" x="1" y="1" width="10" height="10" />
      <rect fill="#81BC06" x="13" y="1" width="10" height="10" />
      <rect fill="#05A6F0" x="1" y="13" width="10" height="10" />
      <rect fill="#FFBA08" x="13" y="13" width="10" height="10" />
    </svg>
  );
}

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"signin" | "verify">("signin");
  const [code, setCode] = useState("");
  const [emailForVerify, setEmailForVerify] = useState("");

  const handleGoogle = () => {
    window.open(
      "http://localhost:8000/auth/google",
      "oauthWindow",
      "width=500,height=600"
    );
  };
  const handleMicrosoft = () => {
    window.open(
      "http://localhost:8000/auth/microsoft",
      "oauthWindow",
      "width=500,height=600"
    );
  };
  const handleEmail = async () => {
    await fetch("http://localhost:8000/auth/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setEmailForVerify(email);
    setStep("verify");
  };
  const handleVerify = async () => {
    const res = await fetch("http://localhost:8000/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailForVerify, code }),
    });
    if (res.ok) window.location.href = "/";
  };

  return (
    <>
      <PageMeta title="Sign In" description="Sign in to your account" />
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#23272e]">
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center mb-2">
            <AppLogo />
            <span className="text-2xl font-semibold text-white tracking-tight ml-2">
              NXCI_DataWave
            </span>
          </div>
        </div>
        <div className="w-full max-w-sm bg-[#181b20] rounded-2xl shadow-2xl px-8 py-10 flex flex-col items-center border border-[#23272e]">
          <h2 className="text-2xl font-semibold text-white mb-8 text-center">
            Log in
          </h2>
          {step === "signin" ? (
            <>
              <button
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-2 border border-[#353a40] bg-transparent hover:bg-[#23272e] text-white font-medium rounded-md py-2 mb-3 shadow-none transition"
                style={{ height: 44 }}
              >
                <GoogleSVG />
                <span className="ml-2">Continue with Google</span>
              </button>
              <button
                onClick={handleMicrosoft}
                className="w-full flex items-center justify-center gap-2 border border-[#353a40] bg-transparent hover:bg-[#23272e] text-white font-medium rounded-md py-2 mb-6 shadow-none transition"
                style={{ height: 44 }}
              >
                <MicrosoftSVG />
                <span className="ml-2">Continue with Microsoft</span>
              </button>
              <div className="flex items-center w-full mb-6">
                <div className="flex-1 h-px bg-[#353a40]" />
                <span className="mx-3 text-gray-500 text-sm">or</span>
                <div className="flex-1 h-px bg-[#353a40]" />
              </div>
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 rounded-md bg-[#23272e] border border-[#353a40] text-white mb-4 focus:outline-none focus:ring-2 focus:ring-red-700 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
              <button
                onClick={handleEmail}
                className="w-full bg-[#2196f3] hover:bg-[#1976d2] text-white font-semibold rounded-md py-2 shadow-none transition"
                disabled={!email}
                style={{ height: 44 }}
              >
                Continue with email
              </button>
            </>
          ) : (
            <>
              <div className="mb-4 text-center font-bold text-lg text-white">
                Enter verification code
              </div>
              <input
                type="text"
                maxLength={6}
                className="w-full px-4 py-2 rounded-md bg-[#23272e] border border-[#353a40] text-white mb-4 text-center tracking-widest text-xl font-mono focus:outline-none focus:ring-2 focus:ring-red-700 transition"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoFocus
              />
              <div className="mb-3 text-center text-gray-400 text-sm">
                We sent an email with the code to <b>{emailForVerify}</b>
              </div>
              <button
                onClick={handleVerify}
                className="w-full bg-[#2196f3] hover:bg-[#1976d2] text-white font-semibold rounded-md py-2 shadow-none transition"
                disabled={code.length !== 6}
                style={{ height: 44 }}
              >
                Verify
              </button>
            </>
          )}
        </div>
        <div className="mt-8 flex justify-center gap-6 text-gray-500 text-sm">
          <a href="#" className="hover:underline">
            Privacy policy
          </a>
          <span>·</span>
          <a href="#" className="hover:underline">
            Terms of use
          </a>
        </div>
      </div>
    </>
  );
}
