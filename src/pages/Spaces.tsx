import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Archive,
  ArchiveRestore,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/currency";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const spaceTypes = [
  { value: "all", label: "All" },
  { value: "Personal", label: "Personal" },
  { value: "Student", label: "Student" },
  { value: "Travel", label: "Travel" },
  { value: "Event", label: "Event" },
  { value: "Team", label: "Team" },
];

const spaceEmojis: Record<string, string> = {
  Personal: "💼",
  Student: "📚",
  Travel: "✈️",
  Event: "🎉",
  Team: "👥",
};

function getBudgetStatus(spent: number, budget: number) {
  if (budget === 0) return { status: "No Budget", color: "secondary", icon: CheckCircle2 };
  const percentage = (spent / budget) * 100;
  if (percentage >= 100)
    return { status: "Over Budget", color: "destructive", icon: AlertTriangle };
  if (percentage >= 80)
    return { status: "Near Limit", color: "warning", icon: AlertTriangle };
  return { status: "On Track", color: "success", icon: CheckCircle2 };
}

export default function Spaces() {
  const { userId, isLoading: userLoading } = useSupabaseUser();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [activeTab, setActiveTab] = useState("active");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);

  // Fetch all spaces from Supabase (including archived)
  const { data: allSpaces = [], isLoading: spacesLoading } = useQuery({
    queryKey: ["spaces", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("spaces")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 30000,
  });

  const isLoading = userLoading || spacesLoading;

  // Separate active and archived spaces
  const activeSpaces = allSpaces.filter((space) => !space.archived);
  const archivedSpaces = allSpaces.filter((space) => space.archived);

  // Fetch expense counts for each space
  const { data: expenseCounts = {} } = useQuery({
    queryKey: ["expense-counts", userId],
    queryFn: async () => {
      if (!userId) return {};
      const { data, error } = await supabase
        .from("expenses")
        .select("space_id")
        .eq("user_id", userId);

      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data.forEach((expense) => {
        counts[expense.space_id] = (counts[expense.space_id] || 0) + 1;
      });
      return counts;
    },
    enabled: !!userId,
    staleTime: 30000,
  });

  // Delete space mutation
  const deleteMutation = useMutation({
    mutationFn: async (spaceId: string) => {
      // First delete all expenses in the space
      const { error: expenseError } = await supabase
        .from("expenses")
        .delete()
        .eq("space_id", spaceId);

      if (expenseError) throw expenseError;

      // Then delete the space
      const { error } = await supabase
        .from("spaces")
        .delete()
        .eq("id", spaceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      queryClient.invalidateQueries({ queryKey: ["expense-counts"] });
      toast.success("Space deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedSpaceId(null);
    },
    onError: (error) => {
      toast.error("Failed to delete space: " + error.message);
    },
  });

  // Archive space mutation
  const archiveMutation = useMutation({
    mutationFn: async (spaceId: string) => {
      const { error } = await supabase
        .from("spaces")
        .update({ archived: true, archived_at: new Date().toISOString() })
        .eq("id", spaceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Space archived successfully");
      setArchiveDialogOpen(false);
      setSelectedSpaceId(null);
    },
    onError: (error) => {
      toast.error("Failed to archive space: " + error.message);
    },
  });

  // Unarchive space mutation
  const unarchiveMutation = useMutation({
    mutationFn: async (spaceId: string) => {
      const { error } = await supabase
        .from("spaces")
        .update({ archived: false, archived_at: null })
        .eq("id", spaceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Space restored successfully");
    },
    onError: (error) => {
      toast.error("Failed to restore space: " + error.message);
    },
  });

  const handleDeleteClick = (spaceId: string) => {
    setSelectedSpaceId(spaceId);
    setDeleteDialogOpen(true);
  };

  const handleArchiveClick = (spaceId: string) => {
    setSelectedSpaceId(spaceId);
    setArchiveDialogOpen(true);
  };

  const handleUnarchiveClick = (spaceId: string) => {
    unarchiveMutation.mutate(spaceId);
  };

  const confirmDelete = () => {
    if (selectedSpaceId) {
      deleteMutation.mutate(selectedSpaceId);
    }
  };

  const confirmArchive = () => {
    if (selectedSpaceId) {
      archiveMutation.mutate(selectedSpaceId);
    }
  };

  const getFilteredSpaces = (spaces: typeof allSpaces) => {
    return spaces.filter((space) => {
      const matchesSearch = space.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType = selectedType === "all" || space.type === selectedType;
      return matchesSearch && matchesType;
    });
  };

  const filteredActiveSpaces = getFilteredSpaces(activeSpaces);
  const filteredArchivedSpaces = getFilteredSpaces(archivedSpaces);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const renderSpaceCard = (space: typeof allSpaces[0], isArchived: boolean = false) => {
    const budgetStatus = getBudgetStatus(space.spent, space.budget);
    const percentage = space.budget > 0 
      ? Math.min((space.spent / space.budget) * 100, 100)
      : 0;
    const emoji = space.icon || spaceEmojis[space.type] || "📁";
    const expenseCount = expenseCounts[space.id] || 0;

    return (
      <Card
        key={space.id}
        className={`border-border hover:shadow-md transition-all duration-200 ${isArchived ? 'opacity-75' : ''}`}
      >
        <CardHeader className="pb-2 md:pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-2xl md:text-3xl">{emoji}</span>
              <div>
                <CardTitle className="text-sm md:text-base">{space.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] md:text-xs">
                    {space.type}
                  </Badge>
                  {isArchived && (
                    <Badge variant="outline" className="text-[10px] md:text-xs">
                      Archived
                    </Badge>
                  )}
                </CardDescription>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 touch-manipulation">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isArchived && (
                  <>
                    <DropdownMenuItem asChild className="touch-manipulation">
                      <Link to={`/spaces/${space.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Space
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="touch-manipulation"
                      onClick={() => handleArchiveClick(space.id)}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  </>
                )}
                {isArchived && (
                  <DropdownMenuItem 
                    className="touch-manipulation"
                    onClick={() => handleUnarchiveClick(space.id)}
                    disabled={unarchiveMutation.isPending}
                  >
                    <ArchiveRestore className="h-4 w-4 mr-2" />
                    Restore
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive touch-manipulation"
                  onClick={() => handleDeleteClick(space.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4">
          <div className="flex items-center justify-between text-xs md:text-sm">
            <span className="text-muted-foreground">
              {expenseCount} expenses
            </span>
            <Badge
              variant={
                budgetStatus.color === "success"
                  ? "default"
                  : budgetStatus.color === "warning"
                  ? "secondary"
                  : "destructive"
              }
              className="gap-1 text-[10px] md:text-xs"
            >
              <budgetStatus.icon className="h-2.5 w-2.5 md:h-3 md:w-3" />
              {budgetStatus.status}
            </Badge>
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-muted-foreground">
                {formatCurrency(space.spent)} / {formatCurrency(space.budget)}
              </span>
              <span className="font-medium">
                {percentage.toFixed(0)}%
              </span>
            </div>
            <Progress value={percentage} className="h-1.5 md:h-2" />
          </div>

          {!isArchived && (
            <Button asChild variant="outline" className="w-full touch-manipulation text-xs md:text-sm" size="sm">
              <Link to={`/spaces/${space.id}`}>View Details</Link>
            </Button>
          )}
          {isArchived && (
            <Button 
              variant="outline" 
              className="w-full touch-manipulation text-xs md:text-sm" 
              size="sm"
              onClick={() => handleUnarchiveClick(space.id)}
              disabled={unarchiveMutation.isPending}
            >
              <ArchiveRestore className="h-3.5 w-3.5 mr-1.5" />
              Restore Space
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderEmptyState = (isArchived: boolean = false) => (
    <Card className="border-border">
      <CardContent className="flex flex-col items-center justify-center py-12 md:py-16">
        <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          {isArchived ? (
            <Archive className="h-7 w-7 md:h-8 md:w-8 text-primary" />
          ) : (
            <Filter className="h-7 w-7 md:h-8 md:w-8 text-primary" />
          )}
        </div>
        <h3 className="text-base md:text-lg font-semibold mb-2">
          {isArchived ? "No archived spaces" : "No spaces found"}
        </h3>
        <p className="text-muted-foreground text-center max-w-sm text-sm">
          {isArchived 
            ? "Spaces you archive will appear here"
            : searchQuery
              ? "Try adjusting your search or filter criteria"
              : "Create your first expense space to get started"
          }
        </p>
        {!searchQuery && !isArchived && (
          <Button asChild className="mt-4 touch-manipulation">
            <Link to="/spaces/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Space
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Expense Spaces</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Manage all your expense spaces in one place
            </p>
          </div>
          <Button asChild size="sm" className="w-fit touch-manipulation">
            <Link to="/spaces/new" className="gap-1.5 md:gap-2">
              <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
              Create Space
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search spaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {/* Horizontal scrollable filter pills */}
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 pb-2">
              {spaceTypes.map((type) => (
                <Button
                  key={type.value}
                  variant={selectedType === type.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type.value)}
                  className="shrink-0 touch-manipulation text-xs md:text-sm"
                >
                  {type.label}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        </div>

        {/* Tabs for Active/Archived */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="active" className="text-xs md:text-sm">
              Active ({activeSpaces.length})
            </TabsTrigger>
            <TabsTrigger value="archived" className="text-xs md:text-sm">
              Archived ({archivedSpaces.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            {filteredActiveSpaces.length === 0 ? (
              renderEmptyState(false)
            ) : (
              <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredActiveSpaces.map((space) => renderSpaceCard(space, false))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="archived" className="mt-4">
            {filteredArchivedSpaces.length === 0 ? (
              renderEmptyState(true)
            ) : (
              <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredArchivedSpaces.map((space) => renderSpaceCard(space, true))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Space</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this space? This will also delete all expenses in this space. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-muted-foreground" />
              Archive Space
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Archiving will hide this space and all its expenses from:</p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                <li>Dashboard overview</li>
                <li>Analytics & charts</li>
                <li>Budget calculations</li>
                <li>Search results</li>
              </ul>
              <p className="font-medium text-foreground mt-3">
                Your data will be safely preserved. You can restore it anytime.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmArchive}>
              {archiveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Archive Space"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
