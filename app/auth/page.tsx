"use client";

import React, { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || (!isLogin && !confirmPassword)) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.push("/");
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else {
        alert("Signup successful! Please check your email for confirmation.");
        setIsLogin(true);
      }
    }

    setLoading(false);
  };

  return (
    <>
      {/* <Head>
        <title>{isLogin ? "Login" : "Signup"} | Auth</title>
        <style>{`
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
          }
        `}</style>
      </Head> */}

      <div style={{
        backgroundImage: "url('/background.jpg')",
        height: 800,
        width: 1550,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }} className="fixed inset-0 flex items-center justify-center bg-cover bg-center h-64">
        {/* Background Image */}
        {/* <img
          src="/background.jpg"
          height={800}
          width={1150}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover z-0"
        /> */}
        {/* Optional: Overlay */}
        <div className="absolute inset-0 bg-black/50 z-10" />

          {/* Centered Form */}
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl px-10 py-14 space-y-12 border border-white/20 flex flex-col items-center" style={{ zIndex: 20, position: 'relative' }}>
          {/* Toggle Buttons */}
          {/* <div className="flex w-full space-x-4 mb-10">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`w-1/2 py-4 text-base rounded-xl font-semibold transition-all duration-200 ${isLogin
                  ? "bg-sky-600 text-white shadow-md hover:bg-sky-700"
                  : "bg-sky-100 text-sky-800 border border-sky-300 hover:bg-sky-200"
                }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`w-1/2 py-4 text-base rounded-xl font-semibold transition-all duration-200 ${!isLogin
                  ? "bg-cyan-600 text-white shadow-md hover:bg-cyan-700"
                  : "bg-sky-100 text-sky-800 border border-sky-300 hover:bg-sky-200"
                }`}
            >
              Signup
            </button>
          </div> */}

          {/* Headings */}
          <div className="w-full text-center space-y-2 mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              {isLogin ? "Welcome Back!" : "Create Account"}
            </h2>
            <p className="text-base text-gray-500">
              {isLogin ? "Sign in to your account" : "Enter your details below"}
            </p>
          </div>

          {/* Form */}
          <form className="space-y-10 w-full" onSubmit={handleSubmit}>
            <div className="space-y-8">
              <div>
                <label
                  htmlFor="loginEmail"
                  className="block text-sm font-medium text-gray-700 mb-3" // increased spacing
                >
                  Email
                </label>
                <input
                  type="email"
                  id="loginEmail"
                  className="w-full px-4 py-4 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 transition-all duration-200 hover:border-blue-400 focus:border-blue-500 text-white placeholder-gray-400"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="loginPassword"
                  className="block text-sm font-medium text-gray-700 mb-3" // increased spacing
                >
                  Password
                </label>
                <input
                  type="password"
                  id="loginPassword"
                  className="w-full px-4 py-4 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 transition-all duration-200 hover:border-blue-400 focus:border-blue-500 text-white placeholder-gray-400"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {!isLogin && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-3" // increased spacing
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    className="w-full px-4 py-4 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-800 transition-all duration-200 hover:border-purple-400 focus:border-purple-500 text-white placeholder-gray-400"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}

            </div>

            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-md text-sm mt-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              // disabled={loading}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white text-lg transition-all duration-200 mt-4 ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : isLogin
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                }`}
            >
              {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
            </button>

            <div className="text-center text-sm mt-10">
              {isLogin ? "Don't have an account?" : "Already registered?"}{" "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:underline font-medium"
              >
                {isLogin ? "Sign up" : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
