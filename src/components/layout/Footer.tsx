"use client";
import Link from "next/link";
import { FaPaw, FaHeart, FaInstagram, FaTwitter, FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-b from-amber-950 to-amber-900 text-amber-100 px-6 py-12 border-t border-amber-700/30">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand Info */}
        <div className="flex flex-col items-center md:items-start space-y-4">
          <Link href="/" className="flex items-center gap-2 group">
            <FaPaw className="text-amber-400 group-hover:rotate-12 transition-transform" size={24} />
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              PetAdopt
            </span>
          </Link>
          <p className="text-sm text-amber-200/80 max-w-xs text-center md:text-left">
            Connecting loving homes with furry friends since 2023. Every adoption saves a life.
          </p>
          <div className="flex gap-4 pt-2">
            <Link href="#" aria-label="Twitter" className="text-amber-200 hover:text-amber-400 transition">
              <FaTwitter size={20} />
            </Link>
            <Link href="#" aria-label="Instagram" className="text-amber-200 hover:text-amber-400 transition">
              <FaInstagram size={20} />
            </Link>
            <Link href="#" aria-label="GitHub" className="text-amber-200 hover:text-amber-400 transition">
              <FaGithub size={20} />
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-50 mb-4">
            Navigation
          </h3>
          <ul className="space-y-2">
            {["Home", "Adopt", "Success Stories", "About"].map((item) => (
              <li key={item}>
                <Link
                  href={`/${item.toLowerCase().replace(' ', '-')}`}
                  className="text-amber-200/80 hover:text-amber-400 text-sm transition flex items-center gap-1"
                >
                  <FaPaw className="text-amber-400/50" size={10} />
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-50 mb-4">
            Resources
          </h3>
          <ul className="space-y-2">
            {["Adoption Guide", "Pet Care", "FAQ", "Volunteer"].map((item) => (
              <li key={item}>
                <Link
                  href={`/${item.toLowerCase().replace(' ', '-')}`}
                  className="text-amber-200/80 hover:text-amber-400 text-sm transition flex items-center gap-1"
                >
                  <FaPaw className="text-amber-400/50" size={10} />
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-50 mb-4">
            Contact Us
          </h3>
          <address className="not-italic text-sm text-amber-200/80 space-y-2">
            <p>123 Pet Lane</p>
            <p>New Delhi, India</p>
            <p>hello@petadopt.com</p>
            <p>+91 98765 43210</p>
          </address>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-12 pt-6 border-t border-amber-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-xs text-amber-200/60 text-center md:text-left">
          &copy; {new Date().getFullYear()} PetAdopt. All rights reserved.
        </div>
        <div className="flex items-center gap-4 text-xs">
          <Link href="/privacy" className="text-amber-200/60 hover:text-amber-400 transition">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-amber-200/60 hover:text-amber-400 transition">
            Terms of Service
          </Link>
        </div>
        <div className="flex items-center gap-1 text-xs text-amber-200/60">
          <span>Made with</span>
          <FaHeart className="text-amber-400" size={12} />
          <span>by Yuvraj</span>
        </div>
      </div>
    </footer>
  );
}