import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Calendar,
  IndianRupee,
  ArrowLeft,
  MoreVertical,
  Loader2,
  Download,
  FileText,
  FileSpreadsheet,
  Settings,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  TooltipProps,
} from "recharts";
import { formatCurrency, formatCurrencyWithDecimals } from "@/lib/currency";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, subDays, startOfDay } from "date-fns";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";
import { EditSpaceDialog } from "@/components/EditSpaceDialog";

// Custom tooltip with proper styling
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-muted-foreground">
            {entry.name}: <span className="font-semibold text-foreground">{formatCurrency(entry.value as number)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground">{payload[0].name}</p>
        <p className="text-sm text-muted-foreground">
          Amount: <span className="font-semibold text-foreground">{formatCurrency(payload[0].value as number)}</span>
        </p>
      </div>
    );
  }
  return null;
};

const categories = [
  { value: "Food", label: "🍔 Food", color: "hsl(var(--chart-1))" },
  { value: "Transport", label: "🚗 Transport", color: "hsl(var(--chart-2))" },
  { value: "Rent", label: "🏠 Rent", color: "hsl(var(--chart-3))" },
  { value: "Education", label: "📚 Education", color: "hsl(var(--chart-4))" },
  { value: "Entertainment", label: "🎮 Entertainment", color: "hsl(var(--chart-5))" },
  { value: "Miscellaneous", label: "📦 Miscellaneous", color: "hsl(var(--muted))" },
];

const spaceEmojis: Record<string, string> = {
  Personal: "💼",
  Student: "📚",
  Travel: "✈️",
  Event: "🎉",
  Team: "👥",
};

interface ExpenseFormData {
  id?: string;
  title: string;
  amount: string;
  category: string;
  date: string;
  notes: string;
}

const initialFormData: ExpenseFormData = {
  title: "",
  amount: "",
  category: "",
  date: format(new Date(), "yyyy-MM-dd"),
  notes: "",
};

