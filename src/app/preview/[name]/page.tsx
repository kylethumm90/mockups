"use client";

import { useParams } from "next/navigation";

export default function PreviewPage() {
  const params = useParams();
  const name = params.name as string;

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
        src={`/api/preview/${name}`}
        className="w-full h-screen border-0"
        title={`Preview: ${name}`}
      />
    </>
  );
}
