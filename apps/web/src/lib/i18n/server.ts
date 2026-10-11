import { translations } from "./translations";
import type { T } from "./translations";

export function tServer(key: keyof T): string {
  const val = translations["de"][key];
  return val !== undefined ? String(val) : String(key);
}
