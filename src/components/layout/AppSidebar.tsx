import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  PieChart,
  Settings,
  Crown,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Spaces", url: "/spaces", icon: Wallet },
  { title: "Analytics", url: "/analytics", icon: PieChart },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { displayName, avatarUrl, getInitials } = useProfile();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && (
          <Logo to="/dashboard" size="lg" className="text-sidebar-foreground" />
        )}
        {collapsed && (
          <Link to="/dashboard" className="font-serif italic text-xl font-medium text-sidebar-foreground hover:opacity-80 transition-opacity">
            T
          </Link>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar shadow-sm hover:bg-accent transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-sidebar-foreground" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-sidebar-foreground" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item) => (
          <Link
            key={item.title}
            to={item.url}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isActive(item.url)
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </Link>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="absolute bottom-4 left-3 right-3 space-y-3">
        {/* User Avatar with Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 hover:bg-sidebar-accent w-full",
                collapsed && "justify-center px-0"
              )}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-muted-foreground">Free Plan</p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Upgrade Card */}
        {!collapsed && (
          <div className="rounded-xl bg-gradient-to-br from-primary/10 to-accent/20 p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sidebar-foreground">Go Pro</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Unlock unlimited spaces & advanced analytics
            </p>
            <Button size="sm" className="w-full">
              Upgrade Now
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
