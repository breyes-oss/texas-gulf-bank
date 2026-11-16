import { getCollection } from "astro:content";
import { getEmDashCollection, getEmDashEntry } from "emdash";

const LOCATION_PHOTOS = new Set([
  "angleton",
  "citycentre",
  "clute",
  "freeport",
  "friendswood",
  "lake-jackson",
  "voss",
  "west-columbia",
]);

export interface HourRow {
  days: string;
  open: string;
  close: string;
  open24?: string;
  close24?: string;
}

export interface LocationData {
  title: string;
  name: string;
  region: string;
  street: string;
  suite: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  has_atm: boolean;
  has_drive_thru: boolean;
  atm_types: string[];
  services: string[];
  languages: string[];
  lat: number;
  lng: number;
  photo: string;
  hours: { lobby: HourRow[]; drive_thru: HourRow[] };
  notes: string;
}

export interface LocationEntry {
  id: string;
  data: LocationData;
}

export interface CmsPage {
  title: string;
  headline: string;
  summary: string;
  body: string;
  phone: string;
  [key: string]: unknown;
}

function mediaSrc(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  const src = (value as { src?: unknown }).src;
  return typeof src === "string" ? src : "";
}

function asRows(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter((row): row is Record<string, unknown> => !!row && typeof row === "object");
}

function labels(value: unknown): string[] {
  return asRows(value)
    .map((row) => (typeof row.label === "string" ? row.label.trim() : ""))
    .filter(Boolean);
}

function hourRows(value: unknown): HourRow[] {
  return asRows(value).map((row) => ({
    days: typeof row.days === "string" ? row.days : "",
    open: typeof row.open === "string" ? row.open : "",
    close: typeof row.close === "string" ? row.close : "",
    open24: typeof row.open24 === "string" && row.open24 ? row.open24 : undefined,
    close24: typeof row.close24 === "string" && row.close24 ? row.close24 : undefined,
  }));
}

function mapLocation(id: string, data: Record<string, unknown>): LocationData {
  const uploaded = mediaSrc(data.photo);
  return {
    title: typeof data.title === "string" ? data.title : "",
    name: typeof data.name === "string" ? data.name : "",
    region: typeof data.region === "string" ? data.region : "",
    street: typeof data.street === "string" ? data.street : "",
    suite: typeof data.suite === "string" ? data.suite : "",
    city: typeof data.city === "string" ? data.city : "",
    state: typeof data.state === "string" && data.state ? data.state : "TX",
    zip: data.zip == null ? "" : String(data.zip),
    phone: typeof data.phone === "string" ? data.phone : "",
    has_atm: data.has_atm !== false,
    has_drive_thru: data.has_drive_thru !== false,
    atm_types: labels(data.atm_types),
    services: labels(data.services),
    languages: labels(data.languages),
    lat: typeof data.lat === "number" ? data.lat : Number(data.lat),
    lng: typeof data.lng === "number" ? data.lng : Number(data.lng),
    photo: uploaded || (LOCATION_PHOTOS.has(id) ? `/locations/${id}.jpg` : ""),
    hours: {
      lobby: hourRows(data.lobby_hours),
      drive_thru: hourRows(data.drive_hours),
    },
    notes: typeof data.notes === "string" ? data.notes : "",
  };
}

function mapFileLocation(id: string, data: LocationData): LocationData {
  return {
    ...data,
    suite: data.suite || "",
    photo: data.photo || (LOCATION_PHOTOS.has(id) ? `/locations/${id}.jpg` : ""),
    notes: data.notes || "",
  };
}

async function fileLocations(): Promise<LocationEntry[]> {
  const files = await getCollection("locations");
  return files
    .map((entry) => ({ id: entry.id, data: mapFileLocation(entry.id, entry.data) }))
    .sort((a, b) => a.data.name.localeCompare(b.data.name));
}

export async function loadLocations(): Promise<LocationEntry[]> {
  try {
    const { entries, error } = await getEmDashCollection("locations");
    if (error) throw error;
    if (!entries.length) return fileLocations();
    return entries
      .map((entry) => ({
        id: entry.id,
        data: mapLocation(entry.id, entry.data as Record<string, unknown>),
      }))
      .sort((a, b) => a.data.name.localeCompare(b.data.name));
  } catch (error) {
    console.error("[emdash] locations fell back to files", error);
    return fileLocations();
  }
}

export function paragraphs(body: string | undefined): string[] {
  return (body ?? "")
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function mapPage(data: Record<string, unknown> | undefined): CmsPage | null {
  if (!data) return null;
  const title = typeof data.title === "string" ? data.title : "";
  const headline = typeof data.headline === "string" && data.headline ? data.headline : title;
  return {
    ...data,
    title,
    headline,
    summary: typeof data.summary === "string" ? data.summary : "",
    body: typeof data.body === "string" ? data.body : "",
    phone: typeof data.phone === "string" ? data.phone : "",
    hero_image_src: mediaSrc(data.hero_image) || "/hero-community.png",
  };
}

export async function loadPage(id: string): Promise<CmsPage | null> {
  try {
    const { entry, error } = await getEmDashEntry("pages", id);
    if (error) throw error;
    return mapPage(entry?.data as Record<string, unknown> | undefined);
  } catch (error) {
    console.error(`[emdash] page ${id} unavailable`, error);
    return null;
  }
}

export function phoneHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits ? `tel:${digits}` : "";
}
