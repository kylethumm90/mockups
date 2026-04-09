import { NextRequest, NextResponse } from "next/server";
import { readMockups, writeMockups } from "@/lib/mockups";

export async function GET() {
  const mockups = await readMockups();
  return NextResponse.json(mockups);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, code, tags } = body;

  if (!name || !code) {
    return NextResponse.json(
      { error: "Name and code are required" },
      { status: 400 }
    );
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const mockups = await readMockups();

  const parsedTags: string[] = Array.isArray(tags) ? tags : [];

  const existingIndex = mockups.findIndex((m) => m.name === slug);
  if (existingIndex >= 0) {
    mockups[existingIndex] = { name: slug, code, tags: parsedTags, createdAt: new Date().toISOString() };
  } else {
    mockups.push({ name: slug, code, tags: parsedTags, createdAt: new Date().toISOString() });
  }

  await writeMockups(mockups);

  return NextResponse.json({ name: slug });
}
