"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import AuthPoster from "@/components/layout/AuthPoster";
import Image from "next/image";


export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Signup successful!");
        window.location.href = "/auth/login";
      } else {
        alert(data.error || "Signup failed!");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong!");
    }
  };

  return (
    <main className="min-h-screen flex bg-black text-white">
      {/* LEFT SIDE */}
      <section className="hidden lg:flex flex-1 justify-center items-center p-8">
        <AuthPoster />
      </section>

      {/* RIGHT SIDE */}
      <section className="flex-1 flex flex-col justify-center items-center p-8 relative">
        {/* Background gradients */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-purple-700 to-purple-900 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-purple-700 to-purple-900 rounded-full blur-3xl opacity-50"></div>

        {/* Heading */}
        <h1 className="text-4xl font-bold mb-8 text-center">
          Create Account<span className="text-purple-500"> .!</span>
        </h1>

        {/* Signup Card */}
        <div className="w-full max-w-md space-y-6 bg-gradient-to-b from-gray-900 to-gray-800 p-8 rounded-xl border border-gray-700 shadow-2xl relative z-10">
          <h2 className="text-3xl font-bold mb-2">Signup</h2>
          
          <p className="text-gray-400 mb-4">Let&apos;s get started.!</p>


          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-transparent border border-gray-600 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border border-gray-600 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-transparent border border-gray-600 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-purple-700 py-2 rounded text-white font-semibold hover:from-purple-600 hover:to-purple-800 transition cursor-pointer"
            >
              Create Account
            </button>
          </form>

          <div className="flex items-center my-4">
            <span className="border-t border-gray-600 flex-grow"></span>
            <span className="mx-4 text-gray-400 text-sm">Or</span>
            <span className="border-t border-gray-600 flex-grow"></span>
          </div>

          {/* OAuth Buttons - vertical */}
          <div className="flex flex-col gap-4">
            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="p-2 border border-gray-600 rounded hover:bg-gray-700 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Continue with Google</span>
              <Image
  src="/google.svg"
  alt="Google"
  width={20}
  height={20}
  className="w-5 h-5"
/>

            </button>

            <button
              onClick={() => signIn("github", { callbackUrl: "/" })}
              className="p-2 border border-gray-600 rounded hover:bg-gray-700 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Continue with GitHub</span>
              <Image
  src="/github.jpeg"
  alt="GitHub"
  width={20}
  height={20}
  className="w-5 h-5"
/>

            </button>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-purple-400 hover:underline cursor-pointer"
            >
              Login
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
