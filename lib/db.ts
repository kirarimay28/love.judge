import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { Case, CaseDB } from './types';

const DB_PATH = path.join(process.cwd(), 'data', 'cases.json');

function ensureDbExists() {
  const dir = path.dirname(DB_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  if (!existsSync(DB_PATH)) writeFileSync(DB_PATH, JSON.stringify({ cases: [] }));
}

function readDb(): CaseDB {
  ensureDbExists();
  const raw = readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeDb(db: CaseDB) {
  ensureDbExists();
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function getAllCases(): Case[] {
  return readDb().cases;
}

export function getCaseByReceipt(receiptNumber: string): Case | undefined {
  return readDb().cases.find(c => c.receiptNumber === receiptNumber);
}

export function createCase(c: Case): Case {
  const db = readDb();
  db.cases.push(c);
  writeDb(db);
  return c;
}

export function updateCase(receiptNumber: string, updates: Partial<Case>): Case | null {
  const db = readDb();
  const idx = db.cases.findIndex(c => c.receiptNumber === receiptNumber);
  if (idx === -1) return null;
  db.cases[idx] = { ...db.cases[idx], ...updates };
  writeDb(db);
  return db.cases[idx];
}
