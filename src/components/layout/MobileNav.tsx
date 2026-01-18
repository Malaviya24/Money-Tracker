import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Wallet, PieChart, Settings, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2 relative">
        {/* Home */}
        <Link
          to="/dashboard"
          className={cn(
            "flex flex-col items-center justify-center gap-1 min-w-[48px] py-2 px-2 rounded-xl transition-all duration-200 touch-manipulation",
            isActive("/dashboard")
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <LayoutDashboard className="h-5 w-5 shrink-0" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        {/* Spaces */}
        <Link
          to="/spaces"
          className={cn(
            "flex flex-col items-center justify-center gap-1 min-w-[48px] py-2 px-2 rounded-xl transition-all duration-200 touch-manipulation",
            isActive("/spaces")
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Wallet className="h-5 w-5 shrink-0" />
          <span className="text-[10px] font-medium">Spaces</span>
        </Link>

        {/* Create Space - Center FAB */}
        <Link
          to="/spaces/new"
          className="flex flex-col items-center justify-center -mt-8 touch-manipulation"
        >
          <div className="flex items-center justify-center h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95">
            <Plus className="h-6 w-6" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground mt-1">Create</span>
        </Link>

        {/* Analytics */}
        <Link
          to="/analytics"
          className={cn(
            "flex flex-col items-center justify-center gap-1 min-w-[48px] py-2 px-2 rounded-xl transition-all duration-200 touch-manipulation",
            isActive("/analytics")
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <PieChart className="h-5 w-5 shrink-0" />
          <span className="text-[10px] font-medium">Analytics</span>
        </Link>

        {/* Settings */}
        <Link
          to="/settings"
          className={cn(
            "flex flex-col items-center justify-center gap-1 min-w-[48px] py-2 px-2 rounded-xl transition-all duration-200 touch-manipulation",
            isActive("/settings")
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Settings className="h-5 w-5 shrink-0" />
          <span className="text-[10px] font-medium">Settings</span>
        </Link>
      </div>
    </nav>
  );
}
