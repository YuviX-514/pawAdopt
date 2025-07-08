"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import AuthPoster from "@/components/layout/AuthPoster";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Hide navbar on this page
  useEffect(() => {
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
    document.documentElement.style.overscrollBehavior = "none";
    document.body.style.overscrollBehavior = "none";

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.documentElement.style.overscrollBehavior = "";
      document.body.style.overscrollBehavior = "";
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      alert(res.error);
    } else {
      window.location.href = "/";
    }
  };

  return (
    <main className="min-h-screen flex bg-black text-white overflow-hidden">
      {/* LEFT SIDE - POSTER */}
      <section className="hidden lg:flex flex-1 justify-center items-center p-8">
        <AuthPoster />
      </section>

      {/* RIGHT SIDE - LOGIN FORM */}
      <section className="flex-1 flex flex-col justify-center items-center p-8 relative overflow-y-auto">
        {/* Background elements */}
        <div className="fixed inset-0 bg-black -z-10" />
        <div className="fixed -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-purple-700 to-purple-900 rounded-full blur-3xl opacity-50 -z-5" />
        <div className="fixed -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-purple-700 to-purple-900 rounded-full blur-3xl opacity-50 -z-5" />

        {/* Login Card */}
        <div className="w-full max-w-md space-y-6 bg-gradient-to-b from-gray-900 to-gray-800 p-8 rounded-xl border border-gray-700 shadow-2xl">
          <h1 className="text-4xl font-bold mb-2">
            Welcome Back<span className="text-purple-500"> .!</span>
          </h1>
          <p className="text-gray-400 mb-6">Glad you're back.!</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border border-gray-600 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-transparent border border-gray-600 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-purple-700 py-3 rounded text-white font-semibold hover:from-purple-600 hover:to-purple-800 transition cursor-pointer"
            >
              Login
            </button>
          </form>

          <div className="flex items-center my-4">
            <span className="border-t border-gray-600 flex-grow"></span>
            <span className="mx-4 text-gray-400 text-sm">Or</span>
            <span className="border-t border-gray-600 flex-grow"></span>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="p-2.5 border border-gray-600 rounded hover:bg-gray-800 transition cursor-pointer flex items-center justify-center gap-3"
            >
              <img src="/google.svg" alt="Google" className="w-5 h-5" />
              <span>Continue with Google</span>
            </button>

            <button
              onClick={() => signIn("github", { callbackUrl: "/" })}
              className="p-2.5 border border-gray-600 rounded hover:bg-gray-800 transition cursor-pointer flex items-center justify-center gap-3"
            >
              <img src="/github.jpeg" alt="GitHub" className="w-5 h-5" />
              <span>Continue with GitHub</span>
            </button>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-purple-400 hover:underline cursor-pointer"
            >
              Signup
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
