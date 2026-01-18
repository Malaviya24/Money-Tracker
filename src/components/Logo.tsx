import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  to?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showLink?: boolean;
}

export function Logo({ to = "/dashboard", className, size = "md", showLink = true }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl", 
    lg: "text-2xl"
  };

  const logoContent = (
    <span 
      className={cn(
        "font-serif italic tracking-tight font-medium bg-gradient-to-r from-foreground via-foreground to-accent bg-clip-text",
        sizeClasses[size],
        className
      )}
      style={{
        letterSpacing: "-0.02em",
      }}
    >
      Tracura
    </span>
  );

  if (!showLink) {
    return logoContent;
  }

  return (
    <Link to={to} className="flex items-center hover:opacity-80 transition-opacity">
      {logoContent}
    </Link>
  );
}
