import { NextRequest, NextResponse } from "next/server";
import { readMockups, writeMockups } from "@/lib/mockups";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const mockups = readMockups();
  const mockup = mockups.find((m) => m.name === name);

  if (!mockup) {
    return NextResponse.json({ error: "Mockup not found" }, { status: 404 });
  }

  return NextResponse.json(mockup);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const mockups = readMockups();
  const filtered = mockups.filter((m) => m.name !== name);

  if (filtered.length === mockups.length) {
    return NextResponse.json({ error: "Mockup not found" }, { status: 404 });
  }

  writeMockups(filtered);
  return NextResponse.json({ success: true });
}
