import * as React from "react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    
    let baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    
    let variantStyles = ""
    switch (variant) {
      case "default": variantStyles = "bg-primary text-primary-foreground hover:bg-primary/90"; break;
      case "destructive": variantStyles = "bg-red-500 text-white hover:bg-red-500/90"; break;
      case "outline": variantStyles = "border border-gray-300 bg-background hover:bg-gray-100 hover:text-gray-900"; break;
      case "secondary": variantStyles = "bg-secondary text-secondary-foreground hover:bg-secondary/80"; break;
      case "ghost": variantStyles = "hover:bg-gray-100 hover:text-gray-900"; break;
      case "link": variantStyles = "text-primary underline-offset-4 hover:underline"; break;
    }

    let sizeStyles = ""
    switch (size) {
      case "default": sizeStyles = "h-10 px-4 py-2"; break;
      case "sm": sizeStyles = "h-9 rounded-md px-3"; break;
      case "lg": sizeStyles = "h-11 rounded-md px-8"; break;
      case "icon": sizeStyles = "h-10 w-10"; break;
    }

    return (
      <button
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
