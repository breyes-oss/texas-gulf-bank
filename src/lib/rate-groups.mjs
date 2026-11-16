// Single source for placeholder deposit rates.
// EmDash 1.4 repeaters cannot contain repeaters, so each product group is its
// own entry and each rate is a labeled row. Do not add rates that are not
// already in this list.

export const PLACEHOLDER = "[Placeholder]";
export const CD_GROUP_ID = "cd-fixed";
export const OFFICIAL_RATES_URL =
  "https://www.texasgulfbank.com/investment-rate-index-time-and-non-time-accounts/";

export const MIGRATION_FLAG = "tgb:rate-groups-v1";

/** Homepage cards. The APY always comes from the row with this key. */
export const FEATURED = [
  { key: "cd-1-year", name: "12-Month CD" },
  { key: "cd-18-month", name: "18-Month CD" },
  { key: "gulf-advantage-qualified", name: "Gulf Advantage Checking" },
  { key: "money-market-top", name: "Money Market", upTo: true },
];

const ROW_SUBFIELDS = [
  { slug: "key", label: "Key", type: "string", required: true },
  { slug: "label", label: "Term or tier", type: "string", required: true },
  { slug: "interest_rate", label: "Interest rate", type: "string", required: true },
  { slug: "apy", label: "APY", type: "string", required: true },
  { slug: "notes", label: "Minimum or notes", type: "string" },
];

export const RATE_COLLECTION_FIELDS = [
  { slug: "title", label: "Title", type: "string", required: true, searchable: true },
  { slug: "sort_order", label: "Sort order", type: "integer" },
  { slug: "tier_label", label: "First column", type: "string" },
  { slug: "note", label: "Note", type: "text" },
  { slug: "as_of_override", label: "CD as-of date", type: "datetime" },
  {
    slug: "rows",
    label: "Rates",
    type: "repeater",
    validation: { subFields: ROW_SUBFIELDS },
  },
];

export const LEGACY_RATE_FIELDS = [
  "published",
  "disclaimer",
  "full_rates_url",
  "sections_footnote",
  "items",
  "sections",
];

