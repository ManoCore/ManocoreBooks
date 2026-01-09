import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { setPasswordApi } from "../api/api";

const SetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || password.length < 8) {
      return setError("Password must be at least 8 characters");
    }

    if (password !== confirm) {
      return setError("Passwords do not match");
    }

    if (!token) {
      return setError("Invalid or expired link");
    }

    try {
      setLoading(true);
      setError("");

      await setPasswordApi({
  token,
  password,
  confirmPassword: confirm,
});

      setSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Link expired or invalid. Please request again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Set Your Password
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Create a secure password to access your account
        </p>

        {error && (
          <div className="flex gap-2 items-center text-sm bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex gap-2 items-center text-sm bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg mb-4">
            <CheckCircle className="w-4 h-4" />
            Password set successfully! Redirecting…
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password */}
          <div>
            <label className="text-sm font-medium">New Password</label>
            <div className="relative mt-1">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-3 text-slate-400"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm */}
          <div>
            <label className="text-sm font-medium">Confirm Password</label>
            <input
              type={show ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl
                       bg-gradient-to-br from-blue-600 to-indigo-600
                       text-white font-medium shadow-lg
                       hover:opacity-90 active:scale-95 transition-all
                       disabled:opacity-60"
          >
            <Lock size={18} />
            {loading ? "Setting Password…" : "Set Password"}
          </button>
        </form>
      </div>

      {/* animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SetPassword;
