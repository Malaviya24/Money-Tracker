import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { IndianRupee, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const spaceTypes = [
  { value: "Personal", label: "💼 Personal" },
  { value: "Student", label: "📚 Student" },
  { value: "Travel", label: "✈️ Travel" },
  { value: "Event", label: "🎉 Event" },
  { value: "Team", label: "👥 Team" },
];

const spaceIcons = [
  { value: "💼", label: "💼 Briefcase" },
  { value: "📚", label: "📚 Books" },
  { value: "✈️", label: "✈️ Airplane" },
  { value: "🎉", label: "🎉 Party" },
  { value: "👥", label: "👥 Team" },
  { value: "🏠", label: "🏠 Home" },
  { value: "🛒", label: "🛒 Shopping" },
  { value: "💰", label: "💰 Money" },
  { value: "🎮", label: "🎮 Gaming" },
  { value: "🍔", label: "🍔 Food" },
  { value: "🚗", label: "🚗 Car" },
  { value: "🏥", label: "🏥 Health" },
  { value: "🎁", label: "🎁 Gifts" },
  { value: "📱", label: "📱 Tech" },
  { value: "🐾", label: "🐾 Pets" },
];

interface Space {
  id: string;
  name: string;
  type: string;
  budget: number;
  icon: string | null;
  currency: string;
}

interface EditSpaceDialogProps {
  space: Space;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SpaceFormData {
  name: string;
  type: string;
  budget: string;
  icon: string;
}

export function EditSpaceDialog({ space, open, onOpenChange }: EditSpaceDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<SpaceFormData>({
    name: "",
    type: "",
    budget: "",
    icon: "",
  });

  useEffect(() => {
    if (space && open) {
      setFormData({
        name: space.name,
        type: space.type,
        budget: space.budget.toString(),
        icon: space.icon || "",
      });
    }
  }, [space, open]);

  const updateSpaceMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("spaces")
        .update({
          name: formData.name.trim(),
          type: formData.type,
          budget: parseFloat(formData.budget) || 0,
          icon: formData.icon || null,
        })
        .eq("id", space.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["space", space.id] });
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      toast.success("Space updated successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to update space: " + error.message);
    },
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a space name");
      return;
    }
    if (!formData.type) {
      toast.error("Please select a space type");
      return;
    }
    updateSpaceMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] md:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base md:text-lg">Edit Space</DialogTitle>
          <DialogDescription className="text-xs md:text-sm">
            Update your space details
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-space-name" className="text-xs md:text-sm">
              Space Name
            </Label>
            <Input
              id="edit-space-name"
              placeholder="My Space"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              maxLength={50}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-space-type" className="text-xs md:text-sm">
                Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {spaceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-space-icon" className="text-xs md:text-sm">
                Icon
              </Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData({ ...formData, icon: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  {spaceIcons.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value}>
                      {icon.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-space-budget" className="text-xs md:text-sm">
              Budget
            </Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="edit-space-budget"
                type="number"
                placeholder="0"
                className="pl-9"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateSpaceMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateSpaceMutation.isPending}
          >
            {updateSpaceMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
