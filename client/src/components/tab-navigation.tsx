import { BarChart3, Car, MapPin, Users } from "lucide-react";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "cars", label: "Cars", icon: Car },
    { id: "locations", label: "Locations", icon: MapPin },
    { id: "family", label: "Family", icon: Users },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm">
      <div className="ios-card mx-4 mb-4 rounded-ios-lg shadow-lg border border-ios-muted dark:border-ios-muted border-opacity-50">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`ios-button tab-button flex flex-col items-center py-2 px-4 ${
                  activeTab === tab.id ? "active" : ""
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
