"use client";

import { createContext, useContext, useState, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// ─── Context ────────────────────────────────────────────────────────────────
const TabsContext = createContext<{ active: string; setActive: (v: string) => void }>({
  active: "",
  setActive: () => {},
});

// ─── Root ───────────────────────────────────────────────────────────────────
interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
}

function Tabs({ defaultValue, children, className, ...props }: TabsProps) {
  const [active, setActive] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// ─── Tab List (Nav-Leiste) ───────────────────────────────────────────────────
function TabsList({ children, className }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex border-b border-gov-border-light bg-gov-white",
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── Tab Trigger ────────────────────────────────────────────────────────────
interface TabTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
}

function TabTrigger({ value, children, className, ...props }: TabTriggerProps) {
  const { active, setActive } = useContext(TabsContext);
  const isActive = active === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActive(value)}
      className={cn(
        "px-4 py-2.5 text-sm font-medium transition-colors",
        "border-b-2 -mb-px",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gov-blue focus-visible:ring-offset-1",
        isActive
          ? "border-gov-blue text-gov-blue"
          : "border-transparent text-gov-text-muted hover:text-gov-text hover:border-gov-border",
        className
      )}
      {...(props as HTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}

// ─── Tab Content ────────────────────────────────────────────────────────────
interface TabContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

function TabContent({ value, children, className, ...props }: TabContentProps) {
  const { active } = useContext(TabsContext);
  if (active !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn("pt-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabTrigger, TabContent };
