import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, IndianRupee, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const spaceTypes = [
  { value: "Personal", emoji: "💼", description: "Track personal daily expenses" },
  { value: "Student", emoji: "📚", description: "Manage student budget & fees" },
  { value: "Travel", emoji: "✈️", description: "Plan and track trip expenses" },
  { value: "Event", emoji: "🎉", description: "Budget for special occasions" },
  { value: "Team", emoji: "👥", description: "Collaborative expense tracking" },
  { value: "Custom", emoji: "⚡", description: "Create your own category" },
];

const currencies = [
  { value: "INR", label: "INR (₹)" },
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "JPY", label: "JPY (¥)" },
  { value: "CAD", label: "CAD ($)" },
];

export default function CreateSpace() {
  const navigate = useNavigate();
  const { userId } = useSupabaseUser();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState("INR");

  const createSpaceMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Not authenticated");
      
      const selectedTypeData = spaceTypes.find((t) => t.value === selectedType);
      
      const { error } = await supabase.from("spaces").insert({
        user_id: userId,
        name: name.trim(),
        type: selectedType!,
        budget: parseFloat(budget),
        currency: currency,
        icon: selectedTypeData?.emoji || "📁",
        spent: 0,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      toast.success("Space created successfully!");
      navigate("/spaces");
    },
    onError: (error) => {
      toast.error("Failed to create space: " + error.message);
    },
  });

  const handleCreate = () => {
    if (!selectedType) {
      toast.error("Please select a space type");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter a space name");
      return;
    }
    if (!budget || parseFloat(budget) <= 0) {
      toast.error("Please enter a valid budget");
      return;
    }
    createSpaceMutation.mutate();
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Link
            to="/spaces"
            className="inline-flex items-center gap-2 text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
          >
            <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Back to Spaces
          </Link>
          <h1 className="text-xl md:text-2xl font-bold">Create New Space</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Set up a new expense space for a specific purpose
          </p>
        </div>

        {/* Space Type Selection */}
        <Card className="border-border">
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-sm md:text-lg">Choose Space Type</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Select a category that best fits your expense tracking needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
              {spaceTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`p-3 md:p-4 rounded-xl border-2 text-left transition-all duration-200 touch-manipulation ${
                    selectedType === type.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-accent/50 active:bg-accent/70"
                  }`}
                >
                  <span className="text-xl md:text-2xl mb-1 md:mb-2 block">{type.emoji}</span>
                  <h3 className="font-medium text-xs md:text-sm">{type.value}</h3>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 line-clamp-2">
                    {type.description}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Space Details */}
        <Card className="border-border">
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-sm md:text-lg">Space Details</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Configure your expense space settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs md:text-sm">Space Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Personal Expenses, Europe Trip 2024"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-xs md:text-sm">Monthly Budget *</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="budget"
                    type="number"
                    placeholder="2000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="pl-9"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-xs md:text-sm">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr.value} value={curr.value}>
                        {curr.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 md:pt-4 pb-4">
          <Button variant="outline" asChild className="touch-manipulation" size="sm">
            <Link to="/spaces">Cancel</Link>
          </Button>
          <Button 
            onClick={handleCreate} 
            className="touch-manipulation" 
            size="sm"
            disabled={createSpaceMutation.isPending}
          >
            {createSpaceMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {createSpaceMutation.isPending ? "Creating..." : "Create Space"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
