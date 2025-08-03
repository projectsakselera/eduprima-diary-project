import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { color, rounded } from "@/lib/type";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border py-1 px-2 text-xs  capitalize font-semibold  transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      color: {
        default: "border-transparent bg-default text-default-foreground",
        outline: "border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
        neutral: "border-border bg-muted text-muted-foreground",
        primary: "border-transparent bg-primary text-primary-foreground",
        secondary: "bg-secondary border-transparent text-secondary-foreground ",
        destructive: "bg-destructive border-transparent text-destructive-foreground",
        success: "bg-success border-transparent  text-success-foreground ",
        info: "bg-info border-transparent text-info-foreground ",
        warning: "bg-warning  border-transparent text-warning-foreground",
      },
      rounded: {
        sm: "rounded",
        md: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-full",
      }
    },

    defaultVariants: {
      color: "outline",
      rounded: "md",
    },
  }
);
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> {

  color?: color;
  rounded?: rounded;
}


function Badge({ className, color, rounded, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ color, rounded }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
