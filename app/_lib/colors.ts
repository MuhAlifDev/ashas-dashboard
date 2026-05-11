import type { Client } from "./types";

/** Flat-color palette — one per client, cycled by insertion order. */
export const CLIENT_PALETTE = [
  { accent: "#3E7FA3", light: "rgba(62,127,163,0.08)", label: "Ashas Blue" },
  { accent: "#C4614A", light: "rgba(196,97,74,0.08)",  label: "Coral" },
  { accent: "#7B5EA8", light: "rgba(123,94,168,0.08)", label: "Violet" },
  { accent: "#2A9B6E", light: "rgba(42,155,110,0.08)", label: "Emerald" },
  { accent: "#C47A2A", light: "rgba(196,122,42,0.08)", label: "Amber" },
  { accent: "#3A8FA0", light: "rgba(58,143,160,0.08)", label: "Teal" },
  { accent: "#A84E78", light: "rgba(168,78,120,0.08)", label: "Rose" },
  { accent: "#5A8A4A", light: "rgba(90,138,74,0.08)",  label: "Sage" },
] as const;

export type ClientColor = (typeof CLIENT_PALETTE)[number];

/**
 * Returns the color assigned to a client by its position in the clients array.
 * Deterministic for the same ordered list.
 */
export function getClientColor(
  clientId: string | undefined,
  clients: Client[],
): ClientColor {
  if (!clientId) return CLIENT_PALETTE[0];
  const idx = clients.findIndex((c) => c.id === clientId);
  const i = idx < 0 ? 0 : idx % CLIENT_PALETTE.length;
  return CLIENT_PALETTE[i];
}
