import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import TabNavigation from "@/components/tab-navigation";
import DashboardTab from "@/components/dashboard-tab";
import CarsTab from "@/components/cars-tab";
import LocationsTab from "@/components/locations-tab";
import FamilyTab from "@/components/family-tab";
import BagReminderModal from "@/components/modals/bag-reminder-modal";
import BagSelectionModal from "@/components/modals/bag-selection-modal";
import AddCarModal from "@/components/modals/add-car-modal";
import AddLocationModal from "@/components/modals/add-location-modal";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showBagReminder, setShowBagReminder] = useState(false);
  const [showBagSelection, setShowBagSelection] = useState(false);
  const [showAddCar, setShowAddCar] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{name: string; address: string} | null>(null);
  
  const { user } = useAuth();

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);

  // Check for geolocation and show reminders
  useEffect(() => {
    if (!user?.hasPaidAccess) return;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd check this against saved locations
          // For now, simulate finding a nearby store
          const nearbyStores = [
            { name: "Whole Foods Market", address: "123 Market St" },
            { name: "Target", address: "456 Mission St" },
          ];
          
          // Simulate being near a store (random for demo)
          if (Math.random() > 0.7) {
            const store = nearbyStores[Math.floor(Math.random() * nearbyStores.length)];
            setCurrentLocation(store);
            setTimeout(() => setShowBagReminder(true), 2000);
          }
        },
        (error) => {
          console.log("Geolocation error:", error);
        }
      );
    }
  }, [user?.hasPaidAccess]);

  // Handle URL params for PWA notifications
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'bag-selection') {
      setShowBagSelection(true);
      // Clean up URL
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const handleBagReminderConfirm = () => {
    setShowBagReminder(false);
    setShowBagSelection(true);
  };

  const handleBagReminderDismiss = () => {
    setShowBagReminder(false);
  };

  const handleBagSelectionComplete = () => {
    setShowBagSelection(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab onAddCar={() => setShowAddCar(true)} />;
      case "cars":
        return <CarsTab onAddCar={() => setShowAddCar(true)} />;
      case "locations":
        return <LocationsTab onAddLocation={() => setShowAddLocation(true)} />;
      case "family":
        return <FamilyTab />;
      default:
        return <DashboardTab onAddCar={() => setShowAddCar(true)} />;
    }
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

      {/* Main Content */}
      <div className="max-w-sm mx-auto pb-20">
        {renderTabContent()}
      </div>

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Modals */}
      <BagReminderModal
        isOpen={showBagReminder}
        onConfirm={handleBagReminderConfirm}
        onDismiss={handleBagReminderDismiss}
        locationName={currentLocation?.name || ""}
      />

      <BagSelectionModal
        isOpen={showBagSelection}
        onComplete={handleBagSelectionComplete}
        onCancel={() => setShowBagSelection(false)}
        locationName={currentLocation?.name || ""}
      />

      <AddCarModal
        isOpen={showAddCar}
        onClose={() => setShowAddCar(false)}
      />

      <AddLocationModal
        isOpen={showAddLocation}
        onClose={() => setShowAddLocation(false)}
      />
    </div>
  );
}
