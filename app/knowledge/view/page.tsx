"use client";

import {useEffect, useMemo, useState} from "react";

type KnowledgeBase = {
  id?: string;
  createdAt?: string;
  sourceUrl?: string;
  foundation?: {
    name?: string;
    description?: string;
    website?: string;
    industry?: string;
    businessModel?: string;
    yearFounded?: string;
    employeeCount?: string;
    address?: string;
    alternateNames?: string[];
  };
  positioning?: {
    pitch?: string;
    foundingStory?: string;
    uniqueSellingPoints?: string[];
    differentiators?: string[];
  };
  market?: {
    targetBuyers?: string[];
    customerNeeds?: string[];
    idealCustomer?: string;
    industries?: string[];
    channels?: string[];
    callsToAction?: string[];
  };
  branding?: {
    colors?: string[];
    fonts?: string[];
    logos?: string[];
    writingStyle?: string;
    artStyle?: string;
  };
  socialMedia?: Record<string, string[] | string>;
  keyPeople?: Array<{
    name?: string;
    title?: string;
    description?: string;
  }>;
  offerings?: Array<{
    name?: string;
    description?: string;
    features?: string[];
    pricing?: string;
    category?: string;
  }>;
  socialProof?: {
    testimonials?: string[];
    awards?: string[];
    certifications?: string[];
    pressmentions?: string[];
  };
};

const STORAGE_KEY = "moknowledge.entries";