export default function SpaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId } = useSupabaseUser();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false);
  const [isEditSpaceOpen, setIsEditSpaceOpen] = useState(false);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<ExpenseFormData>(initialFormData);

  // Fetch space details
  const { data: space, isLoading: spaceLoading } = useQuery({
    queryKey: ["space", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("spaces")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch expenses for this space
  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ["space-expenses", id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("space_id", id)
        .order("date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Add expense mutation
  const addExpenseMutation = useMutation({
    mutationFn: async () => {
      if (!userId || !id) throw new Error("Not authenticated");
      
      const { error } = await supabase.from("expenses").insert({
        user_id: userId,
        space_id: id,
        description: formData.title.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
        notes: formData.notes.trim() || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["space-expenses", id] });
      queryClient.invalidateQueries({ queryKey: ["space", id] });
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      toast.success("Expense added successfully");
      setIsAddExpenseOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to add expense: " + error.message);
    },
  });

  // Edit expense mutation
  const editExpenseMutation = useMutation({
    mutationFn: async () => {
      if (!formData.id) throw new Error("No expense selected");
      
      const { error } = await supabase
        .from("expenses")
        .update({
          description: formData.title.trim(),
          amount: parseFloat(formData.amount),
          category: formData.category,
          date: formData.date,
          notes: formData.notes.trim() || null,
        })
        .eq("id", formData.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["space-expenses", id] });
      queryClient.invalidateQueries({ queryKey: ["space", id] });
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      toast.success("Expense updated successfully");
      setIsEditExpenseOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update expense: " + error.message);
    },
  });

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["space-expenses", id] });
      queryClient.invalidateQueries({ queryKey: ["space", id] });
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      toast.success("Expense deleted successfully");
      setDeleteExpenseId(null);
    },
    onError: (error) => {
      toast.error("Failed to delete expense: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const handleOpenAddExpense = () => {
    resetForm();
    setIsAddExpenseOpen(true);
  };

  const handleOpenEditExpense = (expense: typeof expenses[0]) => {
    setFormData({
      id: expense.id,
      title: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date,
      notes: expense.notes || "",
    });
    setIsEditExpenseOpen(true);
  };

  const handleAddExpense = () => {
    if (!formData.title.trim() || !formData.amount || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }
    addExpenseMutation.mutate();
  };

  const handleEditExpense = () => {
    if (!formData.title.trim() || !formData.amount || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }
    editExpenseMutation.mutate();
  };

  // Calculate category data for pie chart
  const categoryData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    expenses.forEach((expense) => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    return Object.entries(categoryTotals).map(([name, value]) => {
      const category = categories.find((c) => c.value === name);
      return {
        name,
        value,
        color: category?.color || "hsl(var(--muted))",
      };
    });
  }, [expenses]);

  // Calculate daily data for bar chart (last 7 days)
  const dailyData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyTotals: Record<string, number> = {};
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayName = days[date.getDay()];
      dailyTotals[dayName] = 0;
    }

    // Sum expenses per day
    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date);
      const sevenDaysAgo = subDays(startOfDay(new Date()), 6);
      
      if (expenseDate >= sevenDaysAgo) {
        const dayName = days[expenseDate.getDay()];
        dailyTotals[dayName] = (dailyTotals[dayName] || 0) + expense.amount;
      }
    });

    return Object.entries(dailyTotals).map(([day, amount]) => ({
      day,
      amount,
    }));
  }, [expenses]);

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const isLoading = spaceLoading || expensesLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!space) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-muted-foreground mb-4">Space not found</p>
          <Button asChild>
            <Link to="/spaces">Go back to Spaces</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const percentage = space.budget > 0 
    ? Math.min((space.spent / space.budget) * 100, 100)
    : 0;
  const remaining = space.budget - space.spent;
  const emoji = space.icon || spaceEmojis[space.type] || "📁";

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:gap-4">
          <Link
            to="/spaces"
            className="inline-flex items-center gap-2 text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors touch-manipulation w-fit"
          >
            <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Back to Spaces
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              <span className="text-3xl md:text-4xl">{emoji}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold">{space.name}</h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 md:h-8 md:w-8"
                    onClick={() => setIsEditSpaceOpen(true)}
                  >
                    <Settings className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-[10px] md:text-xs">{space.type}</Badge>
                  <span className="text-[10px] md:text-sm text-muted-foreground">
                    Created {format(new Date(space.created_at), "MMMM yyyy")}
                  </span>
                </div>
              </div>
            </div>
            <Button size="sm" className="touch-manipulation w-fit" onClick={handleOpenAddExpense}>
              <Plus className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
              Add Expense
            </Button>
            
            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="touch-manipulation w-fit" disabled={expenses.length === 0}>
                  <Download className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="touch-manipulation"
                  onClick={() => exportToCSV(expenses, space.name)}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="touch-manipulation"
                  onClick={() => exportToPDF(expenses, space)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Edit Space Dialog */}
            <EditSpaceDialog
              space={space}
              open={isEditSpaceOpen}
              onOpenChange={setIsEditSpaceOpen}
            />
            
            {/* Add Expense Dialog */}
            <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
              <DialogContent className="max-w-[90vw] md:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-base md:text-lg">Add New Expense</DialogTitle>
                  <DialogDescription className="text-xs md:text-sm">
                    Record a new expense in {space.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-title" className="text-xs md:text-sm">Title</Label>
                    <Input 
                      id="add-title" 
                      placeholder="Expense title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      maxLength={100}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="add-amount" className="text-xs md:text-sm">Amount</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input 
                          id="add-amount" 
                          type="number" 
                          placeholder="0" 
                          className="pl-9"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-category" className="text-xs md:text-sm">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-date" className="text-xs md:text-sm">Date</Label>
                    <Input 
                      id="add-date" 
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-notes" className="text-xs md:text-sm">Notes (Optional)</Label>
                    <Textarea 
                      id="add-notes" 
                      placeholder="Add any notes..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      maxLength={500}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 md:gap-3">
                  <Button variant="outline" onClick={() => setIsAddExpenseOpen(false)} size="sm" className="touch-manipulation">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddExpense} 
                    size="sm" 
                    className="touch-manipulation"
                    disabled={addExpenseMutation.isPending}
                  >
                    {addExpenseMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Add Expense"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Expense Dialog */}
            <Dialog open={isEditExpenseOpen} onOpenChange={setIsEditExpenseOpen}>
              <DialogContent className="max-w-[90vw] md:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-base md:text-lg">Edit Expense</DialogTitle>
                  <DialogDescription className="text-xs md:text-sm">
                    Update expense details
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title" className="text-xs md:text-sm">Title</Label>
                    <Input 
                      id="edit-title" 
                      placeholder="Expense title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      maxLength={100}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-amount" className="text-xs md:text-sm">Amount</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input 
                          id="edit-amount" 
                          type="number" 
                          placeholder="0" 
                          className="pl-9"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-category" className="text-xs md:text-sm">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-date" className="text-xs md:text-sm">Date</Label>
                    <Input 
                      id="edit-date" 
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-notes" className="text-xs md:text-sm">Notes (Optional)</Label>
                    <Textarea 
                      id="edit-notes" 
                      placeholder="Add any notes..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      maxLength={500}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 md:gap-3">
                  <Button variant="outline" onClick={() => setIsEditExpenseOpen(false)} size="sm" className="touch-manipulation">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleEditExpense} 
                    size="sm" 
                    className="touch-manipulation"
                    disabled={editExpenseMutation.isPending}
                  >
                    {editExpenseMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="border-border">
            <CardHeader className="pb-1 md:pb-2">
              <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold">
                {formatCurrency(space.spent)}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-1 md:pb-2">
              <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">
                Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold">
                {formatCurrency(space.budget)}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-1 md:pb-2">
              <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">
                Remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-lg md:text-2xl font-bold ${
                  remaining >= 0 ? "text-[hsl(var(--success))]" : "text-destructive"
                }`}
              >
                {formatCurrency(Math.abs(remaining))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-1 md:pb-2">
              <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">
                Budget Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold">{percentage.toFixed(0)}%</div>
              <Progress value={percentage} className="h-1.5 md:h-2 mt-1.5 md:mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          <Card className="border-border">
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-sm md:text-base">Spending by Category</CardTitle>
              <CardDescription className="text-xs md:text-sm">Distribution of expenses</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryData.length === 0 ? (
                <div className="h-48 md:h-64 flex items-center justify-center text-muted-foreground">
                  No expenses yet
                </div>
              ) : (
                <>
                  <div className="h-48 md:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 md:mt-4 flex flex-wrap gap-2 md:gap-3 justify-center">
                    {categoryData.map((item) => (
                      <div key={item.name} className="flex items-center gap-1.5 md:gap-2">
                        <div
                          className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-[10px] md:text-sm text-muted-foreground">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-sm md:text-base">Daily Spending</CardTitle>
              <CardDescription className="text-xs md:text-sm">This week's spending pattern</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 md:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={10} />
                    <YAxis axisLine={false} tickLine={false} fontSize={10} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Amount" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expenses List */}
        <Card className="border-border">
          <CardHeader className="pb-3 md:pb-4">
            <div className="flex flex-col gap-3 md:gap-4">
              <div>
                <CardTitle className="text-sm md:text-base">Expenses</CardTitle>
                <CardDescription className="text-xs md:text-sm">{expenses.length} total expenses</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-36 h-9">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 md:space-y-3">
              {filteredExpenses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {expenses.length === 0 ? "No expenses yet. Add your first expense!" : "No matching expenses found"}
                </div>
              ) : (
                filteredExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 md:p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                      <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg bg-primary/10 text-base md:text-lg shrink-0">
                        {categories.find((c) => c.value === expense.category)?.label.split(" ")[0] || "📦"}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-xs md:text-sm truncate">{expense.description}</h4>
                        <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm text-muted-foreground">
                          <Badge variant="secondary" className="text-[8px] md:text-xs shrink-0">
                            {expense.category}
                          </Badge>
                          <span className="hidden sm:inline">•</span>
                          <div className="hidden sm:flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(expense.date), "MMM d, yyyy")}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4 shrink-0">
                      <span className="font-semibold text-xs md:text-sm">-{formatCurrencyWithDecimals(expense.amount)}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 touch-manipulation">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="touch-manipulation"
                            onClick={() => handleOpenEditExpense(expense)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive touch-manipulation"
                            onClick={() => setDeleteExpenseId(expense.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Expense Confirmation */}
      <AlertDialog open={!!deleteExpenseId} onOpenChange={() => setDeleteExpenseId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteExpenseId && deleteExpenseMutation.mutate(deleteExpenseId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteExpenseMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
