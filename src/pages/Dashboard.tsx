import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Plus,
  ArrowRight,
  Crown,
  AlertTriangle,
  CheckCircle2,
  Loader2,
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
import { formatCurrency, formatCurrencyWithDecimals } from "@/lib/currency";
import { useProfile } from "@/hooks/useProfile";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

const spaceEmojis: Record<string, string> = {
  Personal: "💼",
  Student: "📚",
  Travel: "✈️",
  Event: "🎉",
  Team: "👥",
};

function getBudgetStatus(spent: number, budget: number) {
  if (budget === 0) return { status: "none", color: "text-muted-foreground", icon: CheckCircle2 };
  const percentage = (spent / budget) * 100;
  if (percentage >= 100) return { status: "over", color: "text-destructive", icon: AlertTriangle };
  if (percentage >= 80) return { status: "near", color: "text-[hsl(var(--warning))]", icon: AlertTriangle };
  return { status: "good", color: "text-[hsl(var(--success))]", icon: CheckCircle2 };
}

export default function Dashboard() {
  const { userId, isLoading: userLoading } = useSupabaseUser();
  const { displayName } = useProfile();

  // Fetch spaces
  const { data: spaces = [], isLoading: spacesLoading } = useQuery({
    queryKey: ["spaces", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("spaces")
        .select("*")
        .eq("user_id", userId)
        .eq("archived", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 30000,
  });

  // Fetch recent expenses (only from non-archived spaces)
  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ["expenses", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("expenses")
        .select("*, spaces!inner(name, archived)")
        .eq("user_id", userId)
        .eq("spaces.archived", false)
        .order("date", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 30000,
  });

  // Fetch last month's expenses for comparison (only from non-archived spaces)
  const { data: lastMonthExpenses = [] } = useQuery({
    queryKey: ["lastMonthExpenses", userId],
    queryFn: async () => {
      if (!userId) return [];
      const lastMonth = subMonths(new Date(), 1);
      const start = startOfMonth(lastMonth);
      const end = endOfMonth(lastMonth);

      const { data, error } = await supabase
        .from("expenses")
        .select("amount, spaces!inner(archived)")
        .eq("user_id", userId)
        .eq("spaces.archived", false)
        .gte("date", format(start, "yyyy-MM-dd"))
        .lte("date", format(end, "yyyy-MM-dd"));

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 60000,
  });

  // Calculate stats
  const stats = useMemo(() => {
    const thisMonth = new Date();
    const monthStart = startOfMonth(thisMonth);
    
    const thisMonthExpenses = expenses.filter(
      (e) => new Date(e.date) >= monthStart
    );
    const thisMonthTotal = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const lastMonthTotal = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    const percentChange = lastMonthTotal > 0 
      ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 
      : 0;

    const spacesWithinBudget = spaces.filter((s) => s.spent <= s.budget).length;

    return [
      {
        title: "Total Spaces",
        value: spaces.length.toString(),
        icon: Wallet,
        trend: spaces.length > 0 ? `${spaces.length} active` : "No spaces yet",
        trendUp: true,
      },
      {
        title: "Monthly Spending",
        value: formatCurrency(thisMonthTotal),
        icon: IndianRupee,
        trend: lastMonthTotal > 0 
          ? `${percentChange >= 0 ? "+" : ""}${percentChange.toFixed(0)}% vs last month`
          : "No data last month",
        trendUp: percentChange <= 0,
      },
      {
        title: "Budget Health",
        value: spaces.length > 0 
          ? (spacesWithinBudget === spaces.length ? "Good" : "Warning")
          : "N/A",
        icon: TrendingUp,
        trend: spaces.length > 0 
          ? `${spacesWithinBudget} spaces within budget`
          : "Create a space to start",
        trendUp: spacesWithinBudget === spaces.length,
      },
    ];
  }, [spaces, expenses, lastMonthExpenses]);

  // Get recent spaces (up to 3)
  const recentSpaces = spaces.slice(0, 3);

  // Format recent expenses for display
  const recentExpensesFormatted = useMemo(() => {
    return expenses.slice(0, 4).map((expense) => {
      const today = new Date();
      const expenseDate = new Date(expense.date);
      const isToday = expenseDate.toDateString() === today.toDateString();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday = expenseDate.toDateString() === yesterday.toDateString();

      return {
        id: expense.id,
        title: expense.description,
        amount: expense.amount,
        category: expense.category,
        space: expense.spaces?.name || "Unknown",
        date: isToday ? "Today" : isYesterday ? "Yesterday" : format(expenseDate, "MMM d"),
      };
    });
  }, [expenses]);

  const isLoading = userLoading || spacesLoading || expensesLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Welcome back, {displayName}! 👋</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Here's an overview of your expense spaces
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 md:gap-2 touch-manipulation text-xs md:text-sm">
                  <Crown className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Upgrade to</span> Pro
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] md:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-primary" />
                    Coming Soon
                  </DialogTitle>
                  <DialogDescription>
                    🚧 Pro features are under development. Stay tuned for unlimited
                    spaces, advanced analytics, team collaboration, and more!
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h4 className="font-semibold mb-2 text-sm md:text-base">Upcoming Pro Features:</h4>
                  <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
                    <li>• Unlimited expense spaces</li>
                    <li>• Advanced AI insights</li>
                    <li>• Team collaboration tools</li>
                    <li>• Export to PDF/CSV</li>
                    <li>• Priority support</li>
                  </ul>
                </div>
              </DialogContent>
            </Dialog>
            <Button asChild size="sm" className="touch-manipulation">
              <Link to="/spaces/new" className="gap-1.5 md:gap-2">
                <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden sm:inline">New</span> Space
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
                <p
                  className={`text-[10px] md:text-xs mt-1 flex items-center gap-1 ${
                    stat.trendUp ? "text-[hsl(var(--success))]" : "text-destructive"
                  }`}
                >
                  {stat.trendUp ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Spaces & Recent Activity */}
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          {/* Recent Spaces */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 md:pb-4">
              <div>
                <CardTitle className="text-base md:text-lg">Your Spaces</CardTitle>
                <CardDescription className="text-xs md:text-sm">Quick access to your expense spaces</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="touch-manipulation">
                <Link to="/spaces" className="flex items-center gap-1 text-xs md:text-sm">
                  View all
                  <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              {recentSpaces.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-4">No spaces yet</p>
                  <Button asChild size="sm">
                    <Link to="/spaces/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Create your first space
                    </Link>
                  </Button>
                </div>
              ) : (
                recentSpaces.map((space) => {
                  const budgetStatus = getBudgetStatus(space.spent, space.budget);
                  const percentage = space.budget > 0 
                    ? Math.min((space.spent / space.budget) * 100, 100)
                    : 0;
                  const emoji = space.icon || spaceEmojis[space.type] || "📁";
                  
                  return (
                    <Link
                      key={space.id}
                      to={`/spaces/${space.id}`}
                      className="block p-3 md:p-4 rounded-xl border border-border bg-card hover:bg-accent/50 active:bg-accent/70 transition-colors touch-manipulation"
                    >
                      <div className="flex items-center justify-between mb-2 md:mb-3">
                        <div className="flex items-center gap-2 md:gap-3">
                          <span className="text-xl md:text-2xl">{emoji}</span>
                          <div>
                            <h3 className="font-semibold text-sm md:text-base">{space.name}</h3>
                            <p className="text-[10px] md:text-xs text-muted-foreground">{space.type}</p>
                          </div>
                        </div>
                        <budgetStatus.icon className={`h-4 w-4 md:h-5 md:w-5 ${budgetStatus.color}`} />
                      </div>
                      <div className="space-y-1.5 md:space-y-2">
                        <div className="flex justify-between text-xs md:text-sm">
                          <span className="text-muted-foreground">
                            {formatCurrency(space.spent)} / {formatCurrency(space.budget)}
                          </span>
                          <span className={budgetStatus.color}>
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={percentage} className="h-1.5 md:h-2" />
                      </div>
                    </Link>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Recent Expenses */}
          <Card className="border-border">
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-base md:text-lg">Recent Expenses</CardTitle>
              <CardDescription className="text-xs md:text-sm">Latest transactions across all spaces</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {recentExpensesFormatted.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No expenses yet</p>
                  </div>
                ) : (
                  recentExpensesFormatted.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-2.5 md:p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg bg-primary/10">
                          <IndianRupee className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-xs md:text-sm">{expense.title}</h4>
                          <p className="text-[10px] md:text-xs text-muted-foreground">
                            {expense.category} • {expense.space}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-xs md:text-sm">
                          -{formatCurrencyWithDecimals(expense.amount)}
                        </p>
                        <p className="text-[10px] md:text-xs text-muted-foreground">{expense.date}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
