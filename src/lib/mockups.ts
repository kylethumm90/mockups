import { Redis } from "@upstash/redis";

export interface Mockup {
  name: string;
  code: string;
  createdAt: string;
}

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const KEY = "mockups";

export async function readMockups(): Promise<Mockup[]> {
  const data = await redis.get<Mockup[]>(KEY);
  return data ?? [];
}

export async function writeMockups(mockups: Mockup[]): Promise<void> {
  await redis.set(KEY, mockups);
}
