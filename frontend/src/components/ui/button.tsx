import * as React from "react"

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "ghost", size?: "default" | "sm" | "lg" | "icon" }>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    let baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50";
    
    let variants = {
      default: "bg-primary text-black hover:bg-primary/90 shadow-md hover:shadow-primary/20",
      outline: "border border-primary text-primary bg-transparent hover:bg-primary/10",
      ghost: "hover:bg-white/10 hover:text-white text-white/70",
    }
    
    let sizes = {
      default: "h-10 px-6 py-2",
      sm: "h-8 rounded-full px-4 text-xs",
      lg: "h-12 rounded-full px-8 text-base",
      icon: "h-10 w-10",
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ""}`}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
