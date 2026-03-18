import { type HTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

// ─── Wrapper ────────────────────────────────────────────────────────────────
const TableWrapper = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("w-full overflow-auto border border-gov-border-light rounded-sm", className)}
      {...props}
    >
      {children}
    </div>
  )
);
TableWrapper.displayName = "TableWrapper";

// ─── Table ──────────────────────────────────────────────────────────────────
const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm border-collapse", className)}
      {...props}
    />
  )
);
Table.displayName = "Table";

// ─── Head ───────────────────────────────────────────────────────────────────
const TableHead = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn("bg-gov-bg border-b border-gov-border-light", className)}
      {...props}
    />
  )
);
TableHead.displayName = "TableHead";

// ─── Body ───────────────────────────────────────────────────────────────────
const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn("bg-gov-white divide-y divide-gov-border-light", className)}
      {...props}
    />
  )
);
TableBody.displayName = "TableBody";

// ─── Row ────────────────────────────────────────────────────────────────────
const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "transition-colors hover:bg-gov-blue-light/50",
        "data-[selected=true]:bg-gov-blue-light",
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

// ─── Header Cell ────────────────────────────────────────────────────────────
const TableTh = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider",
        "text-gov-text-muted whitespace-nowrap",
        className
      )}
      {...props}
    />
  )
);
TableTh.displayName = "TableTh";

// ─── Data Cell ──────────────────────────────────────────────────────────────
const TableTd = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        "px-4 py-2.5 text-sm text-gov-text whitespace-nowrap",
        className
      )}
      {...props}
    />
  )
);
TableTd.displayName = "TableTd";

// ─── Footer ─────────────────────────────────────────────────────────────────
const TableFooter = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn("bg-gov-bg border-t border-gov-border-light font-semibold", className)}
      {...props}
    />
  )
);
TableFooter.displayName = "TableFooter";

export { TableWrapper, Table, TableHead, TableBody, TableRow, TableTh, TableTd, TableFooter };
