import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Leaf, ShoppingBag, X, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface BagSelectionModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onCancel: () => void;
  locationName: string;
}

export default function BagSelectionModal({ 
  isOpen, 
  onComplete, 
  onCancel, 
  locationName 
}: BagSelectionModalProps) {
  const [selectedBags, setSelectedBags] = useState<Record<number, number>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bagTypes } = useQuery({
    queryKey: ["/api/bag-types"],
    enabled: isOpen,
  });

  const { data: cars } = useQuery({
    queryKey: ["/api/cars"],
    enabled: isOpen,
  });

  const recordUsageMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/bag-usage", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bags recorded!",
        description: "Your savings have been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/savings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bag-usage"] });
      onComplete();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!isOpen) return null;

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "leaf":
        return Leaf;
      case "shopping-bag":
        return ShoppingBag;
      default:
        return ShoppingBag;
    }
  };

  const updateBagQuantity = (bagTypeId: number, change: number) => {
    setSelectedBags(prev => ({
      ...prev,
      [bagTypeId]: Math.max(0, (prev[bagTypeId] || 0) + change)
    }));
  };

  const handleConfirm = () => {
    const selectedEntries = Object.entries(selectedBags).filter(([_, quantity]) => quantity > 0);
    
    if (selectedEntries.length === 0) {
      toast({
        title: "No bags selected",
        description: "Please select at least one bag type.",
        variant: "destructive",
      });
      return;
    }

    // Record each bag type usage
    selectedEntries.forEach(([bagTypeId, quantity]) => {
      const bagType = bagTypes?.find((bt: any) => bt.id === parseInt(bagTypeId));
      if (bagType) {
        const savingsAmount = parseFloat(bagType.pricePerBag) * quantity;
        
        recordUsageMutation.mutate({
          bagTypeId: parseInt(bagTypeId),
          quantity,
          savingsAmount,
          carId: cars?.[0]?.id || null, // Use first car if available
          locationId: null, // Would need location ID if we had it
        });
      }
    });
  };

  const totalSavings = Object.entries(selectedBags).reduce((total, [bagTypeId, quantity]) => {
    const bagType = bagTypes?.find((bt: any) => bt.id === parseInt(bagTypeId));
    if (bagType && quantity > 0) {
      return total + (parseFloat(bagType.pricePerBag) * quantity);
    }
    return total;
  }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="ios-card mx-6 rounded-ios-lg p-6 max-w-sm w-full shadow-xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-ios-text">Which bags did you use?</h3>
          <Button
            onClick={onCancel}
            variant="ghost"
            size="sm"
            className="ios-button p-1"
          >
            <X className="w-5 h-5 text-ios-secondary" />
          </Button>
        </div>

        {locationName && (
          <p className="text-sm text-ios-secondary mb-4">at {locationName}</p>
        )}

        <div className="space-y-3 mb-6">
          {bagTypes && bagTypes.length > 0 ? (
            bagTypes.map((bagType: any) => {
              const IconComponent = getIconComponent(bagType.icon);
              const quantity = selectedBags[bagType.id] || 0;
              
              return (
                <Card key={bagType.id} className="ios-card rounded-ios p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: bagType.color }}
                      >
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="font-medium text-ios-text">{bagType.name}</span>
                        <p className="text-sm text-ios-secondary">
                          Save ${bagType.pricePerBag} each
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => updateBagQuantity(bagType.id, -1)}
                        disabled={quantity === 0}
                        size="sm"
                        variant="outline"
                        className="ios-button w-8 h-8 p-0 rounded-full"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      
                      <span className="w-8 text-center font-semibold text-ios-text">
                        {quantity}
                      </span>
                      
                      <Button
                        onClick={() => updateBagQuantity(bagType.id, 1)}
                        size="sm"
                        className="ios-button w-8 h-8 p-0 rounded-full"
                        style={{ backgroundColor: bagType.color }}
                      >
                        <Plus className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-4 text-ios-secondary">
              <p>No bag types configured</p>
              <p className="text-xs">Set up bag types in your profile first</p>
            </div>
          )}
        </div>

        {totalSavings > 0 && (
          <div className="mb-4 p-3 bg-ios-green bg-opacity-10 rounded-ios border border-ios-green border-opacity-30">
            <div className="text-center">
              <p className="text-sm text-ios-text">Total Savings</p>
              <p className="text-lg font-bold text-ios-green">${totalSavings.toFixed(2)}</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleConfirm}
            disabled={totalSavings === 0 || recordUsageMutation.isPending}
            className="w-full ios-button bg-ios-green hover:bg-ios-green/90 text-white rounded-ios py-3 font-medium"
          >
            {recordUsageMutation.isPending ? "Recording..." : `Confirm - Save $${totalSavings.toFixed(2)}`}
          </Button>
          
          <Button
            onClick={onCancel}
            variant="outline"
            className="w-full ios-button rounded-ios py-3 font-medium"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
