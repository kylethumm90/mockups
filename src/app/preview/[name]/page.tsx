"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { IFRAME_HTML } from "@/lib/iframe-html";

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

  useEffect(() => {
    if (!code || !iframeRef.current) return;

    const blob = new Blob([IFRAME_HTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const iframe = iframeRef.current;

    iframe.src = url;

    function onLoad() {
      iframe.contentWindow?.postMessage({ type: "render", code }, "*");
    }

    iframe.addEventListener("load", onLoad);

    return () => {
      iframe.removeEventListener("load", onLoad);
      URL.revokeObjectURL(url);
    };
  }, [code]);

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
        className="w-full h-screen border-0"
        sandbox="allow-scripts allow-same-origin"
        title={`Preview: ${name}`}
      />
    </>
  );
}

