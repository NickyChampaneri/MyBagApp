import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { X, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const carSchema = z.object({
  name: z.string().min(1, "Car name is required"),
  model: z.string().optional(),
});

type CarForm = z.infer<typeof carSchema>;

interface AddCarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddCarModal({ isOpen, onClose }: AddCarModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CarForm>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      name: "",
      model: "",
    },
  });

  const createCarMutation = useMutation({
    mutationFn: async (data: CarForm) => {
      const response = await apiRequest("POST", "/api/cars", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cars"] });
      toast({
        title: "Car added successfully!",
        description: `${data.name} has been added to your account.`,
      });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error adding car",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CarForm) => {
    createCarMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="ios-card mx-6 rounded-ios-lg max-w-sm w-full shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-ios-text">Add New Car</CardTitle>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="ios-button p-1"
            >
              <X className="w-5 h-5 text-ios-secondary" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-ios-blue to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Car className="w-8 h-8 text-white" />
            </div>
            <p className="text-sm text-ios-secondary">
              Add a car to track bag inventory for each vehicle
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-ios-text">Car Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. My Honda, Dad's Car"
                        className="rounded-ios border-ios-secondary/30"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-ios-text">Model (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Civic 2020, Model 3"
                        className="rounded-ios border-ios-secondary/30"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={createCarMutation.isPending}
                  className="w-full ios-button bg-ios-blue hover:bg-ios-blue/90 text-white rounded-ios py-3 font-medium"
                >
                  {createCarMutation.isPending ? "Adding Car..." : "Add Car"}
                </Button>

                <Button
                  type="button"
                  onClick={handleClose}
                  variant="outline"
                  className="w-full ios-button rounded-ios py-3 font-medium"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>

          <div className="mt-4 p-3 bg-ios-bg rounded-ios">
            <p className="text-xs text-ios-secondary text-center">
              💡 After adding your car, you can set up bag inventory for different bag types
            </p>
          </div>
        </CardContent>
      </div>
    </div>
  );
}
