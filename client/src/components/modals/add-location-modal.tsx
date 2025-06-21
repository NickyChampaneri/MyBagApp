import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { X, MapPin, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const locationSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  address: z.string().min(1, "Address is required"),
  isActive: z.boolean().default(true),
  reminderRadius: z.number().min(50).max(1000).default(300),
});

type LocationForm = z.infer<typeof locationSchema>;

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddLocationModal({ isOpen, onClose }: AddLocationModalProps) {
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<LocationForm>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: "",
      address: "",
      isActive: true,
      reminderRadius: 300,
    },
  });

  const createLocationMutation = useMutation({
    mutationFn: async (data: LocationForm) => {
      const response = await apiRequest("POST", "/api/locations", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      toast({
        title: "Location added successfully!",
        description: `${data.name} has been added to your saved locations.`,
      });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error adding location",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      });
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // In a real app, you'd use a geocoding service to get the address
          // For now, we'll just set a placeholder
          form.setValue("address", "Current Location");
          setUseCurrentLocation(true);
          toast({
            title: "Location detected",
            description: "Please enter the name of this location.",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Could not get address for current location.",
            variant: "destructive",
          });
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        toast({
          title: "Location access denied",
          description: "Please allow location access or enter address manually.",
          variant: "destructive",
        });
        setGettingLocation(false);
      }
    );
  };

  const onSubmit = (data: LocationForm) => {
    createLocationMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    setUseCurrentLocation(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="ios-card mx-6 rounded-ios-lg max-w-sm w-full shadow-xl max-h-[80vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-ios-text">Add Location</CardTitle>
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
            <div className="w-16 h-16 bg-gradient-to-br from-ios-green to-emerald-400 rounded-xl flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <p className="text-sm text-ios-secondary">
              Add stores and locations to get bag reminders
            </p>
          </div>

          {/* Current Location Button */}
          <div className="mb-4">
            <Button
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              variant="outline"
              className="w-full ios-button rounded-ios py-3 font-medium"
            >
              <Navigation className="w-4 h-4 mr-2" />
              {gettingLocation ? "Getting location..." : "Use Current Location"}
            </Button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-ios-text">Location Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Whole Foods Market, Target"
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
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-ios-text">Address *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="123 Main St, City, State"
                        className="rounded-ios border-ios-secondary/30"
                        disabled={useCurrentLocation}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reminderRadius"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-ios-text">Reminder Radius (meters)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="50"
                        max="1000"
                        className="rounded-ios border-ios-secondary/30"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-ios-secondary">
                      Distance from location to trigger bag reminder
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-3 bg-ios-bg rounded-ios">
                    <div>
                      <FormLabel className="text-ios-text font-medium">
                        Enable Reminders
                      </FormLabel>
                      <p className="text-xs text-ios-secondary">
                        Get notifications when you're near this location
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={createLocationMutation.isPending}
                  className="w-full ios-button bg-ios-green hover:bg-ios-green/90 text-white rounded-ios py-3 font-medium"
                >
                  {createLocationMutation.isPending ? "Adding Location..." : "Add Location"}
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

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-ios">
            <p className="text-xs text-yellow-700 text-center">
              💡 Location reminders require Pro upgrade and location permissions
            </p>
          </div>
        </CardContent>
      </div>
    </div>
  );
}
