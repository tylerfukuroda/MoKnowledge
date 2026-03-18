"use client";

import Link from "next/link";
import Image from "next/image";
import {useState} from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full border-b border-black/10 bg-white flex items-center justify-between px-6 py-4">
      
      <div className="flex items-center gap-2">
        <Image src="/mofloarrow.avif" alt="MoFlo Arrow" width={32} height={32} priority />
        <Image src="/moflo.avif" alt="MoFlo" width={80} height={32} priority />
      </div>

      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex flex-col justify-center items-center gap-1.5 p-2"
        >
          <span className="block w-6 h-0.5 bg-gray-700"></span>
          <span className="block w-6 h-0.5 bg-gray-700"></span>
          <span className="block w-6 h-0.5 bg-gray-700"></span>
        </button>

        {open && (
          <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-2xl shadow-md w-40 py-2">
            <Link
              href="/knowledge"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-xl mx-1"
            >
              Scrape
            </Link>
          </div>
        )}
      </div>

    </nav>
  );
}