/** @type {Array<{id: string, title: string, sortOrder: number, tierLabel: string, note: string, rows: Array<{key: string, label: string, interestRate: string, apy: string, notes?: string}>}>} */
export const RATE_GROUPS = [
  {
    id: "cd-fixed",
    title: "Certificates of Deposit — Fixed Rate",
    sortOrder: 1,
    tierLabel: "Term",
    note: "$2,500 minimum to open and earn the stated APY. Interest compounded and credited monthly.",
    rows: [
      { key: "cd-30-day", label: "30 Days", interestRate: "1.25%", apy: "1.26%" },
      { key: "cd-90-day", label: "90 Days", interestRate: "1.80%", apy: "1.81%" },
      { key: "cd-180-day", label: "180 Days", interestRate: "3.20%", apy: "3.25%" },
      { key: "cd-1-year", label: "1 Year", interestRate: "3.40%", apy: "3.45%", notes: "$2,500 minimum" },
      { key: "cd-18-month", label: "18 Months", interestRate: "3.25%", apy: "3.30%", notes: "$2,500 minimum" },
      { key: "cd-2-year", label: "2 Years", interestRate: "2.72%", apy: "2.75%" },
      { key: "cd-3-year", label: "3 Years", interestRate: "2.72%", apy: "2.75%" },
      { key: "cd-4-year", label: "4 Years", interestRate: "2.72%", apy: "2.75%" },
      { key: "cd-5-year", label: "5 Years", interestRate: "2.72%", apy: "2.75%" },
    ],
  },
  {
    id: "ira-fixed",
    title: "Individual Retirement Accounts — Fixed Rate",
    sortOrder: 2,
    tierLabel: "Term",
    note: "$2,000 minimum to open. Interest compounded and credited quarterly.",
    rows: [
      { key: "ira-fixed-1-year", label: "1 Year", interestRate: "3.41%", apy: "3.45%" },
      { key: "ira-fixed-18-month", label: "18 Months", interestRate: "3.26%", apy: "3.30%" },
      { key: "ira-fixed-2-year", label: "2 Years", interestRate: "2.72%", apy: "2.75%" },
      { key: "ira-fixed-3-year", label: "3 Years", interestRate: "2.72%", apy: "2.75%" },
      { key: "ira-fixed-4-year", label: "4 Years", interestRate: "2.72%", apy: "2.75%" },
      { key: "ira-fixed-5-year", label: "5 Years", interestRate: "2.72%", apy: "2.75%" },
    ],
  },
  {
    id: "ira-variable",
    title: "Individual Retirement Accounts — Variable Rate",
    sortOrder: 3,
    tierLabel: "Term",
    note: "$1,000 minimum to open. Rate may change after the account is opened. Compounded/credited quarterly.",
    rows: [{ key: "ira-variable-18-month", label: "18 Months", interestRate: "3.26%", apy: "3.30%" }],
  },
  {
    id: "money-market",
    title: "Personal Money Market",
    sortOrder: 4,
    tierLabel: "Account Balance",
    note: "$500 minimum to open. Tiered rates apply to your entire daily balance. Rates may change after the account is opened.",
    rows: [
      { key: "money-market-0", label: "$0.01 – $39,999.99", interestRate: "0.55%", apy: "0.55%" },
      { key: "money-market-40k", label: "$40,000 – $99,999.99", interestRate: "0.65%", apy: "0.65%" },
      { key: "money-market-100k", label: "$100,000 – $499,999.99", interestRate: "0.85%", apy: "0.85%" },
      { key: "money-market-500k", label: "$500,000 – $999,999.99", interestRate: "1.40%", apy: "1.41%" },
      {
        key: "money-market-top",
        label: "$1,000,000+",
        interestRate: "1.65%",
        apy: "1.66%",
        notes: "From $500 to open",
      },
    ],
  },
  {
    id: "vip-checking",
    title: "VIP High Yield Checking",
    sortOrder: 5,
    tierLabel: "Account Balance",
    note: "$1,000 minimum to open. Tiered rates apply to your entire daily balance. Rates may change after the account is opened.",
    rows: [
      { key: "vip-0", label: "$0.01 – $74,999.99", interestRate: "0.35%", apy: "0.35%" },
      { key: "vip-75k", label: "$75,000 – $249,999.99", interestRate: "0.55%", apy: "0.55%" },
      { key: "vip-250k", label: "$250,000 – $499,999.99", interestRate: "0.65%", apy: "0.65%" },
      { key: "vip-500k", label: "$500,000 – $999,999.99", interestRate: "1.20%", apy: "1.21%" },
      { key: "vip-top", label: "$1,000,000+", interestRate: "1.45%", apy: "1.46%" },
    ],
  },
  {
    id: "savings",
    title: "Personal Savings & Gulf Rewards Savings",
    sortOrder: 6,
    tierLabel: "Account",
    note: "$100 minimum to open and to earn the disclosed APY. Gulf Rewards Savings requires a Gulf Rewards Checking account. Rates may change after the account is opened.",
    rows: [
      { key: "personal-savings", label: "Personal Savings", interestRate: "0.35%", apy: "0.35%" },
      { key: "gulf-rewards-savings", label: "Gulf Rewards Savings*", interestRate: "0.40%", apy: "0.40%" },
    ],
  },
  {
    id: "gulf-advantage",
    title: "Gulf Advantage Checking",
    sortOrder: 7,
    tierLabel: "Account Balance",
    note: "One account allowed per Social Security number. Tiered rate applies to your entire daily balance. Requirements must be met for the higher tier. Rates may change after the account is opened.",
    rows: [
      {
        key: "gulf-advantage-qualified",
        label: "$0.01 – $24,999.99 (requirements met)",
        interestRate: "0.80%",
        apy: "0.80%",
        notes: "Requirements apply",
      },
      {
        key: "gulf-advantage-qualified-high",
        label: "$25,000 – $50,000 (requirements met)",
        interestRate: "0.50%",
        apy: "0.80% – 0.65%",
      },
      {
        key: "gulf-advantage-base",
        label: "$0.01+ (requirements not met)",
        interestRate: "0.40%",
        apy: "0.40%",
      },
    ],
  },
  {
    id: "hsa",
    title: "Health Savings Account",
    sortOrder: 8,
    tierLabel: "Account Balance",
    note: "$50 minimum to open. Tiered rates apply to your entire daily balance.",
    rows: [
      { key: "hsa-1000", label: "$1,000 – $4,999.99", interestRate: "0.30%", apy: "0.30%" },
      { key: "hsa-5000", label: "$5,000+", interestRate: "0.35%", apy: "0.35%" },
    ],
  },
];

const KEY_BY_LABEL = new Map(
  RATE_GROUPS.flatMap((group) => group.rows.map((row) => [`${group.id}\n${row.label}`, row.key])),
);

const NOTES_BY_KEY = new Map(
  RATE_GROUPS.flatMap((group) => group.rows.filter((row) => row.notes).map((row) => [row.key, row.notes])),
);

export function markRate(value) {
  const text = value == null ? "" : String(value).trim();
  if (!text || text === PLACEHOLDER) return PLACEHOLDER;
  if (!text.includes("%") || text.includes(PLACEHOLDER)) return text;
  return `${PLACEHOLDER} ${text}`;
}

export function placeholderGroups() {
  return RATE_GROUPS.map((group) => ({
    ...group,
    rows: group.rows.map((row) => ({
      ...row,
      interestRate: markRate(row.interestRate),
      apy: markRate(row.apy),
      notes: row.notes || "",
    })),
  }));
}

