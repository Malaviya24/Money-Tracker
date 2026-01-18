import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/useProfile";
import { Loader2, User, ExternalLink } from "lucide-react";
import { UserProfile, useClerk } from "@clerk/clerk-react";

export default function Profile() {
  const { profile, isLoading, displayName, avatarUrl, getInitials } = useProfile();
  const { openUserProfile } = useClerk();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and preferences
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Picture
              </CardTitle>
              <CardDescription>
                Your profile is managed by Clerk
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={avatarUrl || undefined} alt="Profile" />
                <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              
              <Button
                variant="outline"
                onClick={() => openUserProfile()}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Manage Profile
              </Button>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Your account details from Clerk
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{displayName}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">First Name</p>
                <p className="font-medium">{profile?.first_name || "Not set"}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Last Name</p>
                <p className="font-medium">{profile?.last_name || "Not set"}</p>
              </div>

              <Button
                onClick={() => openUserProfile()}
                className="w-full mt-4"
              >
                Edit in Clerk
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