function loadEntries(): KnowledgeBase[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as KnowledgeBase[]) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: KnowledgeBase[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export default function KnowledgeViewPage() {
  const [entries, setEntries] = useState<KnowledgeBase[]>([]);
  const [viewMode, setViewMode] = useState<"cards" | "table" | "detail">(
    "cards"
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<KnowledgeBase | null>(null);

  useEffect(() => {
    const stored = loadEntries();
    setEntries(stored);
    if (stored.length > 0) setSelectedId(stored[0].id ?? null);
  }, []);

  const industries = useMemo(() => {
    const values = new Set<string>();
    entries.forEach((entry) => {
      if (entry.foundation?.industry) values.add(entry.foundation.industry);
    });
    return ["all", ...Array.from(values)];
  }, [entries]);

  const filteredEntries = useMemo(() => {
    const lower = query.toLowerCase();
    return entries.filter((entry) => {
      if (industryFilter !== "all") {
        if (entry.foundation?.industry !== industryFilter) return false;
      }
      if (!lower) return true;
      const name = entry.foundation?.name?.toLowerCase() ?? "";
      const website = entry.foundation?.website?.toLowerCase() ?? "";
      const industry = entry.foundation?.industry?.toLowerCase() ?? "";
      return (
        name.includes(lower) ||
        website.includes(lower) ||
        industry.includes(lower)
      );
    });
  }, [entries, query, industryFilter]);

  const selectedEntry = entries.find((entry) => entry.id === selectedId) ?? null;

  const handleDelete = (id?: string) => {
    if (!id) return;
    const next = entries.filter((entry) => entry.id !== id);
    setEntries(next);
    saveEntries(next);
    if (selectedId === id) {
      setSelectedId(next[0]?.id ?? null);
      setIsEditing(false);
      setDraft(null);
    }
  };

  const handleEditToggle = () => {
    if (!selectedEntry) return;
    setIsEditing((prev) => !prev);
    setDraft(selectedEntry);
  };

  const handleApplyEdits = () => {
    if (!draft?.id) return;
    const next = entries.map((entry) => (entry.id === draft.id ? draft : entry));
    setEntries(next);
    saveEntries(next);
    setIsEditing(false);
  };

  const sectionLabel = (label: string) => (
    <h2 className="mt-8 text-lg font-semibold text-black">{label}</h2>
  );

  const renderList = (items?: string[]) => {
    if (!items || items.length === 0) return null;
    return (
      <ul className="mt-2 list-disc pl-5 text-sm text-black">
        {items.map((item, idx) => (
          <li key={`${item}-${idx}`}>{item}</li>
        ))}
      </ul>
    );
  };

  return (
    <main className="min-h-[calc(100vh-64px)] w-full bg-white px-4 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="mb-6 text-2xl font-semibold text-black">
          Knowledge Base
        </h1>
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, website, or industry..."
            className="min-w-[220px] flex-1 rounded-xl border border-black/10 px-4 py-2 text-sm outline-none"
          />
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="rounded-xl border border-black/10 px-3 py-2 text-sm"
          >
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry === "all" ? "All industries" : industry}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            {(["cards", "table", "detail"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                  viewMode === mode
                    ? "border-black/20 bg-black text-white"
                    : "border-black/10 bg-white text-black"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {filteredEntries.length === 0 && (
          <p className="mt-6 text-sm text-gray-600">
            No saved knowledge bases yet.
          </p>
        )}

        {viewMode === "cards" && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm"
              >
                <h3 className="text-lg font-semibold">
                  {entry.foundation?.name || "Company"}
                </h3>
                <p className="text-sm text-gray-600">
                  {entry.foundation?.industry || "Industry unknown"}
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  {entry.foundation?.website}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(entry.id ?? null);
                      setViewMode("detail");
                    }}
                    className="rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(entry.id ?? null);
                      setViewMode("detail");
                      setIsEditing(true);
                      setDraft(entry);
                    }}
                    className="rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === "table" && (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-black/10 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-black/10 bg-gray-50 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Industry</th>
                  <th className="px-4 py-3">Website</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-black/5">
                    <td className="px-4 py-3">
                      {entry.foundation?.name || "Company"}
                    </td>
                    <td className="px-4 py-3">
                      {entry.foundation?.industry || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {entry.foundation?.website || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedId(entry.id ?? null);
                            setViewMode("detail");
                          }}
                          className="rounded-lg border border-black/10 px-2 py-1 text-xs font-semibold"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedId(entry.id ?? null);
                            setViewMode("detail");
                            setIsEditing(true);
                            setDraft(entry);
                          }}
                          className="rounded-lg border border-black/10 px-2 py-1 text-xs font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(entry.id)}
                          className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === "detail" && selectedEntry && (
          <div className="mt-6 rounded-2xl border border-black/10 bg-white p-6 text-black shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">
                {selectedEntry.foundation?.name || "Company"}
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleEditToggle}
                  className="rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold"
                >
                  {isEditing ? "Cancel" : "Edit"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(selectedEntry.id)}
                  className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>

            {draft && isEditing ? (
              <>
                {sectionLabel("Company Details")}
                <div className="mt-3 grid gap-3 text-sm">
                  {[
                    ["Website", "website"],
                    ["Industry", "industry"],
                    ["Business Model", "businessModel"],
                    ["Year Founded", "yearFounded"],
                    ["Main Address", "address"],
                  ].map(([label, field]) => (
                    <div key={field}>
                      <span className="font-semibold">{label}:</span>{" "}
                      <input
                        value={(draft.foundation as any)?.[field] ?? ""}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            foundation: {
                              ...draft.foundation,
                              [field]: e.target.value,
                            },
                          })
                        }
                        className="ml-2 w-[70%] border-b border-black/10 outline-none"
                      />
                    </div>
                  ))}
                </div>
                {sectionLabel("Pitch")}
                <textarea
                  value={draft.positioning?.pitch ?? ""}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      positioning: {
                        ...draft.positioning,
                        pitch: e.target.value,
                      },
                    })
                  }
                  className="mt-3 w-full rounded-xl border border-black/10 p-3 text-sm outline-none"
                />
                {sectionLabel("Market & Customers")}
                <textarea
                  value={(draft.market?.targetBuyers ?? []).join("\n")}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      market: {
                        ...draft.market,
                        targetBuyers: e.target.value
                          .split("\n")
                          .map((v) => v.trim())
                          .filter(Boolean),
                      },
                    })
                  }
                  className="mt-3 w-full rounded-xl border border-black/10 p-3 text-sm outline-none"
                  placeholder="Buyers (one per line)"
                />
                <textarea
                  value={draft.positioning?.foundingStory ?? ""}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      positioning: {
                        ...draft.positioning,
                        foundingStory: e.target.value,
                      },
                    })
                  }
                  className="mt-3 w-full rounded-xl border border-black/10 p-3 text-sm outline-none"
                  placeholder="Founding story"
                />
                {sectionLabel("Branding & Style")}
                <input
                  value={draft.branding?.writingStyle ?? ""}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      branding: {
                        ...draft.branding,
                        writingStyle: e.target.value,
                      },
                    })
                  }
                  className="mt-3 w-full border-b border-black/10 text-sm outline-none"
                  placeholder="Writing style"
                />
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleApplyEdits}
                    className="mt-6 rounded-xl bg-[#1d4ed8] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#1e40af]"
                  >
                    Apply Changes
                  </button>
                )}
              </>
            ) : (
              <>
                {sectionLabel("Company Details")}
                <div className="mt-3 grid gap-2 text-sm">
                  {selectedEntry.foundation?.website && (
                    <div>
                      <span className="font-semibold">Website:</span>{" "}
                      {selectedEntry.foundation.website}
                    </div>
                  )}
                  {selectedEntry.foundation?.industry && (
                    <div>
                      <span className="font-semibold">Industry:</span>{" "}
                      {selectedEntry.foundation.industry}
                    </div>
                  )}
                  {selectedEntry.foundation?.businessModel && (
                    <div>
                      <span className="font-semibold">Business Model:</span>{" "}
                      {selectedEntry.foundation.businessModel}
                    </div>
                  )}
                  {selectedEntry.foundation?.yearFounded && (
                    <div>
                      <span className="font-semibold">Year Founded:</span>{" "}
                      {selectedEntry.foundation.yearFounded}
                    </div>
                  )}
                </div>
                {sectionLabel("Pitch")}
                <p className="mt-2 text-sm">{selectedEntry.positioning?.pitch}</p>
                {sectionLabel("Market & Customers")}
                {renderList(selectedEntry.market?.targetBuyers)}
                {sectionLabel("Founding Story")}
                <p className="mt-2 text-sm">
                  {selectedEntry.positioning?.foundingStory}
                </p>
                {sectionLabel("Branding & Style")}
                <div className="mt-2 text-sm">
                  <span className="font-semibold">Writing Style:</span>{" "}
                  {selectedEntry.branding?.writingStyle || "—"}
                </div>
                {sectionLabel("Key People")}
                {selectedEntry.keyPeople && selectedEntry.keyPeople.length > 0 ? (
                  <div className="mt-2 space-y-2 text-sm">
                    {selectedEntry.keyPeople.map((person, idx) => (
                      <div key={`${person.name ?? "person"}-${idx}`}>
                        <div className="font-semibold">
                          {person.name}
                          {person.title ? ` — ${person.title}` : ""}
                        </div>
                        {person.description && (
                          <div className="text-black/80">{person.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-600">No key people.</p>
                )}
                {sectionLabel("Offerings")}
                {selectedEntry.offerings && selectedEntry.offerings.length > 0 ? (
                  <div className="mt-2 space-y-3 text-sm">
                    {selectedEntry.offerings.map((offering, idx) => (
                      <div key={`${offering.name ?? "offering"}-${idx}`}>
                        <div className="font-semibold">{offering.name}</div>
                        {offering.description && (
                          <div className="text-black/80">{offering.description}</div>
                        )}
                        {offering.features && offering.features.length > 0 && (
                          <div className="mt-2">{renderList(offering.features)}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-600">No offerings.</p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
