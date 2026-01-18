import { Link, useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import { LogOut, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/Logo";

export function MobileHeader() {
  const { signOut } = useClerk();
  const { displayName, avatarUrl, getInitials } = useProfile();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 backdrop-blur-md px-4 lg:hidden">
      {/* Logo */}
      <Logo to="/dashboard" size="md" />

      {/* Right Side Actions */}
      <div className="flex items-center gap-1">
        <ThemeToggle />

        <NotificationDropdown className="touch-manipulation" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full touch-manipulation">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
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
  );
}
