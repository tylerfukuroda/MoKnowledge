"use client";

import {useMemo, useState} from "react";

export default function KnowledgePage() {
  const[value, setValue] = useState("");
  const[touched, setTouched] = useState(false);

  const urlRegex = useMemo(
    () =>
      /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+(com|ai|io|org|edu|net|co|dev|app)(\/.*)?$/i,
    []
  );

  const isValid = urlRegex.test(value.trim());

  return (
    <main className="flex min-h-[calc(100vh-64px)] w-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <label className="sr-only" htmlFor="url-input">
          Website URL
        </label>
        <input
          id="url-input"
          type="text"
          inputMode="url"
          placeholder="Enter a website URL (e.g., www.example.com)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => setTouched(true)}
          className="w-full rounded-2xl border border-black/15 bg-white px-5 py-4 text-base shadow-sm outline-none transition focus:border-black/40"
        />
        {touched && value.trim().length > 0 && !isValid && (
          <p className="mt-3 text-sm text-red-600">
            Please enter a valid URL (e.g., `www.example.com`).
          </p>
        )}
      </div>
    </main>
  );
}
