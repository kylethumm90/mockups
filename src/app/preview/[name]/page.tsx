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

  useEffect(() => {
    if (!code || !iframeRef.current) return;

    const iframeHtml = generateIframeHtml(code);
    const blob = new Blob([iframeHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    iframeRef.current.src = url;

    return () => URL.revokeObjectURL(url);
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

function generateIframeHtml(code: string): string {
  // Escape the code for embedding in a script tag
  const escapedCode = code
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
  <script src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Archivo', sans-serif; }
    #error-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: #fef2f2;
      padding: 40px;
      font-family: monospace;
      font-size: 14px;
      color: #991b1b;
      white-space: pre-wrap;
      overflow: auto;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <div id="error-overlay"></div>
  <script>
    (function() {
      var errorOverlay = document.getElementById('error-overlay');

      try {
        var code = \`${escapedCode}\`;

        // Transpile with Babel
        var transformed = Babel.transform(code, {
          presets: ['react'],
          plugins: ['transform-modules-commonjs'],
          filename: 'component.jsx',
        }).code;

        // Create a module-like environment
        var exports = {};
        var module = { exports: exports };

        var fn = new Function(
          'React',
          'useState',
          'useEffect',
          'useRef',
          'useCallback',
          'useMemo',
          'Fragment',
          'module',
          'exports',
          'require',
          transformed
        );

        fn(
          React,
          React.useState,
          React.useEffect,
          React.useRef,
          React.useCallback,
          React.useMemo,
          React.Fragment,
          module,
          exports,
          function require(name) {
            if (name === 'react') return React;
            throw new Error('Module not found: ' + name);
          }
        );

        // Get the default export
        var Component = module.exports.default || module.exports;

        if (typeof Component !== 'function') {
          throw new Error('No default export found. Make sure your code exports a React component as the default export.');
        }

        // Render
        var root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(Component));

      } catch (err) {
        errorOverlay.style.display = 'block';
        errorOverlay.textContent = 'Render Error:\\n\\n' + err.message + '\\n\\n' + (err.stack || '');
      }
    })();
  <\/script>
</body>
</html>`;
}
