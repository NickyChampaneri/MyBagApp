import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Leaf, ShoppingBag, Car } from "lucide-react";

const bagTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  pricePerBag: z.string().min(1, "Price is required"),
  color: z.string().min(1, "Color is required"),
  icon: z.string().min(1, "Icon is required"),
});

const carSchema = z.object({
  name: z.string().min(1, "Car name is required"),
  model: z.string().optional(),
});

type BagTypeForm = z.infer<typeof bagTypeSchema>;
type CarForm = z.infer<typeof carSchema>;

export default function Setup() {
  const [step, setStep] = useState(1);
  const [bagTypes, setBagTypes] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const bagTypeForm = useForm<BagTypeForm>({
    resolver: zodResolver(bagTypeSchema),
    defaultValues: {
      name: "",
      pricePerBag: "",
      color: "#34C759",
      icon: "leaf",
    },
  });

  const carForm = useForm<CarForm>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      name: "",
      model: "",
    },
  });

  const createBagTypeMutation = useMutation({
    mutationFn: async (data: BagTypeForm) => {
      const response = await apiRequest("POST", "/api/bag-types", {
        ...data,
        pricePerBag: parseFloat(data.pricePerBag),
      });
      return response.json();
    },
    onSuccess: (data) => {
      setBagTypes(prev => [...prev, data]);
      bagTypeForm.reset();
      toast({
        title: "Bag type created",
        description: "Your custom bag type has been added.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createCarMutation = useMutation({
    mutationFn: async (data: CarForm) => {
      const response = await apiRequest("POST", "/api/cars", data);
      return response.json();
    },
    onSuccess: (data) => {
      setCars(prev => [...prev, data]);
      carForm.reset();
      toast({
        title: "Car added",
        description: "Your car has been added to your account.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const completeSetupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/setup/complete");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Setup complete!",
        description: "Welcome to EcoBag! Start tracking your savings.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitBagType = (data: BagTypeForm) => {
    createBagTypeMutation.mutate(data);
  };

  const onSubmitCar = (data: CarForm) => {
    createCarMutation.mutate(data);
  };

  const handleNext = () => {
    if (step === 1 && bagTypes.length === 0) {
      toast({
        title: "Add at least one bag type",
        description: "You need to create at least one bag type to continue.",
        variant: "destructive",
      });
      return;
    }
    if (step === 2 && cars.length === 0) {
      toast({
        title: "Add at least one car",
        description: "You need to add at least one car to continue.",
        variant: "destructive",
      });
      return;
    }
    setStep(step + 1);
  };

  const handleComplete = () => {
    completeSetupMutation.mutate();
  };

  const addDefaultBagTypes = () => {
    const defaultTypes = [
      { name: "Reusable", pricePerBag: "0.50", color: "#34C759", icon: "leaf" },
      { name: "Paper", pricePerBag: "0.25", color: "#FF9500", icon: "shopping-bag" },
    ];
    
    defaultTypes.forEach(type => {
      createBagTypeMutation.mutate(type);
    });
  };

  return (
    <div className="min-h-screen bg-ios-bg">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-6 pt-3 pb-1 text-ios-text text-sm font-semibold">
        <span>9:41</span>
        <div className="flex items-center space-x-1">
          <i className="fas fa-signal text-xs"></i>
          <i className="fas fa-wifi text-xs"></i>
          <i className="fas fa-battery-full text-xs"></i>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-6 py-8">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i <= step ? "bg-ios-green" : "bg-ios-secondary bg-opacity-30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Bag Types */}
        {step === 1 && (
          <div>
            <div className="text-center mb-6">
              <Leaf className="w-16 h-16 mx-auto mb-4 text-ios-green" />
              <h1 className="text-2xl font-bold text-ios-text mb-2">Set Up Bag Types</h1>
              <p className="text-ios-secondary">Define the types of bags you use and their prices</p>
            </div>

            <Card className="ios-card rounded-ios-lg shadow-sm mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Add Bag Type</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...bagTypeForm}>
                  <form onSubmit={bagTypeForm.handleSubmit(onSubmitBagType)} className="space-y-4">
                    <FormField
                      control={bagTypeForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bag Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Reusable, Paper" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={bagTypeForm.control}
                      name="pricePerBag"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price per Bag ($)</FormLabel>
                          <FormControl>
                            <Input placeholder="0.50" type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-ios-green hover:bg-ios-green/90 text-white"
                      disabled={createBagTypeMutation.isPending}
                    >
                      Add Bag Type
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {bagTypes.length === 0 && (
              <div className="text-center mb-6">
                <Button 
                  onClick={addDefaultBagTypes}
                  variant="outline"
                  className="ios-button"
                >
                  Use Default Bag Types
                </Button>
              </div>
            )}

            {bagTypes.length > 0 && (
              <Card className="ios-card rounded-ios-lg shadow-sm mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Your Bag Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bagTypes.map((type, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-ios-bg rounded-ios">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: type.color }}
                          >
                            {type.icon === "leaf" ? <Leaf className="w-4 h-4 text-white" /> : <ShoppingBag className="w-4 h-4 text-white" />}
                          </div>
                          <span className="font-medium text-ios-text">{type.name}</span>
                        </div>
                        <span className="text-ios-green font-semibold">${type.pricePerBag}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Button 
              onClick={handleNext}
              className="w-full bg-ios-blue hover:bg-ios-blue/90 text-white"
            >
              Next: Add Cars
            </Button>
          </div>
        )}

        {/* Step 2: Cars */}
        {step === 2 && (
          <div>
            <div className="text-center mb-6">
              <Car className="w-16 h-16 mx-auto mb-4 text-ios-blue" />
              <h1 className="text-2xl font-bold text-ios-text mb-2">Add Your Cars</h1>
              <p className="text-ios-secondary">Track bag inventory for each of your vehicles</p>
            </div>

            <Card className="ios-card rounded-ios-lg shadow-sm mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Add Car</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...carForm}>
                  <form onSubmit={carForm.handleSubmit(onSubmitCar)} className="space-y-4">
                    <FormField
                      control={carForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Car Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. My Honda, Mom's Car" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={carForm.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Civic 2020" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-ios-blue hover:bg-ios-blue/90 text-white"
                      disabled={createCarMutation.isPending}
                    >
                      Add Car
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {cars.length > 0 && (
              <Card className="ios-card rounded-ios-lg shadow-sm mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Your Cars</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cars.map((car, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-ios-bg rounded-ios">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-ios-blue to-blue-600 rounded-xl flex items-center justify-center">
                            <Car className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <span className="font-medium text-ios-text">{car.name}</span>
                            {car.model && <p className="text-sm text-ios-secondary">{car.model}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Button 
              onClick={handleNext}
              className="w-full bg-ios-blue hover:bg-ios-blue/90 text-white"
            >
              Next: Complete Setup
            </Button>
          </div>
        )}

        {/* Step 3: Complete */}
        {step === 3 && (
          <div>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-ios-green rounded-full flex items-center justify-center">
                <span className="text-2xl">🎉</span>
              </div>
              <h1 className="text-2xl font-bold text-ios-text mb-2">You're All Set!</h1>
              <p className="text-ios-secondary">Ready to start tracking your environmental impact</p>
            </div>

            <Card className="ios-card rounded-ios-lg shadow-sm mb-6">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-ios-green rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="text-ios-text">Bag types configured</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-ios-green rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="text-ios-text">Cars added</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-ios-secondary bg-opacity-30 rounded-full flex items-center justify-center">
                      <span className="text-ios-secondary text-sm">•</span>
                    </div>
                    <span className="text-ios-secondary">Optional: Add locations for reminders</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={handleComplete}
              className="w-full bg-ios-green hover:bg-ios-green/90 text-white"
              disabled={completeSetupMutation.isPending}
            >
              Start Using EcoBag
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
