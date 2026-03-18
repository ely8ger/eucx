/**
 * EmptyState - Wiederverwendbarer Leer-Zustand
 *
 * Zeigt Icon + Titel + Beschreibung + optionalen CTA-Button.
 * Passend für Tabellen, Listen, Diagramme ohne Daten.
 */
import { type ReactNode } from "react";
import { cn }             from "@/lib/utils";

interface EmptyStateProps {
  icon?:        string;        // Emoji oder SVG-Pfad
  title:        string;
  description?: string;
  action?:      ReactNode;     // z.B. <Button>Ersten Auftrag erstellen</Button>
  className?:   string;
  size?:        "sm" | "md" | "lg";
}

const sizeMap = {
  sm:  { wrap: "py-6",  icon: "text-3xl", title: "text-sm",  desc: "text-xs" },
  md:  { wrap: "py-10", icon: "text-4xl", title: "text-base", desc: "text-sm" },
  lg:  { wrap: "py-16", icon: "text-5xl", title: "text-lg",  desc: "text-sm" },
};

export function EmptyState({
  icon        = "◫",
  title,
  description,
  action,
  className,
  size = "md",
}: EmptyStateProps) {
  const s = sizeMap[size];

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center",
      s.wrap,
      className,
    )}>
      <span className={cn("mb-3 opacity-30 select-none", s.icon)}>
        {icon}
      </span>
      <p className={cn("font-semibold text-cb-gray-600 mb-1", s.title)}>
        {title}
      </p>
      {description && (
        <p className={cn("text-cb-gray-400 mb-4 max-w-xs", s.desc)}>
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
