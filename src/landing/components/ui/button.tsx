import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/landing/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-brand-cyan text-black shadow-lg shadow-brand-cyan/20 hover:bg-brand-cyan-light hover:shadow-xl hover:shadow-brand-cyan/30",
        destructive:
          "bg-red-500 text-white shadow-lg hover:bg-red-600",
        outline:
          "border-2 border-brand-cyan bg-transparent text-brand-cyan hover:bg-brand-cyan hover:text-black",
        secondary:
          "bg-brand-teal text-white shadow-lg hover:bg-brand-teal-dark",
        ghost: "text-brand-cyan hover:bg-brand-cyan/10",
        link: "text-brand-cyan underline-offset-4 hover:underline hover:text-brand-cyan-light",
      },
      size: {
        default: "h-11 px-8 py-4",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-10 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
