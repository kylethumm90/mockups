"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Mockup {
  name: string;
  code: string;
  tags: string[];
  createdAt: string;
}

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [mockups, setMockups] = useState<Mockup[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/mockups")
      .then((res) => res.json())
      .then(setMockups)
      .catch(console.error);
  }, []);

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags((prev) => [...prev, newTag]);
      }
      setTagInput("");
    }
    if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    // Capture any trailing text in the tag input
    const finalTags = tagInput.trim()
      ? [...tags, tagInput.trim().toLowerCase()]
      : tags;

    setSaving(true);
    try {
      const res = await fetch("/api/mockups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), code, tags: finalTags }),
      });
      const data = await res.json();
      router.push(`/preview/${data.name}`);
    } catch (err) {
      console.error("Failed to save:", err);
      setSaving(false);
    }
  }

  async function handleDelete(mockupName: string) {
    if (!confirm(`Delete "${mockupName}"?`)) return;
    await fetch(`/api/mockups/${mockupName}`, { method: "DELETE" });
    setMockups((prev) => prev.filter((m) => m.name !== mockupName));
  }

  // Collect all unique tags across mockups
  const allTags = Array.from(new Set(mockups.flatMap((m) => m.tags ?? [])));

  const filteredMockups = activeFilter
    ? mockups.filter((m) => (m.tags ?? []).includes(activeFilter))
    : mockups;

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">
          handled.<span className="text-gray-400 font-normal"> Design Lab</span>
        </h1>
        <p className="text-gray-500 mt-1">
          Paste a React component, save it, preview it live.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 mb-12 max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Page name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. lead-detail"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tags
            </label>
            <div className="flex flex-wrap items-center gap-1.5 w-full px-2 py-1.5 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-black focus-within:border-transparent min-h-[38px]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-md"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    x
                  </button>
                </span>
              ))}
              <input
                id="tags"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={tags.length === 0 ? "Type and press Enter" : ""}
                className="flex-1 min-w-[80px] text-sm outline-none bg-transparent py-0.5"
              />
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            JSX Component Code
          </label>
          <textarea
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`export default function MyComponent() {\n  return <div style={{ padding: 40 }}>Hello world</div>;\n}`}
            rows={14}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-y"
          />
        </div>

        <button
          type="submit"
          disabled={saving || !name.trim() || !code.trim()}
          className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "Saving..." : "Save & Preview"}
        </button>
      </form>

      {mockups.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Saved Mockups
              <span className="text-gray-400 font-normal text-sm ml-2">
                {filteredMockups.length}
              </span>
            </h2>
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              <button
                onClick={() => setActiveFilter(null)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeFilter === null
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() =>
                    setActiveFilter(activeFilter === tag ? null : tag)
                  }
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    activeFilter === tag
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMockups.map((m) => (
              <MockupCard
                key={m.name}
                mockup={m}
                onDelete={() => handleDelete(m.name)}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

function MockupCard({
  mockup,
  onDelete,
}: {
  mockup: Mockup;
  onDelete: () => void;
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all group">
      <a href={`/preview/${mockup.name}`} className="block">
        <div className="relative w-full bg-gray-50 overflow-hidden" style={{ height: 200 }}>
          <iframe
            src={`/api/preview/${mockup.name}`}
            title={`Thumbnail: ${mockup.name}`}
            className="pointer-events-none border-0 origin-top-left"
            loading="lazy"
            tabIndex={-1}
            style={{
              width: 1280,
              height: 800,
              transform: "scale(0.234375)",
              transformOrigin: "top left",
            }}
          />
          <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors" />
        </div>
      </a>

      <div className="px-4 py-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <a
              href={`/preview/${mockup.name}`}
              className="text-sm font-semibold text-gray-900 hover:underline truncate block"
            >
              {mockup.name}
            </a>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(mockup.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            className="text-xs text-gray-300 hover:text-red-500 transition-colors ml-2 mt-0.5"
          >
            Delete
          </button>
        </div>

        {(mockup.tags ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {mockup.tags.map((tag) => (
              <span
                key={tag}
                className="bg-gray-100 text-gray-500 text-[11px] px-2 py-0.5 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
