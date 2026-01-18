import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, User, ExternalLink, LogOut, Trash2, Bell, CreditCard, Crown } from "lucide-react";
import { useClerk } from "@clerk/clerk-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Settings() {
  const { openUserProfile, signOut: clerkSignOut } = useClerk();
  const { profile, isLoading, displayName, avatarUrl, getInitials } = useProfile();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    await clerkSignOut();
    toast.success("Signed out successfully");
    navigate("/login");
  };

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
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto bg-muted p-1 rounded-full">
            <TabsTrigger
              value="profile"
              className="gap-2 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="gap-2 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="gap-2 rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Profile Section */}
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

            {/* Danger Zone */}
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible account actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-medium text-sm">Sign Out</h4>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Sign out of your account on this device
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="w-fit" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-medium text-sm">Delete Account</h4>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" className="w-fit">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Choose what updates you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">Budget Alerts</h4>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Get notified when approaching budget limits
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">Weekly Summary</h4>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Receive weekly spending summaries
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">Expense Reminders</h4>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Daily reminders to log expenses
                    </p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">Product Updates</h4>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      News about new features and improvements
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Manage your subscription</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card">
                  <div>
                    <h3 className="font-semibold text-base">Free Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      Up to 3 expense spaces
                    </p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="w-fit">
                        <Crown className="h-4 w-4 mr-2" />
                        Upgrade to Pro
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Crown className="h-5 w-5 text-primary" />
                          Coming Soon
                        </DialogTitle>
                        <DialogDescription>
                          🚧 Pro features are under development. Stay tuned for
                          unlimited spaces, advanced analytics, team
                          collaboration, and more!
                        </DialogDescription>
                      </DialogHeader>
                      <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <h4 className="font-semibold mb-2 text-sm">
                          Upcoming Pro Features:
                        </h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>• Unlimited expense spaces</li>
                          <li>• Advanced AI insights</li>
                          <li>• Team collaboration tools</li>
                          <li>• Export to PDF/CSV</li>
                          <li>• Priority support</li>
                        </ul>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
