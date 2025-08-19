import { useState } from "react";

interface CodeVerificationProps {
  email: string;
  onVerified: () => void;
}

export default function CodeVerification({ email, onVerified }: CodeVerificationProps) {
  const [code, setCode] = useState("");

  const handleVerify = async () => {
    const res = await fetch("/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    if (res.ok) {
      onVerified();
    } else {
      alert("Verification failed. Please check your code.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="mb-4 text-center font-bold text-lg">Enter verification code</div>
        <input
          type="text"
          maxLength={6}
          className="input w-full mb-3 p-2 border border-gray-300 rounded text-center tracking-widest"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <div className="mb-3 text-center text-gray-400">
          We sent an email with the code to <b>{email}</b>
        </div>
        <button
          onClick={handleVerify}
          className="btn w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded"
        >
          Verify
        </button>
      </div>
    </div>
  );
}
