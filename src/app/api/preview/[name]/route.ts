import { NextRequest, NextResponse } from "next/server";
import { readMockups } from "@/lib/mockups";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const mockups = await readMockups();
  const mockup = mockups.find((m) => m.name === name);

  if (!mockup) {
    return new NextResponse("<h1>Mockup not found</h1>", {
      status: 404,
      headers: { "Content-Type": "text/html" },
    });
  }

  // Base64 encode the code to avoid ALL escaping issues
  const base64Code = Buffer.from(mockup.code).toString("base64");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
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
        var code = atob("${base64Code}");

        var transformed = Babel.transform(code, {
          presets: ['react'],
          plugins: ['transform-modules-commonjs'],
          filename: 'component.jsx',
        }).code;

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

        var Component = module.exports.default || module.exports;

        if (typeof Component !== 'function') {
          throw new Error('No default export found. Make sure your code exports a React component as the default export.');
        }

        var root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(Component));

      } catch (err) {
        errorOverlay.style.display = 'block';
        errorOverlay.textContent = 'Render Error:\\n\\n' + err.message + '\\n\\n' + (err.stack || '');
      }
    })();
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}
