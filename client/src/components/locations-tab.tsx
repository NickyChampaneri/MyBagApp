import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Store, ShoppingCart, Navigation } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface LocationsTabProps {
  onAddLocation: () => void;
}

export default function LocationsTab({ onAddLocation }: LocationsTabProps) {
  const { user } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [locationPermission, setLocationPermission] = useState<string>("prompt");

  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ["/api/locations"],
    enabled: !!user,
  });

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationPermission(result.state);
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation("Downtown San Francisco");
          },
          (error) => {
            console.log("Geolocation error:", error);
            setCurrentLocation("Location unavailable");
          }
        );
      }
    }
  }, []);

  const handleEnableLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationPermission("granted");
          setCurrentLocation("Downtown San Francisco");
        },
        (error) => {
          console.log("Geolocation error:", error);
        }
      );
    }
  };

  if (locationsLoading) {
    return (
      <div className="px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-ios-lg"></div>
          <div className="h-24 bg-gray-200 rounded-ios"></div>
          <div className="h-24 bg-gray-200 rounded-ios"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ios-text">Locations</h1>
          <Button
            onClick={onAddLocation}
            className="ios-button w-8 h-8 bg-ios-blue hover:bg-ios-blue/90 rounded-full flex items-center justify-center p-0"
          >
            <Plus className="w-4 h-4 text-white" />
          </Button>
        </div>
      </div>

      {/* Current Location */}
      <div className="px-6 mb-6">
        <Card className="ios-card rounded-ios-lg p-5 shadow-sm bg-gradient-to-r from-ios-blue to-blue-600">
          <div className="text-white">
            <div className="flex items-center space-x-2 mb-2">
              <Navigation className="w-5 h-5" />
              <span className="font-medium">Current Location</span>
            </div>
            <p className="text-sm opacity-90">{currentLocation}</p>
            {user?.hasPaidAccess && currentLocation !== "Location unavailable" && (
              <div className="mt-3 p-3 bg-white bg-opacity-20 rounded-ios">
                <p className="text-sm">📍 You're near Whole Foods Market!</p>
                <p className="text-xs opacity-75 mt-1">Don't forget your reusable bags</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Saved Locations */}
      <div className="px-6">
        <h3 className="text-lg font-semibold text-ios-text mb-3">Saved Locations</h3>
        
        {locations && locations.length > 0 ? (
          <div className="space-y-3">
            {locations.map((location: any) => (
              <LocationCard key={location.id} location={location} />
            ))}
          </div>
        ) : (
          <Card className="ios-card rounded-ios-lg p-6 shadow-sm text-center">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-ios-secondary opacity-50" />
            <h3 className="font-semibold text-ios-text mb-2">No locations saved yet</h3>
            <p className="text-sm text-ios-secondary mb-4">
              Add your favorite stores to get bag reminders
            </p>
            <Button onClick={onAddLocation} className="bg-ios-blue hover:bg-ios-blue/90 text-white">
              Add Your First Location
            </Button>
          </Card>
        )}
      </div>

      {/* Location Permissions */}
      {locationPermission !== "granted" && (
        <div className="px-6 mt-6">
          <Card className="ios-card rounded-ios p-4 shadow-sm bg-yellow-50 border border-yellow-200">
            <div className="flex items-start space-x-3">
              <i className="fas fa-exclamation-triangle text-yellow-600 mt-1"></i>
              <div>
                <h4 className="font-medium text-yellow-800">Location Permission</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Enable location services for bag reminders when you arrive at stores.
                </p>
                <Button
                  onClick={handleEnableLocation}
                  className="ios-button bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-ios text-sm font-medium mt-2"
                >
                  Enable Location
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Upgrade Prompt for Free Users */}
      {!user?.hasPaidAccess && (
        <div className="px-6 mt-6">
          <Card className="ios-card rounded-ios p-4 shadow-sm border-2 border-ios-blue border-opacity-30">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-ios-text">Unlock Location Reminders</h4>
                <p className="text-sm text-ios-secondary">Get notified when you're near stores</p>
              </div>
              <Button
                onClick={() => window.location.href = "/checkout"}
                className="ios-button bg-ios-blue hover:bg-ios-blue/90 text-white rounded-full px-4 py-2 text-sm font-medium"
              >
                $2.99
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function LocationCard({ location }: { location: any }) {
  const getLocationIcon = (name: string) => {
    if (name.toLowerCase().includes("whole foods") || name.toLowerCase().includes("market")) {
      return Store;
    }
    if (name.toLowerCase().includes("target") || name.toLowerCase().includes("walmart")) {
      return ShoppingCart;
    }
    return Store;
  };

  const getLocationColor = (name: string) => {
    if (name.toLowerCase().includes("whole foods")) {
      return "#34C759";
    }
    if (name.toLowerCase().includes("target")) {
      return "#FF9500";
    }
    return "#34C759";
  };

  const IconComponent = getLocationIcon(location.name);
  const iconColor = getLocationColor(location.name);

  return (
    <Card className="ios-card rounded-ios p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: iconColor }}
          >
            <IconComponent className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-medium text-ios-text">{location.name}</h4>
            <p className="text-sm text-ios-secondary">{location.address}</p>
            <div className="flex items-center space-x-4 mt-1">
              <span className={`text-xs px-2 py-1 rounded ${
                location.isActive 
                  ? 'bg-ios-success text-white' 
                  : 'bg-ios-secondary text-white'
              }`}>
                {location.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="text-xs text-ios-secondary">0.3 miles away</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="ios-button text-ios-secondary">
          <i className="fas fa-ellipsis-h"></i>
        </Button>
      </div>
    </Card>
  );
}
