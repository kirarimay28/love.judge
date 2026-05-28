import { Redis } from '@upstash/redis';
import { Case } from './types';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const CASES_KEY = 'mattai:cases';

export async function getAllCases(): Promise<Case[]> {
  const cases = await redis.get<Case[]>(CASES_KEY);
  return cases ?? [];
}

export async function getCaseByReceipt(receiptNumber: string): Promise<Case | undefined> {
  const cases = await getAllCases();
  return cases.find(c => c.receiptNumber === receiptNumber);
}

export async function createCase(c: Case): Promise<Case> {
  const cases = await getAllCases();
  cases.push(c);
  await redis.set(CASES_KEY, cases);
  return c;
}

export async function updateCase(receiptNumber: string, updates: Partial<Case>): Promise<Case | null> {
  const cases = await getAllCases();
  const idx = cases.findIndex(c => c.receiptNumber === receiptNumber);
  if (idx === -1) return null;
  cases[idx] = { ...cases[idx], ...updates };
  await redis.set(CASES_KEY, cases);
  return cases[idx];
}
