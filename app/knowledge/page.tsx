"use client";

import {useMemo, useState} from "react";

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

type ScrapeResponse =
  | {success: true; data: KnowledgeBase}
  | {success?: false; error?: string};

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

export default function KnowledgePage() {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<KnowledgeBase | null>(null);
  const [draft, setDraft] = useState<KnowledgeBase | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const urlRegex = useMemo(
    () =>
      /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+(com|ai|io|org|edu|net|co|dev|app)(\/.*)?$/i,
    []
  );

  const isValid = urlRegex.test(value.trim());

  const handleScrape = async () => {
    setTouched(true);
    setError(null);
    setSaveMessage(null);
    const trimmed = value.trim();
    if (!urlRegex.test(trimmed)) return;
    setLoading(true);
    setData(null);
    setDraft(null);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({url: trimmed}),
      });
      const json = (await res.json()) as ScrapeResponse;
      if (!res.ok || "error" in json) {
        throw new Error(json.error || "Failed to scrape website");
      }
      const normalized: KnowledgeBase = {
        ...json.data,
        sourceUrl: trimmed,
        createdAt: json.data.createdAt ?? new Date().toISOString(),
      };
      setData(normalized);
      setDraft(normalized);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scrape website");
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (!data) return;
    setIsEditing((prev) => !prev);
    setDraft(data);
  };

  const handleApplyEdits = () => {
    if (!draft) return;
    setData(draft);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!data) return;
    const entries = loadEntries();
    const withId: KnowledgeBase = {
      ...data,
      id: data.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    };
    const updated = [
      withId,
      ...entries.filter((entry) => entry.id !== withId.id),
    ];
    saveEntries(updated);
    setSaveMessage("Saved to knowledge base.");

    const blob = new Blob([JSON.stringify(withId, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${withId.foundation?.name || "knowledge-base"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
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
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="mb-6 text-2xl font-semibold text-black">Scrape & Build</h1>
        <div className="w-full rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
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
            className="w-full rounded-2xl border border-black/20 bg-white px-5 py-4 text-base text-black shadow-md outline-none transition focus:border-black/40"
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleScrape}
              className="rounded-2xl bg-[#1d4ed8] px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-[#1e40af] focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/50"
            >
              {loading ? "Scraping..." : "Scrape!"}
            </button>
            {data && (
              <>
                <button
                  type="button"
                  onClick={handleEditToggle}
                  className="rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black shadow-sm transition hover:bg-gray-50"
                >
                  {isEditing ? "Cancel" : "Edit"}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black shadow-sm transition hover:bg-gray-50"
                >
                  Save JSON
                </button>
              </>
            )}
            {saveMessage && (
              <span className="text-sm text-green-600">{saveMessage}</span>
            )}
          </div>
          {touched && value.trim().length > 0 && !isValid && (
            <p className="mt-3 text-sm text-red-600">
              Please enter a valid URL (e.g., `www.example.com`).
            </p>
          )}
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>

        {loading && (
          <div className="mt-6 rounded-2xl border border-black/10 bg-white p-6 text-sm text-gray-600 shadow-sm">
            Scraping site content and building knowledge base...
          </div>
        )}

        {draft && (
          <div className="mt-8 rounded-2xl border border-black/10 bg-white p-6 text-black shadow-sm">
            {isEditing ? (
              <input
                value={draft.foundation?.name ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    foundation: {
                      ...draft.foundation,
                      name: e.target.value,
                    },
                  })
                }
                className="w-full text-2xl font-semibold outline-none"
                placeholder="Company Name"
              />
            ) : (
              <h2 className="text-2xl font-semibold">
                {draft.foundation?.name || "Company"}
              </h2>
            )}

            {isEditing ? (
              <textarea
                value={draft.foundation?.description ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    foundation: {
                      ...draft.foundation,
                      description: e.target.value,
                    },
                  })
                }
                className="mt-3 w-full rounded-xl border border-black/10 p-3 text-sm outline-none"
                placeholder="Company description"
              />
            ) : (
              draft.foundation?.description && (
                <p className="mt-3 text-sm text-black">
                  {draft.foundation.description}
                </p>
              )
            )}

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
                  {isEditing ? (
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
                  ) : (
                    (draft.foundation as any)?.[field] || ""
                  )}
                </div>
              ))}
              <div>
                <span className="font-semibold">Alt Company Names:</span>{" "}
                {isEditing ? (
                  <input
                    value={(draft.foundation?.alternateNames ?? []).join(", ")}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        foundation: {
                          ...draft.foundation,
                          alternateNames: e.target.value
                            .split(",")
                            .map((v) => v.trim())
                            .filter(Boolean),
                        },
                      })
                    }
                    className="ml-2 w-[70%] border-b border-black/10 outline-none"
                  />
                ) : (
                  (draft.foundation?.alternateNames ?? []).join(", ")
                )}
              </div>
            </div>

            {sectionLabel("Pitch")}
            {isEditing ? (
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
            ) : (
              <p className="mt-3 text-sm">{draft.positioning?.pitch}</p>
            )}

            {sectionLabel("Market & Customers")}
            {isEditing ? (
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
            ) : (
              renderList(draft.market?.targetBuyers)
            )}
            {isEditing ? (
              <textarea
                value={(draft.market?.customerNeeds ?? []).join("\n")}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    market: {
                      ...draft.market,
                      customerNeeds: e.target.value
                        .split("\n")
                        .map((v) => v.trim())
                        .filter(Boolean),
                    },
                  })
                }
                className="mt-3 w-full rounded-xl border border-black/10 p-3 text-sm outline-none"
                placeholder="Customer needs (one per line)"
              />
            ) : (
              draft.market?.customerNeeds &&
              draft.market.customerNeeds.length > 0 && (
                <div className="mt-3 text-sm">
                  <span className="font-semibold">Customer Needs:</span>{" "}
                  {draft.market.customerNeeds.join(" ")}
                </div>
              )
            )}
            {isEditing ? (
              <textarea
                value={draft.market?.idealCustomer ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    market: {
                      ...draft.market,
                      idealCustomer: e.target.value,
                    },
                  })
                }
                className="mt-3 w-full rounded-xl border border-black/10 p-3 text-sm outline-none"
                placeholder="Ideal persona"
              />
            ) : (
              draft.market?.idealCustomer && (
                <div className="mt-3 text-sm">
                  <span className="font-semibold">Ideal Persona:</span>{" "}
                  {draft.market.idealCustomer}
                </div>
              )
            )}

            {sectionLabel("Founding Story")}
            {isEditing ? (
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
              />
            ) : (
              <p className="mt-3 text-sm">{draft.positioning?.foundingStory}</p>
            )}

            {sectionLabel("Branding & Style")}
            <div className="mt-3 grid gap-3 text-sm">
              {[
                ["Writing Style", "writingStyle"],
                ["Art Style", "artStyle"],
              ].map(([label, field]) => (
                <div key={field}>
                  <span className="font-semibold">{label}:</span>{" "}
                  {isEditing ? (
                    <input
                      value={(draft.branding as any)?.[field] ?? ""}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          branding: {
                            ...draft.branding,
                            [field]: e.target.value,
                          },
                        })
                      }
                      className="ml-2 w-[70%] border-b border-black/10 outline-none"
                    />
                  ) : (
                    (draft.branding as any)?.[field] || ""
                  )}
                </div>
              ))}
              {[
                ["Fonts", "fonts"],
                ["Colors", "colors"],
                ["Logos", "logos"],
              ].map(([label, field]) => (
                <div key={field}>
                  <span className="font-semibold">{label}:</span>{" "}
                  {isEditing ? (
                    <input
                      value={((draft.branding as any)?.[field] ?? []).join(", ")}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          branding: {
                            ...draft.branding,
                            [field]: e.target.value
                              .split(",")
                              .map((v) => v.trim())
                              .filter(Boolean),
                          },
                        })
                      }
                      className="ml-2 w-[70%] border-b border-black/10 outline-none"
                    />
                  ) : (
                    ((draft.branding as any)?.[field] ?? []).join(", ")
                  )}
                </div>
              ))}
            </div>

            {draft.socialMedia && sectionLabel("Online Presence")}
            {draft.socialMedia && (
              <div className="mt-3 grid gap-2 text-sm">
                {Object.entries(draft.socialMedia).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-semibold">{key}:</span>{" "}
                    {Array.isArray(value) ? value.join(", ") : value}
                  </div>
                ))}
              </div>
            )}

            {sectionLabel("Key People")}
            {draft.keyPeople && draft.keyPeople.length > 0 ? (
              <div className="mt-3 space-y-3 text-sm">
                {draft.keyPeople.map((person, idx) => (
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
              <p className="mt-2 text-sm text-gray-600">No key people found.</p>
            )}

            {sectionLabel("Offerings")}
            {draft.offerings && draft.offerings.length > 0 ? (
              <div className="mt-3 space-y-4 text-sm">
                {draft.offerings.map((offering, idx) => (
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
              <p className="mt-2 text-sm text-gray-600">No offerings found.</p>
            )}

            {isEditing && (
              <button
                type="button"
                onClick={handleApplyEdits}
                className="mt-6 rounded-xl bg-[#1d4ed8] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#1e40af]"
              >
                Apply Changes
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
