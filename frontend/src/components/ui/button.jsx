import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils.js";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-bold uppercase tracking-wider transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C8DBC] disabled:pointer-events-none disabled:opacity-50 rounded-lg",
  {
    variants: {
      variant: {
        default: "bg-[#3C8DBC] text-white hover:bg-[#357ca5] rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer",
        destructive: "bg-rose-600 text-white hover:bg-rose-700 rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer",
        outline: "bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 rounded-lg shadow-xs active:scale-[0.98] cursor-pointer",
        secondary: "bg-[#1E293B] text-white hover:bg-[#0F172A] rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer",
        ghost: "bg-transparent text-gray-700 hover:bg-gray-100/80 rounded-lg active:scale-[0.98] cursor-pointer",
        link: "text-[#3C8DBC] underline-offset-4 hover:underline font-semibold uppercase tracking-wider",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-[11px]",
        lg: "h-11 px-6 text-xs",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
