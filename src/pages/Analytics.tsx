import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Calendar,
} from "lucide-react";
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
  LineChart,
  Line,
  CartesianGrid,
  TooltipProps,
} from "recharts";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { startOfWeek, startOfMonth, startOfQuarter, startOfYear, format, subMonths } from "date-fns";

// Currency formatter for INR
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

// Custom tooltip component with proper styling
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-xl p-4 shadow-xl backdrop-blur-sm">
        <p className="text-sm font-semibold text-foreground mb-2 pb-2 border-b border-border">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: entry.color || 'hsl(var(--primary))' }}
                />
                <span className="text-sm text-muted-foreground">{entry.name}</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{formatCurrency(entry.value as number)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Custom tooltip for pie chart
const PieTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const percentage = payload[0].payload?.percent 
      ? `${(payload[0].payload.percent * 100).toFixed(1)}%` 
      : null;
    return (
      <div className="bg-popover border border-border rounded-xl p-4 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: payload[0].payload?.color || 'hsl(var(--primary))' }}
          />
          <p className="text-sm font-semibold text-foreground">{payload[0].name}</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="text-sm font-semibold text-foreground">{formatCurrency(payload[0].value as number)}</span>
          </div>
          {percentage && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Share</span>
              <span className="text-sm font-semibold text-foreground">{percentage}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

// Custom tooltip for space comparison bar chart
const SpaceComparisonTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const spent = payload.find(p => p.dataKey === 'spent')?.value as number || 0;
    const budget = payload.find(p => p.dataKey === 'budget')?.value as number || 0;
    const percentage = budget > 0 ? ((spent / budget) * 100).toFixed(1) : '0';
    const isOverBudget = spent > budget;
    
    return (
      <div className="bg-popover border border-border rounded-xl p-4 shadow-xl backdrop-blur-sm min-w-[180px]">
        <p className="text-sm font-semibold text-foreground mb-3 pb-2 border-b border-border">{label}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">Spent</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{formatCurrency(spent)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/50" />
              <span className="text-sm text-muted-foreground">Budget</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{formatCurrency(budget)}</span>
          </div>
          <div className="pt-2 mt-2 border-t border-border">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Usage</span>
              <span className={`text-sm font-bold ${isOverBudget ? 'text-destructive' : 'text-primary'}`}>
                {percentage}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Category colors
const categoryColors: Record<string, string> = {
  Food: "hsl(234, 89%, 73%)",
  Transport: "hsl(255, 91%, 76%)",
  Rent: "hsl(270, 95%, 75%)",
  Entertainment: "hsl(238, 83%, 66%)",
  Education: "hsl(0, 0%, 45%)",
  Shopping: "hsl(180, 70%, 50%)",
  Health: "hsl(120, 60%, 50%)",
  Bills: "hsl(30, 80%, 55%)",
  Other: "hsl(200, 50%, 60%)",
};

const getDateRange = (period: string) => {
  const now = new Date();
  switch (period) {
    case "week":
      return startOfWeek(now, { weekStartsOn: 1 });
    case "month":
      return startOfMonth(now);
    case "quarter":
      return startOfQuarter(now);
    case "year":
      return startOfYear(now);
    default:
      return startOfMonth(now);
  }
};

export default function Analytics() {
  const { userId } = useSupabaseUser();
  const [selectedSpace, setSelectedSpace] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  // Fetch spaces
  const { data: spaces = [] } = useQuery({
    queryKey: ["spaces", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("spaces")
        .select("*")
        .eq("user_id", userId)
        .eq("archived", false);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    staleTime: 30000,
  });

  // Fetch expenses with filters (only from non-archived spaces)
  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses", userId, selectedSpace, selectedPeriod],
    queryFn: async () => {
      if (!userId) return [];
      const startDate = getDateRange(selectedPeriod);
      
      let query = supabase
        .from("expenses")
        .select("*, spaces!inner(archived)")
        .eq("user_id", userId)
        .eq("spaces.archived", false)
        .gte("date", startDate.toISOString().split("T")[0]);

      if (selectedSpace !== "all") {
        query = query.eq("space_id", selectedSpace);
      }

      const { data, error } = await query.order("date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    staleTime: 30000,
  });

  // Calculate stats
  const stats = useMemo(() => {
    const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const daysInPeriod = selectedPeriod === "week" ? 7 : selectedPeriod === "month" ? 30 : selectedPeriod === "quarter" ? 90 : 365;
    const avgDaily = totalSpent / Math.max(daysInPeriod, 1);
    const largest = expenses.length > 0 ? Math.max(...expenses.map((e) => Number(e.amount))) : 0;
    const largestExpense = expenses.find((e) => Number(e.amount) === largest);
    
    return {
      totalSpent,
      avgDaily,
      largest,
      largestDescription: largestExpense?.description || "N/A",
      transactionCount: expenses.length,
    };
  }, [expenses, selectedPeriod]);

  // Category distribution data
  const categoryData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    expenses.forEach((exp) => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + Number(exp.amount);
    });
    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
      color: categoryColors[name] || categoryColors.Other,
    }));
  }, [expenses]);

  // Monthly trend data (last 6 months)
  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const key = format(date, "MMM");
      months[key] = 0;
    }
    
    expenses.forEach((exp) => {
      const expDate = new Date(exp.date);
      const monthKey = format(expDate, "MMM");
      if (months[monthKey] !== undefined) {
        months[monthKey] += Number(exp.amount);
      }
    });

    return Object.entries(months).map(([month, amount]) => ({ month, amount }));
  }, [expenses]);

  // Space comparison data
  const spaceComparison = useMemo(() => {
    return spaces.map((space) => ({
      name: space.name,
      spent: Number(space.spent),
      budget: Number(space.budget),
    }));
  }, [spaces]);

  // Generate insights
  const insights = useMemo(() => {
    const result = [];
    
    // Check for high category spending
    if (categoryData.length > 0) {
      const topCategory = categoryData.reduce((max, cat) => cat.value > max.value ? cat : max, categoryData[0]);
      const totalSpent = categoryData.reduce((sum, cat) => sum + cat.value, 0);
      const percentage = totalSpent > 0 ? Math.round((topCategory.value / totalSpent) * 100) : 0;
      
      result.push({
        type: "info",
        title: "Top Category",
        description: `${topCategory.name} is your biggest expense at ${percentage}% of total spending.`,
        icon: Lightbulb,
      });
    }

    // Check budget status
    const spacesOverBudget = spaces.filter((s) => Number(s.spent) > Number(s.budget) && Number(s.budget) > 0);
    const spacesWithinBudget = spaces.filter((s) => Number(s.spent) <= Number(s.budget) && Number(s.budget) > 0);
    
    if (spacesOverBudget.length > 0) {
      result.push({
        type: "warning",
        title: "Over Budget Alert",
        description: `${spacesOverBudget.length} space(s) have exceeded their budget. Review your spending.`,
        icon: AlertTriangle,
      });
    } else if (spacesWithinBudget.length > 0) {
      result.push({
        type: "success",
        title: "Budget Champion",
        description: `${spacesWithinBudget.length} out of ${spaces.length} spaces are within budget. Great job!`,
        icon: TrendingUp,
      });
    }

    // Transaction insight
    if (expenses.length > 0) {
      result.push({
        type: "info",
        title: "Activity Summary",
        description: `You've made ${expenses.length} transactions this ${selectedPeriod}.`,
        icon: Lightbulb,
      });
    }

    return result.slice(0, 3);
  }, [categoryData, spaces, expenses.length, selectedPeriod]);

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Analytics</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Insights and trends across all your expense spaces
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Select value={selectedSpace} onValueChange={setSelectedSpace}>
              <SelectTrigger className="w-28 md:w-40 h-9">
                <SelectValue placeholder="Select space" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Spaces</SelectItem>
                {spaces.map((space) => (
                  <SelectItem key={space.id} value={space.id}>
                    {space.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-28 md:w-32 h-9">
                <Calendar className="h-4 w-4 mr-1.5 md:mr-2" />
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="border-border">
            <CardHeader className="pb-1 md:pb-2">
              <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold">{formatCurrency(stats.totalSpent)}</div>
              <p className="text-[10px] md:text-xs mt-1 text-muted-foreground">
                This {selectedPeriod}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-1 md:pb-2">
              <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">
                Avg. Daily
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold">{formatCurrency(stats.avgDaily)}</div>
              <p className="text-[10px] md:text-xs mt-1 text-muted-foreground">
                Per day average
              </p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-1 md:pb-2">
              <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">
                Largest
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold">{formatCurrency(stats.largest)}</div>
              <p className="text-[10px] md:text-xs mt-1 text-muted-foreground truncate">{stats.largestDescription}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-1 md:pb-2">
              <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">
                Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold">{stats.transactionCount}</div>
              <p className="text-[10px] md:text-xs mt-1 text-muted-foreground">
                {selectedSpace === "all" ? "Across all spaces" : "In this space"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Smart Insights */}
        {insights.length > 0 && (
          <ScrollArea className="w-full">
            <div className="flex gap-3 md:gap-4 pb-2 md:grid md:grid-cols-3">
              {insights.map((insight, index) => (
                <Card
                  key={index}
                  className={`border-border shrink-0 w-[280px] md:w-auto ${
                    insight.type === "warning"
                      ? "border-l-4 border-l-[hsl(var(--warning))]"
                      : insight.type === "success"
                      ? "border-l-4 border-l-[hsl(var(--success))]"
                      : "border-l-4 border-l-primary"
                  }`}
                >
                  <CardContent className="pt-4 md:pt-6">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-1.5 md:p-2 rounded-lg shrink-0 ${
                          insight.type === "warning"
                            ? "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]"
                            : insight.type === "success"
                            ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        <insight.icon className="h-4 w-4 md:h-5 md:w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-xs md:text-sm">{insight.title}</h3>
                        <p className="text-[10px] md:text-sm text-muted-foreground mt-1">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="md:hidden" />
          </ScrollArea>
        )}

        {/* Charts */}
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          {/* Monthly Trend */}
          <Card className="border-border">
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-sm md:text-base">Spending Trend</CardTitle>
              <CardDescription className="text-xs md:text-sm">Monthly spending over the past 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 md:h-64">
                {monthlyData.some((d) => d.amount > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={10} />
                      <YAxis axisLine={false} tickLine={false} fontSize={10} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 3 }}
                        name="Amount"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    No spending data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card className="border-border">
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-sm md:text-base">Category Distribution</CardTitle>
              <CardDescription className="text-xs md:text-sm">How your spending is distributed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 md:h-64">
                {categoryData.length > 0 ? (
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
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    No category data available
                  </div>
                )}
              </div>
              {categoryData.length > 0 && (
                <div className="mt-3 md:mt-4 flex flex-wrap gap-2 md:gap-3 justify-center">
                  {categoryData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5 md:gap-2">
                      <div
                        className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[10px] md:text-sm text-muted-foreground">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Space Comparison */}
        <Card className="border-border">
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="text-sm md:text-base">Space Budget Comparison</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              How each space is performing against its budget
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 md:h-64">
              {spaceComparison.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spaceComparison} layout="vertical">
                    <XAxis type="number" axisLine={false} tickLine={false} fontSize={10} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      width={60}
                      fontSize={10}
                    />
                    <Tooltip content={<SpaceComparisonTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                    <Bar dataKey="spent" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Spent" />
                    <Bar dataKey="budget" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} name="Budget" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  No spaces created yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
