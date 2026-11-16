import { getEmDashCollection } from "emdash";
import {
  CD_GROUP_ID,
  FEATURED,
  OFFICIAL_RATES_URL,
  PLACEHOLDER,
  fallbackGroups,
  formatAsOfDate,
  formatFeaturedValue,
} from "./rate-groups.mjs";
import { ensureRatesMigrated } from "./migrate-rates";

export { CD_GROUP_ID, OFFICIAL_RATES_URL, PLACEHOLDER };

export interface RateRow {
  key: string;
  label: string;
  interestRate: string;
  apy: string;
  notes: string;
}

export interface RateGroup {
  id: string;
  title: string;
  sortOrder: number;
  tierLabel: string;
  note: string;
  updatedAt: Date | null;
  asOfOverride: string | null;
  rows: RateRow[];
}

export interface RateCatalog {
  source: "cms" | "fallback";
  groups: RateGroup[];
}

export interface FeaturedRate {
  key: string;
  name: string;
  detail: string;
  value: string;
}

export interface ClientRateGroup {
  id: string;
  title: string;
  columns: string[];
  rows: string[][];
  note: string;
  asOf: string;
}

const MISSING_ROW: RateRow = {
  key: "",
  label: PLACEHOLDER,
  interestRate: PLACEHOLDER,
  apy: PLACEHOLDER,
  notes: "",
};

function text(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function dateValue(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "string" && value.trim()) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return null;
}

function mapRows(value: unknown): RateRow[] {
  if (!Array.isArray(value)) return [];
  const rows: RateRow[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const key = text(row.key);
    if (!key) continue;
    rows.push({
      key,
      label: text(row.label) || PLACEHOLDER,
      interestRate: text(row.interest_rate) || PLACEHOLDER,
      apy: text(row.apy) || PLACEHOLDER,
      notes: text(row.notes),
    });
  }
  return rows;
}

function mapGroup(entry: { id: string; data: Record<string, unknown> }): RateGroup | null {
  const data = entry.data;
  if (text(data.status) && text(data.status) !== "published") return null;
  const rows = mapRows(data.rows);
  if (!rows.length) return null;
  const id = text(data.slug) || entry.id;
  return {
    id,
    title: text(data.title) || id,
    sortOrder: typeof data.sort_order === "number" ? data.sort_order : Number(data.sort_order) || 0,
    tierLabel: text(data.tier_label) || "Term",
    note: text(data.note),
    updatedAt: dateValue(data.updatedAt),
    asOfOverride: text(data.as_of_override) || null,
    rows,
  };
}

export function fallbackCatalog(): RateCatalog {
  return {
    source: "fallback",
    groups: fallbackGroups().map((group) => ({
      id: group.id,
      title: group.title,
      sortOrder: group.sortOrder,
      tierLabel: group.tierLabel,
      note: group.note,
      updatedAt: null,
      asOfOverride: null,
      rows: group.rows.map((row) => ({
        key: row.key,
        label: row.label,
        interestRate: row.interestRate,
        apy: row.apy,
        notes: row.notes || "",
      })),
    })),
  };
}

export async function loadRateCatalog(): Promise<RateCatalog> {
  try {
    await ensureRatesMigrated();
    const { entries, error } = await getEmDashCollection("rates");
    if (error) throw error;
    const groups = entries
      .map((entry) => mapGroup(entry as { id: string; data: Record<string, unknown> }))
      .filter((group): group is RateGroup => group !== null)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
    if (!groups.length) return fallbackCatalog();
    return { source: "cms", groups };
  } catch (error) {
    console.error("[emdash] rates unavailable", error);
    return fallbackCatalog();
  }
}

export function getRate(catalog: RateCatalog, key: string): RateRow {
  for (const group of catalog.groups) {
    const row = group.rows.find((candidate) => candidate.key === key);
    if (row) return row;
  }
  return { ...MISSING_ROW, key };
}

export function getRateGroup(catalog: RateCatalog, id: string): RateGroup | undefined {
  return catalog.groups.find((group) => group.id === id);
}

export function featuredRates(catalog: RateCatalog): FeaturedRate[] {
  return FEATURED.map((item) => {
    const row = getRate(catalog, item.key);
    return {
      key: item.key,
      name: item.name,
      detail: row.notes,
      value: formatFeaturedValue(row.apy, item.upTo === true),
    };
  });
}

/** CD as-of line. The date is the CD group's last update, unless that entry sets CD as-of date. */
export function cdAsOfText(catalog: RateCatalog): string {
  if (catalog.source !== "cms") return `Rates as of ${PLACEHOLDER}`;
  const group = getRateGroup(catalog, CD_GROUP_ID);
  const formatted = formatAsOfDate(group?.asOfOverride || group?.updatedAt);
  return formatted ? `Rates as of ${formatted}` : `Rates as of ${PLACEHOLDER}`;
}

export function showsCdRates(groupId: string | undefined, featured: boolean): boolean {
  return featured || groupId === CD_GROUP_ID;
}

const RATE_TOKEN = /\{\{rate:([a-z0-9-]+)\.(apy|interest)\}\}/g;

export function applyRateTokens(catalog: RateCatalog, value: string): string {
  if (!value.includes("{{rate:")) return value;
  return value.replace(RATE_TOKEN, (_match, key: string, field: string) => {
    const row = getRate(catalog, key);
    return field === "interest" ? row.interestRate : row.apy;
  });
}

export function applyRateTokensToCopy<T extends { highlights?: string[]; details?: string[]; points?: string[] }>(
  catalog: RateCatalog,
  item: T,
): T {
  const fill = (lines: string[] | undefined) => lines?.map((line) => applyRateTokens(catalog, line));
  return {
    ...item,
    highlights: fill(item.highlights),
    details: fill(item.details),
    points: fill(item.points),
  };
}

export function clientRateGroups(catalog: RateCatalog): ClientRateGroup[] {
  const asOf = cdAsOfText(catalog);
  return catalog.groups.map((group) => ({
    id: group.id,
    title: group.title,
    columns: [group.tierLabel, "Interest Rate", "APY"],
    rows: group.rows.map((row) => [row.label, row.interestRate, row.apy]),
    note: group.note,
    asOf: group.id === CD_GROUP_ID ? asOf : "",
  }));
}

export function savingsCompareLines(catalog: RateCatalog): Record<string, string> {
  const apy = (key: string) => getRate(catalog, key).apy;
  return {
    savings: `Personal Savings ${apy("personal-savings")} · Gulf Rewards Savings ${apy("gulf-rewards-savings")}`,
    "cd-fixed": `1-Year CD ${apy("cd-1-year")} · 18-Month CD ${apy("cd-18-month")} · 5-Year CD ${apy("cd-5-year")}`,
    "ira-fixed": `1-Year IRA ${apy("ira-fixed-1-year")} · Variable 18-Month IRA ${apy("ira-variable-18-month")}`,
    "money-market": `Money Market tiers run ${apy("money-market-0")} → ${apy("money-market-top")} APY · Personal Savings pays ${apy("personal-savings")}`,
  };
}
