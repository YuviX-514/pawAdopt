"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Menu, X, User, PawPrint, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [dbUser, setDbUser] = useState<{
    username: string;
    image: string;
  } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (status !== "authenticated") return;

      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setDbUser({
            username: data.user.username,
            image: data.user.image,
          });
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUser();
  }, [status]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
    setSidebarOpen(false);
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-amber-100/20 bg-gradient-to-b from-amber-900/80 to-amber-950/90 text-white shadow backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6">
        {/* Mobile Hamburger */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-amber-100 md:hidden"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
          onClick={() => setSidebarOpen(false)}
        >
          <Image
            src="/logo.png"
            alt="PawAdopt"
            width={40}
            height={40}
            className="rounded-full group-hover:rotate-12 transition-transform duration-300"
          />
          <span className="text-xl font-bold bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
            PawAdopt
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 ml-10">
          {["Home", "Pets", "About", "Contact"].map((item) => (
            <Link
              key={item}
              href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
              className="text-amber-100 hover:text-amber-300 font-medium transition-colors duration-200 hover:scale-105"
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Desktop Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex items-center ml-6 relative w-64"
        >
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search pets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-amber-900/50 border border-amber-200/20 rounded-full text-amber-100 placeholder-amber-200/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
            <Search
              className="absolute left-3 top-2.5 text-amber-200/60"
              size={18}
            />
          </div>
        </form>

        {/* Right side icons */}
        <div className="flex items-center gap-4 ml-4">
          {/* Upload Pet */}
          <Link
            href="/pets/upload"
            className="flex items-center gap-0 p-2 rounded-full text-amber-100 hover:bg-amber-800/40 transition-all duration-300 group"
          >
            <PawPrint className="w-5 h-5 group-hover:text-amber-400 transition-colors duration-300" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-2 group-hover:text-amber-400 duration-300 ease-in-out text-sm font-medium">
              List Pet
            </span>
          </Link>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-4">
            {status === "authenticated" && dbUser ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none group relative"
                  aria-label="User menu"
                >
                  {/* Avatar */}
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-amber-300">
                    {dbUser.image ? (
                      <Image
                        src={dbUser?.image || "/user.png"}
                        alt="User profile"
                        fill
                        className="object-cover w-full h-full"
                        style={{ objectPosition: "center center" }}
                        priority
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center">
                        <User size={18} className="text-amber-100" />
                      </div>
                    )}
                  </div>

                  {/* Name and Dropdown */}
                  {dbUser?.username && (
                    <div className="hidden md:flex items-center gap-1">
                      <span className="text-sm font-medium text-amber-100">
                        {dbUser.username}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-amber-200 transition-transform duration-200 ${
                          dropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-amber-900/90 backdrop-blur-md rounded-md shadow-lg border border-amber-200/20 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-amber-200/10">
                      <p className="text-sm font-medium text-amber-100">
                        {dbUser?.username}
                      </p>
                      <p className="text-xs text-amber-200/80 truncate">
                        {session.user?.email}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-amber-100 hover:bg-amber-800/80 transition-colors"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-4 py-2 text-sm text-amber-100 hover:bg-amber-800/80 transition-colors border-t border-amber-200/10"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex gap-3">
                <Link
                  href="/auth/login"
                  className="px-3 py-1.5 text-sm rounded-full bg-amber-700 text-amber-50 border border-amber-700 hover:bg-amber-800 hover:border-amber-800 flex items-center gap-2 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-3 py-1.5 text-sm rounded-full bg-amber-900 border border-amber-300 text-amber-100 hover:bg-amber-800 flex items-center gap-2 transition-colors"
                >
                  Signup
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar overlay */}
      <div
        className={`fixed inset-0 bg-amber-950/80 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-72 bg-amber-900/95 backdrop-blur-md z-50 transform transition-transform duration-300 md:hidden flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-amber-200/10">
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={() => setSidebarOpen(false)}
          >
            <Image
              src="/logo.png"
              alt="PetAdopt"
              width={36}
              height={36}
              className="rounded-full"
            />
            <span className="text-lg font-bold text-amber-100">PetAdopt</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-amber-100 hover:text-amber-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Sidebar Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="p-4 border-b border-amber-200/10"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search pets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-amber-800/50 border border-amber-200/20 rounded-full text-amber-100 placeholder-amber-200/60 focus:outline-none"
            />
            <Search
              className="absolute left-3 top-2.5 text-amber-200/60"
              size={18}
            />
          </div>
        </form>

        {/* Sidebar Links */}
        <nav className="flex-1 overflow-y-auto p-4">
          {["Home", "Pets", "About", "Contact"].map((item) => (
            <Link
              key={item}
              href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
              className="block py-3 px-4 text-amber-100 hover:bg-amber-800/50 rounded-lg transition-colors mb-1"
              onClick={() => setSidebarOpen(false)}
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Sidebar Auth */}
        <div className="mt-auto px-4 py-6 border-t border-amber-200/10">
          {status === "authenticated" && dbUser ? (
            <>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 w-full bg-amber-800/50 px-4 py-2 rounded-full"
              >
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-amber-300">
                  {dbUser.image ? (
                    <Image
                      src={dbUser?.image || "/user.png"}
                      alt="User profile"
                      fill
                      className="object-cover w-full h-full"
                      style={{ objectPosition: "center center" }}
                      priority
                    />
                  ) : (
                    <div className="h-full w-full bg-amber-700 flex items-center justify-center">
                      <User size={20} className="text-white" />
                    </div>
                  )}
                </div>
                <span className="text-amber-100 font-medium truncate">
                  {dbUser.username}
                </span>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  dropdownOpen ? "max-h-64 mt-4" : "max-h-0"
                }`}
              >
                <Link
                  href="/profile"
                  onClick={() => setSidebarOpen(false)}
                  className="block w-full text-center px-4 py-2 rounded bg-amber-700 text-amber-50 hover:bg-amber-600 mb-2"
                >
                  Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setSidebarOpen(false)}
                  className="block w-full text-center px-4 py-2 rounded bg-amber-700 text-amber-50 hover:bg-amber-600 mb-2"
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setSidebarOpen(false);
                  }}
                  className="block w-full text-center px-4 py-2 rounded bg-red-700 text-amber-50 hover:bg-red-600 mt-2"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                href="/auth/login"
                onClick={() => setSidebarOpen(false)}
                className="w-full text-center px-4 py-2 rounded bg-amber-700 text-amber-50 hover:bg-amber-800"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setSidebarOpen(false)}
                className="w-full text-center px-4 py-2 rounded bg-amber-800 border border-amber-300 text-amber-100 hover:bg-amber-700"
              >
                Signup
              </Link>
            </div>
          )}
        </div>
      </aside>
    </header>
  );
}
