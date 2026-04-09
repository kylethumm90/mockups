"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Mockup {
  name: string;
  code: string;
  createdAt: string;
}

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [mockups, setMockups] = useState<Mockup[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/mockups")
      .then((res) => res.json())
      .then(setMockups)
      .catch(console.error);
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/mockups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), code }),
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

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">
          handled.<span className="text-gray-400 font-normal"> Design Lab</span>
        </h1>
        <p className="text-gray-500 mt-1">
          Paste a React component, save it, preview it live.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 mb-12">
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
            rows={16}
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
          <h2 className="text-lg font-semibold mb-3">Saved Mockups</h2>
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg">
            {mockups.map((m) => (
              <div
                key={m.name}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <a
                    href={`/preview/${m.name}`}
                    className="text-sm font-medium text-black hover:underline"
                  >
                    {m.name}
                  </a>
                  <p className="text-xs text-gray-400">
                    {new Date(m.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={`/preview/${m.name}`}
                    className="text-xs text-gray-500 hover:text-black transition-colors"
                  >
                    Preview →
                  </a>
                  <button
                    onClick={() => handleDelete(m.name)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
