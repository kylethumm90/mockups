"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";

export default function PreviewPage() {
  const params = useParams();
  const name = params.name as string;
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    fetch(`/api/mockups/${name}`)
      .then((res) => {
        if (!res.ok) throw new Error("Mockup not found");
        return res.json();
      })
      .then((data) => setCode(data.code))
      .catch((err) => setError(err.message));
  }, [name]);

  function handleIframeLoad() {
    if (code && iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(
        { type: "render", code },
        "*"
      );
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Not Found</h1>
          <p className="text-gray-500 mb-4">
            Mockup &quot;{name}&quot; doesn&apos;t exist.
          </p>
          <a href="/" className="text-sm text-black underline">
            ← Back to Design Lab
          </a>
        </div>
      </div>
    );
  }

  if (!code) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-3 right-3 z-50 flex gap-2">
        <a
          href="/"
          className="px-3 py-1.5 bg-white/90 backdrop-blur border border-gray-200 rounded-lg text-xs text-gray-600 hover:text-black hover:border-gray-400 transition-all shadow-sm"
        >
          ← Lab
        </a>
      </div>
      <iframe
        ref={iframeRef}
        src="/api/preview-frame"
        onLoad={handleIframeLoad}
        className="w-full h-screen border-0"
        title={`Preview: ${name}`}
      />
    </>
  );
}
