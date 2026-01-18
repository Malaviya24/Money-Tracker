import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import { AppSidebar } from "./AppSidebar";
import { MobileHeader } from "./MobileHeader";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { Search, LogOut, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageTransition } from "@/components/PageTransition";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { signOut } = useClerk();
  const { displayName, avatarUrl, getInitials } = useProfile();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Mobile Header */}
      <MobileHeader />

      {/* Main Content */}
      <div className="lg:ml-64 transition-all duration-300">
        {/* Desktop Top Bar */}
        <header className="sticky top-0 z-30 hidden lg:flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-6">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search spaces, expenses..."
                className="pl-9 bg-card border-input"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <NotificationDropdown />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  {displayName}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 cursor-pointer">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6 pb-24 lg:pb-6">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
