import * as React from "react";
    import { cn } from "@/lib/utils"; // Ensure this utility is available

    const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
      return (
        <button
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
            {
              "bg-primary text-primary-foreground shadow hover:bg-primary/90": variant === "default",
              "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90": variant === "destructive",
              "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground": variant === "outline",
              "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80": variant === "secondary",
              "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
              "hover:bg-destructive/90": variant === "destructive-ghost",
              "h-9 px-4 py-2": size === "default",
              "h-7 rounded-md px-3": size === "sm",
              "h-11 rounded-md px-8": size === "lg",
            },
            className
          )}
          ref={ref}
          {...props}
        />
      );
    });
    Button.displayName = "Button";

    export { Button };
