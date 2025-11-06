import * as React from "react";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  active: string;
  setActive: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function Tabs({
  children,
  className,
  defaultValue,
  value,
  onValueChange,
  ...props
}: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const active = value ?? internalValue;

  const setActive = React.useCallback(
    (next: string) => {
      if (value === undefined) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    },
    [value, onValueChange]
  );

  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={cn("space-y-4", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TabsList({ className, ...props }: TabsListProps) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({ className, value, ...props }: TabsTriggerProps) {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("TabsTrigger must be used within Tabs");
  }
  const isActive = context.active === value;
  return (
    <button
      onClick={() => context.setActive(value)}
      type="button"
      className={cn(
        "inline-flex min-w-[120px] items-center justify-center whitespace-nowrap rounded-sm px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-background text-foreground shadow"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
      aria-pressed={isActive}
      {...props}
    />
  );
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({ className, value, ...props }: TabsContentProps) {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("TabsContent must be used within Tabs");
  }

  if (context.active !== value) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      className={cn("rounded-md border border-dashed border-border p-4", className)}
      {...props}
    />
  );
}