export function fallbackGroups() {
  return RATE_GROUPS.map((group) => ({
    ...group,
    rows: group.rows.map((row) => ({
      ...row,
      interestRate: PLACEHOLDER,
      apy: PLACEHOLDER,
      notes: row.notes || "",
    })),
  }));
}

function cellText(value) {
  if (value == null) return "";
  return String(value).trim();
}

function parseColumns(value) {
  if (Array.isArray(value)) return value.map(cellText).filter(Boolean);
  return cellText(value)
    .split(",")
    .map((column) => column.trim())
    .filter(Boolean);
}

function parseMatrix(value) {
  if (Array.isArray(value)) {
    return value
      .map((row) => {
        if (Array.isArray(row)) return row.map(cellText);
        return cellText(row)
          .split("|")
          .map((cell) => cell.trim());
      })
      .filter((row) => row.some(Boolean));
  }
  return cellText(value)
    .split("\n")
    .map((line) => line.split("|").map((cell) => cell.trim()))
    .filter((row) => row.some(Boolean));
}

function slugKey(groupId, label) {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `${groupId}-${slug || "row"}`;
}

const FEATURED_KEY_BY_NAME = new Map(FEATURED.map((item) => [item.name, item.key]));

function apyFromFeatured(value) {
  let text = cellText(value);
  let prefix = "";
  if (text.startsWith(`${PLACEHOLDER} `)) {
    prefix = `${PLACEHOLDER} `;
    text = text.slice(prefix.length);
  } else if (text === PLACEHOLDER) {
    return PLACEHOLDER;
  }
  text = text.replace(/^up to\s+/i, "");
  return `${prefix}${text}`.trim();
}

function rateCore(value) {
  return cellText(value)
    .replaceAll(PLACEHOLDER, "")
    .replace(/up to/gi, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

/**
 * Turn the legacy single rate-sheet entry into product groups.
 * Section rows supply interest rate and APY. A featured row whose APY differs
 * from its section row keeps that edited APY, so a CMS edit is not dropped.
 * Returns null when there is nothing to migrate.
 * @param {unknown} sections
 * @param {unknown} [items]
 */
export function groupsFromLegacy(sections, items) {
  const list = Array.isArray(sections) ? sections : [];
  /** @type {ReturnType<typeof placeholderGroups>} */
  const groups = [];
  const seen = new Set();

  for (const section of list) {
    if (!section || typeof section !== "object") continue;
    const record = /** @type {Record<string, unknown>} */ (section);
    const id = cellText(record.id) || `group-${groups.length + 1}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const known = RATE_GROUPS.find((group) => group.id === id);
    const used = new Set();
    const rows = parseMatrix(record.rows).map((cells, index) => {
      const label = cells[0] || `Row ${index + 1}`;
      const interestRate = cells[1] || PLACEHOLDER;
      const apy = cells[2] || cells[1] || PLACEHOLDER;
      let key = KEY_BY_LABEL.get(`${id}\n${label}`) || slugKey(id, label);
      if (used.has(key)) key = `${key}-${index + 1}`;
      used.add(key);
      return {
        key,
        label,
        interestRate,
        apy,
        notes: NOTES_BY_KEY.get(key) || "",
      };
    });
    if (!rows.length) continue;
    groups.push({
      id,
      title: cellText(record.title) || known?.title || id,
      sortOrder: groups.length + 1,
      tierLabel: parseColumns(record.columns)[0] || known?.tierLabel || "Term",
      note: cellText(record.note),
      rows,
    });
  }

  if (Array.isArray(items)) {
    for (const item of items) {
      if (!item || typeof item !== "object") continue;
      const record = /** @type {Record<string, unknown>} */ (item);
      const key = FEATURED_KEY_BY_NAME.get(cellText(record.name));
      if (!key) continue;
      const nextApy = apyFromFeatured(record.value);
      if (!nextApy.includes("%")) continue;
      for (const group of groups) {
        const row = group.rows.find((candidate) => candidate.key === key);
        if (!row) continue;
        if (rateCore(row.apy) !== rateCore(nextApy)) row.apy = nextApy;
        const detail = cellText(record.detail);
        if (detail) row.notes = detail;
      }
    }
  }

  return groups.length ? groups : null;
}

export function formatFeaturedValue(apy, upTo) {
  const value = cellText(apy) || PLACEHOLDER;
  if (!upTo || value === PLACEHOLDER) return value;
  const body = value.startsWith(`${PLACEHOLDER} `) ? value.slice(PLACEHOLDER.length + 1) : value;
  if (body.toLowerCase().startsWith("up to ")) {
    return value.startsWith(`${PLACEHOLDER} `) ? `${PLACEHOLDER} ${body}` : body;
  }
  return value.startsWith(`${PLACEHOLDER} `) ? `${PLACEHOLDER} up to ${body}` : `up to ${value}`;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Month D, YYYY in UTC. Returns "" when the value is not a date. */
export function formatAsOfDate(value) {
  if (value == null || value === "") return "";
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}
