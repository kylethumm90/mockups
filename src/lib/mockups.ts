import fs from "fs";
import path from "path";

export interface Mockup {
  name: string;
  code: string;
  createdAt: string;
}

// In production on Vercel, the project directory is read-only.
// Use /tmp for persistence (ephemeral but works per-instance).
// Locally, use data/mockups.json in the project root.
function getDataFile(): string {
  const localFile = path.join(process.cwd(), "data", "mockups.json");
  if (process.env.VERCEL) {
    const tmpFile = "/tmp/mockups.json";
    // Seed from the bundled file on first access
    if (!fs.existsSync(tmpFile) && fs.existsSync(localFile)) {
      fs.copyFileSync(localFile, tmpFile);
    }
    return tmpFile;
  }
  return localFile;
}

export function readMockups(): Mockup[] {
  const file = getDataFile();
  if (!fs.existsSync(file)) {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, "[]");
    return [];
  }
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

export function writeMockups(mockups: Mockup[]): void {
  const file = getDataFile();
  fs.writeFileSync(file, JSON.stringify(mockups, null, 2));
}
