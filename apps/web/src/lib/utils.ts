/**
 * cn() - Tailwind className utility
 * Kombiniert clsx (conditional classes) mit dedup-Logik.
 * Standard-Pattern für shadcn/ui-kompatible Komponenten.
 */
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
